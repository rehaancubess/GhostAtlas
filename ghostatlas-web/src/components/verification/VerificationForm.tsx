import React, { useState } from 'react';
import { Button } from '@/components/common/Button';

export interface VerificationFormProps {
  onSubmit: (data: { spookinessScore: number; notes?: string }) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  errorMessage?: string;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({
  onSubmit,
  isLoading = false,
  isDisabled = false,
  errorMessage,
}) => {
  const [spookinessScore, setSpookinessScore] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      spookinessScore,
      notes: notes.trim() || undefined,
    });
  };

  const getSpookinessLabel = (score: number): string => {
    const labels = [
      'Not Spooky',
      'Slightly Eerie',
      'Moderately Haunted',
      'Very Spooky',
      'Absolutely Terrifying',
    ];
    return labels[score - 1] || '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Spookiness Score Slider */}
      <div>
        <label
          htmlFor="spookiness-score"
          className="block text-ghost-light-gray text-sm font-medium mb-3"
        >
          Spookiness Score
        </label>
        
        <div className="space-y-3">
          {/* Score Display */}
          <div className="flex items-center justify-between">
            <span className="text-ghost-green text-2xl font-bold text-glow">
              {spookinessScore}
            </span>
            <span className="text-ghost-light-gray text-sm italic">
              {getSpookinessLabel(spookinessScore)}
            </span>
          </div>

          {/* Slider */}
          <div className="relative">
            <input
              id="spookiness-score"
              type="range"
              min="1"
              max="5"
              step="1"
              value={spookinessScore}
              onChange={(e) => setSpookinessScore(parseInt(e.target.value, 10))}
              disabled={isDisabled || isLoading}
              className="w-full h-2 bg-ghost-dark-gray rounded-lg appearance-none cursor-pointer
                disabled:cursor-not-allowed disabled:opacity-50
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-6
                [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-ghost-green
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,255,65,0.5)]
                [&::-webkit-slider-thumb]:hover:shadow-[0_0_15px_rgba(0,255,65,0.8)]
                [&::-webkit-slider-thumb]:transition-shadow
                [&::-moz-range-thumb]:w-6
                [&::-moz-range-thumb]:h-6
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-ghost-green
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(0,255,65,0.5)]
                [&::-moz-range-thumb]:hover:shadow-[0_0_15px_rgba(0,255,65,0.8)]
                [&::-moz-range-thumb]:transition-shadow"
              style={{
                background: `linear-gradient(to right, #00FF41 0%, #00FF41 ${((spookinessScore - 1) / 4) * 100}%, #1a1a1a ${((spookinessScore - 1) / 4) * 100}%, #1a1a1a 100%)`,
              }}
            />
            
            {/* Score Markers */}
            <div className="flex justify-between mt-2 px-1">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => !isDisabled && !isLoading && setSpookinessScore(score)}
                  disabled={isDisabled || isLoading}
                  className={`text-xs transition-colors ${
                    spookinessScore === score
                      ? 'text-ghost-green font-bold'
                      : 'text-ghost-gray hover:text-ghost-light-gray'
                  } disabled:cursor-not-allowed`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Optional Notes */}
      <div>
        <label
          htmlFor="verification-notes"
          className="block text-ghost-light-gray text-sm font-medium mb-2"
        >
          Notes (Optional)
        </label>
        <textarea
          id="verification-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isDisabled || isLoading}
          placeholder="Share your experience at this location..."
          rows={4}
          maxLength={500}
          className="w-full px-4 py-3 bg-ghost-dark-gray border border-ghost-green/30 rounded-lg
            text-ghost-light-gray placeholder-ghost-gray
            focus:outline-none focus:border-ghost-green focus:ring-1 focus:ring-ghost-green
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none transition-colors"
        />
        <div className="flex justify-between mt-1">
          <span className="text-ghost-gray text-xs">
            Describe what you experienced
          </span>
          <span className="text-ghost-gray text-xs">
            {notes.length}/500
          </span>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-300 text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="large"
        loading={isLoading}
        disabled={isDisabled || isLoading}
        className="w-full"
      >
        {isLoading ? 'Submitting Verification...' : 'Submit Verification'}
      </Button>

      {isDisabled && !errorMessage && (
        <p className="text-ghost-gray text-sm text-center">
          You must be within 50 meters of the location to verify
        </p>
      )}
    </form>
  );
};
