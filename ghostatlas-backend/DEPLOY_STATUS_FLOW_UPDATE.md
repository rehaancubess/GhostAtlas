# Deployment Checklist - Status Flow Update

## Pre-Deployment

- [ ] Review changes in `STATUS_FLOW_UPDATE.md`
- [ ] Backup DynamoDB table (or enable point-in-time recovery)
- [ ] Test locally with SAM or CDK
- [ ] Run TypeScript build: `npm run build`
- [ ] Run tests: `npm test`

## Deployment Steps

### 1. Deploy Backend Changes

```bash
cd ghostatlas-backend
npm run build
cdk deploy
```

**Files being deployed:**
- `src/utils/types.ts` - Added `enhanced` status
- `src/lambdas/enhancement/enhancementOrchestrator.ts` - Sets status to `enhanced`
- `src/lambdas/api/getAllEncounters.ts` - Filters by `enhanced`
- `src/lambdas/api/getEncounters.ts` - Filters by `enhanced`
- `src/lambdas/api/getEncounterById.ts` - Accepts `approved` and `enhanced`

### 2. Verify Deployment

```bash
# Check Lambda functions updated
aws lambda get-function --function-name EnhancementOrchestrator
aws lambda get-function --function-name GetAllEncounters
aws lambda get-function --function-name GetEncounters
aws lambda get-function --function-name GetEncounterById

# Check deployment timestamp
aws lambda list-functions --query 'Functions[?contains(FunctionName, `GhostAtlas`)].{Name:FunctionName, Updated:LastModified}'
```

### 3. Test the Flow

#### Test 1: Submit and Approve New Story

```bash
# 1. Submit a test story
curl -X POST https://your-api.execute-api.region.amazonaws.com/prod/api/encounters/submit \
  -H "Content-Type: application/json" \
  -d '{
    "authorName": "Test User",
    "location": {"latitude": 40.7128, "longitude": -74.0060},
    "originalStory": "I saw a ghost in Central Park last night.",
    "encounterTime": "2024-01-15T22:00:00Z",
    "imageCount": 0
  }'

# Save the encounterId from response

# 2. Verify status is "pending"
curl https://your-api.execute-api.region.amazonaws.com/prod/api/encounters/{encounterId}

# 3. Approve the story (admin endpoint)
curl -X PUT https://your-api.execute-api.region.amazonaws.com/prod/api/admin/encounters/{encounterId}/approve

# 4. Verify status is "approved" (not visible in public listing yet)
curl https://your-api.execute-api.region.amazonaws.com/prod/api/encounters/all
# Should NOT include the story

# 5. Wait 60 seconds for AI enhancement

# 6. Check status again
curl https://your-api.execute-api.region.amazonaws.com/prod/api/encounters/{encounterId}
# Should show status: "enhanced"

# 7. Verify NOW visible in public listing
curl https://your-api.execute-api.region.amazonaws.com/prod/api/encounters/all
# Should include the story with AI content
```

#### Test 2: Check Existing Stories

```bash
# Get all stories
curl https://your-api.execute-api.region.amazonaws.com/prod/api/encounters/all

# Verify all returned stories have:
# - status: "enhanced"
# - enhancedStory (not empty)
# - illustrationUrls (array with 3-5 URLs)
# - narrationUrl (not null)
```

### 4. Monitor CloudWatch Logs

```bash
# Watch enhancement orchestrator logs
aws logs tail /aws/lambda/EnhancementOrchestrator --follow

# Watch for errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/EnhancementOrchestrator \
  --filter-pattern "ERROR" \
  --start-time $(date -u -d '5 minutes ago' +%s)000
```

### 5. Check SQS Queue

```bash
# Check enhancement queue for messages
aws sqs get-queue-attributes \
  --queue-url https://sqs.region.amazonaws.com/account/enhancement-queue \
  --attribute-names ApproximateNumberOfMessages ApproximateNumberOfMessagesNotVisible

# Check dead-letter queue
aws sqs get-queue-attributes \
  --queue-url https://sqs.region.amazonaws.com/account/enhancement-dlq \
  --attribute-names ApproximateNumberOfMessages
```

## Post-Deployment

### 1. Migrate Existing Data (if needed)

If you have existing stories with status `approved` that already have AI content:

```bash
# Run migration script
node scripts/migrate-approved-to-enhanced.js
```

Or manually update in DynamoDB console:
1. Go to DynamoDB → Tables → Encounters
2. Scan for items where `status = "approved"`
3. Check if they have `enhancedStory`, `illustrationUrls`, and `narrationUrl`
4. If yes, update `status` to `"enhanced"`

### 2. Update Frontend (if needed)

The frontend changes are already deployed, but verify:

```bash
cd ghostatlas
flutter build
# Deploy to app stores or web
```

### 3. Monitor for 24 Hours

- [ ] Check CloudWatch metrics every 2 hours
- [ ] Monitor error rates
- [ ] Check user feedback
- [ ] Verify no stories stuck in "approved" status

### 4. Performance Checks

```bash
# Check average enhancement time
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=EnhancementOrchestrator \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average

# Should be around 60,000ms (60 seconds)
```

## Rollback Plan

If issues occur:

### Quick Rollback (API Only)

```bash
# Revert Lambda functions to previous version
aws lambda update-function-code \
  --function-name GetAllEncounters \
  --s3-bucket your-deployment-bucket \
  --s3-key previous-version.zip

# Repeat for other functions
```

### Full Rollback (CDK)

```bash
cd ghostatlas-backend
git revert HEAD
npm run build
cdk deploy
```

### Manual Fix (DynamoDB)

If stories are stuck in "approved":

```bash
# Update status to "enhanced" for stories with AI content
# Use DynamoDB console or AWS CLI
```

## Success Criteria

- [ ] New stories go through: pending → approved → enhanced
- [ ] Stories only appear in public listing when status = "enhanced"
- [ ] All visible stories have AI content (narrative, illustrations, narration)
- [ ] No stories stuck in "approved" for >2 minutes
- [ ] Enhancement pipeline completes in ~60 seconds
- [ ] No increase in error rates
- [ ] User feedback is positive

## Troubleshooting

### Stories Not Appearing

**Symptom**: Story approved but not showing in listing

**Check**:
1. Verify status in DynamoDB (should be "enhanced")
2. Check CloudWatch logs for enhancement orchestrator
3. Check SQS dead-letter queue for failed messages
4. Verify AI services (Bedrock, Polly) are working

**Fix**:
- If stuck in "approved", check enhancement logs
- If enhancement failed, retry manually or fix issue
- If status is "enhanced" but not showing, check API filters

### Enhancement Taking Too Long

**Symptom**: Stories stuck in "approved" for >2 minutes

**Check**:
1. CloudWatch logs for enhancement orchestrator
2. Bedrock service quotas
3. S3 upload permissions
4. Lambda timeout settings

**Fix**:
- Increase Lambda timeout if needed
- Check Bedrock throttling
- Verify IAM permissions

### Wrong Status in Listing

**Symptom**: Stories with status "approved" appearing in listing

**Check**:
1. Verify API code deployed correctly
2. Check Lambda function version
3. Verify API Gateway integration

**Fix**:
- Redeploy Lambda functions
- Clear API Gateway cache
- Verify environment variables

## Contact

If issues persist:
- Check CloudWatch Logs
- Review `STATUS_FLOW_UPDATE.md`
- Check GitHub issues
- Contact DevOps team
