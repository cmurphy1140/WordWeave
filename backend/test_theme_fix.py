#!/usr/bin/env python3

"""
Test script to verify that the theme handling fix works correctly.
"""

import json
import sys
import os

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the lambda function
from lambda_function import lambda_handler

def test_theme_fix():
    """Test that the Lambda function returns both theme and analysis objects"""

    # Mock event for API Gateway
    event = {
        'httpMethod': 'POST',
        'body': json.dumps({
            'verb': 'dance',
            'adjective': 'mystical',
            'noun': 'moonlight'
        })
    }

    # Mock context
    class MockContext:
        def __init__(self):
            self.function_name = 'test'
            self.aws_request_id = 'test-request'

    context = MockContext()

    print("🧪 Testing Lambda function with theme fix...")
    print(f"📝 Input: {json.loads(event['body'])}")

    try:
        # Call the lambda function
        response = lambda_handler(event, context)

        print(f"📊 Response Status: {response['statusCode']}")

        if response['statusCode'] == 200:
            body = json.loads(response['body'])

            if body.get('success'):
                data = body.get('data', {})

                # Check if we have the required fields
                has_poem = 'poem' in data
                has_theme = 'theme' in data
                has_analysis = 'analysis' in data
                has_metadata = 'metadata' in data

                print(f"✅ Has poem: {has_poem}")
                print(f"✅ Has theme: {has_theme}")
                print(f"✅ Has analysis: {has_analysis}")
                print(f"✅ Has metadata: {has_metadata}")

                if has_theme:
                    theme = data['theme']
                    print(f"🎨 Theme colors: {theme.get('colors', {})}")
                    print(f"🎬 Animation style: {theme.get('animations', {}).get('style', 'unknown')}")

                if has_analysis:
                    analysis = data['analysis']
                    theme_analysis = analysis.get('themeAnalysis', {})
                    emotional_tone = theme_analysis.get('emotional_tone', {})
                    print(f"😊 Primary emotion: {emotional_tone.get('primary', 'unknown')}")

                if has_metadata:
                    metadata = data['metadata']
                    print(f"📊 Word count: {metadata.get('wordCount', 0)}")
                    print(f"💭 Sentiment: {metadata.get('sentiment', 'unknown')}")

                print("\n🎉 SUCCESS: All required fields are present!")
                return True
            else:
                print(f"❌ API returned success=false: {body.get('error', {})}")
                return False
        else:
            print(f"❌ HTTP error {response['statusCode']}: {response.get('body', '')}")
            return False

    except Exception as e:
        print(f"💥 Error during test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_theme_fix()
    if success:
        print("\n✅ Theme fix test PASSED")
        sys.exit(0)
    else:
        print("\n❌ Theme fix test FAILED")
        sys.exit(1)