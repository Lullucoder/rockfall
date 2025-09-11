#!/bin/bash

# Vercel Deployment Setup Script for Rockfall Dashboard
# Run this script to prepare your project for Vercel deployment

echo "🚀 Setting up Rockfall Dashboard for Vercel Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Check if project name matches
if ! grep -q "rockfall-dashboard" package.json; then
    echo "❌ Error: This doesn't appear to be the rockfall-dashboard project."
    exit 1
fi

echo "✅ Project verification passed"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📄 Creating .env.local file..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local and add your Gemini API key"
else
    echo "✅ .env.local already exists"
fi

# Test build
echo "🔨 Testing build process..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - ready for Vercel deployment"
    echo "⚠️  Don't forget to add your GitHub remote:"
    echo "    git remote add origin https://github.com/yourusername/rockfall-dashboard.git"
    echo "    git push -u origin main"
else
    echo "✅ Git repository already initialized"
fi

echo ""
echo "🎉 Setup complete! Your project is ready for Vercel deployment."
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub (if not already done)"
echo "2. Go to https://vercel.com and import your GitHub repository"
echo "3. Set the VITE_GEMINI_API_KEY environment variable in Vercel"
echo "4. Deploy!"
echo ""
echo "📖 For detailed instructions, see VERCEL_DEPLOYMENT.md"
