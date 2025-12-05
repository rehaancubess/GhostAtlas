import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Encounter } from '@/types/api';

export interface StoryCardProps {
  encounter: Encounter;
  className?: string;
}

/**
 * StoryCard component displays an encounter preview with hover effects
 * Implements lazy-loaded thumbnail with vignette effect
 * Navigates to detail view on click
 */
export const StoryCard: React.FC<StoryCardProps> = ({ encounter, className = '' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/encounter/${encounter.id}`);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get preview text from enhanced or original story
  const getPreviewText = () => {
    const story = encounter.enhancedStory || encounter.originalStory;
    const maxLength = 150;
    if (story.length <= maxLength) return story;
    return story.substring(0, maxLength).trim() + '...';
  };

  // Get all available images (illustrations + user images)
  const getAllImages = () => {
    const images: string[] = [];
    
    // Add illustration URLs (AI-generated images)
    if (encounter.illustrationUrls && encounter.illustrationUrls.length > 0) {
      images.push(...encounter.illustrationUrls);
    }
    // Fallback to single illustrationUrl if available
    else if (encounter.illustrationUrl) {
      images.push(encounter.illustrationUrl);
    }
    
    // Add user-uploaded images
    if (encounter.imageUrls && encounter.imageUrls.length > 0) {
      images.push(...encounter.imageUrls);
    }
    
    return images;
  };

  const allImages = getAllImages();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  
  // Auto-rotate images if multiple
  React.useEffect(() => {
    if (allImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 3000); // Change image every 3 seconds
    
    return () => clearInterval(interval);
  }, [allImages.length]);

  return (
    <article
      onClick={handleClick}
      className={`
        group relative bg-ghost-near-black border-2 border-ghost-green/30 rounded-lg overflow-hidden
        cursor-pointer transition-all duration-300
        hover:border-ghost-red hover:scale-[1.03] hover:shadow-red-glow-lg
        ${className}
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`View details for ${encounter.authorName}'s encounter`}
    >
      {/* Image Gallery with Auto-rotation */}
      {allImages.length > 0 ? (
        <div className="relative w-full h-64 overflow-hidden bg-ghost-dark-gray">
          {/* Current Image */}
          <img
            src={allImages[currentImageIndex]}
            alt={`Encounter at ${encounter.location.address || 'unknown location'}`}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
            onError={(e) => {
              // Hide broken images
              e.currentTarget.style.display = 'none';
            }}
          />
          
          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ghost-black via-ghost-black/50 to-transparent" />
          
          {/* Image counter badge */}
          {allImages.length > 1 && (
            <div className="absolute top-3 right-3 bg-ghost-black/80 backdrop-blur-sm px-3 py-1 rounded-full border border-ghost-green/50 shadow-green-glow">
              <span className="text-ghost-green text-xs font-medium">
                {currentImageIndex + 1} / {allImages.length}
              </span>
            </div>
          )}
          
          {/* AI-Enhanced badge */}
          {encounter.status === 'enhanced' && (
            <div className="absolute top-3 left-3 bg-ghost-red/90 backdrop-blur-sm px-3 py-1 rounded-full border border-ghost-red shadow-red-glow">
              <span className="text-ghost-black text-xs font-bold">✨ AI Enhanced</span>
            </div>
          )}
          
          {/* Navigation dots */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? 'bg-ghost-red w-6 shadow-red-glow'
                      : 'bg-ghost-gray/50 hover:bg-ghost-gray'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Placeholder for encounters without images
        <div className="relative w-full h-64 overflow-hidden bg-gradient-to-br from-ghost-dark-gray to-ghost-near-black flex items-center justify-center">
          <svg
            className="w-16 h-16 text-ghost-green/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Author and Date Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-ghost-red/20 border border-ghost-red flex items-center justify-center shadow-red-glow">
              <span className="text-ghost-red text-xs font-bold">
                {encounter.authorName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-ghost-red text-sm font-semibold group-hover:text-ghost-red transition-colors">
              {encounter.authorName}
            </span>
          </div>
          <time className="text-ghost-gray/60 text-xs" dateTime={encounter.encounterTime}>
            {formatDate(encounter.encounterTime)}
          </time>
        </div>

        {/* Location */}
        <div className="flex items-start space-x-2">
          <svg
            className="w-4 h-4 text-ghost-green flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-ghost-gray text-xs line-clamp-1">
            {encounter.location.address || `${encounter.location.latitude.toFixed(4)}, ${encounter.location.longitude.toFixed(4)}`}
          </span>
          {encounter.distance !== undefined && (
            <span className="text-ghost-green text-xs font-medium ml-auto">
              {encounter.distance < 1 
                ? `${(encounter.distance * 1000).toFixed(0)}m` 
                : `${encounter.distance.toFixed(1)}km`}
            </span>
          )}
        </div>

        {/* Preview Text */}
        <p className="text-ghost-gray text-sm line-clamp-4 leading-relaxed">
          {getPreviewText()}
        </p>

        {/* Rating and Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-ghost-green/20">
          {/* Rating Stars */}
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-5 h-5 transition-all duration-200 ${
                  star <= Math.round(encounter.rating)
                    ? 'text-ghost-red fill-current drop-shadow-[0_0_3px_rgba(255,0,64,0.5)]'
                    : 'text-ghost-gray/30'
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-xs text-ghost-gray ml-2 font-medium">
              {encounter.rating > 0 ? encounter.rating.toFixed(1) : '0.0'} ({encounter.ratingCount})
            </span>
          </div>

          {/* Verification Badge */}
          {encounter.verificationCount > 0 && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-ghost-green/10 border border-ghost-green/30 rounded-full">
              <svg
                className="w-3 h-3 text-ghost-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs text-ghost-green font-medium">{encounter.verificationCount}</span>
            </div>
          )}
        </div>
        
        {/* Audio Narration Indicator */}
        {encounter.narrationUrl && (
          <div className="flex items-center space-x-2 pt-2">
            <div className="flex items-center space-x-1 px-2 py-1 bg-ghost-red/10 border border-ghost-red/30 rounded-full">
              <svg
                className="w-3 h-3 text-ghost-red"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
              <span className="text-xs text-ghost-red font-medium">Audio Available</span>
            </div>
          </div>
        )}
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-t from-ghost-red/10 via-ghost-red/5 to-transparent" />
      </div>
    </article>
  );
};
