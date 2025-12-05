# Enhancement Pipeline Update - Multi-Image Video Generation

## Overview

The enhancement pipeline has been updated to support video-like storytelling with multiple AI-generated images. All approved encounters now receive mandatory AI enhancements regardless of user-uploaded content.

## Key Changes

### 1. Mandatory AI Enhancement
- **Previous**: Enhancement was optional or conditional
- **New**: ALL approved encounters MUST receive:
  - AI-rewritten narrative (Bedrock Claude)
  - Multiple AI-generated illustrations (Bedrock Stable Diffusion)
  - Voice narration (AWS Polly)
- **Rationale**: Ensures consistent, high-quality content for all stories

### 2. Multiple Illustrations (3-5 Images)
- **Previous**: Single illustration per encounter
- **New**: 3-5 illustrations representing different scenes
- **Purpose**: Create video-like storytelling experience
- **Structure**: 
  ```
  encounters/{id}/illustrations/
    0.png  (Scene 1 - Beginning)
    1.png  (Scene 2 - Rising action)
    2.png  (Scene 3 - Climax)
    3.png  (Scene 4 - Resolution, optional)
    4.png  (Scene 5 - Ending, optional)
  ```

### 3. Scene Extraction
The system now:
1. Parses the enhanced narrative into key scenes
2. Extracts visual elements for each scene
3. Generates distinct prompts for sequential storytelling
4. Maintains visual consistency across images using consistent seeds

### 4. Data Model Changes

#### Encounters Table
```typescript
{
  // ... existing fields
  imageUrls: string[]           // User-uploaded (optional)
  illustrationUrls: string[]    // AI-generated (3-5 images, required)
  narrationUrl: string          // AI-generated (required)
  enhancedStory: string         // AI-generated (required)
}
```

### 5. Lambda Configuration Updates

#### EnhancementOrchestrator
- **Memory**: 1024 MB → 2048 MB
- **Timeout**: 60s → 90s
- **New Environment Variables**:
  - `MIN_ILLUSTRATIONS`: 3
  - `MAX_ILLUSTRATIONS`: 5

#### GenerateIllustration
- **Timeout**: 20s → 60s
- **Behavior**: Now generates multiple images in sequence
- **Returns**: Array of CloudFront URLs instead of single URL

### 6. Processing Time
- **Previous**: ~30 seconds total
- **New**: ~60 seconds total
  - Narrative: 10s
  - Illustrations: 45s (3-5 images @ ~15s each)
  - Narration: 10s
  - Overhead: 5s

### 7. Cost Impact

#### Monthly Cost (500 approvals/month)
- **Lambda**: $50 → $80 (+$30)
- **Bedrock Stable Diffusion**: $50 → $200 (+$150)
- **Total Increase**: ~$180/month
- **New Total**: ~$391.50/month

## Implementation Tasks

### Required Code Changes

1. **Update GenerateIllustration Lambda**
   - Add scene extraction logic
   - Implement loop for multiple image generation
   - Update S3 path structure
   - Return array of URLs

2. **Update EnhancementOrchestrator Lambda**
   - Handle array of illustration URLs
   - Update DynamoDB write to use `illustrationUrls` field
   - Increase timeout and memory configuration

3. **Update DynamoDB Schema**
   - Change `illustrationUrl` (string) → `illustrationUrls` (string array)
   - Update all queries/writes accordingly

4. **Update API Responses**
   - Modify GetEncounters to return `illustrationUrls` array
   - Modify GetEncounterById to return `illustrationUrls` array
   - Update OpenAPI specification

5. **Update Flutter App**
   - Modify Encounter model to handle `illustrationUrls` array
   - Update UI to display multiple images
   - Implement image carousel/slideshow
   - Add video compilation feature (future)

### Testing Requirements

1. **Property Tests**
   - Property 24: Verify 3-5 illustrations are generated
   - Update Property 18: Verify all AI services invoked
   - Update Property 19: Verify illustrationUrls array populated

2. **Integration Tests**
   - Test full enhancement pipeline with multiple images
   - Verify S3 paths for all illustrations
   - Verify CloudFront URLs accessible
   - Test error handling when some images fail

3. **Load Tests**
   - Verify 60s completion time under load
   - Test Lambda timeout handling
   - Monitor Bedrock throttling

## Migration Strategy

### For Existing Encounters

**Option 1: Lazy Migration**
- Keep existing `illustrationUrl` field
- Add new `illustrationUrls` field
- App checks both fields (array first, fallback to single)

**Option 2: Batch Re-enhancement**
- Re-run enhancement pipeline for all approved encounters
- Generate multiple images for existing stories
- Update all records to new schema

**Recommendation**: Option 1 for faster deployment, Option 2 for consistency

### Deployment Steps

1. Deploy updated Lambda functions
2. Update DynamoDB table (add `illustrationUrls` field)
3. Deploy API Gateway changes
4. Update Flutter app to handle both formats
5. Monitor enhancement pipeline performance
6. (Optional) Batch re-enhance existing encounters

## Future Enhancements

### Video Compilation
- Combine illustrations + narration into MP4
- Add transitions between scenes
- Add text overlays with story segments
- Store video in S3 for sharing

### Advanced Scene Detection
- Use AI to identify optimal scene breaks
- Generate more images for longer stories
- Adaptive image count based on narrative complexity

### Visual Consistency
- Use ControlNet for better scene continuity
- Maintain character appearance across scenes
- Preserve location details throughout sequence

## Monitoring

### Key Metrics to Watch
- Enhancement pipeline duration (target: <60s)
- Illustration generation success rate (target: >95%)
- Bedrock throttling errors
- Lambda timeout errors
- Cost per enhancement

### Alarms
- Enhancement duration >75s
- Illustration generation failure rate >10%
- DLQ message count >5 in 5 minutes
- Daily Bedrock cost >$10

## Questions & Decisions

### Resolved
- ✅ Always generate AI content (even with user images)
- ✅ Generate 3-5 images per story
- ✅ Use sequential scene-based generation
- ✅ Increase Lambda timeout to 90s

### Pending
- ❓ Should we generate video immediately or on-demand?
- ❓ What's the optimal number of images (3, 4, or 5)?
- ❓ Should we allow users to select illustration style?
- ❓ Do we need image-to-image consistency models?

## References

- Requirements: `.kiro/specs/ghostatlas-aws-backend/requirements.md`
- Design: `.kiro/specs/ghostatlas-aws-backend/design.md`
- Tasks: `.kiro/specs/ghostatlas-aws-backend/tasks.md`
- Current Implementation: `src/lambdas/enhancement/`
