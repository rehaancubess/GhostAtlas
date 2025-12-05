#!/bin/bash

# Script to check CloudWatch logs for Lambda functions
# Usage: ./check-lambda-logs.sh [function-name] [environment] [minutes]

set -e

# Default values
ENVIRONMENT="${2:-dev}"
MINUTES="${3:-60}"
FUNCTION_NAME="${1}"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== GhostAtlas Lambda CloudWatch Logs Checker ===${NC}\n"

# If no function name provided, show menu
if [ -z "$FUNCTION_NAME" ]; then
  echo "Available Lambda functions:"
  echo "  1. submit-encounter"
  echo "  2. get-encounters"
  echo "  3. get-all-encounters"
  echo "  4. get-encounter-by-id"
  echo "  5. rate-encounter"
  echo "  6. verify-location"
  echo "  7. admin-list-pending"
  echo "  8. admin-approve"
  echo "  9. admin-reject"
  echo "  10. enhancement-orchestrator"
  echo "  11. generate-narrative"
  echo "  12. generate-illustration"
  echo "  13. generate-narration"
  echo ""
  read -p "Select function (1-13) or enter custom name: " selection
  
  case $selection in
    1) FUNCTION_NAME="submit-encounter" ;;
    2) FUNCTION_NAME="get-encounters" ;;
    3) FUNCTION_NAME="get-all-encounters" ;;
    4) FUNCTION_NAME="get-encounter-by-id" ;;
    5) FUNCTION_NAME="rate-encounter" ;;
    6) FUNCTION_NAME="verify-location" ;;
    7) FUNCTION_NAME="admin-list-pending" ;;
    8) FUNCTION_NAME="admin-approve" ;;
    9) FUNCTION_NAME="admin-reject" ;;
    10) FUNCTION_NAME="enhancement-orchestrator" ;;
    11) FUNCTION_NAME="generate-narrative" ;;
    12) FUNCTION_NAME="generate-illustration" ;;
    13) FUNCTION_NAME="generate-narration" ;;
    *) FUNCTION_NAME="$selection" ;;
  esac
fi

FULL_FUNCTION_NAME="ghostatlas-${FUNCTION_NAME}-${ENVIRONMENT}"
LOG_GROUP="/aws/lambda/${FULL_FUNCTION_NAME}"

echo -e "${YELLOW}Checking logs for: ${FULL_FUNCTION_NAME}${NC}"
echo -e "${YELLOW}Log Group: ${LOG_GROUP}${NC}"
echo -e "${YELLOW}Time Range: Last ${MINUTES} minutes${NC}\n"

# Check if log group exists
if ! aws logs describe-log-groups --log-group-name-prefix "$LOG_GROUP" --query "logGroups[?logGroupName=='$LOG_GROUP']" --output text &>/dev/null; then
  echo -e "${RED}Error: Log group not found. Function may not have been invoked yet or doesn't exist.${NC}"
  exit 1
fi

# Calculate start time (X minutes ago)
START_TIME=$(($(date +%s) - ($MINUTES * 60)))000

echo -e "${GREEN}=== Recent Invocations ===${NC}\n"

# Get recent log streams
LOG_STREAMS=$(aws logs describe-log-streams \
  --log-group-name "$LOG_GROUP" \
  --order-by LastEventTime \
  --descending \
  --max-items 5 \
  --query 'logStreams[*].logStreamName' \
  --output text)

if [ -z "$LOG_STREAMS" ]; then
  echo -e "${YELLOW}No recent invocations found.${NC}"
  exit 0
fi

# Fetch and display logs
echo -e "${GREEN}Fetching logs...${NC}\n"

aws logs filter-log-events \
  --log-group-name "$LOG_GROUP" \
  --start-time "$START_TIME" \
  --query 'events[*].[timestamp,message]' \
  --output text | while IFS=$'\t' read -r timestamp message; do
    # Convert timestamp to readable format
    readable_time=$(date -r $((timestamp / 1000)) '+%Y-%m-%d %H:%M:%S')
    
    # Color code based on log level
    if echo "$message" | grep -qi "error"; then
      echo -e "${RED}[$readable_time] $message${NC}"
    elif echo "$message" | grep -qi "warn"; then
      echo -e "${YELLOW}[$readable_time] $message${NC}"
    else
      echo "[$readable_time] $message"
    fi
  done

echo -e "\n${GREEN}=== Error Summary ===${NC}\n"

# Count errors
ERROR_COUNT=$(aws logs filter-log-events \
  --log-group-name "$LOG_GROUP" \
  --start-time "$START_TIME" \
  --filter-pattern "ERROR" \
  --query 'length(events)' \
  --output text)

if [ "$ERROR_COUNT" -gt 0 ]; then
  echo -e "${RED}Found $ERROR_COUNT error(s) in the last $MINUTES minutes${NC}\n"
  
  echo -e "${YELLOW}Recent errors:${NC}"
  aws logs filter-log-events \
    --log-group-name "$LOG_GROUP" \
    --start-time "$START_TIME" \
    --filter-pattern "ERROR" \
    --query 'events[*].message' \
    --output text | head -10
else
  echo -e "${GREEN}No errors found in the last $MINUTES minutes${NC}"
fi

echo -e "\n${GREEN}=== Lambda Metrics ===${NC}\n"

# Get Lambda metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value="$FULL_FUNCTION_NAME" \
  --start-time "$(date -u -v-${MINUTES}M '+%Y-%m-%dT%H:%M:%S')" \
  --end-time "$(date -u '+%Y-%m-%dT%H:%M:%S')" \
  --period 300 \
  --statistics Sum \
  --query 'Datapoints[0].Sum' \
  --output text | xargs -I {} echo "Invocations: {}"

aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --dimensions Name=FunctionName,Value="$FULL_FUNCTION_NAME" \
  --start-time "$(date -u -v-${MINUTES}M '+%Y-%m-%dT%H:%M:%S')" \
  --end-time "$(date -u '+%Y-%m-%dT%H:%M:%S')" \
  --period 300 \
  --statistics Sum \
  --query 'Datapoints[0].Sum' \
  --output text | xargs -I {} echo "Errors: {}"

aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value="$FULL_FUNCTION_NAME" \
  --start-time "$(date -u -v-${MINUTES}M '+%Y-%m-%dT%H:%M:%S')" \
  --end-time "$(date -u '+%Y-%m-%dT%H:%M:%S')" \
  --period 300 \
  --statistics Average \
  --query 'Datapoints[0].Average' \
  --output text | xargs -I {} echo "Avg Duration: {} ms"

echo ""
