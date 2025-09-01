#!/bin/sh

# NPM publishing script
# Usage: ./publish.sh [patch|minor|major]

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get version type
VERSION_TYPE=${1:-patch}

echo -e "${YELLOW}🚀 Preparing to publish @verisense-network/sensespace-did-ts...${NC}"

# 1. Check Git status
if [[ $(git status --porcelain) ]]; then
    echo -e "${RED}❌ Git working directory is not clean, please commit all changes first${NC}"
    exit 1
fi

# 2. Check if on main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" != "main" && "$BRANCH" != "master" ]]; then
    echo -e "${YELLOW}⚠️  Currently not on main branch ($BRANCH), are you sure you want to continue? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 3. Check npm login status
if ! npm whoami > /dev/null 2>&1; then
    echo -e "${RED}❌ Not logged in to npm, please run first: npm login${NC}"
    exit 1
fi

# 4. Run tests (if available)
echo -e "${YELLOW}🧪 Running tests...${NC}"
npm test || echo -e "${YELLOW}⚠️  Tests skipped${NC}"

# 5. Clean and build
echo -e "${YELLOW}🔨 Building project...${NC}"
npm run build

# 6. Preview package contents
echo -e "${YELLOW}📦 Previewing package contents...${NC}"
npm pack --dry-run

# 7. Confirm publish
echo -e "${YELLOW}❓ Confirm publishing $VERSION_TYPE version? (y/N)${NC}"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Publishing cancelled${NC}"
    exit 1
fi

# 8. Update version and publish
echo -e "${GREEN}✨ Publishing version...${NC}"
npm version $VERSION_TYPE
npm publish

# 9. Push tags
echo -e "${GREEN}📌 Pushing Git tags...${NC}"
git push --follow-tags

echo -e "${GREEN}🎉 Publishing successful! Package URL: https://www.npmjs.com/package/@verisense-network/sensespace-did-ts${NC}"
