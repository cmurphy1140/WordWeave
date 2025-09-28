#!/usr/bin/env python3
"""
Mock API Server for WordWeave
Simulates the poem generation and theme analysis endpoints
"""

import json
import random
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer
import threading

# Enhanced poem templates with placeholders for dynamic generation
POEM_TEMPLATES = [
    {
        "template": """The {adjective} {noun} begins to {verb},
Through shadows deep and mysteries to preserve.
In whispered tales of ancient lore,
Where dreams and reality explore.

{adjective} light dances through the air,
As {noun} moves with graceful care.
To {verb} beyond the realm of sight,
Into the embrace of endless night.""",
        "mood": "mystical",
        "colors": ["#4B0082", "#8A2BE2", "#9370DB", "#DDA0DD"],
        "emotion": "mysterious"
    },
    {
        "template": """Beneath the {adjective} sky so wide,
The {noun} begins to {verb} with pride.
Golden rays of morning light,
Chase away the fading night.

{adjective} winds carry songs of old,
Stories that will never grow cold.
As {noun} learns to {verb} and soar,
Opening every hidden door.""",
        "mood": "uplifting",
        "colors": ["#FFD700", "#FFA500", "#FF8C00", "#FF6347"],
        "emotion": "joyful"
    },
    {
        "template": """In gardens where the {adjective} flowers grow,
The {noun} learns to {verb} and flow.
Petals soft as morning dew,
Paint the world in every hue.

{adjective} beauty fills the air,
As {noun} moves without a care.
To {verb} among the blooming trees,
Dancing with the gentle breeze.""",
            "mood": "peaceful",
        "colors": ["#98FB98", "#90EE90", "#32CD32", "#228B22"],
        "emotion": "serene"
    },
    {
        "template": """The {adjective} ocean calls to me,
Where {noun} learns to {verb} so free.
Waves that crash upon the shore,
Tell of legends and much more.

{adjective} depths hold secrets deep,
Where ancient {noun} forever sleep.
To {verb} beneath the starlit foam,
Finding peace, finding home.""",
        "mood": "contemplative",
        "colors": ["#4682B4", "#87CEEB", "#B0E0E6", "#E0F6FF"],
        "emotion": "peaceful"
    },
    {
        "template": """Through {adjective} forests dark and deep,
Where {noun} learns to {verb} and leap.
Ancient trees with branches wide,
Offer shelter, offer guide.

{adjective} shadows dance and play,
As {noun} finds its destined way.
To {verb} through paths unknown,
Making wilderness its home.""",
        "mood": "adventurous",
        "colors": ["#228B22", "#32CD32", "#8FBC8F", "#98FB98"],
        "emotion": "adventurous"
    },
    {
        "template": """When {adjective} stars begin to shine,
The {noun} knows it's time to {verb} divine.
Moonbeams silver, soft and bright,
Guide the journey through the night.

{adjective} dreams take flight above,
Carried by the wings of love.
As {noun} learns to {verb} and gleam,
Living every cherished dream.""",
        "mood": "dreamy",
        "colors": ["#191970", "#4169E1", "#6495ED", "#87CEFA"],
        "emotion": "dreamy"
    },
    {
        "template": """The {adjective} mountain stands so tall,
Where {noun} answers nature's call.
To {verb} beyond the clouds so high,
Touching the infinite sky.

{adjective} winds whisper ancient songs,
Of where the {noun} truly belongs.
To {verb} with courage, strong and true,
Making every dream come through.""",
        "mood": "inspiring",
        "colors": ["#708090", "#778899", "#B0C4DE", "#F0F8FF"],
        "emotion": "inspiring"
    },
    {
        "template": """In {adjective} meadows green and bright,
The {noun} prepares to {verb} in flight.
Butterflies and bees dance near,
Whispering secrets crystal clear.

{adjective} sunshine warms the earth,
Celebrating nature's mirth.
As {noun} learns to {verb} and grow,
In the gentle, warming glow.""",
        "mood": "cheerful",
        "colors": ["#ADFF2F", "#7CFC00", "#32CD32", "#00FF00"],
        "emotion": "cheerful"
    }
]

