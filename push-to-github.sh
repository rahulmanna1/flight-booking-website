#!/bin/bash

# Safe Push to Existing GitHub Repository
# This script will safely push your new features to your existing GitHub repo

set -e

echo "🚀 Push Advanced Features to GitHub"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in a git repo
if [ ! -d .git ]; then
    echo -e "${RED}❌ Not a git repository${NC}"
    exit 1
fi

# Show current status
echo -e "${BLUE}📊 Current Git Status:${NC}"
git status --short
echo ""

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    echo ""
    git status --short
    echo ""
    read -p "Do you want to commit these changes? (y/n): " commit_changes
    
    if [ "$commit_changes" = "y" ]; then
        git add .
        echo ""
        read -p "Enter commit message (or press Enter for default): " commit_msg
        if [ -z "$commit_msg" ]; then
            commit_msg="Update: Add advanced Amadeus features and documentation"
        fi
        git commit -m "$commit_msg"
        echo -e "${GREEN}✓ Changes committed${NC}"
    fi
    echo ""
fi

# Check for existing remote
if git remote | grep -q origin; then
    echo -e "${GREEN}✓ Remote 'origin' already configured${NC}"
    echo ""
    echo "Current remote:"
    git remote -v
    echo ""
    read -p "Is this the correct repository? (y/n): " correct_remote
    
    if [ "$correct_remote" != "y" ]; then
        read -p "Enter your GitHub repository URL: " repo_url
        git remote remove origin
        git remote add origin "$repo_url"
        echo -e "${GREEN}✓ Remote updated${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No remote configured${NC}"
    echo ""
    echo "Please enter your GitHub repository URL"
    echo "Format: https://github.com/username/repo.git"
    echo "     or: git@github.com:username/repo.git"
    echo ""
    read -p "Repository URL: " repo_url
    
    if [ -z "$repo_url" ]; then
        echo -e "${RED}❌ Repository URL is required${NC}"
        exit 1
    fi
    
    git remote add origin "$repo_url"
    echo -e "${GREEN}✓ Remote added${NC}"
fi

echo ""
echo -e "${BLUE}📤 Preparing to push to GitHub...${NC}"
echo ""

# Show what will be pushed
echo "Current branch: $(git branch --show-current)"
echo "Commits to push:"
git log origin/main..HEAD --oneline 2>/dev/null || git log --oneline -n 5
echo ""

read -p "Ready to push? (y/n): " ready_to_push

if [ "$ready_to_push" != "y" ]; then
    echo "Push cancelled"
    exit 0
fi

echo ""
echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"

# Try to push
if git push -u origin main 2>&1; then
    echo ""
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
    echo ""
    echo "Your changes are now on GitHub! 🎉"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Vercel will automatically detect the changes"
    echo "2. A new deployment will start automatically"
    echo "3. Check your Vercel dashboard: https://vercel.com/dashboard"
    echo ""
    echo "Your new features include:"
    echo "  ✓ Price Analysis with deal indicators"
    echo "  ✓ Cheapest Dates Calendar"
    echo "  ✓ Branded Fares Comparison"
    echo "  ✓ Nearby Airports Suggestions"
    echo "  ✓ Price Alerts System"
    echo ""
else
    exit_code=$?
    echo ""
    echo -e "${RED}❌ Push failed${NC}"
    echo ""
    echo "Common issues:"
    echo "1. Authentication required - run: gh auth login"
    echo "2. Branch behind remote - run: git pull origin main"
    echo "3. Wrong repository URL"
    echo ""
    echo "Try these commands:"
    echo ""
    echo "# If remote branch doesn't exist yet:"
    echo "git push -u origin main --force-with-lease"
    echo ""
    echo "# If you need to pull first:"
    echo "git pull origin main --rebase"
    echo "git push origin main"
    echo ""
    exit $exit_code
fi
