#!/usr/bin/env python3
"""
Test script for WordWeave Lambda function
Usage: python test_lambda.py [--local] [--endpoint URL]
"""

import json
import requests
import argparse
import sys
from lambda_function import lambda_handler

def test_local():
    """Test the Lambda function locally"""
    print("🧪 Testing Lambda function locally...")
    
    # Test event
    test_event = {
        'httpMethod': 'POST',
        'body': json.dumps({
            'verb': 'dance',
            'adjective': 'ethereal',
            'noun': 'moonlight'
        }),
        'headers': {
            'Content-Type': 'application/json'
        }
    }
    
    # Mock context
    class MockContext:
        def __init__(self):
            self.function_name = 'test-function'
            self.memory_limit_in_mb = 512
            self.invoked_function_arn = 'arn:aws:lambda:us-east-1:123456789012:function:test'
            self.aws_request_id = 'test-request-id'
    
    try:
        context = MockContext()
        response = lambda_handler(test_event, context)
        
        print(f"✅ Status Code: {response['statusCode']}")
        print(f"📋 Response Body:")
        
        body = json.loads(response['body'])
        print(json.dumps(body, indent=2))
        
        if response['statusCode'] == 200 and body.get('success'):
            print("\n🎉 Local test passed!")
            return True
        else:
            print("\n❌ Local test failed!")
            return False
            
    except Exception as e:
        print(f"❌ Local test error: {str(e)}")
        return False

def test_remote(endpoint):
    """Test the deployed Lambda function via API Gateway"""
    print(f"🌐 Testing deployed function at: {endpoint}")
    
    test_data = {
        'verb': 'whisper',
        'adjective': 'ancient',
        'noun': 'forest'
    }
    
    try:
        response = requests.post(
            endpoint,
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"✅ Status Code: {response.status_code}")
        print(f"⏱️  Response Time: {response.elapsed.total_seconds():.2f}s")
        print(f"📋 Response Body:")
        
        if response.headers.get('content-type', '').startswith('application/json'):
            body = response.json()
            print(json.dumps(body, indent=2))
            
            if response.status_code == 200 and body.get('success'):
                print("\n🎉 Remote test passed!")
                
                # Print poem for verification
                if 'data' in body and 'poem' in body['data']:
                    print("\n📝 Generated Poem:")
                    print("-" * 40)
                    print(body['data']['poem'])
                    print("-" * 40)
                    
                    # Print metadata
                    if 'metadata' in body['data']:
                        metadata = body['data']['metadata']
                        print(f"\n📊 Metadata:")
                        print(f"   Theme: {metadata.get('theme', 'N/A')}")
                        print(f"   Mood: {metadata.get('mood', 'N/A')}")
                        print(f"   Emotion: {metadata.get('emotion', 'N/A')}")
                        print(f"   Word Count: {metadata.get('word_count', 'N/A')}")
                        print(f"   Colors: {metadata.get('dominant_colors', [])}")
                
                return True
            else:
                print("\n❌ Remote test failed!")
                return False
        else:
            print(response.text)
            print("\n❌ Remote test failed - non-JSON response!")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out after 30 seconds")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

def test_error_cases(endpoint):
    """Test error handling"""
    print(f"\n🚨 Testing error cases...")
    
    test_cases = [
        # Missing fields
        ({}, "Missing fields"),
        ({'verb': 'test'}, "Missing adjective and noun"),
        ({'verb': 'test', 'adjective': 'nice'}, "Missing noun"),
        
        # Empty fields
        ({'verb': '', 'adjective': 'nice', 'noun': 'cat'}, "Empty verb"),
        ({'verb': 'run', 'adjective': '', 'noun': 'cat'}, "Empty adjective"),
        ({'verb': 'run', 'adjective': 'nice', 'noun': ''}, "Empty noun"),
        
        # Invalid types
        ({'verb': 123, 'adjective': 'nice', 'noun': 'cat'}, "Non-string verb"),
        ({'verb': 'run', 'adjective': [], 'noun': 'cat'}, "Non-string adjective"),
        ({'verb': 'run', 'adjective': 'nice', 'noun': None}, "Non-string noun"),
        
        # Too long fields
        ({'verb': 'a' * 51, 'adjective': 'nice', 'noun': 'cat'}, "Too long verb"),
    ]
    
    for test_data, description in test_cases:
        try:
            response = requests.post(
                endpoint,
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 400:
                print(f"✅ {description}: Correctly returned 400")
            else:
                print(f"❌ {description}: Expected 400, got {response.status_code}")
                
        except Exception as e:
            print(f"❌ {description}: Error - {str(e)}")

def main():
    parser = argparse.ArgumentParser(description='Test WordWeave Lambda function')
    parser.add_argument('--local', action='store_true', help='Test locally')
    parser.add_argument('--endpoint', type=str, help='API Gateway endpoint URL')
    parser.add_argument('--error-tests', action='store_true', help='Run error case tests')
    
    args = parser.parse_args()
    
    success = True
    
    if args.local:
        success = test_local()
    
    if args.endpoint:
        success = success and test_remote(args.endpoint)
        
        if args.error_tests:
            test_error_cases(args.endpoint)
    
    if not args.local and not args.endpoint:
        print("❌ Please specify --local or --endpoint URL")
        sys.exit(1)
    
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
