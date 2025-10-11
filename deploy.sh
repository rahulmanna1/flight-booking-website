#!/bin/bash

# Flight Booking Website - Quick Deployment Script
# This script helps you deploy to GitHub and Vercel

set -e  # Exit on error

echo "🚀 Flight Booking Website Deployment"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${RED}❌ Git repository not initialized${NC}"
    echo "Run: git init"
    exit 1
fi

# Check current status
echo -e "${BLUE}📊 Checking git status...${NC}"
git status
echo ""

# Ask for GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${RED}❌ GitHub username is required${NC}"
    exit 1
fi

# Ask for repository name
echo ""
read -p "Enter repository name (default: flight-booking-website): " REPO_NAME
REPO_NAME=${REPO_NAME:-flight-booking-website}

echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Make sure you've created this repository on GitHub first!${NC}"
echo "Go to: https://github.com/new"
echo "Repository name: $REPO_NAME"
echo "Keep it PRIVATE to protect your code"
echo ""
read -p "Have you created the repository on GitHub? (y/n): " CREATED_REPO

if [ "$CREATED_REPO" != "y" ]; then
    echo ""
    echo -e "${YELLOW}Please create the repository first:${NC}"
    echo "1. Go to https://github.com/new"
    echo "2. Name: $REPO_NAME"
    echo "3. Description: Modern flight booking platform with Amadeus API"
    echo "4. Keep it PRIVATE"
    echo "5. DO NOT add README, .gitignore, or license (we have them)"
    echo "6. Click 'Create repository'"
    echo ""
    echo "Then run this script again!"
    exit 0
fi

# Check if remote already exists
if git remote | grep -q origin; then
    echo -e "${YELLOW}⚠️  Remote 'origin' already exists${NC}"
    echo "Current remote:"
    git remote -v
    echo ""
    read -p "Do you want to update it? (y/n): " UPDATE_REMOTE
    
    if [ "$UPDATE_REMOTE" = "y" ]; then
        git remote remove origin
        echo -e "${GREEN}✓ Removed old remote${NC}"
    else
        echo "Keeping existing remote"
    fi
fi

# Add remote if it doesn't exist
if ! git remote | grep -q origin; then
    REMOTE_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo -e "${BLUE}🔗 Adding GitHub remote...${NC}"
    git remote add origin "$REMOTE_URL"
    echo -e "${GREEN}✓ Remote added: $REMOTE_URL${NC}"
fi

echo ""
echo -e "${BLUE}📤 Pushing to GitHub...${NC}"

# Push to GitHub
if git push -u origin main; then
    echo ""
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
    echo ""
    echo "Your code is now at:"
    echo "https://github.com/$GITHUB_USERNAME/$REPO_NAME"
else
    echo ""
    echo -e "${RED}❌ Failed to push to GitHub${NC}"
    echo ""
    echo "Common issues:"
    echo "1. Repository doesn't exist on GitHub"
    echo "2. Authentication failed (check GitHub credentials)"
    echo "3. Remote URL is incorrect"
    echo ""
    echo "Try:"
    echo "- Create repository: https://github.com/new"
    echo "- Check credentials: gh auth login"
    echo "- Or push manually: git push -u origin main"
    exit 1
fi

echo ""
echo -e "${BLUE}🎯 Next Steps:${NC}"
echo ""
echo "1. Deploy to Vercel:"
echo "   → Go to: https://vercel.com/new"
echo "   → Import your GitHub repository"
echo "   → Configure environment variables (see below)"
echo "   → Click Deploy!"
echo ""
echo "2. Required Environment Variables for Vercel:"
echo "   AMADEUS_CLIENT_ID=your-api-key"
echo "   AMADEUS_CLIENT_SECRET=your-api-secret"
echo "   AMADEUS_ENVIRONMENT=test"
echo "   NEXTAUTH_SECRET=generate-random-32-chars"
echo "   NEXTAUTH_URL=https://your-app.vercel.app"
echo "   DATABASE_URL=your-neon-postgres-url"
echo ""
echo "3. Test your deployment:"
echo "   → Visit your Vercel URL"
echo "   → Test flight search"
echo "   → Verify all features work"
echo ""
echo -e "${GREEN}✨ Your repository is ready for Vercel deployment!${NC}"
echo ""
echo "📚 For detailed instructions, see: DEPLOYMENT_GUIDE.md"
echo ""
