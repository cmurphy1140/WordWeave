#!/usr/bin/env python3
"""
Test script for WordWeave Theme Analyzer Lambda function
Usage: python test_theme_analyzer.py [--local] [--endpoint URL]
"""

import json
import requests
import argparse
import sys
import time
from theme_analyzer import lambda_handler

# Test poems for comprehensive testing
TEST_POEMS = {
    "joyful": """
Bright sunbeams dance through morning air,
Golden laughter fills the day,
Children's voices everywhere
Singing songs of endless play.
Flowers bloom in colors bold,
Butterflies on rainbow wings,
Stories of pure joy unfold
In the happiness life brings.
Light embraces every heart,
Magic sparkles all around,
Love connects what's been apart,
Joy in every sight and sound.
    """.strip(),
    
    "melancholic": """
Autumn leaves fall silently,
Memories drift like morning mist,
Shadows grow more tenderly
Around the moments that I've missed.
Gray clouds gather overhead,
While raindrops trace their gentle tears,
Through empty halls where echoes spread
Of long-forgotten hopes and fears.
Time moves slowly, heart grows cold,
As seasons change and years go by,
The stories that will never be told
Beneath this weeping, darkened sky.
    """.strip(),
    
    "mystical": """
Ethereal moonlight dances across
Silver meadows where dreams take flight,
Whispers of ancient magic flow
Through starlit valleys deep and wide.
Mystic shadows play and grow
Beneath the cosmic ocean's tide,
Celestial rhythms pulse and sway
In harmonies beyond our sight.
Enchanted moments slip away
Like dewdrops kissed by morning light,
Forever spinning tales untold
In languages of silver and gold.
    """.strip(),
    
    "energetic": """
Lightning strikes with electric power,
Thunder roars through neon nights,
Pulsing beats ignite each hour
With explosive, blazing lights.
Rapid rhythms fuel the fire,
Energy surges through the air,
Heartbeats climb ever higher
As adrenaline fills with flair.
Speed and motion never cease,
Dynamic forces push and pull,
Power builds without release
Till the moment's strong and full.
    """.strip()
}


