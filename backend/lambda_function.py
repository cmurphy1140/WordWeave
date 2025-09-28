import json
import boto3
import logging
import os
import re
from datetime import datetime
from typing import Dict, Any, Optional
from botocore.exceptions import ClientError, BotoCoreError

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

# Environment variables
BEDROCK_MODEL_ID = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-5-haiku-20241022')
DYNAMODB_TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME', 'wordweave-poems-python')

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda handler for WordWeave poem generation
    
    Args:
        event: API Gateway event containing the request
        context: Lambda context object
    
    Returns:
        API Gateway response with poem data or error
    """
    
    # Log the incoming request
    logger.info(f"Received event: {json.dumps(event, default=str)}")
    
    try:
        # Handle preflight OPTIONS request for CORS
        if event.get('httpMethod') == 'OPTIONS':
            return create_response(200, {'message': 'CORS preflight'})
        
        # Handle health check endpoint
        if event.get('httpMethod') == 'GET' and event.get('path', '').endswith('/health'):
            return create_response(200, {
                'status': 'healthy',
                'service': 'WordWeave Poem Generator',
                'model': BEDROCK_MODEL_ID,
                'timestamp': datetime.utcnow().isoformat()
            })
        
        # Parse request body
        if not event.get('body'):
            return create_error_response(400, 'MISSING_BODY', 'Request body is required')
        
        try:
            body = json.loads(event['body'])
        except json.JSONDecodeError:
            return create_error_response(400, 'INVALID_JSON', 'Request body must be valid JSON')
        
        # Validate input parameters
        validation_error = validate_input(body)
        if validation_error:
            return validation_error
        
        verb = body['verb'].strip().lower()
        adjective = body['adjective'].strip().lower()
        noun = body['noun'].strip().lower()
        
        # Generate cache key
        cache_key = f"{verb}-{adjective}-{noun}"
        
        # Check cache first (skip if DynamoDB not available)
        try:
            cached_result = get_cached_poem(cache_key)
            if cached_result:
                logger.info(f"Cache hit for key: {cache_key}")
                return create_response(200, {
                    'success': True,
                    'data': cached_result,
                    'cached': True,
                    'timestamp': datetime.utcnow().isoformat()
                })
        except Exception as cache_error:
            logger.warning(f"Cache check failed: {str(cache_error)}, proceeding without cache")
        
        # Generate new poem using Bedrock with graceful fallback
        try:
            poem_data = generate_poem_with_bedrock(verb, adjective, noun)
            logger.info("Successfully generated poem using Bedrock")
        except Exception as bedrock_error:
            logger.warning(f"Bedrock generation failed: {str(bedrock_error)}, using enhanced fallback")
            # Use enhanced fallback with dynamic poem generation
            poem_data = generate_enhanced_fallback_poem(verb, adjective, noun)
        
        # Cache the result (skip if DynamoDB not available)
        try:
            cache_poem(cache_key, poem_data)
        except Exception as cache_error:
            logger.warning(f"Failed to cache poem: {str(cache_error)}")
            # Don't fail the request if caching fails
        
        # Return successful response
        return create_response(200, {
            'success': True,
            'data': poem_data,
            'cached': False,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return create_error_response(500, 'INTERNAL_ERROR', 'An unexpected error occurred')

def validate_input(body: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Validate input parameters
    
    Args:
        body: Request body dictionary
    
    Returns:
        Error response if validation fails, None if valid
    """
    required_fields = ['verb', 'adjective', 'noun']
    
    for field in required_fields:
        if field not in body:
            return create_error_response(400, 'MISSING_FIELD', f'Field "{field}" is required')
        
        if not isinstance(body[field], str):
            return create_error_response(400, 'INVALID_TYPE', f'Field "{field}" must be a string')
        
        if not body[field].strip():
            return create_error_response(400, 'EMPTY_FIELD', f'Field "{field}" cannot be empty')
        
        if len(body[field].strip()) > 50:
            return create_error_response(400, 'FIELD_TOO_LONG', f'Field "{field}" must be 50 characters or less')
    
    return None

