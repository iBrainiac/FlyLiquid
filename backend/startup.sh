#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting FlightStakeFi Backend System...${NC}"

# 1. Start Database
echo -e "${BLUE}📦 Checking Database...${NC}"
docker-compose up -d
sleep 3 # Wait for DB to be ready

# 2. Run Migrations
echo -e "${BLUE}🔄 Syncing Schema...${NC}"
npx prisma db push

# 3. Start Listener (Background)
echo -e "${BLUE}👂 Starting Event Listener...${NC}"
# Kill any existing listener
pkill -f "node src/services/listener.js" || true
nohup node src/services/listener.js > listener.log 2>&1 &
echo -e "${GREEN}✅ Listener running in background (logs: backend/listener.log)${NC}"

# 4. Start API Server (Foreground)
echo -e "${BLUE}🌍 Starting API Server...${NC}"
# Kill any existing server
pkill -f "node src/server.js" || true
npm run dev