def test_local(poem_type="mystical"):
    """Test the theme analyzer function locally"""
    print(f"🧪 Testing Theme Analyzer locally with {poem_type} poem...")
    
    # Test event
    test_event = {
        'httpMethod': 'POST',
        'body': json.dumps({
            'poem': TEST_POEMS[poem_type]
        }),
        'headers': {
            'Content-Type': 'application/json'
        }
    }
    
    # Mock context
    class MockContext:
        def __init__(self):
            self.function_name = 'test-theme-analyzer'
            self.memory_limit_in_mb = 1024
            self.invoked_function_arn = 'arn:aws:lambda:us-east-1:123456789012:function:test'
            self.aws_request_id = 'test-request-id'
    
    try:
        context = MockContext()
        response = lambda_handler(test_event, context)
        
        print(f"✅ Status Code: {response['statusCode']}")
        
        body = json.loads(response['body'])
        
        if response['statusCode'] == 200 and body.get('success'):
            print("\n🎨 Theme Analysis Results:")
            print("=" * 60)
            
            data = body['data']
            
            # Emotion analysis
            emotion = data.get('emotion', {})
            print(f"🎭 Primary Emotion: {emotion.get('primary', 'N/A')} (intensity: {emotion.get('intensity', 0):.2f})")
            if emotion.get('secondary'):
                print("   Secondary Emotions:")
                for sec in emotion['secondary']:
                    print(f"     • {sec.get('emotion', 'N/A')} ({sec.get('intensity', 0):.2f})")
            
            # Color palette
            colors = data.get('colors', {})
            print(f"\n🎨 Color Palette ({colors.get('dominant_temperature', 'N/A')} temperature):")
            for color in colors.get('palette', []):
                print(f"   • {color.get('hex', 'N/A')} - {color.get('role', 'N/A')} (weight: {color.get('weight', 0):.2f})")
            
            # Animation parameters
            animation = data.get('animation', {})
            print(f"\n🌊 Animation Style: {animation.get('style', 'N/A')}")
            print(f"   Movement: {animation.get('movement_type', 'N/A')}")
            timing = animation.get('timing', {})
            print(f"   Duration: {timing.get('duration', 0)}ms")
            print(f"   Stagger: {timing.get('stagger_delay', 0)}ms")
            print(f"   Easing: {timing.get('easing', 'N/A')}")
            
            particles = animation.get('particles', {})
            if particles.get('enabled'):
                print(f"   Particles: {particles.get('type', 'N/A')} (density: {particles.get('density', 0):.2f})")
            
            # Visual imagery
            imagery = data.get('imagery', {})
            print(f"\n🖼️  Visual Imagery ({imagery.get('category', 'N/A')}):")
            keywords = imagery.get('keywords', [])
            print(f"   Keywords: {', '.join(keywords[:5])}{'...' if len(keywords) > 5 else ''}")
            print(f"   Visual Density: {imagery.get('visual_density', 0):.2f}")
            
            # Typography
            typo = data.get('typography', {})
            print(f"\n📝 Typography ({typo.get('mood', 'N/A')}):")
            print(f"   Font Weight: {typo.get('font_weight', 400)}")
            print(f"   Scale: {typo.get('font_scale', 1.0):.2f}")
            print(f"   Line Height: {typo.get('line_height', 1.6):.2f}")
            print(f"   Letter Spacing: {typo.get('letter_spacing', 0):.3f}em")
            
            # Layout parameters
            layout = data.get('layout', {})
            print(f"\n📐 Layout Parameters:")
            print(f"   Spacing Scale: {layout.get('spacing_scale', 1.0):.2f}")
            print(f"   Border Radius: {layout.get('border_radius', 0)}px")
            print(f"   Backdrop Blur: {layout.get('backdrop_blur', 0)}px")
            print(f"   Gradient Angle: {layout.get('gradient_angle', 135)}°")
            opacities = layout.get('opacity_variations', [])
            print(f"   Opacity Variations: {[f'{op:.2f}' for op in opacities]}")
            
            # Metadata
            metadata = data.get('metadata', {})
            print(f"\n📊 Analysis Metadata:")
            print(f"   Confidence: {metadata.get('analysis_confidence', 0):.2f}")
            print(f"   Notes: {metadata.get('processing_notes', 'N/A')}")
            
            print("\n🎉 Local test passed!")
            return True
        else:
            print(f"📋 Response Body:")
            print(json.dumps(body, indent=2))
            print("\n❌ Local test failed!")
            return False
            
    except Exception as e:
        print(f"❌ Local test error: {str(e)}")
        return False


def test_remote(endpoint, poem_type="mystical"):
    """Test the deployed theme analyzer via API Gateway"""
    print(f"🌐 Testing deployed theme analyzer at: {endpoint}")
    print(f"Using {poem_type} test poem...")
    
    test_data = {
        'poem': TEST_POEMS[poem_type]
    }
    
    start_time = time.time()
    
    try:
        response = requests.post(
            endpoint,
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=60  # Theme analysis can take longer
        )
        
        end_time = time.time()
        
        print(f"✅ Status Code: {response.status_code}")
        print(f"⏱️  Response Time: {end_time - start_time:.2f}s")
        
        if response.headers.get('content-type', '').startswith('application/json'):
            body = response.json()
            
            if response.status_code == 200 and body.get('success'):
                print("\n🎉 Remote test passed!")
                
                # Show key analysis results
                data = body['data']
                emotion = data.get('emotion', {})
                colors = data.get('colors', {})
                animation = data.get('animation', {})
                
                print(f"\n🎨 Quick Results:")
                print(f"   Emotion: {emotion.get('primary', 'N/A')} ({emotion.get('intensity', 0):.2f})")
                print(f"   Animation: {animation.get('style', 'N/A')}")
                print(f"   Colors: {len(colors.get('palette', []))} palette colors")
                print(f"   Cached: {body.get('cached', False)}")
                
                # Test caching by making the same request again
                print("\n🔄 Testing cache functionality...")
                cache_start = time.time()
                cache_response = requests.post(endpoint, json=test_data, timeout=30)
                cache_end = time.time()
                
                if cache_response.status_code == 200:
                    cache_body = cache_response.json()
                    print(f"   Cache Response Time: {cache_end - cache_start:.2f}s")
                    print(f"   From Cache: {cache_body.get('cached', False)}")
                    if cache_body.get('cached'):
                        print("   ✅ Caching working correctly!")
                    else:
                        print("   ⚠️  Expected cached response")
                
                return True
            else:
                print(f"📋 Response Body:")
                print(json.dumps(body, indent=2))
                print("\n❌ Remote test failed!")
                return False
        else:
            print(response.text)
            print("\n❌ Remote test failed - non-JSON response!")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out after 60 seconds")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False


