import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { LocationPicker } from './LocationPicker';
import { ImageUploader, type ImageFile } from './ImageUploader';
import { useSubmitEncounter } from '@/hooks/useEncounters';
import type { Location } from '@/types/api';
import axios from 'axios';

interface FormData {
  authorName: string;
  location: Location | null;
  story: string;
  encounterTime: string;
}

interface FormErrors {
  authorName?: string;
  location?: string;
  story?: string;
  encounterTime?: string;
  images?: string;
}

type FormStep = 'details' | 'location' | 'images' | 'review';

export const SubmitForm: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<FormStep>('details');
  const [formData, setFormData] = useState<FormData>({
    authorName: '',
    location: null,
    story: '',
    encounterTime: '',
  });
  const [images, setImages] = useState<ImageFile[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const submitEncounter = useSubmitEncounter();

  const validateStep = (step: FormStep): boolean => {
    const newErrors: FormErrors = {};

    if (step === 'details') {
      if (!formData.authorName.trim()) {
        newErrors.authorName = 'Author name is required';
      } else if (formData.authorName.trim().length < 2) {
        newErrors.authorName = 'Author name must be at least 2 characters';
      }

      if (!formData.story.trim()) {
        newErrors.story = 'Story is required';
      } else if (formData.story.trim().length < 50) {
        newErrors.story = 'Story must be at least 50 characters';
      }

      if (!formData.encounterTime) {
        newErrors.encounterTime = 'Encounter time is required';
      } else {
        const encounterDate = new Date(formData.encounterTime);
        const now = new Date();
        if (encounterDate > now) {
          newErrors.encounterTime = 'Encounter time cannot be in the future';
        }
      }
    }

    if (step === 'location') {
      if (!formData.location) {
        newErrors.location = 'Location is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    const steps: FormStep[] = ['details', 'location', 'images', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: FormStep[] = ['details', 'location', 'images', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const uploadImagesToS3 = async (uploadUrls: string[]): Promise<void> => {
    const totalImages = images.length;
    let uploadedCount = 0;

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const uploadUrl = uploadUrls[i];

      try {
        await axios.put(uploadUrl, image.file, {
          headers: {
            'Content-Type': image.file.type,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const imageProgress = (progressEvent.loaded / progressEvent.total) * 100;
              const totalProgress = ((uploadedCount + imageProgress / 100) / totalImages) * 100;
              setUploadProgress(Math.round(totalProgress));
            }
          },
        });

        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / totalImages) * 100));
      } catch (error) {
        console.error(`Failed to upload image ${i + 1}:`, error);
        throw new Error(`Failed to upload image ${i + 1}`);
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep('review')) {
      return;
    }

    if (!formData.location) {
      setErrors({ location: 'Location is required' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Submit encounter to get presigned URLs
      const submitResponse = await submitEncounter.mutateAsync({
        authorName: formData.authorName.trim(),
        location: formData.location,
        originalStory: formData.story.trim(),
        encounterTime: new Date(formData.encounterTime).toISOString(),
        imageCount: images.length,
      });

      const encounterId = submitResponse.encounterId;

      // Step 2: Upload images to S3 if any
      if (images.length > 0 && submitResponse.uploadUrls.length > 0) {
        await uploadImagesToS3(submitResponse.uploadUrls);
      }

      // Step 3: Trigger enhancement by calling the API directly
      await axios.put(`${import.meta.env.VITE_API_BASE_URL || ''}/encounters/${encounterId}/upload-complete`);

      // Show success animation
      setShowSuccess(true);

      // Navigate to profile after delay
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({
        ...errors,
        images: error instanceof Error ? error.message : 'Failed to submit encounter',
      });
      setIsUploading(false);
    }
  };

  const getStepNumber = (step: FormStep): number => {
    const steps: FormStep[] = ['details', 'location', 'images', 'review'];
    return steps.indexOf(step) + 1;
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="relative">
          <svg
            className="w-24 h-24 text-ghost-green animate-pulse"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div className="absolute inset-0 animate-ping opacity-20">
            <svg
              className="w-24 h-24 text-ghost-green"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-creepster text-ghost-green text-glow-lg animate-glow-pulse">
            Encounter Submitted!
          </h2>
          <p className="text-ghost-gray">
            The <span className="text-ghost-red font-semibold">spirits</span> are processing your story...
          </p>
          <p className="text-ghost-gray text-sm">
            Redirecting to your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      {/* Progress Indicator */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-2">
          {(['details', 'location', 'images', 'review'] as FormStep[]).map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm
                    transition-all duration-200
                    ${
                      getStepNumber(currentStep) > index + 1
                        ? 'bg-ghost-green text-ghost-black shadow-glow'
                        : getStepNumber(currentStep) === index + 1
                          ? 'bg-ghost-red text-ghost-black shadow-red-glow-lg animate-glow-pulse-red'
                          : 'bg-ghost-dark-gray text-ghost-gray border border-ghost-green/30'
                    }
                  `}
                >
                  {getStepNumber(currentStep) > index + 1 ? '✓' : index + 1}
                </div>
                <span className="text-xs sm:text-sm text-ghost-gray mt-1 capitalize hidden sm:block">{step}</span>
              </div>
              {index < 3 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2
                    ${
                      getStepNumber(currentStep) > index + 1
                        ? 'bg-ghost-green'
                        : 'bg-ghost-dark-gray'
                    }
                  `}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <div className="bg-ghost-near-black border-2 border-ghost-green/30 hover:border-ghost-red/40 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6 transition-all duration-300 shadow-glow hover:shadow-glow-red-lg">
        {/* Step 1: Details */}
        {currentStep === 'details' && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-creepster text-ghost-green text-glow">Tell Your <span className="text-ghost-red">Story</span></h2>

            {/* Author Name */}
            <div>
              <label htmlFor="authorName" className="block text-ghost-green text-sm font-medium mb-2 text-glow">
                Your Name *
              </label>
              <input
                id="authorName"
                type="text"
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                className={`
                  w-full px-4 py-2 bg-ghost-dark-gray border-2 rounded-lg text-ghost-white
                  placeholder-ghost-gray focus:outline-none focus:ring-2 transition-all duration-200
                  ${errors.authorName ? 'border-ghost-red focus:border-ghost-red focus:ring-ghost-red/50 shadow-red-glow' : 'border-ghost-green/50 focus:border-ghost-green focus:ring-ghost-green/50'}
                `}
                placeholder="Enter your name"
              />
              {errors.authorName && (
                <p className="text-ghost-red text-sm mt-1 text-glow-red">{errors.authorName}</p>
              )}
            </div>

            {/* Encounter Time */}
            <div>
              <label htmlFor="encounterTime" className="block text-ghost-green text-sm font-medium mb-2 text-glow">
                When Did This Happen? *
              </label>
              <input
                id="encounterTime"
                type="datetime-local"
                value={formData.encounterTime}
                onChange={(e) => setFormData({ ...formData, encounterTime: e.target.value })}
                max={new Date().toISOString().slice(0, 16)}
                className={`
                  w-full px-4 py-2 bg-ghost-dark-gray border-2 rounded-lg text-ghost-white
                  focus:outline-none focus:ring-2 transition-all duration-200
                  ${errors.encounterTime ? 'border-ghost-red focus:border-ghost-red focus:ring-ghost-red/50 shadow-red-glow' : 'border-ghost-green/50 focus:border-ghost-green focus:ring-ghost-green/50'}
                `}
              />
              {errors.encounterTime && (
                <p className="text-ghost-red text-sm mt-1 text-glow-red">{errors.encounterTime}</p>
              )}
            </div>

            {/* Story */}
            <div>
              <label htmlFor="story" className="block text-ghost-green text-sm font-medium mb-2 text-glow">
                Your <span className="text-ghost-red">Paranormal</span> Encounter *
              </label>
              <textarea
                id="story"
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                rows={8}
                className={`
                  w-full px-4 py-2 bg-ghost-dark-gray border-2 rounded-lg text-ghost-white
                  placeholder-ghost-gray focus:outline-none focus:ring-2 transition-all duration-200 resize-none
                  ${errors.story ? 'border-ghost-red focus:border-ghost-red focus:ring-ghost-red/50 shadow-red-glow' : 'border-ghost-green/50 focus:border-ghost-green focus:ring-ghost-green/50'}
                `}
                placeholder="Describe your paranormal encounter in detail... (minimum 50 characters)"
              />
              <div className="flex justify-between items-center mt-1">
                {errors.story ? (
                  <p className="text-ghost-red text-sm text-glow-red">{errors.story}</p>
                ) : (
                  <p className="text-ghost-gray text-xs">
                    {formData.story.length} / 50 characters minimum
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {currentStep === 'location' && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-creepster text-ghost-green">Where Did It Happen?</h2>
            <LocationPicker
              location={formData.location}
              onLocationChange={(location) => setFormData({ ...formData, location })}
            />
            {errors.location && (
              <p className="text-red-500 text-sm">{errors.location}</p>
            )}
          </div>
        )}

        {/* Step 3: Images */}
        {currentStep === 'images' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-creepster text-ghost-green">Add Evidence</h2>
              <p className="text-ghost-gray text-sm mt-1">
                Upload photos from your encounter (optional, up to 5 images)
              </p>
            </div>
            <ImageUploader
              images={images}
              onImagesChange={setImages}
              maxImages={5}
              maxSizeMB={10}
            />
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 'review' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-creepster text-ghost-green">Review Your Submission</h2>

            <div className="space-y-4">
              <div className="border border-ghost-green/30 rounded-lg p-4">
                <h3 className="text-ghost-green font-medium mb-2">Author</h3>
                <p className="text-ghost-white">{formData.authorName}</p>
              </div>

              <div className="border border-ghost-green/30 rounded-lg p-4">
                <h3 className="text-ghost-green font-medium mb-2">Encounter Time</h3>
                <p className="text-ghost-white">
                  {new Date(formData.encounterTime).toLocaleString()}
                </p>
              </div>

              <div className="border border-ghost-green/30 rounded-lg p-4">
                <h3 className="text-ghost-green font-medium mb-2">Location</h3>
                <p className="text-ghost-white">
                  {formData.location?.address || `${formData.location?.latitude.toFixed(6)}, ${formData.location?.longitude.toFixed(6)}`}
                </p>
              </div>

              <div className="border border-ghost-green/30 rounded-lg p-4">
                <h3 className="text-ghost-green font-medium mb-2">Your Story</h3>
                <p className="text-ghost-white whitespace-pre-wrap">{formData.story}</p>
              </div>

              {images.length > 0 && (
                <div className="border border-ghost-green/30 rounded-lg p-4">
                  <h3 className="text-ghost-green font-medium mb-2">Images ({images.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {images.map((image, index) => (
                      <img
                        key={image.id}
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full aspect-square object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {errors.images && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-500">{errors.images}</p>
              </div>
            )}
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-ghost-green">Uploading...</span>
              <span className="text-ghost-green">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-ghost-dark-gray rounded-full h-2 overflow-hidden">
              <div
                className="bg-ghost-green h-full transition-all duration-300 shadow-[0_0_10px_rgba(0,255,65,0.5)]"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 'details' || isUploading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Back
          </Button>

          {currentStep !== 'review' ? (
            <Button variant="primary" onClick={handleNext} className="w-full sm:w-auto order-1 sm:order-2">
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isUploading}
              disabled={isUploading}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Submit Encounter
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
