"""
Comprehensive Jest-style unit tests for WordWeave theme generation logic
Tests all aspects of theme analysis including validation, caching, and error handling
"""

import pytest
import json
import hashlib
import time
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, MagicMock
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from theme_analyzer import (
    lambda_handler,
    validate_input,
    analyze_theme_with_retry,
    analyze_theme_with_bedrock,
    extract_json_from_response,
    create_fallback_analysis,
    validate_and_sanitize_analysis,
    generate_cache_key,
    get_cached_analysis,
    cache_analysis,
    create_response,
    create_error_response
)


class TestThemeAnalyzer:
    """Test suite for theme analysis functionality"""

    def test_validate_input_success(self):
        """Test successful input validation"""
        valid_body = {"poem": "A beautiful poem about nature"}
        result = validate_input(valid_body)
        assert result is None

    def test_validate_input_missing_poem(self):
        """Test validation failure when poem is missing"""
        invalid_body = {"not_poem": "some text"}
        result = validate_input(invalid_body)
        assert result is not None
        assert result["statusCode"] == 400
        assert "MISSING_POEM" in result["body"]

    def test_validate_input_empty_poem(self):
        """Test validation failure when poem is empty"""
        invalid_body = {"poem": "   "}
        result = validate_input(invalid_body)
        assert result is not None
        assert result["statusCode"] == 400
        assert "EMPTY_POEM" in result["body"]

    def test_validate_input_poem_too_long(self):
        """Test validation failure when poem exceeds length limit"""
        long_poem = "a" * 5001  # Exceeds 5000 character limit
        invalid_body = {"poem": long_poem}
        result = validate_input(invalid_body)
        assert result is not None
        assert result["statusCode"] == 400
        assert "POEM_TOO_LONG" in result["body"]

    def test_validate_input_invalid_type(self):
        """Test validation failure when poem is not a string"""
        invalid_body = {"poem": 123}
        result = validate_input(invalid_body)
        assert result is not None
        assert result["statusCode"] == 400
        assert "INVALID_TYPE" in result["body"]

    def test_generate_cache_key_consistency(self):
        """Test that cache key generation is consistent"""
        poem = "The same poem content"
        key1 = generate_cache_key(poem)
        key2 = generate_cache_key(poem)
        assert key1 == key2
        assert len(key1) == 64  # SHA-256 hex length

    def test_generate_cache_key_normalization(self):
        """Test that cache key generation normalizes input"""
        poem1 = "The poem with\r\nline breaks"
        poem2 = "The poem with\nline breaks"
        poem3 = "  The poem with\nline breaks  "
        
        key1 = generate_cache_key(poem1)
        key2 = generate_cache_key(poem2)
        key3 = generate_cache_key(poem3)
        
        assert key1 == key2 == key3

    def test_create_fallback_analysis_structure(self):
        """Test that fallback analysis has correct structure"""
        fallback = create_fallback_analysis()
        
        # Check required top-level keys
        required_keys = ["emotion", "colors", "animation", "imagery", "typography", "layout", "metadata"]
        for key in required_keys:
            assert key in fallback

        # Check emotion structure
        assert "primary" in fallback["emotion"]
        assert "intensity" in fallback["emotion"]
        assert isinstance(fallback["emotion"]["intensity"], (int, float))
        assert 0 <= fallback["emotion"]["intensity"] <= 1

        # Check colors structure
        assert "palette" in fallback["colors"]
        assert len(fallback["colors"]["palette"]) == 5
        for color in fallback["colors"]["palette"]:
            assert "hex" in color
            assert "weight" in color
            assert "role" in color

    def test_extract_json_from_response_valid_json(self):
        """Test JSON extraction from valid response"""
        valid_json = '{"emotion": {"primary": "joy", "intensity": 0.8}}'
        result = extract_json_from_response(valid_json)
        assert result["emotion"]["primary"] == "joy"
        assert result["emotion"]["intensity"] == 0.8

    def test_extract_json_from_response_with_text(self):
        """Test JSON extraction from response with surrounding text"""
        response_with_text = 'Here is the analysis:\n{"emotion": {"primary": "sadness", "intensity": 0.6}}\nEnd of response.'
        result = extract_json_from_response(response_with_text)
        assert result["emotion"]["primary"] == "sadness"
        assert result["emotion"]["intensity"] == 0.6

    def test_extract_json_from_response_invalid_json(self):
        """Test JSON extraction fallback when JSON is invalid"""
        invalid_json = 'This is not valid JSON at all'
        result = extract_json_from_response(invalid_json)
        # Should return fallback analysis
        assert "emotion" in result
        assert "colors" in result

    def test_validate_and_sanitize_analysis_emotion_intensity(self):
        """Test emotion intensity validation and sanitization"""
        data = {
            "emotion": {
                "primary": "joy",
                "intensity": 1.5,  # Invalid: > 1.0
                "secondary": [{"emotion": "excitement", "intensity": -0.2}]  # Invalid: < 0.0
            }
        }
        result = validate_and_sanitize_analysis(data)
        
        # Should be clamped to valid ranges
        assert result["emotion"]["intensity"] == 1.0
        assert result["emotion"]["secondary"][0]["intensity"] == 0.0

    def test_validate_and_sanitize_analysis_animation_timing(self):
        """Test animation timing validation and sanitization"""
        data = {
            "animation": {
                "timing": {
                    "duration": 100,  # Too low
                    "stagger_delay": 600  # Too high
                }
            }
        }
        result = validate_and_sanitize_analysis(data)
        
        # Should be clamped to valid ranges
        assert result["animation"]["timing"]["duration"] == 500  # Min value
        assert result["animation"]["timing"]["stagger_delay"] == 500  # Max value

    def test_validate_and_sanitize_analysis_typography(self):
        """Test typography validation and sanitization"""
        data = {
            "typography": {
                "font_weight": 100,  # Too low
                "font_scale": 2.0,   # Too high
                "line_height": 1.0,  # Too low
                "letter_spacing": -0.1,  # Too low
                "text_shadow": 10  # Too high
            }
        }
        result = validate_and_sanitize_analysis(data)
        
        # Should be clamped to valid ranges
        assert result["typography"]["font_weight"] == 300  # Min value
        assert result["typography"]["font_scale"] == 1.5   # Max value
        assert result["typography"]["line_height"] == 1.2  # Min value
        assert result["typography"]["letter_spacing"] == -0.05  # Min value
        assert result["typography"]["text_shadow"] == 4  # Max value

    def test_validate_and_sanitize_analysis_layout(self):
        """Test layout validation and sanitization"""
        data = {
            "layout": {
                "spacing_scale": 0.5,  # Too low
                "border_radius": 25,   # Too high
                "backdrop_blur": -5,   # Too low
                "gradient_angle": 450, # Should be normalized
                "opacity_variations": [0.05, 1.5, -0.1]  # Out of range
            }
        }
        result = validate_and_sanitize_analysis(data)
        
        # Should be clamped to valid ranges
        assert result["layout"]["spacing_scale"] == 0.8  # Min value
        assert result["layout"]["border_radius"] == 20   # Max value
        assert result["layout"]["backdrop_blur"] == 0    # Min value
        assert result["layout"]["gradient_angle"] == 90  # Normalized (450 % 360)
        assert result["layout"]["opacity_variations"] == [0.1, 1.0, 0.1]  # Clamped

    def test_validate_and_sanitize_analysis_colors(self):
        """Test color weight validation and sanitization"""
        data = {
            "colors": {
                "palette": [
                    {"hex": "#ff0000", "weight": 1.5, "role": "primary"},  # Too high
                    {"hex": "#00ff00", "weight": 0.05, "role": "secondary"}  # Too low
                ]
            }
        }
        result = validate_and_sanitize_analysis(data)
        
        # Should be clamped to valid ranges
        assert result["colors"]["palette"][0]["weight"] == 1.0  # Max value
        assert result["colors"]["palette"][1]["weight"] == 0.1  # Min value

    def test_create_response_success(self):
        """Test successful response creation"""
        body = {"success": True, "data": "test"}
        response = create_response(200, body)
        
        assert response["statusCode"] == 200
        assert response["headers"]["Content-Type"] == "application/json"
        assert response["headers"]["Access-Control-Allow-Origin"] == "*"
        assert "success" in response["body"]

    def test_create_error_response(self):
        """Test error response creation"""
        response = create_error_response(400, "TEST_ERROR", "Test error message")
        
        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert body["success"] is False
        assert body["error"]["code"] == "TEST_ERROR"
        assert body["error"]["message"] == "Test error message"
        assert "timestamp" in body

    @patch('theme_analyzer.dynamodb')
    def test_get_cached_analysis_hit(self, mock_dynamodb):
        """Test successful cache retrieval"""
        # Mock DynamoDB response
        mock_table = Mock()
        mock_dynamodb.Table.return_value = mock_table
        
        cache_key = "test_key"
        analysis_data = {"emotion": {"primary": "joy"}}
        ttl = int((datetime.utcnow() + timedelta(hours=1)).timestamp())
        
        mock_table.get_item.return_value = {
            "Item": {
                "cache_key": cache_key,
                "analysis_data": analysis_data,
                "ttl": ttl
            }
        }
        
        result = get_cached_analysis(cache_key)
        assert result == analysis_data
        mock_table.get_item.assert_called_once_with(Key={'cache_key': cache_key})

    @patch('theme_analyzer.dynamodb')
    def test_get_cached_analysis_miss(self, mock_dynamodb):
        """Test cache miss"""
        mock_table = Mock()
        mock_dynamodb.Table.return_value = mock_table
        mock_table.get_item.return_value = {}
        
        result = get_cached_analysis("nonexistent_key")
        assert result is None

    @patch('theme_analyzer.dynamodb')
    def test_get_cached_analysis_expired(self, mock_dynamodb):
        """Test expired cache item"""
        mock_table = Mock()
        mock_dynamodb.Table.return_value = mock_table
        
        # TTL in the past
        expired_ttl = int((datetime.utcnow() - timedelta(hours=1)).timestamp())
        
        mock_table.get_item.return_value = {
            "Item": {
                "cache_key": "expired_key",
                "analysis_data": {"emotion": {"primary": "joy"}},
                "ttl": expired_ttl
            }
        }
        
        result = get_cached_analysis("expired_key")
        assert result is None

    @patch('theme_analyzer.dynamodb')
    def test_cache_analysis_success(self, mock_dynamodb):
        """Test successful analysis caching"""
        mock_table = Mock()
        mock_dynamodb.Table.return_value = mock_table
        
        cache_key = "test_key"
        analysis_data = {"emotion": {"primary": "joy"}}
        
        cache_analysis(cache_key, analysis_data)
        
        mock_table.put_item.assert_called_once()
        call_args = mock_table.put_item.call_args[1]["Item"]
        assert call_args["cache_key"] == cache_key
        assert call_args["analysis_data"] == analysis_data
        assert "ttl" in call_args
        assert "created_at" in call_args

    @patch('theme_analyzer.bedrock_client')
    def test_analyze_theme_with_bedrock_success(self, mock_bedrock):
        """Test successful Bedrock theme analysis"""
        # Mock Bedrock response
        mock_response = {
            'body': Mock()
        }
        mock_response['body'].read.return_value = json.dumps({
            'content': [{'text': '{"emotion": {"primary": "joy", "intensity": 0.8}}}']
        }).encode()
        
        mock_bedrock.invoke_model.return_value = mock_response
        
        result = analyze_theme_with_bedrock("A joyful poem")
        
        assert result["emotion"]["primary"] == "joy"
        assert result["emotion"]["intensity"] == 0.8
        assert "metadata" in result

    @patch('theme_analyzer.bedrock_client')
    def test_analyze_theme_with_bedrock_throttling(self, mock_bedrock):
        """Test Bedrock throttling exception"""
        from botocore.exceptions import ClientError
        
        # Mock throttling exception
        mock_bedrock.invoke_model.side_effect = ClientError(
            error_response={'Error': {'Code': 'ThrottlingException', 'Message': 'Rate exceeded'}},
            operation_name='InvokeModel'
        )
        
        with pytest.raises(Exception) as exc_info:
            analyze_theme_with_bedrock("A test poem")
        
        assert "Analysis service is currently busy" in str(exc_info.value)

    @patch('theme_analyzer.bedrock_client')
    def test_analyze_theme_with_bedrock_validation_error(self, mock_bedrock):
        """Test Bedrock validation exception"""
        from botocore.exceptions import ClientError
        
        # Mock validation exception
        mock_bedrock.invoke_model.side_effect = ClientError(
            error_response={'Error': {'Code': 'ValidationException', 'Message': 'Invalid request'}},
            operation_name='InvokeModel'
        )
        
        with pytest.raises(Exception) as exc_info:
            analyze_theme_with_bedrock("A test poem")
        
        assert "Invalid analysis request format" in str(exc_info.value)

    @patch('theme_analyzer.analyze_theme_with_bedrock')
    def test_analyze_theme_with_retry_success_first_attempt(self, mock_bedrock):
        """Test retry logic with successful first attempt"""
        mock_bedrock.return_value = {"emotion": {"primary": "joy"}}
        
        result = analyze_theme_with_retry("A test poem")
        
        assert result["emotion"]["primary"] == "joy"
        mock_bedrock.assert_called_once()

    @patch('theme_analyzer.analyze_theme_with_bedrock')
    @patch('theme_analyzer.time.sleep')
    def test_analyze_theme_with_retry_success_after_retry(self, mock_sleep, mock_bedrock):
        """Test retry logic with success after initial failure"""
        from botocore.exceptions import ClientError
        
        # First call fails with throttling, second succeeds
        mock_bedrock.side_effect = [
            ClientError(
                error_response={'Error': {'Code': 'ThrottlingException', 'Message': 'Rate exceeded'}},
                operation_name='InvokeModel'
            ),
            {"emotion": {"primary": "joy"}}
        ]
        
        result = analyze_theme_with_retry("A test poem")
        
        assert result["emotion"]["primary"] == "joy"
        assert mock_bedrock.call_count == 2
        mock_sleep.assert_called_once()

    @patch('theme_analyzer.analyze_theme_with_bedrock')
    @patch('theme_analyzer.time.sleep')
    def test_analyze_theme_with_retry_max_retries_exceeded(self, mock_sleep, mock_bedrock):
        """Test retry logic when max retries are exceeded"""
        from botocore.exceptions import ClientError
        
        # All attempts fail with throttling
        mock_bedrock.side_effect = ClientError(
            error_response={'Error': {'Code': 'ThrottlingException', 'Message': 'Rate exceeded'}},
            operation_name='InvokeModel'
        )
        
        with pytest.raises(ClientError):
            analyze_theme_with_retry("A test poem")
        
        assert mock_bedrock.call_count == 3  # MAX_RETRIES
        assert mock_sleep.call_count == 2  # MAX_RETRIES - 1

    @patch('theme_analyzer.get_cached_analysis')
    @patch('theme_analyzer.analyze_theme_with_retry')
    @patch('theme_analyzer.cache_analysis')
    def test_lambda_handler_success_cached(self, mock_cache, mock_analyze, mock_get_cached):
        """Test lambda handler with cached result"""
        # Mock cached analysis
        cached_analysis = {"emotion": {"primary": "joy"}}
        mock_get_cached.return_value = cached_analysis
        
        event = {
            "body": json.dumps({"poem": "A joyful poem"})
        }
        
        result = lambda_handler(event, {})
        
        assert result["statusCode"] == 200
        body = json.loads(result["body"])
        assert body["success"] is True
        assert body["cached"] is True
        assert body["data"] == cached_analysis
        
        # Should not call analysis or caching
        mock_analyze.assert_not_called()
        mock_cache.assert_not_called()

    @patch('theme_analyzer.get_cached_analysis')
    @patch('theme_analyzer.analyze_theme_with_retry')
    @patch('theme_analyzer.cache_analysis')
    def test_lambda_handler_success_new_analysis(self, mock_cache, mock_analyze, mock_get_cached):
        """Test lambda handler with new analysis"""
        # Mock cache miss
        mock_get_cached.return_value = None
        
        # Mock analysis result
        analysis_result = {"emotion": {"primary": "joy"}}
        mock_analyze.return_value = analysis_result
        
        event = {
            "body": json.dumps({"poem": "A joyful poem"})
        }
        
        result = lambda_handler(event, {})
        
        assert result["statusCode"] == 200
        body = json.loads(result["body"])
        assert body["success"] is True
        assert body["cached"] is False
        assert body["data"] == analysis_result
        
        # Should call analysis and caching
        mock_analyze.assert_called_once_with("A joyful poem")
        mock_cache.assert_called_once()

    def test_lambda_handler_missing_body(self):
        """Test lambda handler with missing body"""
        event = {}
        result = lambda_handler(event, {})
        
        assert result["statusCode"] == 400
        body = json.loads(result["body"])
        assert body["error"]["code"] == "MISSING_BODY"

    def test_lambda_handler_invalid_json(self):
        """Test lambda handler with invalid JSON"""
        event = {"body": "invalid json"}
        result = lambda_handler(event, {})
        
        assert result["statusCode"] == 400
        body = json.loads(result["body"])
        assert body["error"]["code"] == "INVALID_JSON"

    def test_lambda_handler_validation_error(self):
        """Test lambda handler with validation error"""
        event = {
            "body": json.dumps({"not_poem": "some text"})
        }
        result = lambda_handler(event, {})
        
        assert result["statusCode"] == 400
        body = json.loads(result["body"])
        assert body["error"]["code"] == "MISSING_POEM"

    def test_lambda_handler_options_request(self):
        """Test lambda handler with OPTIONS request"""
        event = {"httpMethod": "OPTIONS"}
        result = lambda_handler(event, {})
        
        assert result["statusCode"] == 200
        body = json.loads(result["body"])
        assert body["message"] == "CORS preflight"

    @patch('theme_analyzer.analyze_theme_with_retry')
    def test_lambda_handler_analysis_error(self, mock_analyze):
        """Test lambda handler with analysis error"""
        mock_analyze.side_effect = Exception("Analysis failed")
        
        event = {
            "body": json.dumps({"poem": "A test poem"})
        }
        result = lambda_handler(event, {})
        
        assert result["statusCode"] == 500
        body = json.loads(result["body"])
        assert body["error"]["code"] == "INTERNAL_ERROR"


class TestThemeAnalyzerIntegration:
    """Integration tests for theme analysis workflow"""

    @patch('theme_analyzer.dynamodb')
    @patch('theme_analyzer.bedrock_client')
    def test_full_theme_analysis_workflow(self, mock_bedrock, mock_dynamodb):
        """Test complete theme analysis workflow"""
        # Setup mocks
        mock_table = Mock()
        mock_dynamodb.Table.return_value = mock_table
        mock_table.get_item.return_value = {}  # Cache miss
        
        # Mock Bedrock response
        mock_response = {
            'body': Mock()
        }
        mock_response['body'].read.return_value = json.dumps({
            'content': [{'text': '''{
                "emotion": {"primary": "joy", "intensity": 0.8},
                "colors": {"palette": [{"hex": "#ff0000", "weight": 0.8, "role": "primary"}]},
                "animation": {"style": "energetic", "timing": {"duration": 2000, "stagger_delay": 150, "easing": "ease-out"}},
                "imagery": {"keywords": ["sunshine"], "category": "nature", "visual_density": 0.7},
                "typography": {"mood": "playful", "font_weight": 400, "font_scale": 1.1, "line_height": 1.6, "letter_spacing": 0.02, "text_shadow": 1},
                "layout": {"spacing_scale": 1.2, "border_radius": 12, "backdrop_blur": 8, "gradient_angle": 135, "opacity_variations": [0.9, 0.6, 0.3]},
                "metadata": {"analysis_confidence": 0.85, "processing_notes": "Joyful nature theme"}
            }'''}]
        }).encode()
        
        mock_bedrock.invoke_model.return_value = mock_response
        
        # Test the workflow
        event = {
            "body": json.dumps({"poem": "The sun shines bright and warm"})
        }
        
        result = lambda_handler(event, {})
        
        # Verify response
        assert result["statusCode"] == 200
        body = json.loads(result["body"])
        assert body["success"] is True
        assert body["cached"] is False
        
        # Verify analysis data structure
        data = body["data"]
        assert data["emotion"]["primary"] == "joy"
        assert data["colors"]["palette"][0]["hex"] == "#ff0000"
        assert data["animation"]["style"] == "energetic"
        
        # Verify caching was attempted
        mock_table.put_item.assert_called_once()


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v", "--tb=short"])
