import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

export interface ImageUploaderProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

const ACCEPTED_FORMATS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxSizeMB = 10,
}) => {
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `${file.name} exceeds ${maxSizeMB}MB limit`;
    }

    // Check file format
    const acceptedTypes = Object.keys(ACCEPTED_FORMATS);
    if (!acceptedTypes.includes(file.type)) {
      return `${file.name} is not a valid format (JPEG, PNG, or WebP only)`;
    }

    return null;
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setErrors([]);
      const newErrors: string[] = [];

      // Check if adding these files would exceed max count
      if (images.length + acceptedFiles.length > maxImages) {
        newErrors.push(`Maximum ${maxImages} images allowed`);
        setErrors(newErrors);
        return;
      }

      // Validate and process files
      const validFiles: ImageFile[] = [];
      acceptedFiles.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          newErrors.push(error);
        } else {
          validFiles.push({
            file,
            preview: URL.createObjectURL(file),
            id: crypto.randomUUID(),
          });
        }
      });

      if (newErrors.length > 0) {
        setErrors(newErrors);
      }

      if (validFiles.length > 0) {
        onImagesChange([...images, ...validFiles]);
      }
    },
    [images, maxImages, maxSizeMB, onImagesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxFiles: maxImages - images.length,
    disabled: images.length >= maxImages,
  });

  const removeImage = (id: string) => {
    const imageToRemove = images.find((img) => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    onImagesChange(images.filter((img) => img.id !== id));
    setErrors([]);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  // Cleanup preview URLs on unmount
  React.useEffect(() => {
    return () => {
      images.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${
              isDragActive
                ? 'border-ghost-green bg-ghost-green/10 shadow-[0_0_20px_rgba(0,255,65,0.3)]'
                : 'border-ghost-green/50 hover:border-ghost-green hover:bg-ghost-green/5'
            }
            ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-2">
            <svg
              className="w-12 h-12 text-ghost-green"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {isDragActive ? (
              <p className="text-ghost-green font-medium">Drop the images here...</p>
            ) : (
              <>
                <p className="text-ghost-green font-medium">
                  Drag & drop images here, or click to select
                </p>
                <p className="text-ghost-gray text-sm">
                  JPEG, PNG, or WebP • Max {maxSizeMB}MB per image • Up to {maxImages} images
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-red-500 font-medium mb-1">Upload Errors</h3>
              <ul className="text-red-400 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-ghost-green text-sm font-medium">
              {images.length} / {maxImages} images
            </p>
            {images.length > 1 && (
              <p className="text-ghost-gray text-xs">Drag to reorder</p>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative group bg-ghost-dark-gray rounded-lg overflow-hidden border border-ghost-green/30 hover:border-ghost-green transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', index.toString());
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  if (fromIndex !== index) {
                    moveImage(fromIndex, index);
                  }
                }}
              >
                {/* Image preview */}
                <div className="aspect-square">
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Overlay with controls */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  {/* Move left */}
                  {index > 0 && (
                    <button
                      onClick={() => moveImage(index, index - 1)}
                      className="p-2 bg-ghost-green/20 hover:bg-ghost-green/40 rounded-full transition-colors"
                      aria-label="Move left"
                    >
                      <svg
                        className="w-5 h-5 text-ghost-green"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}

                  {/* Remove */}
                  <button
                    onClick={() => removeImage(image.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full transition-colors"
                    aria-label="Remove image"
                  >
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  {/* Move right */}
                  {index < images.length - 1 && (
                    <button
                      onClick={() => moveImage(index, index + 1)}
                      className="p-2 bg-ghost-green/20 hover:bg-ghost-green/40 rounded-full transition-colors"
                      aria-label="Move right"
                    >
                      <svg
                        className="w-5 h-5 text-ghost-green"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Image number badge */}
                <div className="absolute top-2 left-2 bg-ghost-black/80 text-ghost-green text-xs font-bold px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
