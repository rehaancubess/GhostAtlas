# Submit Components

This directory contains components for the encounter submission form.

## Components

### SubmitForm

The main multi-step form component for submitting ghost encounters.

**Features:**
- Multi-step wizard (Details → Location → Images → Review)
- Form validation with error messages
- Progress indicator
- Image upload to S3 with progress tracking
- Success animation
- Automatic navigation to profile after submission

**Usage:**
```tsx
import { SubmitForm } from '@/components/submit';

<SubmitForm />
```

### LocationPicker

Component for selecting encounter location with multiple input methods.

**Features:**
- Google Places Autocomplete for address search
- Browser geolocation API integration
- Manual coordinate entry
- Interactive map preview with dark theme
- Click-to-select on map

**Props:**
- `location`: Current location value
- `onLocationChange`: Callback when location changes

**Usage:**
```tsx
import { LocationPicker } from '@/components/submit';

<LocationPicker
  location={location}
  onLocationChange={(loc) => setLocation(loc)}
/>
```

### ImageUploader

Drag-and-drop image uploader with preview and reordering.

**Features:**
- Drag-and-drop zone with React Dropzone
- File validation (format: JPEG/PNG/WebP, size: max 10MB)
- Image preview thumbnails
- Drag-to-reorder functionality
- Remove images
- Visual feedback for errors

**Props:**
- `images`: Array of ImageFile objects
- `onImagesChange`: Callback when images change
- `maxImages`: Maximum number of images (default: 5)
- `maxSizeMB`: Maximum file size in MB (default: 10)

**Usage:**
```tsx
import { ImageUploader } from '@/components/submit';

<ImageUploader
  images={images}
  onImagesChange={setImages}
  maxImages={5}
  maxSizeMB={10}
/>
```

## Submission Flow

1. **Submit Encounter**: POST to `/api/encounters` with form data
   - Returns `encounterId` and presigned S3 URLs for images

2. **Upload Images**: PUT images directly to S3 using presigned URLs
   - Shows progress bar during upload
   - Handles upload failures gracefully

3. **Trigger Enhancement**: PUT to `/api/encounters/:id/upload-complete`
   - Initiates AI enhancement pipeline
   - Encounter status changes to "enhancing"

4. **Success**: Show success animation and redirect to profile
   - User can view their submission in profile page
   - Encounter will be approved by admin before appearing publicly

## Validation Rules

### Author Name
- Required
- Minimum 2 characters

### Story
- Required
- Minimum 50 characters

### Encounter Time
- Required
- Cannot be in the future

### Location
- Required
- Valid latitude (-90 to 90)
- Valid longitude (-180 to 180)

### Images
- Optional (0-5 images)
- Formats: JPEG, PNG, WebP
- Max size: 10MB per image
