import json
import boto3
import logging
import hashlib
import os
import time
import random
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Tuple
from botocore.exceptions import ClientError, BotoCoreError

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

# Environment variables
BEDROCK_MODEL_ID = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-5-haiku-20241022-v1:0')
DYNAMODB_TABLE_NAME = "wordweave-themes-python"
CACHE_TTL_HOURS = 168  # 7 days cache for theme analysis

# Retry configuration
MAX_RETRIES = 3
BASE_DELAY = 1  # seconds
MAX_DELAY = 16  # seconds


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda handler for WordWeave theme analysis
    
    Args:
        event: API Gateway event containing the poem text
        context: Lambda context object
    
    Returns:
        API Gateway response with detailed theme analysis
    """
    
    logger.info(f"Received theme analysis request: {json.dumps(event, default=str)}")
    
    try:
        # Handle preflight OPTIONS request for CORS
        if event.get('httpMethod') == 'OPTIONS':
            return create_response(200, {'message': 'CORS preflight'})
        
        # Parse request body
        if not event.get('body'):
            return create_error_response(400, 'MISSING_BODY', 'Request body is required')
        
        try:
            body = json.loads(event['body'])
        except json.JSONDecodeError:
            return create_error_response(400, 'INVALID_JSON', 'Request body must be valid JSON')
        
        # Validate input
        validation_error = validate_input(body)
        if validation_error:
            return validation_error
        
        poem_text = body['poem'].strip()
        
        # Generate cache key from poem content
        cache_key = generate_cache_key(poem_text)
        
        # Check cache first
        cached_analysis = get_cached_analysis(cache_key)
        if cached_analysis:
            logger.info(f"Cache hit for theme analysis: {cache_key[:12]}...")
            return create_response(200, {
                'success': True,
                'data': cached_analysis,
                'cached': True,
                'timestamp': datetime.utcnow().isoformat()
            })
        
        # Analyze theme with Bedrock (with retry logic)
        theme_analysis = analyze_theme_with_retry(poem_text)
        
        # Cache the result
        try:
            cache_analysis(cache_key, theme_analysis)
        except Exception as cache_error:
            logger.warning(f"Failed to cache theme analysis: {str(cache_error)}")
            # Don't fail the request if caching fails
        
        # Return successful response
        return create_response(200, {
            'success': True,
            'data': theme_analysis,
            'cached': False,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Unexpected error in theme analysis: {str(e)}", exc_info=True)
        return create_error_response(500, 'INTERNAL_ERROR', 'Failed to analyze theme')


def validate_input(body: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Validate input parameters
    
    Args:
        body: Request body dictionary
    
    Returns:
        Error response if validation fails, None if valid
    """
    if 'poem' not in body:
        return create_error_response(400, 'MISSING_POEM', 'Field "poem" is required')
    
    if not isinstance(body['poem'], str):
        return create_error_response(400, 'INVALID_TYPE', 'Field "poem" must be a string')
    
    if not body['poem'].strip():
        return create_error_response(400, 'EMPTY_POEM', 'Poem cannot be empty')
    
    if len(body['poem']) > 5000:  # Reasonable limit for poem length
        return create_error_response(400, 'POEM_TOO_LONG', 'Poem must be 5000 characters or less')
    
    return None


def analyze_theme_with_retry(poem_text: str) -> Dict[str, Any]:
    """
    Analyze theme with exponential backoff retry logic
    
    Args:
        poem_text: The poem to analyze
    
    Returns:
        Comprehensive theme analysis data
    """
    last_exception = None
    
    for attempt in range(MAX_RETRIES):
        try:
            return analyze_theme_with_bedrock(poem_text)
        
        except ClientError as e:
            error_code = e.response['Error']['Code']
            last_exception = e
            
            if error_code == 'ThrottlingException' and attempt < MAX_RETRIES - 1:
                delay = min(BASE_DELAY * (2 ** attempt) + random.uniform(0, 1), MAX_DELAY)
                logger.warning(f"Bedrock throttled, retrying in {delay:.2f}s (attempt {attempt + 1})")
                time.sleep(delay)
                continue
            else:
                raise e
        
        except Exception as e:
            last_exception = e
            if attempt < MAX_RETRIES - 1:
                delay = min(BASE_DELAY * (2 ** attempt), MAX_DELAY)
                logger.warning(f"Analysis failed, retrying in {delay:.2f}s (attempt {attempt + 1}): {str(e)}")
                time.sleep(delay)
                continue
            else:
                raise e
    
    # If we get here, all retries failed
    raise last_exception


