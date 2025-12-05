import React from 'react';
import { SubmitForm } from '@/components/submit';

export const SubmitPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-creepster text-ghost-green text-glow-lg animate-glow-pulse mb-4">
          Share Your <span className="text-ghost-red text-glow-red-lg animate-neon-flicker">Encounter</span>
        </h1>
        <p className="text-ghost-gray max-w-2xl mx-auto text-lg">
          Have you experienced something <span className="text-ghost-red font-semibold text-glow-red">paranormal</span>? Share your story with the GhostAtlas
          community. Your encounter will be enhanced with <span className="text-ghost-green">AI-generated</span> narrative and
          illustration.
        </p>
      </div>

      <SubmitForm />
    </div>
  );
};
