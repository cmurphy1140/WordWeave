# WordWeave Development Environment

## 🚀 Development Server Status

✅ **Backend Mock Server**: Running on `http://localhost:3001`  
✅ **Frontend React App**: Running on `http://localhost:3000`  
✅ **API Connection**: Tested and working

## 📡 Available Endpoints

### Backend API (Port 3001)
- `POST /generate` - Generate poems from word inputs
- `POST /analyze-theme` - Analyze poem themes and generate visual parameters
- `GET /health` - Health check endpoint

### Frontend (Port 3000)
- `http://localhost:3000` - Main WordWeave application
- `http://localhost:3000/showcase` - Animation showcase
- `http://localhost:3000/pipeline` - Pipeline testing
- `http://localhost:3000/generated-poem` - Generated poem display

## 🛠️ Development Commands

### Start Development Environment
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:frontend  # React app on port 3000
npm run dev:backend   # Mock server on port 3001
```

### Backend Mock Server
```bash
cd backend
python3 mock_server.py 3001
```

### Frontend Development
```bash
cd frontend
npm start
```

## 🧪 Testing the API

### Generate a Poem
```bash
curl -X POST http://localhost:3001/generate \
  -H "Content-Type: application/json" \
  -d '{"verb":"whisper","adjective":"ancient","noun":"stars"}'
```

### Analyze Theme
```bash
curl -X POST http://localhost:3001/analyze-theme \
  -H "Content-Type: application/json" \
  -d '{"poem":"Your poem text here"}'
```

### Health Check
```bash
curl http://localhost:3001/health
```

## 🎨 Features Available

### Word Selection Interface
- **Constellation Picker**: Interactive star-based word selection
- **Progressive Disclosure**: One word type at a time
- **Smart Suggestions**: Mood-based word recommendations
- **Accessibility**: Full keyboard navigation and screen reader support

### Poem Generation
- **Live Preview**: Real-time poem generation
- **Theme Analysis**: Automatic visual theme generation
- **Animation System**: Framer Motion animations
- **Responsive Design**: Mobile-first approach

### Hero Section
- **Animated Tagline**: Typewriter effect
- **Live Preview Window**: Continuous poem cycling
- **Particle System**: Interactive mouse-responsive particles
- **Mesh Gradients**: Emotional color transitions

## 🔧 Configuration

### Frontend Proxy
The frontend is configured to proxy API requests to the backend:
```json
{
  "proxy": "http://localhost:3003"
}
```

### Environment Variables
Create `.env` files in the frontend directory:
```bash
# .env.development
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
```

## 📱 Responsive Breakpoints

- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 480px - 767px
- **Small Mobile**: < 480px

## ♿ Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and live regions
- **High Contrast**: WCAG AA compliant
- **Reduced Motion**: Respects user preferences

## 🎯 Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **Mock Data**: Backend provides realistic mock responses
3. **CORS**: Properly configured for development
4. **Error Handling**: Comprehensive error responses
5. **Logging**: Detailed request/response logging

## 🚨 Troubleshooting

### Port Conflicts
If ports 3000 or 3001 are in use:
```bash
# Kill existing processes
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Dependencies
```bash
# Reinstall dependencies
npm run install:all
```

### Backend Issues
```bash
# Check Python version
python3 --version

# Install requirements
cd backend
pip3 install -r requirements.txt
```

## 📊 Performance Monitoring

- **Lighthouse Score**: > 90
- **Animation FPS**: 60fps maintained
- **Bundle Size**: Optimized for production
- **Load Time**: < 1 second for initial load

---

## Backend Development (Python Lambda)

### AWS Lambda Functions

WordWeave uses Python-based AWS Lambda functions for:

- **AI Poetry Generation**: Uses Claude 3.5 Sonnet with structured XML prompts
- **Dynamic Theme Generation**: Analyzes poem emotion and generates color palettes
- **Caching**: DynamoDB caching with TTL to reduce costs
- **Error Handling**: Comprehensive error handling for all AWS services

### Backend Architecture

```
User Request → API Gateway → Lambda Function → Bedrock Claude 3.5 Sonnet
                                ↓
                         DynamoDB Cache ← Response
```

### Backend Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Python 3.11+** installed
3. **AWS Account** with Bedrock access to Claude 3.5 Sonnet
4. **Permissions** to create Lambda, DynamoDB, IAM roles, and API Gateway

### Backend Development Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.template .env
# Edit .env with your AWS configuration

# Deploy to development
npm run deploy:dev
```

### Testing Lambda Functions

```bash
# Test locally with Serverless
serverless invoke local -f generatePoem -d '{"verb":"test","adjective":"local","noun":"development"}'

# Test deployed function
aws lambda invoke --function-name wordweave-dev-generatePoem --payload '{"verb":"test","adjective":"aws","noun":"lambda"}' response.json
```

---

**🎉 Your WordWeave development environment is ready!**

Visit `http://localhost:3000` to start creating magical poetry experiences.