def analyze_theme_with_bedrock(poem_text: str) -> Dict[str, Any]:
    """
    Analyze poem theme using AWS Bedrock Claude 3.5 Sonnet
    
    Args:
        poem_text: The poem text to analyze
    
    Returns:
        Detailed theme analysis with visual parameters
    """
    
    # Create comprehensive XML prompt for granular analysis
    xml_prompt = f"""
<visual_theme_analysis>
    <context>
        You are a visual design AI analyzing poetry to extract specific parameters for CSS styling and React animations.
        Your analysis must be precise and quantified to drive dynamic web transformations.
    </context>
    
    <poem_to_analyze>
{poem_text}
    </poem_to_analyze>
    
    <analysis_requirements>
        <emotion_analysis>
            <primary_emotion>Identify the single most dominant emotion (joy, sadness, anger, fear, surprise, disgust, anticipation, trust, wonder, melancholy, serenity, excitement, contemplation, nostalgia, hope)</primary_emotion>
            <intensity>Rate emotional intensity from 0.0 to 1.0 (0.1=barely perceptible, 0.5=moderate, 1.0=overwhelming)</intensity>
            <secondary_emotions>List up to 3 secondary emotions with their intensities</secondary_emotions>
        </emotion_analysis>
        
        <color_palette>
            <primary_colors>Extract 5 hex colors that best represent this poem's visual essence</primary_colors>
            <color_weights>Assign weight 0.1-1.0 to each color based on prominence</color_weights>
            <color_psychology>Consider emotional associations: warm vs cool, bright vs muted, saturated vs desaturated</color_psychology>
        </color_palette>
        
        <animation_parameters>
            <style>Choose from: calm, energetic, dramatic, mystical</style>
            <timing>
                <duration>Base animation duration in milliseconds (500-5000)</duration>
                <stagger_delay>Delay between animated elements in milliseconds (50-500)</stagger_delay>
                <easing>CSS easing function (ease, ease-in, ease-out, ease-in-out, cubic-bezier values)</easing>
            </timing>
            <movement_type>Choose from: fade, slide, bounce, float, pulse, wave, spiral, zoom</movement_type>
            <particle_effects>
                <enabled>true/false based on poem's imagery</enabled>
                <type>Choose from: sparkles, leaves, rain, snow, bubbles, light_rays, dust, fireflies</type>
                <density>0.1-1.0 (particle density)</density>
                <speed>0.1-2.0 (particle movement speed multiplier)</speed>
            </particle_effects>
        </animation_parameters>
        
        <visual_imagery>
            <keywords>Extract max 10 concrete visual elements mentioned or implied (e.g., ocean, mountains, stars, fire, shadows, light, flowers, etc.)</keywords>
            <imagery_category>Choose dominant category: nature, urban, cosmic, abstract, human, architectural, elemental</imagery_category>
            <visual_density>Rate visual complexity 0.1-1.0 (sparse imagery vs rich detail)</visual_density>
        </visual_imagery>
        
        <typography_parameters>
            <mood>Choose from: modern, classic, playful, elegant</mood>
            <font_weight>300-900 (CSS font-weight for primary text)</font_weight>
            <font_scale>0.8-1.5 (multiplier for base font sizes)</font_scale>
            <line_height>1.2-2.0 (CSS line-height ratio)</line_height>
            <letter_spacing>-0.05 to 0.2 (CSS letter-spacing in em)</letter_spacing>
            <text_shadow>0-4 (shadow blur radius, 0 = no shadow)</text_shadow>
        </typography_parameters>
        
        <layout_parameters>
            <spacing_scale>0.8-1.4 (multiplier for margins and padding)</spacing_scale>
            <border_radius>0-20 (CSS border-radius in pixels)</border_radius>
            <backdrop_blur>0-20 (CSS backdrop-filter blur in pixels)</backdrop_blur>
            <gradient_angle>0-360 (degrees for background gradients)</gradient_angle>
            <opacity_variations>List 3 opacity values 0.1-1.0 for layering effects</opacity_variations>
        </layout_parameters>
    </analysis_requirements>
    
    <output_format>
        Return ONLY a JSON object with this exact structure:
        {{
            "emotion": {{
                "primary": "emotion_name",
                "intensity": 0.75,
                "secondary": [
                    {{"emotion": "secondary_emotion", "intensity": 0.4}},
                    {{"emotion": "another_emotion", "intensity": 0.2}}
                ]
            }},
            "colors": {{
                "palette": [
                    {{"hex": "#1a202c", "weight": 0.8, "role": "primary"}},
                    {{"hex": "#2d3748", "weight": 0.6, "role": "secondary"}},
                    {{"hex": "#4a5568", "weight": 0.5, "role": "accent"}},
                    {{"hex": "#718096", "weight": 0.3, "role": "neutral"}},
                    {{"hex": "#e2e8f0", "weight": 0.2, "role": "highlight"}}
                ],
                "dominant_temperature": "warm|cool|neutral",
                "saturation_level": "high|medium|low"
            }},
            "animation": {{
                "style": "calm|energetic|dramatic|mystical",
                "timing": {{
                    "duration": 2000,
                    "stagger_delay": 150,
                    "easing": "ease-out"
                }},
                "movement_type": "fade",
                "particles": {{
                    "enabled": true,
                    "type": "sparkles",
                    "density": 0.3,
                    "speed": 0.8
                }}
            }},
            "imagery": {{
                "keywords": ["keyword1", "keyword2", "keyword3"],
                "category": "nature",
                "visual_density": 0.7
            }},
            "typography": {{
                "mood": "elegant",
                "font_weight": 400,
                "font_scale": 1.1,
                "line_height": 1.6,
                "letter_spacing": 0.02,
                "text_shadow": 1
            }},
            "layout": {{
                "spacing_scale": 1.2,
                "border_radius": 12,
                "backdrop_blur": 8,
                "gradient_angle": 135,
                "opacity_variations": [0.9, 0.6, 0.3]
            }},
            "metadata": {{
                "analysis_confidence": 0.85,
                "processing_notes": "Brief note about analysis approach"
            }}
        }}
    </output_format>
</visual_theme_analysis>

Analyze the provided poem and return the precise visual parameters needed for dynamic web styling.
    """
    
    try:
        # Prepare request body for Claude
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 3000,  # Increased for detailed analysis
            "temperature": 0.3,  # Lower temperature for more consistent analysis
            "top_p": 0.9,
            "messages": [
                {
                    "role": "user",
                    "content": xml_prompt
                }
            ]
        }
        
        logger.info(f"Calling Bedrock for theme analysis with model: {BEDROCK_MODEL_ID}")
        response = bedrock_client.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(request_body)
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        content = response_body['content'][0]['text']
        
        # Extract JSON from Claude's response
        theme_data = extract_json_from_response(content)
        
        # Add processing metadata
        theme_data['metadata']['analysis_timestamp'] = datetime.utcnow().isoformat()
        theme_data['metadata']['model_used'] = BEDROCK_MODEL_ID
        theme_data['metadata']['poem_hash'] = generate_cache_key(poem_text)[:16]
        
        # Validate and sanitize the analysis data
        theme_data = validate_and_sanitize_analysis(theme_data)
        
        logger.info("Theme analysis completed successfully")
        return theme_data
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        logger.error(f"Bedrock API error: {error_code} - {error_message}")
        
        if error_code == 'ThrottlingException':
            raise Exception('Analysis service is currently busy. Please try again in a moment.')
        elif error_code == 'ValidationException':
            raise Exception('Invalid analysis request format.')
        elif error_code == 'AccessDeniedException':
            raise Exception('Access denied to analysis service.')
        else:
            raise Exception(f'Analysis service error: {error_message}')
            
    except BotoCoreError as e:
        logger.error(f"Boto3 error: {str(e)}")
        raise Exception('AWS service connection error during analysis.')
    
    except Exception as e:
        logger.error(f"Unexpected error in theme analysis: {str(e)}")
        raise Exception('Failed to complete theme analysis.')


