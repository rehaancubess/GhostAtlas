import React, { useState, useEffect } from 'react';
import type { GetEncounterResponse } from '@/types/api';
import { Button } from '@/components/common/Button';
import { RatingStars } from '@/components/common/RatingStars';
import { AudioPlayer } from '@/components/common/AudioPlayer';
import { useRateEncounter } from '@/hooks/useEncounters';
import { useDeviceStore } from '@/stores/deviceStore';

export interface StoryDetailProps {
  encounter: GetEncounterResponse;
  onShare?: (platform: 'twitter' | 'facebook' | 'reddit') => void;
  onVerifyClick?: () => void;
}

export const StoryDetail: React.FC<StoryDetailProps> = ({ encounter, onShare, onVerifyClick }) => {
  const { deviceId, initializeDeviceId } = useDeviceStore();
  const rateEncounterMutation = useRateEncounter(encounter.id);
  
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);
  const [displayRating, setDisplayRating] = useState(encounter.rating);
  const [displayRatingCount, setDisplayRatingCount] = useState(encounter.ratingCount);

  // Initialize device ID on mount
  useEffect(() => {
    initializeDeviceId();
  }, [initializeDeviceId]);

  // Check if user has already rated (stored in localStorage)
  useEffect(() => {
    if (deviceId) {
      const ratingKey = `ghostatlas-rating-${encounter.id}`;
      const savedRating = localStorage.getItem(ratingKey);
      if (savedRating) {
        setUserRating(parseInt(savedRating, 10));
        setHasRated(true);
      }
    }
  }, [deviceId, encounter.id]);

  const handleRatingChange = async (rating: number) => {
    if (!deviceId || hasRated) return;

    try {
      const result = await rateEncounterMutation.mutateAsync({
        deviceId,
        rating,
      });

      // Update local state
      setUserRating(rating);
      setHasRated(true);
      setDisplayRating(result.averageRating);
      setDisplayRatingCount(result.ratingCount);

      // Store rating in localStorage to prevent duplicates
      const ratingKey = `ghostatlas-rating-${encounter.id}`;
      localStorage.setItem(ratingKey, rating.toString());
    } catch (error) {
      console.error('Failed to submit rating:', error);
      // Could show error toast here
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'reddit') => {
    if (onShare) {
      onShare(platform);
    }

    const url = window.location.href;
    const text = `Check out this ghost encounter: ${encounter.authorName}'s story from ${encounter.location.address || 'an unknown location'}`;

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header Section */}
      <header className="mb-6 sm:mb-8">
        <h1 className="font-creepster text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-ghost-green mb-3 sm:mb-4 text-glow">
          {encounter.authorName}'s Encounter
        </h1>
        
        {/* Metadata */}
        <div className="flex flex-wrap gap-3 sm:gap-4 text-ghost-gray text-xs sm:text-sm mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{encounter.location.address || `${encounter.location.latitude.toFixed(4)}, ${encounter.location.longitude.toFixed(4)}`}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatDate(encounter.encounterTime)}</span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span>{encounter.rating.toFixed(1)} ({encounter.ratingCount} ratings)</span>
          </div>

          {encounter.verificationCount > 0 && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{encounter.verificationCount} verifications</span>
            </div>
          )}
        </div>
      </header>

      {/* AI-Generated Illustration */}
      {encounter.illustrationUrl && (
        <div className="mb-6 sm:mb-8 relative group">
          <div className="relative overflow-hidden rounded-lg border border-ghost-green/30 shadow-[0_0_20px_rgba(0,255,65,0.2)]">
            <img
              src={encounter.illustrationUrl}
              alt={`Illustration of ${encounter.authorName}'s encounter`}
              className="w-full h-auto object-cover"
              style={{
                maskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)',
              }}
            />
            {/* Vignette overlay */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-ghost-black pointer-events-none" />
          </div>
        </div>
      )}

      {/* Audio Narration */}
      {encounter.narrationUrl && (
        <section className="mb-6 sm:mb-8">
          <AudioPlayer
            src={encounter.narrationUrl}
            title="AI-Generated Narration"
          />
        </section>
      )}

      {/* Enhanced Story */}
      <section className="mb-6 sm:mb-8">
        <h2 className="font-creepster text-xl sm:text-2xl text-ghost-green mb-3 sm:mb-4 text-glow">
          The Encounter
        </h2>
        <div className="prose prose-invert prose-ghost max-w-none">
          <p className="text-ghost-light-gray leading-relaxed whitespace-pre-wrap text-base sm:text-lg">
            {encounter.enhancedStory}
          </p>
        </div>
      </section>

      {/* Verification Button */}
      {onVerifyClick && 'geolocation' in navigator && (
        <section className="mb-6 sm:mb-8">
          <Button
            variant="secondary"
            size="large"
            onClick={onVerifyClick}
            className="w-full md:w-auto flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Verify This Location
          </Button>
          <p className="text-ghost-gray text-sm mt-2">
            Visit this location to verify the encounter and share your experience
          </p>
        </section>
      )}

      {/* Rating Section */}
      <section className="mb-6 sm:mb-8 p-4 sm:p-6 bg-ghost-dark-gray border border-ghost-green/30 rounded-lg">
        <h3 className="font-creepster text-lg sm:text-xl text-ghost-green mb-3 sm:mb-4 text-glow">
          Rate This Encounter
        </h3>
        
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <RatingStars
              rating={userRating || displayRating}
              onRatingChange={handleRatingChange}
              readOnly={hasRated}
              size="large"
            />
            <span className="text-ghost-light-gray text-sm">
              {displayRating.toFixed(1)} ({displayRatingCount} {displayRatingCount === 1 ? 'rating' : 'ratings'})
            </span>
          </div>

          {hasRated && userRating && (
            <div className="text-ghost-green text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              You rated this {userRating} {userRating === 1 ? 'star' : 'stars'}
            </div>
          )}

          {rateEncounterMutation.isPending && (
            <div className="text-ghost-gray text-sm flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting rating...
            </div>
          )}

          {rateEncounterMutation.isError && (
            <div className="text-red-400 text-sm">
              Failed to submit rating. Please try again.
            </div>
          )}
        </div>

        {!hasRated && (
          <p className="text-ghost-gray text-sm mt-3">
            Click the stars to rate this encounter
          </p>
        )}
      </section>

      {/* User Images */}
      {encounter.imageUrls && encounter.imageUrls.length > 0 && (
        <section className="mb-8">
          <h2 className="font-creepster text-2xl text-ghost-green mb-4 text-glow">
            Evidence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {encounter.imageUrls.map((url, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg border border-ghost-green/30 hover:border-ghost-green/60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,65,0.3)]"
              >
                <img
                  src={url}
                  alt={`Evidence ${index + 1}`}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Social Sharing */}
      <section className="mb-8 pt-8 border-t border-ghost-green/20">
        <h3 className="text-ghost-light-gray text-sm uppercase tracking-wider mb-4">
          Share This Encounter
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="small"
            onClick={() => handleShare('twitter')}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
            Twitter
          </Button>

          <Button
            variant="secondary"
            size="small"
            onClick={() => handleShare('facebook')}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </Button>

          <Button
            variant="secondary"
            size="small"
            onClick={() => handleShare('reddit')}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
            </svg>
            Reddit
          </Button>
        </div>
      </section>
    </article>
  );
};