# Word variations to make poems more dynamic
WORD_VARIATIONS = {
    "verb": {
        "dance": ["sway", "glide", "flow", "move", "twirl"],
        "whisper": ["murmur", "speak", "call", "sing", "echo"],
        "soar": ["fly", "rise", "ascend", "float", "drift"],
        "bloom": ["flourish", "grow", "blossom", "unfold", "emerge"],
        "flow": ["stream", "glide", "move", "drift", "cascade"],
        "shine": ["glow", "gleam", "sparkle", "radiate", "illuminate"],
        "wander": ["roam", "explore", "journey", "travel", "drift"]
    },
    "adjective": {
        "ethereal": ["mystical", "magical", "celestial", "divine", "otherworldly"],
        "ancient": ["timeless", "eternal", "ageless", "enduring", "primordial"],
        "golden": ["radiant", "luminous", "brilliant", "shimmering", "gleaming"],
        "vibrant": ["vivid", "bright", "colorful", "lively", "dynamic"],
        "serene": ["peaceful", "tranquil", "calm", "gentle", "quiet"],
        "gentle": ["soft", "tender", "mild", "soothing", "delicate"],
        "mysterious": ["enigmatic", "cryptic", "hidden", "secret", "veiled"]
    },
    "noun": {
        "moonlight": ["starlight", "sunbeam", "twilight", "dawn", "radiance"],
        "forest": ["woodland", "grove", "thicket", "wilderness", "glade"],
        "horizon": ["skyline", "vista", "expanse", "distance", "boundary"],
        "garden": ["meadow", "field", "grove", "sanctuary", "paradise"],
        "river": ["stream", "brook", "waterway", "current", "flow"],
        "ocean": ["sea", "waters", "depths", "waves", "tide"],
        "mountain": ["peak", "summit", "cliff", "ridge", "highland"]
    }
}

def enhance_word(word, word_type):
    """Enhance a word with variations or return the original"""
    if word_type in WORD_VARIATIONS and word.lower() in WORD_VARIATIONS[word_type]:
        variations = WORD_VARIATIONS[word_type][word.lower()]
        return random.choice([word] + variations)  # Include original word in choices
    return word

def analyze_poem_themes(poem_text, original_words, enhanced_words):
    """Advanced theme analysis of the generated poem"""
    text_lower = poem_text.lower()
    
    # Emotional tone analysis
    emotional_keywords = {
        "joy": ["bright", "light", "dance", "sing", "laugh", "celebrate", "golden", "radiant"],
        "melancholy": ["shadow", "fade", "whisper", "lonely", "distant", "memory", "lost"],
        "wonder": ["mystery", "magic", "ancient", "eternal", "infinite", "beyond", "dream"],
        "peace": ["gentle", "calm", "serene", "quiet", "still", "soft", "tranquil"],
        "passion": ["fire", "burn", "intense", "deep", "powerful", "strong", "fierce"],
        "nostalgia": ["old", "time", "remember", "past", "echo", "fading", "once"],
        "hope": ["new", "dawn", "rise", "grow", "bloom", "future", "tomorrow"],
        "love": ["heart", "embrace", "tender", "warm", "cherish", "beloved", "dear"]
    }
    
    # Calculate emotional scores
    emotion_scores = {}
    for emotion, keywords in emotional_keywords.items():
        score = sum(1 for keyword in keywords if keyword in text_lower)
        if score > 0:
            emotion_scores[emotion] = score
    
    # Determine primary and secondary emotions
    sorted_emotions = sorted(emotion_scores.items(), key=lambda x: x[1], reverse=True)
    primary_emotion = sorted_emotions[0][0] if sorted_emotions else "contemplative"
    secondary_emotion = sorted_emotions[1][0] if len(sorted_emotions) > 1 else None
    
    # Theme analysis based on content
    nature_themes = ["forest", "ocean", "mountain", "sky", "earth", "tree", "flower", "river"]
    time_themes = ["night", "day", "dawn", "dusk", "season", "eternal", "moment", "time"]
    spiritual_themes = ["soul", "spirit", "divine", "sacred", "prayer", "blessing", "grace"]
    journey_themes = ["path", "road", "journey", "travel", "explore", "discover", "quest"]
    
    detected_themes = []
    if any(theme in text_lower for theme in nature_themes):
        detected_themes.append("nature")
    if any(theme in text_lower for theme in time_themes):
        detected_themes.append("temporal")
    if any(theme in text_lower for theme in spiritual_themes):
        detected_themes.append("spiritual")
    if any(theme in text_lower for theme in journey_themes):
        detected_themes.append("journey")
    
    # Mood intensity analysis
    intensity_words = {
        "high": ["powerful", "intense", "fierce", "blazing", "thunderous", "mighty"],
        "medium": ["gentle", "flowing", "dancing", "singing", "glowing", "shining"],
        "low": ["whisper", "soft", "quiet", "still", "peaceful", "calm"]
    }
    
    intensity = "medium"  # default
    for level, words in intensity_words.items():
        if any(word in text_lower for word in words):
            intensity = level
            break
    
    # Literary devices detection
    literary_devices = []
    if "like" in text_lower or "as" in text_lower:
        literary_devices.append("simile")
    if any(word in text_lower for word in ["whisper", "sing", "call", "cry"]):
        literary_devices.append("personification")
    if len([line for line in poem_text.split('\n') if line.strip()]) > 8:
        literary_devices.append("extended_metaphor")
    
    return {
        "emotional_tone": {
            "primary": primary_emotion,
            "secondary": secondary_emotion,
            "intensity": intensity,
            "scores": emotion_scores
        },
        "themes": detected_themes,
        "literary_devices": literary_devices,
        "word_analysis": {
            "original": original_words,
            "enhanced": enhanced_words,
            "transformation_quality": calculate_word_enhancement_quality(original_words, enhanced_words)
        }
    }

