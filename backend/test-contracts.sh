#!/bin/bash

# Stellar Contract Clients Test Runner
# Convenience script for running contract client tests

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Running Stellar Contract Clients Test Suite...${NC}"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo -e "${YELLOW}Please create .env from .env.example and configure it${NC}"
    exit 1
fi

# Check if bindings exist
if [ ! -d "../packages/escrow-factory-client" ]; then
    echo -e "${YELLOW}Warning: Bindings packages not found${NC}"
    echo -e "${YELLOW}Run 'pnpm run bindings:generate' first${NC}"
    echo ""
fi

# Run the test script
npx ts-node -r tsconfig-paths/register src/test-stellar-clients.ts