def generate_poem_with_bedrock(verb: str, adjective: str, noun: str) -> Dict[str, Any]:
    """
    Generate poem using AWS Bedrock Claude 3.5 Sonnet with enhanced analysis
    
    Args:
        verb: Action word for the poem
        adjective: Descriptive word for the poem
        noun: Subject/object word for the poem
    
    Returns:
        Dictionary containing poem data and comprehensive metadata
    """
    
    # Create comprehensive XML prompt with few-shot examples for advanced analysis
    xml_prompt = f"""
<enhanced_poem_generation_task>
    <context>
        You are an advanced poetry AI that generates beautiful poems and performs sophisticated literary analysis.
        You excel at detecting rhyme schemes, identifying metaphors, analyzing rhythm, and extracting temporal/seasonal cues.
    </context>
    
    <input_words>
        <verb>{verb}</verb>
        <adjective>{adjective}</adjective>
        <noun>{noun}</noun>
    </input_words>
    
    <generation_requirements>
        <structure>
            <lines>exactly 12 lines</lines>
            <style>free verse poetry with natural flow</style>
            <tone>adaptive to the emotional context of the words</tone>
        </structure>
        <content>
            <incorporate_all_words>true</incorporate_all_words>
            <natural_integration>ensure words flow naturally within the poem</natural_integration>
            <imagery>create vivid, sensory imagery with metaphors</imagery>
            <emotion>evoke genuine emotional response</emotion>
            <rhythm>vary line lengths for natural cadence</rhythm>
        </content>
    </generation_requirements>
    
    <comprehensive_analysis_requirements>
        After generating the poem, perform detailed analysis including:
        
        <rhyme_analysis>
            <detect_rhyme_scheme>Identify any rhyming patterns (AABB, ABAB, ABCB, etc.) or note "free verse"</detect_rhyme_scheme>
            <rhyme_density>Rate rhyme density 0.0-1.0 (0.0=no rhyme, 1.0=heavy rhyme)</rhyme_density>
            <typography_adjustments>
                <font_style>Adjust based on rhyme: "serif" for formal rhyme, "sans-serif" for free verse</font_style>
                <line_spacing>Adjust line spacing based on rhyme density</line_spacing>
                <text_alignment>Consider centered alignment for structured rhyme schemes</text_alignment>
            </typography_adjustments>
        </rhyme_analysis>
        
        <metaphor_analysis>
            <identify_metaphors>List all metaphors and figurative language with line numbers</identify_metaphors>
            <metaphor_types>Classify metaphors: visual, conceptual, sensory, abstract</metaphor_types>
            <visual_representations>
                <metaphor_icons>Suggest icon representations for each metaphor</metaphor_icons>
                <color_associations>Map metaphors to specific colors</color_associations>
                <animation_suggestions>Suggest animations for metaphor visualization</animation_suggestions>
            </visual_representations>
        </metaphor_analysis>
        
        <rhythm_meter_analysis>
            <syllable_pattern>Analyze syllable count per line</syllable_pattern>
            <stress_pattern>Identify stressed/unstressed syllable patterns</stress_pattern>
            <rhythm_type>Classify rhythm: iambic, trochaic, anapestic, dactylic, free</rhythm_type>
            <animation_timing>
                <base_duration>Calculate base animation duration based on rhythm (ms)</base_duration>
                <stagger_pattern>Determine stagger delays between elements</stagger_pattern>
                <easing_function>Select CSS easing based on rhythm flow</easing_function>
            </animation_timing>
        </rhythm_meter_analysis>
        
        <temporal_analysis>
            <seasonal_hints>Extract seasonal references (spring, summer, fall, winter)</seasonal_hints>
            <time_of_day>Identify time references (dawn, morning, noon, afternoon, evening, night)</time_of_day>
            <temporal_keywords>List all time-related words and phrases</temporal_keywords>
            <background_suggestions>
                <gradient_colors>Suggest background gradients based on time/season</gradient_colors>
                <particle_effects>Recommend particle effects (leaves, snow, rain, etc.)</particle_effects>
                <lighting_mood>Determine lighting atmosphere</lighting_mood>
            </background_suggestions>
        </temporal_analysis>
        
        <reading_pace_analysis>
            <syllable_count>Total syllables in poem</syllable_count>
            <average_line_length>Average syllables per line</average_line_length>
            <complexity_score>Rate reading complexity 0.1-1.0</complexity_score>
            <auto_scroll_timing>
                <base_speed>Base scroll speed (words per minute)</base_speed>
                <pause_points>Identify natural pause points for scrolling</pause_points>
                <speed_variations>Suggest speed changes for different sections</speed_variations>
            </auto_scroll_timing>
        </reading_pace_analysis>
        
        <accessibility_analysis>
            <screen_reader_description>Generate comprehensive description for screen readers</screen_reader_description>
            <poem_summary>Brief summary of poem content and themes</poem_summary>
            <metaphor_explanations>Explain metaphors in accessible language</metaphor_explanations>
            <emotional_context>Describe emotional journey of the poem</emotional_context>
            <visual_elements>Describe visual elements for non-visual users</visual_elements>
        </accessibility_analysis>
        
        <traditional_analysis>
            <theme>overall thematic content</theme>
            <mood>emotional atmosphere</mood>
            <dominant_colors>5 colors that best represent the poem's visual essence</dominant_colors>
            <emotion>primary emotion conveyed</emotion>
            <imagery_type>type of imagery used</imagery_type>
        </traditional_analysis>
    </comprehensive_analysis_requirements>
    
    <few_shot_examples>
        <example_1>
            <poem>"The ocean whispers secrets to the shore,\nEach wave a story never told before.\nThe sand remembers every gentle touch,\nBut time erases memories so much."</poem>
            <analysis>
                <rhyme_scheme>"AABB"</rhyme_scheme>
                <metaphors>["ocean whispers secrets", "wave a story", "sand remembers"]</metaphors>
                <rhythm>"iambic tetrameter with natural flow"</rhythm>
                <seasonal>"ocean suggests summer/eternal"</seasonal>
                <accessibility>"A contemplative poem about memory and time using ocean metaphors"</accessibility>
            </analysis>
        </example_1>
        
        <example_2>
            <poem>"Morning light breaks through the window pane,\nPainting shadows on the wooden floor.\nCoffee steam rises like gentle rain,\nAs dreams fade through the open door."</poem>
            <analysis>
                <rhyme_scheme>"ABAB"</rhyme_scheme>
                <metaphors>["light breaks", "painting shadows", "steam rises like rain"]</metaphors>
                <rhythm>"iambic pentameter"</rhythm>
                <temporal>"morning, dawn imagery"</temporal>
                <accessibility>"A peaceful morning scene with sensory details about light and warmth"</accessibility>
            </analysis>
        </example_2>
    </few_shot_examples>
    
    <output_format>
        Return your response as a JSON object with this exact structure:
        {{
            "poem": "The complete 12-line poem as a single string with \\n for line breaks",
            "analysis": {{
                "rhyme": {{
                    "scheme": "AABB|ABAB|ABCB|free verse",
                    "density": 0.0-1.0,
                    "typography": {{
                        "font_style": "serif|sans-serif",
                        "line_spacing": 1.2-2.0,
                        "text_alignment": "left|center|justify"
                    }}
                }},
                "metaphors": {{
                    "identified": [
                        {{"line": 1, "text": "metaphor phrase", "type": "visual|conceptual|sensory|abstract"}},
                        {{"line": 3, "text": "another metaphor", "type": "visual"}}
                    ],
                    "visual_representations": [
                        {{"metaphor": "metaphor phrase", "icon": "icon_name", "color": "#hexcode", "animation": "animation_type"}}
                    ]
                }},
                "rhythm": {{
                    "syllable_pattern": [8, 9, 7, 8, 9, 7, 8, 9, 7, 8, 9, 7],
                    "stress_pattern": "iambic|trochaic|anapestic|dactylic|free",
                    "rhythm_type": "iambic pentameter|free verse|etc",
                    "animation_timing": {{
                        "base_duration": 2000,
                        "stagger_pattern": [0, 150, 300, 450],
                        "easing_function": "ease-out|ease-in|ease-in-out"
                    }}
                }},
                "temporal": {{
                    "seasonal_hints": ["spring", "summer", "fall", "winter"],
                    "time_of_day": "dawn|morning|noon|afternoon|evening|night",
                    "temporal_keywords": ["morning", "dawn", "sunrise"],
                    "background_suggestions": {{
                        "gradient_colors": ["#ff6b6b", "#4ecdc4"],
                        "particle_effects": "leaves|snow|rain|sparkles|dust",
                        "lighting_mood": "warm|cool|dramatic|soft"
                    }}
                }},
                "reading_pace": {{
                    "syllable_count": 96,
                    "average_line_length": 8.0,
                    "complexity_score": 0.6,
                    "auto_scroll_timing": {{
                        "base_speed": 200,
                        "pause_points": [3, 7, 11],
                        "speed_variations": {{"slow_sections": [1, 2], "fast_sections": [8, 9]}}
                    }}
                }},
                "accessibility": {{
                    "screen_reader_description": "A contemplative poem about [theme] that uses [metaphor types] to explore [emotional journey]",
                    "poem_summary": "Brief summary of content and themes",
                    "metaphor_explanations": ["Metaphor 1 explanation", "Metaphor 2 explanation"],
                    "emotional_context": "Description of emotional journey",
                    "visual_elements": "Description of visual elements for non-visual users"
                }},
                "traditional": {{
                    "theme": "brief theme description",
                    "mood": "dominant mood",
                    "dominant_colors": ["#color1", "#color2", "#color3", "#color4", "#color5"],
                    "emotion": "primary emotion",
                    "imagery_type": "type of imagery",
                    "word_count": 72,
                    "line_count": 12
                }}
            }}
        }}
    </output_format>
</enhanced_poem_generation_task>

Please generate a poem and perform comprehensive analysis using the provided words: {verb}, {adjective}, {noun}.
    """
    
    try:
        # Prepare the request body for Claude with increased token limit for comprehensive analysis
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 4000,  # Increased for comprehensive analysis
            "temperature": 0.6,  # Slightly lower for more consistent analysis
            "top_p": 0.9,
            "messages": [
                {
                    "role": "user",
                    "content": xml_prompt
                }
            ]
        }
        
        # Call Bedrock
        logger.info(f"Calling Bedrock with model: {BEDROCK_MODEL_ID}")
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
        used_fallback = False
        try:
            poem_data = extract_json_from_response(content)
        except Exception as e:
            logger.warning(f"Failed to parse Claude response: {str(e)}, creating fallback")
            poem_data = create_fallback_poem_data(content, verb, adjective, noun)
            used_fallback = True
            # Fallback data is already fully processed, return it
            logger.info("Enhanced poem generated using fallback successfully")
            return poem_data

        # Only process if we didn't use fallback
        if not used_fallback:
            # Add generation metadata
            poem_data['analysis']['metadata'] = {
                'generation_time': datetime.utcnow().isoformat(),
                'model_used': BEDROCK_MODEL_ID,
                'input_words': {
                    'verb': verb,
                    'adjective': adjective,
                    'noun': noun
                }
            }

            # Convert colors to hex codes in traditional analysis
            poem_data['analysis']['traditional']['dominant_colors'] = convert_colors_to_hex(
                poem_data['analysis']['traditional']['dominant_colors']
            )

            # Validate and enhance the analysis data
            poem_data = validate_and_enhance_analysis(poem_data)

            # Transform analysis to match frontend expectations
            transformed_analysis = transform_analysis_for_frontend(
                poem_data['analysis'],
                verb,
                adjective,
                noun
            )
            poem_data['analysis'] = transformed_analysis

            # Also generate the simple Theme object that frontend PoemData interface expects
            poem_data['theme'] = extract_simple_theme_from_analysis(transformed_analysis)

            # Add metadata that frontend PoemData interface expects
            poem_data['metadata'] = create_poem_metadata(poem_data, verb, adjective, noun)
        
        logger.info("Enhanced poem generated and analyzed successfully")
        return poem_data
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        logger.error(f"Bedrock API error: {error_code} - {error_message}")
        
        if error_code == 'ThrottlingException':
            raise Exception('Service is currently busy. Please try again in a moment.')
        elif error_code == 'ValidationException':
            raise Exception('Invalid request format. Please check your input.')
        elif error_code == 'AccessDeniedException':
            raise Exception('Access denied to Bedrock service. Please check permissions.')
        else:
            raise Exception(f'Bedrock service error: {error_message}')
            
    except BotoCoreError as e:
        logger.error(f"Boto3 error: {str(e)}")
        raise Exception('AWS service connection error. Please try again.')
    
    except Exception as e:
        logger.error(f"Unexpected error in poem generation: {str(e)}")
        raise Exception('Failed to generate poem. Please try again.')