def calculate_word_enhancement_quality(original, enhanced):
    """Calculate how well the words were enhanced"""
    changes = 0
    for key in original:
        if original[key].lower() != enhanced[key].lower():
            changes += 1
    
    quality_levels = ["minimal", "moderate", "significant"]
    return quality_levels[min(changes, 2)]

def generate_visual_theme(theme_analysis, poem_mood):
    """Generate comprehensive visual theme based on analysis"""
    
    # Color palette generation based on emotional tone and themes
    color_palettes = {
        "joy": {
            "primary": "#FFD700",
            "secondary": "#FFA500", 
            "accent": "#FF6347",
            "background": "#FFFAF0",
            "gradient": ["#FFD700", "#FFA500", "#FF8C00", "#FF6347"]
        },
        "melancholy": {
            "primary": "#4682B4",
            "secondary": "#708090",
            "accent": "#B0C4DE",
            "background": "#F8F8FF",
            "gradient": ["#4682B4", "#708090", "#B0C4DE", "#E6E6FA"]
        },
        "wonder": {
            "primary": "#9370DB",
            "secondary": "#8A2BE2",
            "accent": "#DDA0DD",
            "background": "#F5F0FF",
            "gradient": ["#9370DB", "#8A2BE2", "#BA55D3", "#DDA0DD"]
        },
        "peace": {
            "primary": "#98FB98",
            "secondary": "#90EE90",
            "accent": "#32CD32",
            "background": "#F0FFF0",
            "gradient": ["#98FB98", "#90EE90", "#32CD32", "#228B22"]
        },
        "passion": {
            "primary": "#DC143C",
            "secondary": "#B22222",
            "accent": "#FF69B4",
            "background": "#FFF0F5",
            "gradient": ["#DC143C", "#B22222", "#CD5C5C", "#FF69B4"]
        },
        "nostalgia": {
            "primary": "#D2B48C",
            "secondary": "#BC8F8F",
            "accent": "#F4A460",
            "background": "#FDF5E6",
            "gradient": ["#D2B48C", "#BC8F8F", "#F4A460", "#DEB887"]
        },
        "hope": {
            "primary": "#87CEEB",
            "secondary": "#87CEFA",
            "accent": "#00BFFF",
            "background": "#F0F8FF",
            "gradient": ["#87CEEB", "#87CEFA", "#00BFFF", "#1E90FF"]
        },
        "love": {
            "primary": "#FF69B4",
            "secondary": "#FFB6C1",
            "accent": "#FF1493",
            "background": "#FFF0F5",
            "gradient": ["#FF69B4", "#FFB6C1", "#FF1493", "#DC143C"]
        }
    }
    
    # Get base palette from primary emotion
    primary_emotion = theme_analysis["emotional_tone"]["primary"]
    base_palette = color_palettes.get(primary_emotion, color_palettes["peace"])
    
    # Modify palette based on themes
    if "nature" in theme_analysis["themes"]:
        # Add more green tones
        base_palette["accent"] = "#32CD32"
    if "spiritual" in theme_analysis["themes"]:
        # Add more ethereal tones
        base_palette["background"] = "#F5F0FF"
    if "temporal" in theme_analysis["themes"]:
        # Add more muted, timeless tones
        base_palette["secondary"] = "#708090"
    
    # Typography recommendations
    typography_styles = {
        "mystical": {"font": "serif", "weight": "light", "spacing": "wide"},
        "uplifting": {"font": "sans-serif", "weight": "medium", "spacing": "normal"},
        "peaceful": {"font": "serif", "weight": "light", "spacing": "relaxed"},
        "contemplative": {"font": "serif", "weight": "normal", "spacing": "wide"},
        "adventurous": {"font": "sans-serif", "weight": "bold", "spacing": "tight"},
        "dreamy": {"font": "serif", "weight": "light", "spacing": "wide"},
        "inspiring": {"font": "sans-serif", "weight": "medium", "spacing": "normal"},
        "cheerful": {"font": "sans-serif", "weight": "medium", "spacing": "normal"}
    }
    
    typography = typography_styles.get(poem_mood, typography_styles["peaceful"])
    
    # Animation recommendations
    intensity = theme_analysis["emotional_tone"]["intensity"]
    animation_configs = {
        "high": {"duration": 0.4, "easing": "ease-out", "stagger": 0.05},
        "medium": {"duration": 0.8, "easing": "ease-in-out", "stagger": 0.1},
        "low": {"duration": 1.2, "easing": "ease-in", "stagger": 0.15}
    }
    
    animation = animation_configs[intensity]
    
    # Layout recommendations
    layout_style = "centered"
    if "journey" in theme_analysis["themes"]:
        layout_style = "flowing"
    elif "nature" in theme_analysis["themes"]:
        layout_style = "organic"
    elif "spiritual" in theme_analysis["themes"]:
        layout_style = "elevated"
    
    return {
        "colors": base_palette,
        "typography": {
            "fontFamily": typography["font"],
            "fontWeight": typography["weight"],
            "letterSpacing": typography["spacing"],
            "lineHeight": 1.6 if intensity == "low" else 1.4,
            "fontSize": "large" if intensity == "high" else "medium"
        },
        "animations": {
            "duration": animation["duration"],
            "easing": animation["easing"],
            "stagger": animation["stagger"],
            "style": poem_mood
        },
        "layout": {
            "style": layout_style,
            "alignment": "center" if primary_emotion in ["peace", "love"] else "left",
            "spacing": "relaxed" if intensity == "low" else "normal"
        },
        "effects": {
            "blur": intensity == "low",
            "glow": primary_emotion in ["wonder", "hope", "love"],
            "shadow": intensity == "high",
            "gradient": "nature" in theme_analysis["themes"]
        }
    }

