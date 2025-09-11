# Vercel Deployment Setup Script for Rockfall Dashboard (PowerShell)
# Run this script to prepare your project for Vercel deployment

Write-Host "🚀 Setting up Rockfall Dashboard for Vercel Deployment..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Make sure you're in the project root directory." -ForegroundColor Red
    exit 1
}

# Check if project name matches
$packageContent = Get-Content "package.json" -Raw
if ($packageContent -notmatch "rockfall-dashboard") {
    Write-Host "❌ Error: This doesn't appear to be the rockfall-dashboard project." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project verification passed" -ForegroundColor Green

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "📄 Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "⚠️  Please edit .env.local and add your Gemini API key" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

# Test build
Write-Host "🔨 Testing build process..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Please fix errors before deploying." -ForegroundColor Red
    exit 1
}

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📁 Initializing git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit - ready for Vercel deployment"
    Write-Host "⚠️  Don't forget to add your GitHub remote:" -ForegroundColor Yellow
    Write-Host "    git remote add origin https://github.com/yourusername/rockfall-dashboard.git" -ForegroundColor Cyan
    Write-Host "    git push -u origin main" -ForegroundColor Cyan
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Setup complete! Your project is ready for Vercel deployment." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Push your code to GitHub (if not already done)" -ForegroundColor White
Write-Host "2. Go to https://vercel.com and import your GitHub repository" -ForegroundColor White
Write-Host "3. Set the VITE_GEMINI_API_KEY environment variable in Vercel" -ForegroundColor White
Write-Host "4. Deploy!" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see VERCEL_DEPLOYMENT.md" -ForegroundColor Cyan