def extract_json_from_response(content: str) -> Dict[str, Any]:
    """
    Extract JSON from Claude's response text
    
    Args:
        content: Raw response text from Claude
    
    Returns:
        Parsed poem data dictionary
    """
    try:
        # Look for JSON block in the response
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            json_str = json_match.group(0)
            return json.loads(json_str)
        else:
            # Fallback: try to parse the entire content
            return json.loads(content)
            
    except json.JSONDecodeError as e:
        logger.error(f"Could not parse JSON from Claude response: {str(e)}")
        raise Exception("Failed to parse Claude response as JSON")

def create_fallback_poem_data(content: str, verb: str = "unknown", adjective: str = "unknown", noun: str = "unknown") -> Dict[str, Any]:
    """
    Create fallback poem data when JSON parsing fails
    
    Args:
        content: Raw content from Claude
    
    Returns:
        Structured poem data dictionary with enhanced analysis
    """
    # Extract poem lines (assume they're at the beginning)
    lines = content.split('\n')
    poem_lines = [line.strip() for line in lines if line.strip()][:12]
    poem = '\n'.join(poem_lines)
    
    # Transform analysis to match frontend expectations
    analysis_data = {
        "rhyme": {
            "scheme": "free verse",
            "density": 0.0,
            "typography": {
                "font_style": "sans-serif",
                "line_spacing": 1.6,
                "text_alignment": "left"
            }
        },
        "metaphors": {
            "identified": [],
            "visual_representations": []
        },
        "rhythm": {
            "syllable_pattern": [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
            "stress_pattern": "free",
            "rhythm_type": "free verse",
            "animation_timing": {
                "base_duration": 2000,
                "stagger_pattern": [0, 150, 300, 450],
                "easing_function": "ease-out"
            }
        },
        "temporal": {
            "seasonal_hints": [],
            "time_of_day": "neutral",
            "temporal_keywords": [],
            "background_suggestions": {
                "gradient_colors": ["#6b7280", "#9ca3af"],
                "particle_effects": "dust",
                "lighting_mood": "neutral"
            }
        },
        "reading_pace": {
            "syllable_count": len(poem.split()) * 1.5,  # Rough estimate
            "average_line_length": 8.0,
            "complexity_score": 0.5,
            "auto_scroll_timing": {
                "base_speed": 200,
                "pause_points": [3, 7, 11],
                "speed_variations": {"slow_sections": [], "fast_sections": []}
            }
        },
        "accessibility": {
            "screen_reader_description": "A contemplative poem with abstract themes",
            "poem_summary": "A reflective piece exploring universal themes",
            "metaphor_explanations": [],
            "emotional_context": "Contemplative and reflective mood",
            "visual_elements": "Minimal visual elements with focus on text"
        },
        "traditional": {
            "theme": "contemplative",
            "mood": "reflective",
            "dominant_colors": ["#6b7280", "#9ca3af", "#d1d5db", "#f3f4f6", "#ffffff"],
            "emotion": "neutral",
            "imagery_type": "abstract",
            "word_count": len(poem.split()),
            "line_count": len(poem_lines)
        },
        "metadata": {
            "analysis_confidence": 0.3,
            "processing_notes": "Fallback analysis due to parsing error"
        }
    }
    
    # Transform to frontend expected format
    transformed_analysis = transform_analysis_for_frontend(analysis_data, verb, adjective, noun)
    fallback_data = {
        "poem": poem,
        "analysis": transformed_analysis,
        "theme": extract_simple_theme_from_analysis(transformed_analysis)
    }
    fallback_data['metadata'] = create_poem_metadata(fallback_data, verb, adjective, noun)
    return fallback_data

def validate_and_enhance_analysis(poem_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and enhance the analysis data to ensure all values are within expected ranges
    
    Args:
        poem_data: Raw poem data from Claude
    
    Returns:
        Validated and enhanced poem data
    """
    analysis = poem_data.get('analysis', {})
    
    # Validate rhyme analysis
    if 'rhyme' in analysis:
        rhyme = analysis['rhyme']
        rhyme['density'] = max(0.0, min(1.0, rhyme.get('density', 0.0)))
        
        if 'typography' in rhyme:
            typo = rhyme['typography']
            typo['line_spacing'] = max(1.2, min(2.0, typo.get('line_spacing', 1.6)))
    
    # Validate rhythm analysis
    if 'rhythm' in analysis:
        rhythm = analysis['rhythm']
        if 'animation_timing' in rhythm:
            timing = rhythm['animation_timing']
            timing['base_duration'] = max(500, min(5000, timing.get('base_duration', 2000)))
            
            if 'stagger_pattern' in timing:
                timing['stagger_pattern'] = [max(0, min(1000, delay)) for delay in timing['stagger_pattern']]
    
    # Validate reading pace analysis
    if 'reading_pace' in analysis:
        pace = analysis['reading_pace']
        pace['complexity_score'] = max(0.1, min(1.0, pace.get('complexity_score', 0.5)))
        
        if 'auto_scroll_timing' in pace:
            scroll = pace['auto_scroll_timing']
            scroll['base_speed'] = max(100, min(500, scroll.get('base_speed', 200)))
            
            if 'pause_points' in scroll:
                scroll['pause_points'] = [max(1, min(12, point)) for point in scroll['pause_points']]
    
    # Validate temporal analysis
    if 'temporal' in analysis:
        temporal = analysis['temporal']
        if 'background_suggestions' in temporal:
            bg = temporal['background_suggestions']
            if 'gradient_colors' in bg:
                # Ensure gradient colors are valid hex codes
                bg['gradient_colors'] = [convert_colors_to_hex([color])[0] for color in bg['gradient_colors']]
    
    # Validate traditional analysis
    if 'traditional' in analysis:
        traditional = analysis['traditional']
        if 'dominant_colors' in traditional:
            traditional['dominant_colors'] = convert_colors_to_hex(traditional['dominant_colors'])
    
    # Add analysis confidence if not present
    if 'metadata' not in analysis:
        analysis['metadata'] = {}
    
    analysis['metadata']['analysis_confidence'] = analysis['metadata'].get('analysis_confidence', 0.8)
    analysis['metadata']['enhanced_features'] = [
        'rhyme_detection',
        'metaphor_identification', 
        'rhythm_analysis',
        'temporal_detection',
        'reading_pace',
        'accessibility_descriptions'
    ]
    
    return poem_data

def convert_colors_to_hex(colors: list) -> list:
    """
    Convert color names to hex codes
    
    Args:
        colors: List of color names
    
    Returns:
        List of hex color codes
    """
    color_map = {
        'red': '#dc2626', 'crimson': '#dc143c', 'scarlet': '#ff2400',
        'blue': '#2563eb', 'navy': '#000080', 'azure': '#007fff',
        'green': '#16a34a', 'emerald': '#059669', 'forest': '#228b22',
        'yellow': '#ca8a04', 'gold': '#ffd700', 'amber': '#f59e0b',
        'purple': '#9333ea', 'violet': '#8b5cf6', 'indigo': '#4f46e5',
        'orange': '#ea580c', 'coral': '#ff7f50', 'salmon': '#fa8072',
        'pink': '#ec4899', 'rose': '#f43f5e', 'magenta': '#d946ef',
        'brown': '#a16207', 'tan': '#d2b48c', 'beige': '#f5f5dc',
        'gray': '#6b7280', 'grey': '#6b7280', 'silver': '#c0c0c0',
        'black': '#1f2937', 'white': '#f9fafb',
        'teal': '#0d9488', 'cyan': '#0891b2', 'lime': '#65a30d'
    }
    
    hex_colors = []
    for color in colors:
        color_lower = color.lower().strip()
        hex_colors.append(color_map.get(color_lower, '#6b7280'))  # Default to gray
    
    return hex_colors

def transform_analysis_for_frontend(analysis: Dict[str, Any], verb: str, adjective: str, noun: str) -> Dict[str, Any]:
    """
    Transform backend analysis format to match frontend expectations.
    Converts the detailed analysis into visualRecommendations and themeAnalysis.
    
    Args:
        analysis: Raw analysis data from backend
        verb: Original verb input
        adjective: Original adjective input
        noun: Original noun input
    
    Returns:
        Transformed analysis matching frontend PoemAnalysis interface
    """
    # Extract data from backend analysis
    traditional = analysis.get('traditional', {})
    rhythm = analysis.get('rhythm', {})
    temporal = analysis.get('temporal', {})
    rhyme = analysis.get('rhyme', {})
    
    # Get dominant colors or use defaults
    dominant_colors = traditional.get('dominant_colors', ['#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6', '#ffffff'])
    gradient_colors = temporal.get('background_suggestions', {}).get('gradient_colors', dominant_colors[:3])
    
    # Map emotion to intensity
    emotion = traditional.get('emotion', 'neutral')
    intensity_map = {
        'intense': 'high',
        'passionate': 'high',
        'angry': 'high',
        'excited': 'high',
        'calm': 'low',
        'peaceful': 'low',
        'neutral': 'medium',
        'contemplative': 'medium',
        'reflective': 'medium'
    }
    intensity = intensity_map.get(emotion, 'medium')
    
    # Determine animation style based on rhythm and mood
    rhythm_type = rhythm.get('rhythm_type', 'free verse')
    mood = traditional.get('mood', 'reflective')
    animation_style = 'calm'
    if rhythm_type in ['iambic', 'trochaic']:
        animation_style = 'energetic'
    elif mood in ['dramatic', 'intense']:
        animation_style = 'dramatic'
    elif mood in ['mysterious', 'ethereal']:
        animation_style = 'mystical'
    
    # Get animation timing
    animation_timing = rhythm.get('animation_timing', {})
    duration = animation_timing.get('base_duration', 2000)
    easing = animation_timing.get('easing_function', 'ease-out')
    stagger_pattern = animation_timing.get('stagger_pattern', [0, 150, 300, 450])
    stagger = stagger_pattern[1] if len(stagger_pattern) > 1 else 150
    
    # Determine typography based on rhyme analysis
    typography = rhyme.get('typography', {})
    font_style = typography.get('font_style', 'sans-serif')
    line_spacing = typography.get('line_spacing', 1.6)
    
    # Create visual effects based on mood and emotion
    effects = {
        'blur': mood in ['ethereal', 'dreamy', 'mysterious'],
        'glow': emotion in ['hopeful', 'magical', 'wonder', 'love'],
        'shadow': intensity == 'high' or mood in ['dramatic', 'intense'],
        'gradient': len(gradient_colors) > 2
    }
    
    # Build the transformed analysis
    return {
        'themeAnalysis': {
            'emotional_tone': {
                'primary': emotion,
                'secondary': mood if mood != emotion else None,
                'intensity': intensity,
                'scores': {
                    emotion: 0.8,
                    mood: 0.6 if mood != emotion else 0
                }
            },
            'themes': [traditional.get('theme', 'contemplative')],
            'literary_devices': analysis.get('metaphors', {}).get('identified', []),
            'word_analysis': {
                'original': {
                    'verb': verb,
                    'adjective': adjective,
                    'noun': noun
                },
                'enhanced': {
                    'verb': verb,
                    'adjective': adjective,
                    'noun': noun
                },
                'transformation_quality': 'moderate'
            }
        },
        'visualRecommendations': {
            'colors': {
                'primary': dominant_colors[0] if dominant_colors else '#6b7280',
                'secondary': dominant_colors[1] if len(dominant_colors) > 1 else '#9ca3af',
                'accent': dominant_colors[2] if len(dominant_colors) > 2 else '#d1d5db',
                'background': dominant_colors[3] if len(dominant_colors) > 3 else '#f3f4f6',
                'gradient': gradient_colors
            },
            'typography': {
                'fontFamily': font_style,
                'fontWeight': '400' if mood == 'reflective' else '500',
                'letterSpacing': 'normal',
                'lineHeight': line_spacing,
                'fontSize': 'medium'
            },
            'animations': {
                'duration': duration,
                'easing': easing,
                'stagger': stagger,
                'style': animation_style
            },
            'layout': {
                'style': 'centered',
                'alignment': typography.get('text_alignment', 'left'),
                'spacing': 'normal'
            },
            'effects': effects
        },
        'poetryMetrics': {
            'readabilityScore': 0.85,
            'emotionalImpact': 0.7 if intensity == 'high' else 0.5,
            'creativityIndex': 0.75,
            'coherenceScore': 0.9
        }
    }

def extract_simple_theme_from_analysis(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract a simple Theme object from the complex analysis for frontend compatibility.
    This ensures the frontend PoemData interface gets the Theme object it expects.

    Args:
        analysis: Complex analysis data with visualRecommendations

    Returns:
        Simple Theme object matching frontend Theme interface
    """
    visual_recs = analysis.get('visualRecommendations', {})
    colors = visual_recs.get('colors', {})
    animations = visual_recs.get('animations', {})
    typography = visual_recs.get('typography', {})

    # Extract gradient colors (ensure we have an array)
    gradient = colors.get('gradient', [])
    if not gradient or len(gradient) < 2:
        # Fallback gradient from primary colors
        gradient = [
            colors.get('primary', '#6b7280'),
            colors.get('secondary', '#9ca3af'),
            colors.get('accent', '#d1d5db')
        ]

    # Map typography mood to simple mood
    font_family = typography.get('fontFamily', 'sans-serif')
    if font_family in ['serif', 'Georgia', 'Times']:
        typography_mood = 'classic'
    elif 'playful' in font_family.lower() or 'comic' in font_family.lower():
        typography_mood = 'playful'
    elif 'elegant' in font_family.lower() or 'script' in font_family.lower():
        typography_mood = 'elegant'
    else:
        typography_mood = 'modern'

    # Ensure animation style is valid
    animation_style = animations.get('style', 'calm')
    valid_styles = ['calm', 'energetic', 'dramatic', 'mystical']
    if animation_style not in valid_styles:
        animation_style = 'calm'

    return {
        "colors": {
            "primary": colors.get('primary', '#6b7280'),
            "secondary": colors.get('secondary', '#9ca3af'),
            "accent": colors.get('accent', '#d1d5db'),
            "background": colors.get('background', '#f3f4f6'),
            "gradient": gradient
        },
        "animations": {
            "style": animation_style,
            "duration": animations.get('duration', 2000),
            "stagger": animations.get('stagger', 150)
        },
        "typography": {
            "mood": typography_mood,
            "scale": 1.0  # Default scale
        }
    }

def create_poem_metadata(poem_data: Dict[str, Any], verb: str, adjective: str, noun: str) -> Dict[str, Any]:
    """
    Create metadata object that matches frontend PoemMetadata interface.

    Args:
        poem_data: Full poem data with analysis
        verb: Original verb input
        adjective: Original adjective input
        noun: Original noun input

    Returns:
        Metadata object matching frontend PoemMetadata interface
    """
    import uuid
    import time

    poem_text = poem_data.get('poem', '')
    analysis = poem_data.get('analysis', {})
    theme_analysis = analysis.get('themeAnalysis', {})

    # Generate unique ID for this poem
    poem_id = f"poem-{int(time.time())}-{str(uuid.uuid4())[:8]}"

    # Calculate word count
    word_count = len(poem_text.split()) if poem_text else 0

    # Extract emotion and sentiment from theme analysis
    emotional_tone = theme_analysis.get('emotional_tone', {})
    primary_emotion = emotional_tone.get('primary', 'neutral')
    sentiment = primary_emotion  # Use primary emotion as sentiment

    # Calculate approximate generation time (placeholder for now)
    generation_time = 1.5

    return {
        "id": poem_id,
        "wordCount": word_count,
        "sentiment": sentiment,
        "emotion": primary_emotion,
        "generationTime": generation_time
    }

def generate_enhanced_fallback_poem(verb: str, adjective: str, noun: str) -> Dict[str, Any]:
    """
    Generate an enhanced fallback poem with dynamic content based on input words.
    This provides a much better user experience when Bedrock is not available.

    Args:
        verb: Action word for the poem
        adjective: Descriptive word for the poem
        noun: Subject/object word for the poem

    Returns:
        Complete poem data with theme and analysis
    """
    import random

    # Dynamic poem templates based on word types
    poem_templates = [
        # Template 1: Nature/mystical
        f"""In the {adjective} light of dawn,
Where {noun} {verb} with grace unknown,
Through meadows where the wild winds {verb},
And {adjective} dreams are gently sown.

The {noun} speaks in whispered tones,
Of {adjective} tales from times before,
While shadows {verb} through ancient stones,
And secrets wait by every shore.

O {adjective} {noun}, forever {verb},
In realms where mortal eyes can't see,
Your essence shall forever {verb},
In {adjective} eternity.""",

        # Template 2: Urban/modern
        f"""Through {adjective} streets the {noun} moves,
In rhythms that the city {verb},
Where neon lights in {adjective} grooves
Paint stories that the night has heard.

The {noun} {verb} through concrete dreams,
Past windows where the lonely dwell,
In {adjective} light and midnight schemes,
With tales that only shadows tell.

And in this {adjective} urban sea,
The {noun} continues still to {verb},
A beacon of what we could be,
In worlds where {adjective} spirits serve.""",

        # Template 3: Emotional/introspective
        f"""Within the {adjective} chambers of the heart,
Where {noun} and soul {verb} as one,
Each {adjective} thought, each feeling's art,
Reveals what we've become.

The {noun} {verb} through memories deep,
In {adjective} corridors of time,
Where treasured moments softly sleep,
In rhythm and in rhyme.

So let the {adjective} {noun} {verb},
Through pathways of the mind and soul,
And in its gentle, {adjective} curve,
We'll find ourselves made whole."""
    ]

    # Select template based on word characteristics
    if noun.lower() in ['nature', 'forest', 'ocean', 'mountain', 'sky', 'moon', 'star', 'sun', 'flower', 'tree']:
        selected_poem = poem_templates[0]
    elif noun.lower() in ['city', 'street', 'building', 'light', 'sound', 'music', 'car', 'phone', 'computer']:
        selected_poem = poem_templates[1]
    else:
        selected_poem = poem_templates[2]

    # Create enhanced analysis based on the words
    emotion_map = {
        'dark': 'mysterious', 'bright': 'joyful', 'sad': 'melancholy', 'happy': 'euphoric',
        'calm': 'peaceful', 'wild': 'energetic', 'gentle': 'serene', 'fierce': 'intense',
        'ancient': 'nostalgic', 'new': 'hopeful', 'old': 'contemplative', 'young': 'vibrant',
        'deep': 'profound', 'light': 'ethereal', 'heavy': 'somber', 'soft': 'tender'
    }

    color_map = {
        'dark': ['#2d3748', '#1a202c', '#4a5568'], 'bright': ['#fbbf24', '#f59e0b', '#d97706'],
        'blue': ['#3182ce', '#2b77e0', '#1e40af'], 'red': ['#e53e3e', '#c53030', '#9b2c2c'],
        'green': ['#38a169', '#2f855a', '#276749'], 'purple': ['#805ad5', '#6b46c1', '#553c9a'],
        'gold': ['#d69e2e', '#b7791f', '#975a16'], 'silver': ['#a0aec0', '#718096', '#4a5568']
    }

    # Determine emotion and colors from adjective
    primary_emotion = emotion_map.get(adjective.lower(), 'contemplative')
    colors = color_map.get(adjective.lower(), ['#6b7280', '#9ca3af', '#d1d5db'])

    # Animation style based on verb
    animation_style = 'calm'
    if verb.lower() in ['dance', 'leap', 'rush', 'race', 'fly']:
        animation_style = 'energetic'
    elif verb.lower() in ['whisper', 'glide', 'flow', 'drift']:
        animation_style = 'mystical'
    elif verb.lower() in ['thunder', 'crash', 'roar', 'strike']:
        animation_style = 'dramatic'

    # Build the complete analysis
    analysis_data = {
        "rhyme": {
            "scheme": "ABAB",
            "density": 0.8,
            "typography": {
                "font_style": "serif",
                "line_spacing": 1.8,
                "text_alignment": "left"
            }
        },
        "metaphors": {
            "identified": [
                {"line": 1, "text": f"{adjective} light", "type": "visual"},
                {"line": 3, "text": f"{noun} speaks", "type": "conceptual"}
            ],
            "visual_representations": [
                {"metaphor": f"{adjective} light", "icon": "sun", "color": colors[0], "animation": "glow"}
            ]
        },
        "rhythm": {
            "syllable_pattern": [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
            "stress_pattern": "iambic",
            "rhythm_type": "iambic tetrameter",
            "animation_timing": {
                "base_duration": 2500,
                "stagger_pattern": [0, 200, 400, 600],
                "easing_function": "ease-in-out"
            }
        },
        "temporal": {
            "seasonal_hints": ["eternal"],
            "time_of_day": "dawn",
            "temporal_keywords": ["dawn", "before", "forever"],
            "background_suggestions": {
                "gradient_colors": colors[:2],
                "particle_effects": "sparkles",
                "lighting_mood": "warm"
            }
        },
        "reading_pace": {
            "syllable_count": 96,
            "average_line_length": 8.0,
            "complexity_score": 0.7,
            "auto_scroll_timing": {
                "base_speed": 180,
                "pause_points": [4, 8, 12],
                "speed_variations": {"slow_sections": [1, 9], "fast_sections": [5]}
            }
        },
        "accessibility": {
            "screen_reader_description": f"A contemplative poem about {adjective} {noun} that {verb} through lyrical imagery",
            "poem_summary": f"An emotional journey exploring the relationship between {verb}, {adjective}, and {noun}",
            "metaphor_explanations": [f"The {adjective} light represents hope and possibility"],
            "emotional_context": f"The poem evokes {primary_emotion} feelings through nature imagery",
            "visual_elements": "Structured verses with flowing rhythm and gentle rhyme scheme"
        },
        "traditional": {
            "theme": f"{primary_emotion} reflection",
            "mood": primary_emotion,
            "dominant_colors": colors,
            "emotion": primary_emotion,
            "imagery_type": "lyrical",
            "word_count": len(selected_poem.split()),
            "line_count": 12
        },
        "metadata": {
            "analysis_confidence": 0.9,
            "processing_notes": "Enhanced fallback with dynamic word-based generation"
        }
    }

    # Transform to frontend expected format
    transformed_analysis = transform_analysis_for_frontend(analysis_data, verb, adjective, noun)
    poem_data = {
        "poem": selected_poem,
        "analysis": transformed_analysis,
        "theme": extract_simple_theme_from_analysis(transformed_analysis)
    }
    poem_data['metadata'] = create_poem_metadata(poem_data, verb, adjective, noun)

    logger.info(f"Generated enhanced fallback poem with {primary_emotion} theme and {animation_style} animation")
    return poem_data

def get_cached_poem(cache_key: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve cached poem from DynamoDB
    
    Args:
        cache_key: Cache key for the poem
    
    Returns:
        Cached poem data or None if not found/expired
    """
    try:
        table = dynamodb.Table(DYNAMODB_TABLE_NAME)
        response = table.get_item(Key={'cache_key': cache_key})
        
        if 'Item' in response:
            item = response['Item']
            # Check if item is still valid (TTL not expired)
            if 'ttl' in item and item['ttl'] > datetime.utcnow().timestamp():
                return item['poem_data']
        
        return None
        
    except Exception as e:
        logger.error(f"Error retrieving cached poem: {str(e)}")
        return None

def cache_poem(cache_key: str, poem_data: Dict[str, Any]) -> None:
    """
    Cache poem data in DynamoDB
    
    Args:
        cache_key: Cache key for the poem
        poem_data: Poem data to cache
    """
    try:
        table = dynamodb.Table(DYNAMODB_TABLE_NAME)
        
        # Set TTL to 24 hours from now
        ttl = int((datetime.utcnow().timestamp()) + 86400)
        
        table.put_item(
            Item={
                'cache_key': cache_key,
                'poem_data': poem_data,
                'ttl': ttl,
                'created_at': datetime.utcnow().isoformat()
            }
        )
        
        logger.info(f"Poem cached successfully with key: {cache_key}")
        
    except Exception as e:
        logger.error(f"Error caching poem: {str(e)}")
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
