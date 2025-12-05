import React from 'react';
import { Button } from './Button';

/**
 * ThemeDemo component showcases the neon green and red theme
 * This is for development/testing purposes
 */
export const ThemeDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-ghost-black">
      {/* Color Palette */}
      <section>
        <h2 className="font-creepster text-3xl text-ghost-green mb-4 text-glow">
          Color Palette
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-20 bg-ghost-green rounded-lg shadow-green-glow-lg" />
            <p className="text-ghost-gray text-sm">Neon Green</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-ghost-red rounded-lg shadow-red-glow-lg" />
            <p className="text-ghost-gray text-sm">Neon Red</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-ghost-near-black rounded-lg border border-ghost-green" />
            <p className="text-ghost-gray text-sm">Near Black</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-ghost-gray rounded-lg" />
            <p className="text-ghost-gray text-sm">Gray</p>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="font-creepster text-3xl text-ghost-green mb-4 text-glow">
          Typography
        </h2>
        <div className="space-y-4">
          <h1 className="font-creepster text-5xl text-ghost-green text-glow-xl">
            Ghost<span className="text-ghost-red shadow-red-glow-xl">Atlas</span>
          </h1>
          <h2 className="font-creepster text-4xl text-ghost-green text-glow-lg">
            Heading Level 2
          </h2>
          <h3 className="font-creepster text-3xl text-ghost-red text-glow-red-lg">
            Heading Level 3 (Red)
          </h3>
          <p className="text-ghost-gray text-lg">
            This is body text in the default gray color. It's readable and maintains good contrast.
          </p>
          <p className="text-ghost-green">
            This is text in <span className="text-ghost-red font-bold">neon red</span> for emphasis.
          </p>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="font-creepster text-3xl text-ghost-green mb-4 text-glow">
          Buttons
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary (Green)</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="neon-red">Neon Red</Button>
        </div>
      </section>

      {/* Glow Effects */}
      <section>
        <h2 className="font-creepster text-3xl text-ghost-green mb-4 text-glow">
          Glow Effects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-ghost-near-black border-2 border-ghost-green rounded-lg shadow-green-glow-lg">
            <h3 className="font-creepster text-2xl text-ghost-green text-glow mb-2">
              Green Glow Card
            </h3>
            <p className="text-ghost-gray">
              This card has a green border and glow effect.
            </p>
          </div>
          <div className="p-6 bg-ghost-near-black border-2 border-ghost-red rounded-lg shadow-red-glow-lg">
            <h3 className="font-creepster text-2xl text-ghost-red text-glow-red mb-2">
              Red Glow Card
            </h3>
            <p className="text-ghost-gray">
              This card has a red border and glow effect.
            </p>
          </div>
        </div>
      </section>

      {/* Hover Effects */}
      <section>
        <h2 className="font-creepster text-3xl text-ghost-green mb-4 text-glow">
          Hover Effects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="group p-6 bg-ghost-near-black border border-ghost-green/30 rounded-lg cursor-pointer transition-all duration-300 hover:border-ghost-green hover:shadow-green-glow-lg hover:scale-105">
            <h4 className="font-creepster text-xl text-ghost-green mb-2">
              Hover Me (Green)
            </h4>
            <p className="text-ghost-gray text-sm">
              Hover to see green glow effect
            </p>
          </div>
          <div className="group p-6 bg-ghost-near-black border border-ghost-red/30 rounded-lg cursor-pointer transition-all duration-300 hover:border-ghost-red hover:shadow-red-glow-lg hover:scale-105">
            <h4 className="font-creepster text-xl text-ghost-red mb-2">
              Hover Me (Red)
            </h4>
            <p className="text-ghost-gray text-sm">
              Hover to see red glow effect
            </p>
          </div>
          <div className="group p-6 bg-ghost-near-black border border-ghost-green/30 rounded-lg cursor-pointer transition-all duration-300 hover:border-ghost-red hover:shadow-red-glow-lg">
            <h4 className="font-creepster text-xl text-ghost-green group-hover:text-ghost-red mb-2">
              Hover Me (Transition)
            </h4>
            <p className="text-ghost-gray text-sm">
              Transitions from green to red
            </p>
          </div>
        </div>
      </section>

      {/* Animations */}
      <section>
        <h2 className="font-creepster text-3xl text-ghost-green mb-4 text-glow">
          Animations
        </h2>
        <div className="flex flex-wrap gap-6">
          <div className="p-6 bg-ghost-near-black border-2 border-ghost-green rounded-lg animate-glow-pulse">
            <p className="text-ghost-green font-bold">Pulsing Green Glow</p>
          </div>
          <div className="p-6 bg-ghost-near-black border-2 border-ghost-red rounded-lg animate-glow-pulse-red">
            <p className="text-ghost-red font-bold">Pulsing Red Glow</p>
          </div>
          <div className="p-6 bg-ghost-near-black border-2 border-ghost-green rounded-lg animate-fade-in">
            <p className="text-ghost-green font-bold">Fade In</p>
          </div>
          <div className="p-6 bg-ghost-near-black border-2 border-ghost-red rounded-lg animate-slide-up">
            <p className="text-ghost-red font-bold">Slide Up</p>
          </div>
        </div>
      </section>
    </div>
  );
};
