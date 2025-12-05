#!/bin/bash

# Test script for GhostAtlas API endpoints
# This script tests the API connectivity and basic functionality

API_BASE_URL="https://yj3dszj0vh.execute-api.us-east-1.amazonaws.com/dev/api"

echo "🔍 Testing GhostAtlas API..."
echo "Base URL: $API_BASE_URL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Get all encounters
echo "📍 Test 1: GET /api/encounters (geospatial query)"
echo "Request: GET $API_BASE_URL/encounters?latitude=13.081084&longitude=77.559572&radius=100&limit=10"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/encounters?latitude=13.081084&longitude=77.559572&radius=100&limit=10")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Success (HTTP $HTTP_CODE)${NC}"
    echo "Response preview:"
    echo "$BODY" | jq -r '.encounters[0:2] | length' 2>/dev/null && echo "Found $(echo "$BODY" | jq -r '.count') encounters" || echo "$BODY"
else
    echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
fi
echo ""

# Test 2: Get all encounters (no location filter)
echo "📍 Test 2: GET /api/encounters/all"
echo "Request: GET $API_BASE_URL/encounters/all?limit=10"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/encounters/all?limit=10")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Success (HTTP $HTTP_CODE)${NC}"
    echo "Response preview:"
    echo "$BODY" | jq -r '.encounters[0:2] | length' 2>/dev/null && echo "Found $(echo "$BODY" | jq -r '.count') encounters" || echo "$BODY"
else
    echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
fi
echo ""

# Test 3: Get specific encounter (if we have an ID from previous test)
ENCOUNTER_ID=$(echo "$BODY" | jq -r '.encounters[0].id' 2>/dev/null)
if [ ! -z "$ENCOUNTER_ID" ] && [ "$ENCOUNTER_ID" != "null" ]; then
    echo "📍 Test 3: GET /api/encounters/:id"
    echo "Request: GET $API_BASE_URL/encounters/$ENCOUNTER_ID"
    RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/encounters/$ENCOUNTER_ID")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓ Success (HTTP $HTTP_CODE)${NC}"
        echo "Response preview:"
        echo "$BODY" | jq -r '{id, authorName, status}' 2>/dev/null || echo "$BODY"
    else
        echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
        echo "Response: $BODY"
    fi
else
    echo -e "${YELLOW}⊘ Test 3: Skipped (no encounter ID available)${NC}"
fi
echo ""

# Test 4: CORS preflight
echo "📍 Test 4: OPTIONS /api/encounters (CORS preflight)"
echo "Request: OPTIONS $API_BASE_URL/encounters"
RESPONSE=$(curl -s -w "\n%{http_code}" -X OPTIONS \
    -H "Origin: http://localhost:5173" \
    -H "Access-Control-Request-Method: GET" \
    "$API_BASE_URL/encounters")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 204 ]; then
    echo -e "${GREEN}✓ Success (HTTP $HTTP_CODE) - CORS enabled${NC}"
else
    echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "API Base URL: $API_BASE_URL"
echo ""
echo "Next steps:"
echo "1. Start the web app: cd ghostatlas-web && npm run dev"
echo "2. Visit http://localhost:5173/stories"
echo "3. Check browser console for any errors"
echo ""
echo "For more detailed testing:"
echo "- Use browser DevTools Network tab"
echo "- Check CloudWatch logs in AWS Console"
echo "- Review API Gateway metrics"
echo ""
