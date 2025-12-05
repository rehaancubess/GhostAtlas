import React, { useState } from 'react';
import { Button } from './Button';
import { LoadingIndicator } from './LoadingIndicator';
import { Modal } from './Modal';
import { RatingStars } from './RatingStars';

/**
 * Demo component to showcase all common UI components
 * This is for development/testing purposes only
 */
export const ComponentDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="min-h-screen bg-ghost-black p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-4xl font-creepster text-ghost-green text-center mb-8">
          Component Showcase
        </h1>

        {/* Button variants */}
        <section className="space-y-4">
          <h2 className="text-2xl font-creepster text-ghost-green">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Button</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="small">Small</Button>
            <Button variant="primary" size="medium">Medium</Button>
            <Button variant="primary" size="large">Large</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" loading>Loading...</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </section>

        {/* Loading Indicator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-creepster text-ghost-green">Loading Indicator</h2>
          <Button variant="primary" onClick={handleLoadingDemo}>
            Show Loading (3s)
          </Button>
          {isLoading && <LoadingIndicator variant="inline" />}
        </section>

        {/* Modal */}
        <section className="space-y-4">
          <h2 className="text-2xl font-creepster text-ghost-green">Modal</h2>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Open Modal
          </Button>
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Paranormal Activity Detected"
          >
            <p className="mb-4">
              The spirits are restless tonight. Strange occurrences have been reported
              in this area. Proceed with caution.
            </p>
            <div className="flex gap-4 justify-end">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                Investigate
              </Button>
            </div>
          </Modal>
        </section>

        {/* Rating Stars */}
        <section className="space-y-4">
          <h2 className="text-2xl font-creepster text-ghost-green">Rating Stars</h2>
          <div className="space-y-4">
            <div>
              <p className="text-ghost-gray mb-2">Interactive (current: {rating})</p>
              <RatingStars
                rating={rating}
                onRatingChange={setRating}
                size="large"
              />
            </div>
            <div>
              <p className="text-ghost-gray mb-2">Read-only (3.5 stars)</p>
              <RatingStars rating={3.5} readOnly size="medium" />
            </div>
            <div>
              <p className="text-ghost-gray mb-2">Small size</p>
              <RatingStars rating={4} readOnly size="small" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
