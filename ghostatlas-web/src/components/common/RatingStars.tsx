import React, { useState } from 'react';

export interface RatingStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  onRatingChange,
  readOnly = false,
  size = 'medium',
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  const starSize = sizeClasses[size];

  const handleClick = (value: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readOnly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(null);
    }
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      role="img"
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled = value <= displayRating;
        const isHovering = hoverRating !== null && value <= hoverRating;

        return (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            disabled={readOnly}
            className={`
              ${starSize}
              transition-all duration-150
              ${!readOnly ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              ${isHovering ? 'drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]' : ''}
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ghost-green focus-visible:ring-offset-2 focus-visible:ring-offset-ghost-black rounded
            `}
            aria-label={`Rate ${value} out of 5 stars`}
            aria-pressed={value <= rating}
          >
            <svg
              viewBox="0 0 24 24"
              fill={isFilled ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              className={`
                ${isFilled ? 'text-ghost-green' : 'text-ghost-medium-gray'}
                transition-colors duration-150
              `}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
};
