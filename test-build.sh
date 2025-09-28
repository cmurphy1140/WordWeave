#!/bin/bash

echo "🧪 WordWeave Local Development Test Script"
echo "========================================="

# Check Node.js version
echo "📋 Node.js version:"
node --version
npm --version

echo ""
echo "📁 Project structure check:"
ls -la

echo ""
echo "🔍 Frontend dependencies check:"
if [ -d "frontend" ]; then
    cd frontend
    echo "✅ Frontend directory exists"
    
    if [ -f "package.json" ]; then
        echo "✅ package.json exists"
        
        echo ""
        echo "📦 Installing dependencies..."
        npm install
        
        echo ""
        echo "🔨 Running TypeScript build test..."
        npm run build
        
        if [ $? -eq 0 ]; then
            echo "✅ Build successful!"
        else
            echo "❌ Build failed - check TypeScript errors"
        fi
    else
        echo "❌ package.json not found"
    fi
else
    echo "❌ Frontend directory not found"
fi

echo ""
echo "🎯 Animation components check:"
if [ -d "frontend/src/components/animations" ]; then
    echo "✅ Animation components directory exists"
    ls -la frontend/src/components/animations/
else
    echo "❌ Animation components directory not found"
fi

echo ""
echo "🏃‍♂️ Development server readiness:"
echo "Run: cd frontend && npm start"
echo "Visit: http://localhost:3000"

echo ""
echo "🎬 Animation features available:"
echo "- TypewriterText ⌨️"
echo "- FadeInWords 📝"
echo "- StaggeredLines 📜"  
echo "- GlowingText ✨"
echo "- MorphingText 🔄"
echo "- AnimationShowcase (demo)"
echo "- PipelineTest (end-to-end testing)"

echo ""
echo "✅ Script completed!"



