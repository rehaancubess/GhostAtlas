import React from 'react';

export interface LoadingIndicatorProps {
  variant?: 'fullscreen' | 'inline';
  message?: string;
}

const atmosphericMessages = [
  'Summoning spirits...',
  'Opening the portal...',
  'Consulting the ancient texts...',
  'Channeling paranormal energy...',
  'Awakening the restless souls...',
  'Piercing the veil...',
  'Gathering ghostly whispers...',
];

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  variant = 'inline',
  message,
}) => {
  const [displayMessage] = React.useState(
    message || atmosphericMessages[Math.floor(Math.random() * atmosphericMessages.length)]
  );

  const ghostIcon = (
    <svg
      className="w-16 h-16 text-ghost-green animate-pulse"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9v7l-2 2v2h18v-2l-2-2V9c0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5v7.17l1 1V19H6v-.83l1-1V9c0-2.76 2.24-5 5-5z" />
      <circle cx="9" cy="11" r="1.5" />
      <circle cx="15" cy="11" r="1.5" />
      <path d="M12 16c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2z" />
    </svg>
  );

  if (variant === 'fullscreen') {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ghost-black"
        role="status"
        aria-live="polite"
      >
        <div className="relative">
          {ghostIcon}
          <div className="absolute inset-0 animate-ping opacity-20">
            {ghostIcon}
          </div>
        </div>
        <p className="mt-4 text-ghost-green text-lg font-medium text-glow">
          {displayMessage}
        </p>
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center py-8"
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        {ghostIcon}
        <div className="absolute inset-0 animate-ping opacity-20">
          {ghostIcon}
        </div>
      </div>
      <p className="mt-4 text-ghost-green text-sm font-medium text-glow">
        {displayMessage}
      </p>
      <span className="sr-only">Loading</span>
    </div>
  );
};