def extract_json_from_response(content: str) -> Dict[str, Any]:
    """
    Extract JSON from Claude's response text
    
    Args:
        content: Raw response text from Claude
    
    Returns:
        Parsed theme analysis dictionary
    """
    try:
        # Look for JSON block in the response
        import re
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            json_str = json_match.group(0)
            return json.loads(json_str)
        else:
            # Try to parse the entire content
            return json.loads(content)
            
    except json.JSONDecodeError:
        logger.warning("Could not parse JSON from theme analysis response, using fallback")
        return create_fallback_analysis()


def create_fallback_analysis() -> Dict[str, Any]:
    """
    Create fallback theme analysis when parsing fails
    
    Returns:
        Basic theme analysis structure
    """
    return {
        "emotion": {
            "primary": "contemplative",
            "intensity": 0.5,
            "secondary": [
                {"emotion": "calm", "intensity": 0.3}
            ]
        },
        "colors": {
            "palette": [
                {"hex": "#4a5568", "weight": 0.8, "role": "primary"},
                {"hex": "#718096", "weight": 0.6, "role": "secondary"},
                {"hex": "#a0aec0", "weight": 0.4, "role": "accent"},
                {"hex": "#cbd5e0", "weight": 0.3, "role": "neutral"},
                {"hex": "#e2e8f0", "weight": 0.2, "role": "highlight"}
            ],
            "dominant_temperature": "neutral",
            "saturation_level": "medium"
        },
        "animation": {
            "style": "calm",
            "timing": {
                "duration": 2000,
                "stagger_delay": 150,
                "easing": "ease-out"
            },
            "movement_type": "fade",
            "particles": {
                "enabled": false,
                "type": "dust",
                "density": 0.2,
                "speed": 0.5
            }
        },
        "imagery": {
            "keywords": ["abstract", "contemplative", "peaceful"],
            "category": "abstract",
            "visual_density": 0.5
        },
        "typography": {
            "mood": "modern",
            "font_weight": 400,
            "font_scale": 1.0,
            "line_height": 1.6,
            "letter_spacing": 0.0,
            "text_shadow": 0
        },
        "layout": {
            "spacing_scale": 1.0,
            "border_radius": 8,
            "backdrop_blur": 4,
            "gradient_angle": 135,
            "opacity_variations": [0.9, 0.6, 0.3]
        },
        "metadata": {
            "analysis_confidence": 0.3,
            "processing_notes": "Fallback analysis due to parsing error"
        }
    }


