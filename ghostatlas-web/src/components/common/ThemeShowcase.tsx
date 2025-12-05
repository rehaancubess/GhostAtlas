/**
 * ThemeShowcase Component
 * 
 * A visual demonstration of the GhostAtlas theme system.
 * This component showcases all theme colors, typography, effects, and utilities.
 * Useful for development and design review.
 */

export function ThemeShowcase() {
  return (
    <div className="min-h-screen bg-ghost-black p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="font-creepster text-6xl text-ghost-green text-glow mb-4 animate-fade-in">
            GhostAtlas Theme System
          </h1>
          <p className="text-ghost-gray text-xl">
            A comprehensive horror-themed design system
          </p>
        </header>

        {/* Colors Section */}
        <section className="bg-ghost-near-black border border-ghost-green rounded-lg p-6 shadow-green-glow">
          <h2 className="font-creepster text-3xl text-ghost-green mb-6">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="bg-ghost-black h-20 rounded-lg border border-ghost-gray mb-2"></div>
              <p className="text-ghost-gray text-sm">Ghost Black</p>
              <p className="text-ghost-gray text-xs">#000000</p>
            </div>
            <div className="text-center">
              <div className="bg-ghost-near-black h-20 rounded-lg border border-ghost-gray mb-2"></div>
              <p className="text-ghost-gray text-sm">Near Black</p>
              <p className="text-ghost-gray text-xs">#0A0A0A</p>
            </div>
            <div className="text-center">
              <div className="bg-ghost-green h-20 rounded-lg mb-2"></div>
              <p className="text-ghost-gray text-sm">Ghost Green</p>
              <p className="text-ghost-gray text-xs">#00FF41</p>
            </div>
            <div className="text-center">
              <div className="bg-ghost-gray h-20 rounded-lg mb-2"></div>
              <p className="text-ghost-gray text-sm">Ghost Gray</p>
              <p className="text-ghost-gray text-xs">#E0E0E0</p>
            </div>
            <div className="text-center">
              <div className="bg-ghost-white h-20 rounded-lg mb-2"></div>
              <p className="text-ghost-gray text-sm">Ghost White</p>
              <p className="text-ghost-gray text-xs">#FFFFFF</p>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="bg-ghost-near-black border border-ghost-green rounded-lg p-6 shadow-green-glow">
          <h2 className="font-creepster text-3xl text-ghost-green mb-6">Typography</h2>
          <div className="space-y-4">
            <div>
              <h1 className="font-creepster text-5xl text-ghost-green">Heading 1 - Creepster</h1>
              <p className="text-ghost-gray text-sm">Font: Creepster, Size: 3rem (48px)</p>
            </div>
            <div>
              <h2 className="font-creepster text-4xl text-ghost-green">Heading 2 - Creepster</h2>
              <p className="text-ghost-gray text-sm">Font: Creepster, Size: 2.25rem (36px)</p>
            </div>
            <div>
              <h3 className="font-creepster text-3xl text-ghost-green">Heading 3 - Creepster</h3>
              <p className="text-ghost-gray text-sm">Font: Creepster, Size: 1.875rem (30px)</p>
            </div>
            <div>
              <p className="text-ghost-gray text-lg">
                Body text using Inter font. This is the primary font for all body content,
                providing excellent readability while maintaining the horror aesthetic.
              </p>
              <p className="text-ghost-gray text-sm">Font: Inter, Size: 1rem (16px)</p>
            </div>
          </div>
        </section>

        {/* Glow Effects Section */}
        <section className="bg-ghost-near-black border border-ghost-green rounded-lg p-6 shadow-green-glow">
          <h2 className="font-creepster text-3xl text-ghost-green mb-6">Glow Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-ghost-green mb-3">Text Glow</h3>
              <div className="space-y-2">
                <p className="text-ghost-green text-glow">Standard text glow</p>
                <p className="text-ghost-green text-glow-md">Medium text glow</p>
                <p className="text-ghost-green text-glow-lg">Large text glow</p>
                <p className="text-ghost-green text-glow-xl">Extra large text glow</p>
              </div>
            </div>
            <div>
              <h3 className="text-ghost-green mb-3">Box Glow</h3>
              <div className="space-y-3">
                <div className="bg-ghost-black p-4 rounded-lg shadow-green-glow">
                  <p className="text-ghost-gray">Standard box glow</p>
                </div>
                <div className="bg-ghost-black p-4 rounded-lg shadow-green-glow-lg">
                  <p className="text-ghost-gray">Large box glow</p>
                </div>
                <div className="bg-ghost-black p-4 rounded-lg shadow-green-glow-xl">
                  <p className="text-ghost-gray">Extra large box glow</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="bg-ghost-near-black border border-ghost-green rounded-lg p-6 shadow-green-glow">
          <h2 className="font-creepster text-3xl text-ghost-green mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-ghost-green text-ghost-black font-semibold rounded-lg shadow-green-glow hover:shadow-green-glow-lg transition-all duration-250">
              Primary Button
            </button>
            <button className="px-6 py-3 bg-transparent border-2 border-ghost-green text-ghost-green rounded-lg hover:bg-ghost-green hover:text-ghost-black transition-all duration-250">
              Ghost Button
            </button>
            <button className="px-6 py-3 bg-ghost-near-black border-2 border-ghost-green text-ghost-green rounded-lg glow-on-hover transition-all duration-250">
              Hover Glow Button
            </button>
          </div>
        </section>

        {/* Animations Section */}
        <section className="bg-ghost-near-black border border-ghost-green rounded-lg p-6 shadow-green-glow">
          <h2 className="font-creepster text-3xl text-ghost-green mb-6">Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-ghost-black p-4 rounded-lg border border-ghost-green animate-pulse-green">
              <p className="text-ghost-gray text-center">Pulse Green</p>
            </div>
            <div className="bg-ghost-black p-4 rounded-lg border border-ghost-green animate-fade-in">
              <p className="text-ghost-gray text-center">Fade In</p>
            </div>
            <div className="bg-ghost-black p-4 rounded-lg border border-ghost-green animate-slide-up">
              <p className="text-ghost-gray text-center">Slide Up</p>
            </div>
            <div className="bg-ghost-black p-4 rounded-lg border border-ghost-green animate-glow-pulse">
              <p className="text-ghost-gray text-center">Glow Pulse</p>
            </div>
          </div>
        </section>

        {/* Vignette Effects Section */}
        <section className="bg-ghost-near-black border border-ghost-green rounded-lg p-6 shadow-green-glow">
          <h2 className="font-creepster text-3xl text-ghost-green mb-6">Vignette Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="vignette bg-ghost-green h-40 rounded-lg flex items-center justify-center">
              <p className="text-ghost-black font-semibold relative z-10">Standard Vignette</p>
            </div>
            <div className="vignette-lg bg-ghost-green h-40 rounded-lg flex items-center justify-center">
              <p className="text-ghost-black font-semibold relative z-10">Large Vignette</p>
            </div>
          </div>
        </section>

        {/* Background Effects Section */}
        <section className="bg-ghost-near-black border border-ghost-green rounded-lg p-6 shadow-green-glow">
          <h2 className="font-creepster text-3xl text-ghost-green mb-6">Background Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="fog-effect h-32 rounded-lg border border-ghost-green flex items-center justify-center">
              <p className="text-ghost-gray">Fog Effect</p>
            </div>
            <div className="gradient-radial h-32 rounded-lg border border-ghost-green flex items-center justify-center">
              <p className="text-ghost-gray">Radial Gradient</p>
            </div>
            <div className="gradient-green-fade h-32 rounded-lg border border-ghost-green flex items-center justify-center">
              <p className="text-ghost-gray">Green Fade</p>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="bg-ghost-near-black border border-ghost-green rounded-lg p-6 shadow-green-glow">
          <h2 className="font-creepster text-3xl text-ghost-green mb-6">Card Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="bg-ghost-near-black border border-ghost-green rounded-lg p-6 shadow-green-glow hover:shadow-green-glow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
              <h3 className="font-creepster text-2xl text-ghost-green mb-2">Story Card</h3>
              <p className="text-ghost-gray text-sm mb-4">October 31, 2024</p>
              <p className="text-ghost-gray">A chilling encounter in the dead of night...</p>
            </article>
            <article className="bg-ghost-near-black border border-ghost-green rounded-lg p-6 shadow-green-glow hover:shadow-green-glow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
              <h3 className="font-creepster text-2xl text-ghost-green mb-2">Location Card</h3>
              <p className="text-ghost-gray text-sm mb-4">New Orleans, LA</p>
              <p className="text-ghost-gray">Multiple encounters reported at this location...</p>
            </article>
            <article className="bg-ghost-near-black border border-ghost-green rounded-lg p-6 shadow-green-glow hover:shadow-green-glow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
              <h3 className="font-creepster text-2xl text-ghost-green mb-2">User Card</h3>
              <p className="text-ghost-gray text-sm mb-4">Ghostbuster</p>
              <p className="text-ghost-gray">15 encounters verified, 42 stories rated...</p>
            </article>
          </div>
        </section>

        {/* Loading States Section */}
        <section className="bg-ghost-near-black border border-ghost-green rounded-lg p-6 shadow-green-glow">
          <h2 className="font-creepster text-3xl text-ghost-green mb-6">Loading States</h2>
          <div className="space-y-3">
            <div className="loading-skeleton h-8 w-full rounded"></div>
            <div className="loading-skeleton h-8 w-3/4 rounded"></div>
            <div className="loading-skeleton h-8 w-1/2 rounded"></div>
          </div>
        </section>
      </div>
    </div>
  );
}