def generate_dynamic_poem(verb, adjective, noun):
    """Generate a poem using the input words with a random template"""
    template_data = random.choice(POEM_TEMPLATES)
    
    # Enhance words with variations for more variety
    enhanced_verb = enhance_word(verb, "verb")
    enhanced_adjective = enhance_word(adjective, "adjective")
    enhanced_noun = enhance_word(noun, "noun")
    
    # Fill in the template
    poem = template_data["template"].format(
        verb=enhanced_verb,
        adjective=enhanced_adjective,
        noun=enhanced_noun
    )
    
    # Add some randomization to make each generation unique
    lines = poem.split('\n')
    
    # Occasionally add an extra stanza for longer poems
    if random.random() < 0.3:  # 30% chance
        extra_stanza = f"""
The {enhanced_adjective} world awakens new,
Where {enhanced_noun} finds what's pure and true.
To {enhanced_verb} with heart so free,
Embracing all that's meant to be."""
        poem += extra_stanza
    
    # Perform advanced theme analysis
    original_words = {"verb": verb, "adjective": adjective, "noun": noun}
    enhanced_words = {"verb": enhanced_verb, "adjective": enhanced_adjective, "noun": enhanced_noun}
    theme_analysis = analyze_poem_themes(poem, original_words, enhanced_words)
    
    # Generate visual theme based on analysis
    visual_theme = generate_visual_theme(theme_analysis, template_data["mood"])
    
    return {
        "poem": poem,
        "mood": template_data["mood"],
        "colors": template_data["colors"],
        "emotion": template_data["emotion"],
        "enhanced_words": enhanced_words,
        "theme_analysis": theme_analysis,
        "visual_theme": visual_theme
    }

class MockAPIHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization')
        self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()

    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/generate':
            self.handle_generate_poem()
        elif self.path == '/analyze-theme':
            self.handle_analyze_theme()
        else:
            self.send_error_response(404, 'NOT_FOUND', 'Endpoint not found')

    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/health':
            self.handle_health_check()
        else:
            self.send_error_response(404, 'NOT_FOUND', 'Endpoint not found')

    def handle_generate_poem(self):
        """Handle poem generation requests"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            print(f"📝 Generating poem for: {data}")
            
            # Validate input
            if not all(key in data for key in ['verb', 'adjective', 'noun']):
                self.send_error_response(400, 'VALIDATION_ERROR', 'Missing required fields: verb, adjective, noun')
                return
            
            if not all(data[key].strip() for key in ['verb', 'adjective', 'noun']):
                self.send_error_response(400, 'VALIDATION_ERROR', 'All fields must be non-empty')
                return
            
            # Simulate processing delay
            processing_time = random.uniform(1.5, 3.5)
            time.sleep(processing_time)
            
            # Generate dynamic poem based on input words
            poem_data = generate_dynamic_poem(
                data['verb'].strip(),
                data['adjective'].strip(),
                data['noun'].strip()
            )
            
            # Create enhanced theme object with visual theme
            theme = {
                "colors": poem_data["visual_theme"]["colors"],
                "animations": poem_data["visual_theme"]["animations"],
                "typography": poem_data["visual_theme"]["typography"],
                "layout": poem_data["visual_theme"]["layout"],
                "effects": poem_data["visual_theme"]["effects"]
            }
            
            # Create comprehensive metadata
            word_count = len(poem_data["poem"].split())
            line_count = len([line for line in poem_data["poem"].split('\n') if line.strip()])
            
            metadata = {
                "id": f"poem-{int(time.time())}-{random.randint(1000, 9999)}",
                "wordCount": word_count,
                "lineCount": line_count,
                "sentiment": poem_data["emotion"],
                "emotion": poem_data["emotion"],
                "generationTime": processing_time,
                "originalWords": {
                    "verb": data['verb'].strip(),
                    "adjective": data['adjective'].strip(),
                    "noun": data['noun'].strip()
                },
                "enhancedWords": poem_data["enhanced_words"],
                "complexity": "high" if word_count > 100 else "medium" if word_count > 50 else "simple"
            }
            
            response_data = {
                "poem": poem_data["poem"],
                "theme": theme,
                "metadata": metadata,
                "analysis": {
                    "themeAnalysis": poem_data["theme_analysis"],
                    "visualRecommendations": poem_data["visual_theme"],
                    "poetryMetrics": {
                        "readabilityScore": random.uniform(0.7, 0.95),
                        "emotionalImpact": random.uniform(0.6, 0.9),
                        "creativityIndex": random.uniform(0.5, 0.85),
                        "coherenceScore": random.uniform(0.8, 0.95)
                    }
                }
            }
            
            print(f"✅ Generated poem with {word_count} words, mood: {poem_data['mood']}")
            self.send_success_response(response_data)
            
        except json.JSONDecodeError:
            self.send_error_response(400, 'INVALID_JSON', 'Invalid JSON in request body')
        except Exception as e:
            print(f"❌ Error generating poem: {e}")
            self.send_error_response(500, 'INTERNAL_ERROR', f'Internal server error: {str(e)}')

    def handle_analyze_theme(self):
        """Handle theme analysis requests"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            if 'poem' not in data:
                self.send_error_response(400, 'VALIDATION_ERROR', 'Missing required field: poem')
                return
            
            # Simulate processing delay
            time.sleep(random.uniform(0.5, 1.5))
            
            # Mock theme analysis based on poem content
            poem_text = data['poem'].lower()
            
            # Determine theme based on keywords in poem
            if any(word in poem_text for word in ['night', 'star', 'moon', 'dark']):
                theme_colors = ["#191970", "#4169E1", "#6495ED", "#87CEFA"]
                mood = "mystical"
            elif any(word in poem_text for word in ['sun', 'gold', 'bright', 'light']):
                theme_colors = ["#FFD700", "#FFA500", "#FF8C00", "#FF6347"]
                mood = "uplifting"
            elif any(word in poem_text for word in ['ocean', 'sea', 'water', 'wave']):
                theme_colors = ["#4682B4", "#87CEEB", "#B0E0E6", "#E0F6FF"]
                mood = "peaceful"
            elif any(word in poem_text for word in ['forest', 'tree', 'green', 'nature']):
                theme_colors = ["#228B22", "#32CD32", "#8FBC8F", "#98FB98"]
                mood = "natural"
            else:
                theme_colors = ["#667eea", "#764ba2", "#f093fb", "#f5576c"]
                mood = "balanced"
            
            theme_analysis = {
                "colors": {
                    "palette": [
                        {"hex": theme_colors[0], "weight": 0.4, "role": "primary"},
                        {"hex": theme_colors[1], "weight": 0.3, "role": "secondary"},
                        {"hex": theme_colors[2], "weight": 0.2, "role": "accent"},
                        {"hex": theme_colors[3], "weight": 0.1, "role": "highlight"}
                    ],
                    "primary": theme_colors[0],
                    "secondary": theme_colors[1],
                    "accent": theme_colors[2],
                    "background": "#ffffff"
                },
                "typography": {
                    "fontFamily": "serif" if "ancient" in poem_text else "sans-serif",
                    "fontSize": "large" if len(poem_text) < 200 else "medium",
                    "lineHeight": 1.6,
                    "letterSpacing": "normal"
                },
                "animations": {
                    "duration": 0.8,
                    "easing": "ease-out",
                    "stagger": 0.1
                },
                "mood": mood,
                "intensity": random.uniform(0.6, 0.9)
            }
            
            self.send_success_response(theme_analysis)
            
        except json.JSONDecodeError:
            self.send_error_response(400, 'INVALID_JSON', 'Invalid JSON in request body')
        except Exception as e:
            print(f"❌ Error analyzing theme: {e}")
            self.send_error_response(500, 'INTERNAL_ERROR', f'Internal server error: {str(e)}')

    def handle_health_check(self):
        """Handle health check requests"""
        health_data = {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": "1.0.0",
            "endpoints": ["/generate", "/analyze-theme", "/health"]
        }
        self.send_success_response(health_data)

    def send_success_response(self, data):
        """Send a successful response"""
        response = {
            "success": True,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization')
        self.end_headers()
        
        self.wfile.write(json.dumps(response, indent=2).encode('utf-8'))

    def send_error_response(self, status_code, error_code, message):
        """Send an error response"""
        response = {
            "success": False,
            "error": {
                "code": error_code,
                "message": message
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization')
        self.end_headers()
        
        self.wfile.write(json.dumps(response, indent=2).encode('utf-8'))

    def log_message(self, format, *args):
        """Override to customize logging"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] {format % args}")

def run_server(port=3001):
    """Run the mock server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, MockAPIHandler)
    
    print(f"🚀 WordWeave Mock API Server starting on port {port}")
    print(f"📍 Health check: http://localhost:{port}/health")
    print(f"📝 Generate poem: POST http://localhost:{port}/generate")
    print(f"🎨 Analyze theme: POST http://localhost:{port}/analyze-theme")
    print("🔄 Server ready to handle requests...")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server shutting down...")
        httpd.shutdown()

if __name__ == '__main__':
    run_server()