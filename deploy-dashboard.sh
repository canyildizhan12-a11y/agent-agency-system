#!/bin/bash

# Deploy Agent Agency Dashboard to Vercel

echo "🦉 Agent Agency Dashboard Deployment"
echo "======================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

cd dashboard

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🏗️  Building project..."
npm run build

echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Deploy
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your dashboard should be live shortly."
echo "Check your Vercel dashboard for the URL."