def validate_and_sanitize_analysis(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and sanitize the analysis data to ensure all values are within expected ranges
    
    Args:
        data: Raw analysis data from Claude
    
    Returns:
        Sanitized and validated analysis data
    """
    # Emotion validation
    if 'emotion' in data:
        if 'intensity' in data['emotion']:
            data['emotion']['intensity'] = max(0.0, min(1.0, data['emotion']['intensity']))
        
        if 'secondary' in data['emotion']:
            for emotion in data['secondary']:
                if 'intensity' in emotion:
                    emotion['intensity'] = max(0.0, min(1.0, emotion['intensity']))
    
    # Animation timing validation
    if 'animation' in data and 'timing' in data['animation']:
        timing = data['animation']['timing']
        timing['duration'] = max(500, min(5000, timing.get('duration', 2000)))
        timing['stagger_delay'] = max(50, min(500, timing.get('stagger_delay', 150)))
    
    # Typography validation
    if 'typography' in data:
        typo = data['typography']
        typo['font_weight'] = max(300, min(900, typo.get('font_weight', 400)))
        typo['font_scale'] = max(0.8, min(1.5, typo.get('font_scale', 1.0)))
        typo['line_height'] = max(1.2, min(2.0, typo.get('line_height', 1.6)))
        typo['letter_spacing'] = max(-0.05, min(0.2, typo.get('letter_spacing', 0.0)))
        typo['text_shadow'] = max(0, min(4, typo.get('text_shadow', 0)))
    
    # Layout validation
    if 'layout' in data:
        layout = data['layout']
        layout['spacing_scale'] = max(0.8, min(1.4, layout.get('spacing_scale', 1.0)))
        layout['border_radius'] = max(0, min(20, layout.get('border_radius', 8)))
        layout['backdrop_blur'] = max(0, min(20, layout.get('backdrop_blur', 4)))
        layout['gradient_angle'] = layout.get('gradient_angle', 135) % 360
        
        if 'opacity_variations' in layout:
            layout['opacity_variations'] = [max(0.1, min(1.0, op)) for op in layout['opacity_variations']]
    
    # Color validation
    if 'colors' in data and 'palette' in data['colors']:
        for color in data['colors']['palette']:
            if 'weight' in color:
                color['weight'] = max(0.1, min(1.0, color['weight']))
    
    return data


def generate_cache_key(poem_text: str) -> str:
    """
    Generate cache key from poem content
    
    Args:
        poem_text: The poem text
    
    Returns:
        SHA-256 hash of the poem content
    """
    normalized_poem = poem_text.strip().lower().replace('\r\n', '\n').replace('\r', '\n')
    return hashlib.sha256(normalized_poem.encode('utf-8')).hexdigest()


def get_cached_analysis(cache_key: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve cached theme analysis from DynamoDB
    
    Args:
        cache_key: Cache key for the analysis
    
    Returns:
        Cached analysis data or None if not found/expired
    """
    try:
        table = dynamodb.Table(DYNAMODB_TABLE_NAME)
        response = table.get_item(Key={'cache_key': cache_key})
        
        if 'Item' in response:
            item = response['Item']
            # Check if item is still valid (TTL not expired)
            if 'ttl' in item and item['ttl'] > datetime.utcnow().timestamp():
                return item['analysis_data']
        
        return None
        
    except Exception as e:
        logger.error(f"Error retrieving cached analysis: {str(e)}")
        return None


def cache_analysis(cache_key: str, analysis_data: Dict[str, Any]) -> None:
    """
    Cache theme analysis in DynamoDB
    
    Args:
        cache_key: Cache key for the analysis
        analysis_data: Analysis data to cache
    """
    try:
        table = dynamodb.Table(DYNAMODB_TABLE_NAME)
        
        # Set TTL to specified hours from now
        ttl = int((datetime.utcnow() + timedelta(hours=CACHE_TTL_HOURS)).timestamp())
        
        table.put_item(
            Item={
                'cache_key': cache_key,
                'analysis_data': analysis_data,
                'ttl': ttl,
                'created_at': datetime.utcnow().isoformat(),
                'poem_preview': analysis_data.get('metadata', {}).get('poem_hash', '')[:50]
            }
        )
        
        logger.info(f"Analysis cached successfully with key: {cache_key[:12]}...")
        
    except Exception as e:
        logger.error(f"Error caching analysis: {str(e)}")
        raise


def create_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create API Gateway response with CORS headers
    
    Args:
        status_code: HTTP status code
        body: Response body
    
    Returns:
        API Gateway response format
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-API-Key,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        'body': json.dumps(body, default=str)
    }


def create_error_response(status_code: int, error_code: str, message: str) -> Dict[str, Any]:
    """
    Create error response
    
    Args:
        status_code: HTTP status code
        error_code: Internal error code
        message: Error message
    
    Returns:
        API Gateway error response
    """
    return create_response(status_code, {
        'success': False,
        'error': {
            'code': error_code,
            'message': message
        },
        'timestamp': datetime.utcnow().isoformat()
    })
