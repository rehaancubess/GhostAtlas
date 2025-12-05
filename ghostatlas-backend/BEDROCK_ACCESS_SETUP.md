# AWS Bedrock Model Access Setup

## Issue
The AI enhancement pipeline is failing with the error:
```
Model use case details have not been submitted for this account. 
Fill out the Anthropic use case details form before using the model.
```

## Solution: Submit Anthropic Use Case Details

AWS Bedrock now auto-enables models on first invocation, but **Anthropic models require submitting use case details** for first-time users.

### Method 1: Use Bedrock Playground (Easiest)

1. **Navigate to AWS Bedrock Console**
   - Go to: https://console.aws.amazon.com/bedrock/
   - Make sure you're in **us-east-1** region

2. **Open Model Catalog**
   - Click **"Model catalog"** in the left sidebar
   - Search for **"Claude"** or **"Anthropic"**

3. **Select Claude 3 Haiku**
   - Click on **"Claude 3 Haiku"** model card
   - Click **"Open in Playground"** button

4. **Submit Use Case Form**
   - You'll be prompted to fill out the Anthropic use case form
   - Fill in:
     - **Use case description**: "AI-powered ghost story enhancement and narrative generation for GhostAtlas mobile application"
     - **Industry**: Entertainment/Media or Technology
     - **Expected monthly usage**: Low (development/testing)
   - Submit the form

5. **Wait for Approval**
   - Usually instant or within minutes
   - You may receive an email confirmation

### Method 2: Invoke Model via CLI (Alternative)

Try invoking the model directly to trigger the use case form:

```bash
aws bedrock-runtime invoke-model \
  --region us-east-1 \
  --model-id anthropic.claude-3-haiku-20240307-v1:0 \
  --body '{"anthropic_version":"bedrock-2023-05-31","max_tokens":100,"messages":[{"role":"user","content":"Hello"}]}' \
  --cli-binary-format raw-in-base64-out \
  output.json
```

If you see the use case error, you'll need to use Method 1 (Playground) to submit the form.

### Verify Access

After submitting the form, verify access:
```bash
aws bedrock list-foundation-models --region us-east-1 --query 'modelSummaries[?contains(modelId, `anthropic`)].modelId'
```

### Step 6: Test Enhancement Pipeline
Once access is granted, the enhancement pipeline will automatically start working. You can:

1. **Check existing failed encounters**: They're still in the queue and will be retried
2. **Approve a new story**: Test the full flow from approval to enhancement
3. **Monitor CloudWatch logs**: 
   ```bash
   aws logs tail /aws/lambda/ghostatlas-enhancement-orchestrator-dev --follow
   ```

## Current Status
- ❌ **7 encounters** are in `enhancement_failed` status
- ❌ **5 messages** are currently in the SQS queue (being retried)
- ✅ SQS queue and Lambda functions are properly configured
- ✅ Event source mapping is enabled

## What Happens After Access is Granted
1. Messages in the SQS queue will be automatically retried
2. Failed encounters will be reprocessed
3. New approvals will work immediately
4. Stories will appear in the app after ~60 seconds of enhancement

## Models Used by GhostAtlas
- **Claude 3 Haiku**: Fast narrative generation (primary)
- **Claude 3.5 Sonnet**: High-quality narrative generation (fallback)
- **Amazon Titan Image Generator**: AI-generated illustrations

## Alternative: Use Mock Data (Development Only)
If you want to test without Bedrock access, you can temporarily modify the Lambda functions to return mock data. However, this is not recommended for production.
