# AI Enhancement Flow

## Overview

When a story is submitted and approved, it goes through an AI enhancement pipeline that takes approximately **60 seconds** to complete. This document explains the flow and what to expect.

## The Complete Flow

### 1. Story Submission (User)
- User submits a story with:
  - Original story text
  - Location
  - Optional user-uploaded photos
- Story is saved with status: `pending`
- **NOT visible to public users**

### 2. Admin Approval
- Admin reviews the story in the Admin Panel
- Admin clicks "Approve"
- Story status changes to: `approved`
- **Enhancement pipeline is triggered** (via SQS queue)
- Admin sees message: "Encounter approved! AI enhancement in progress (~60 seconds)..."
- **Still NOT visible in stories list** (waiting for AI enhancement)

### 3. AI Enhancement Pipeline (~60 seconds)

The enhancement happens in the background through these steps:

#### Step 1: Generate Enhanced Narrative (~10s)
- Uses AWS Bedrock Claude AI
- Rewrites the original story with:
  - Better narrative structure
  - More atmospheric language
  - Horror/spooky tone
  - Proper grammar and flow
- Updates `enhancedStory` field

#### Step 2: Generate Illustrations (~45s)
- Uses AWS Bedrock Stable Diffusion
- Generates 3-5 AI images representing different scenes
- Images are stored in S3 and served via CloudFront
- Updates `illustrationUrls` field (array of URLs)

#### Step 3: Generate Voice Narration (~10s)
- Uses AWS Polly text-to-speech
- Creates an audio file of the enhanced story
- Audio is stored in S3 and served via CloudFront
- Updates `narrationUrl` field

### 4. Enhancement Complete
- Status changes to: `enhanced`
- All AI-generated content is now available
- **NOW visible in stories list**
- Story displays:
  - ✅ Enhanced narrative (AI-rewritten)
  - ✅ AI-generated illustrations (3-5 images)
  - ✅ Voice narration (audio player)
- Story card shows "AI Enhanced" badge

## Visual Indicators

### During Enhancement (0-60 seconds after approval)
- **Story Card**: Shows orange "Enhancing..." badge with spinner
- **Story Detail**: Shows orange banner: "AI Enhancement in Progress"
- **Text**: Shows original story (not enhanced yet)
- **Images**: May show placeholder or first generated image
- **Audio**: Not available yet

### After Enhancement (60+ seconds after approval)
- **Story Card**: Shows green "AI Enhanced" badge
- **Story Detail**: No banner (enhancement complete)
- **Text**: Shows AI-enhanced narrative
- **Images**: Shows 3-5 AI-generated illustrations
- **Audio**: Audio player available with narration

## What You See

### Immediately After Approval
```
Status: approved
enhancedStory: [same as originalStory]
illustrationUrls: []
narrationUrl: null
```
→ **NOT visible in stories list** (enhancement in progress)

### After ~60 Seconds
```
Status: enhanced
enhancedStory: "In the dead of night, beneath a moonless sky..."
illustrationUrls: [
  "https://cdn.../0.png",
  "https://cdn.../1.png",
  "https://cdn.../2.png"
]
narrationUrl: "https://cdn.../narration.mp3"
```
→ **NOW visible in stories list** with "AI Enhanced" badge

## Troubleshooting

### Story Still Shows Original Text After 60+ Seconds

**Possible Causes:**
1. Enhancement pipeline failed (check CloudWatch logs)
2. Frontend is showing cached data (pull to refresh)
3. AWS Bedrock quota exceeded
4. Network issues during enhancement

**Solutions:**
1. Check backend logs in AWS CloudWatch
2. Pull down to refresh the stories list
3. Check AWS Bedrock service quotas
4. Verify SQS queue has no dead-letter messages

### No AI Images Showing

**Possible Causes:**
1. Stable Diffusion generation failed
2. S3 upload failed
3. CloudFront URLs not accessible

**Solutions:**
1. Check `illustrationUrls` field in DynamoDB
2. Verify S3 bucket has the images
3. Test CloudFront URLs directly
4. Check Lambda logs for `generateIllustration`

### No Audio Narration

**Possible Causes:**
1. Polly generation failed
2. Audio file too large
3. S3 upload failed

**Solutions:**
1. Check `narrationUrl` field in DynamoDB
2. Verify S3 bucket has the audio file
3. Check Lambda logs for `generateNarration`

## Backend Architecture

```
User Submits Story
       ↓
   [DynamoDB]
   status: pending
   (NOT in public listing)
       ↓
Admin Approves ──→ [SQS Queue] ──→ [Enhancement Orchestrator Lambda]
       ↓                                      ↓
   status: approved                    [Generate Narrative]
   (STILL NOT in listing)                    ↓
                                       [Generate Illustrations]
                                              ↓
                                       [Generate Narration]
                                              ↓
                                       [Update DynamoDB]
                                              ↓
                                       status: enhanced ✓
                                       enhancedStory ✓
                                       illustrationUrls ✓
                                       narrationUrl ✓
                                              ↓
                                       NOW IN PUBLIC LISTING ✓
```

## Key Points

1. **Enhancement is asynchronous** - It happens in the background after approval
2. **Takes ~60 seconds** - Stories don't appear in public listing until enhancement completes
3. **Three status states**:
   - `pending` - Awaiting admin review (not visible)
   - `approved` - Admin approved, AI enhancement in progress (not visible)
   - `enhanced` - AI enhancement complete (visible in public listing)
4. **Original story is preserved** - We keep both `originalStory` and `enhancedStory`
5. **User photos are separate** - `imageUrls` (user) vs `illustrationUrls` (AI)
6. **No partial content** - Stories only appear when fully enhanced

## Testing the Flow

1. Submit a test story
2. Go to Admin Panel
3. Approve the story
4. Note the timestamp
5. Wait 60 seconds
6. Pull down to refresh the stories list
7. Open the story detail
8. Verify:
   - Enhanced narrative is different from original
   - 3-5 AI illustrations are showing
   - Audio player is available
   - "AI Enhanced" badge is showing

## Cost Per Enhancement

- Narrative (Claude): ~$0.01
- Illustrations (Stable Diffusion): ~$0.40 (3-5 images)
- Narration (Polly): ~$0.01
- **Total: ~$0.42 per approved story**