def test_all_poem_types(endpoint):
    """Test all poem types to verify different analysis results"""
    print("\n🧪 Testing all poem types for variety...")
    
    results = {}
    
    for poem_type in TEST_POEMS.keys():
        print(f"\n--- Testing {poem_type.upper()} poem ---")
        
        try:
            response = requests.post(
                endpoint,
                json={'poem': TEST_POEMS[poem_type]},
                headers={'Content-Type': 'application/json'},
                timeout=60
            )
            
            if response.status_code == 200:
                body = response.json()
                if body.get('success'):
                    data = body['data']
                    emotion = data.get('emotion', {})
                    animation = data.get('animation', {})
                    colors = data.get('colors', {})
                    
                    results[poem_type] = {
                        'emotion': emotion.get('primary', 'unknown'),
                        'intensity': emotion.get('intensity', 0),
                        'animation_style': animation.get('style', 'unknown'),
                        'color_temp': colors.get('dominant_temperature', 'unknown')
                    }
                    
                    print(f"✅ {poem_type}: {emotion.get('primary', 'N/A')} ({emotion.get('intensity', 0):.2f}) -> {animation.get('style', 'N/A')}")
                else:
                    print(f"❌ {poem_type}: Failed - {body.get('error', {}).get('message', 'Unknown error')}")
            else:
                print(f"❌ {poem_type}: HTTP {response.status_code}")
                
        except Exception as e:
            print(f"❌ {poem_type}: Error - {str(e)}")
    
    # Analyze variety in results
    print(f"\n📊 Analysis Variety Report:")
    emotions = set(r['emotion'] for r in results.values())
    animations = set(r['animation_style'] for r in results.values())
    temperatures = set(r['color_temp'] for r in results.values())
    
    print(f"   Unique Emotions: {len(emotions)} ({', '.join(emotions)})")
    print(f"   Unique Animation Styles: {len(animations)} ({', '.join(animations)})")
    print(f"   Unique Color Temperatures: {len(temperatures)} ({', '.join(temperatures)})")
    
    if len(emotions) >= 3 and len(animations) >= 2:
        print("   ✅ Good variety in analysis results!")
    else:
        print("   ⚠️  Limited variety - may need prompt tuning")


def test_error_cases(endpoint):
    """Test error handling"""
    print(f"\n🚨 Testing error cases...")
    
    test_cases = [
        # Missing poem
        ({}, "Missing poem field"),
        
        # Empty poem
        ({'poem': ''}, "Empty poem"),
        ({'poem': '   '}, "Whitespace-only poem"),
        
        # Invalid types
        ({'poem': 123}, "Non-string poem"),
        ({'poem': None}, "Null poem"),
        ({'poem': []}, "Array poem"),
        
        # Too long poem
        ({'poem': 'word ' * 2000}, "Extremely long poem"),
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
    parser = argparse.ArgumentParser(description='Test WordWeave Theme Analyzer')
    parser.add_argument('--local', action='store_true', help='Test locally')
    parser.add_argument('--endpoint', type=str, help='API Gateway endpoint URL')
    parser.add_argument('--poem-type', type=str, choices=TEST_POEMS.keys(), 
                       default='mystical', help='Type of test poem to use')
    parser.add_argument('--all-types', action='store_true', help='Test all poem types')
    parser.add_argument('--error-tests', action='store_true', help='Run error case tests')
    
    args = parser.parse_args()
    
    success = True
    
    if args.local:
        success = test_local(args.poem_type)
    
    if args.endpoint:
        if args.all_types:
            test_all_poem_types(args.endpoint)
        else:
            success = success and test_remote(args.endpoint, args.poem_type)
        
        if args.error_tests:
            test_error_cases(args.endpoint)
    
    if not args.local and not args.endpoint:
        print("❌ Please specify --local or --endpoint URL")
        sys.exit(1)
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
