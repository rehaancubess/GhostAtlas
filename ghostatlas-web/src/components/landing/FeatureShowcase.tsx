import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/common/Button';

interface Feature {
  title: string;
  description: string;
  icon: string;
  illustration: React.ReactElement;
}

interface FeatureShowcaseProps {
  onExploreStoriesClick: () => void;
  onViewMapClick: () => void;
}

export function FeatureShowcase({ onExploreStoriesClick, onViewMapClick }: FeatureShowcaseProps) {
  const [visibleFeatures, setVisibleFeatures] = useState<Set<number>>(new Set());
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  const features: Feature[] = [
    {
      title: 'Share Your Encounters',
      description: 'Document your paranormal experiences with photos, location data, and detailed narratives. Our AI enhances your stories into atmospheric horror tales.',
      icon: '👻',
      illustration: (
        <div className="relative w-full h-48 bg-ghost-near-black rounded-lg border border-ghost-green/30 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-pulse-green">📝</div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ghost-black/80 to-transparent" />
        </div>
      ),
    },
    {
      title: 'Explore the Haunted Map',
      description: 'Discover paranormal hotspots around the world. View encounters on an interactive map and find haunted locations near you.',
      icon: '🗺️',
      illustration: (
        <div className="relative w-full h-48 bg-ghost-near-black rounded-lg border border-ghost-green/30 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-glow-pulse">🌍</div>
          </div>
          <div className="absolute top-4 left-4 w-3 h-3 bg-ghost-green rounded-full animate-pulse-green" />
          <div className="absolute top-8 right-8 w-3 h-3 bg-ghost-green rounded-full animate-pulse-green" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-6 left-12 w-3 h-3 bg-ghost-green rounded-full animate-pulse-green" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-ghost-black/80 to-transparent" />
        </div>
      ),
    },
    {
      title: 'Verify Locations',
      description: 'Visit haunted locations in person and verify encounters. Rate the spookiness and contribute to the community investigation.',
      icon: '🔍',
      illustration: (
        <div className="relative w-full h-48 bg-ghost-near-black rounded-lg border border-ghost-green/30 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">📍</div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-ghost-green rounded-full animate-ping opacity-20" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ghost-black/80 to-transparent" />
        </div>
      ),
    },
    {
      title: 'Rate & Discover',
      description: 'Rate encounters to help the most credible stories rise to the top. Listen to AI-generated narrations and view atmospheric illustrations.',
      icon: '⭐',
      illustration: (
        <div className="relative w-full h-48 bg-ghost-near-black rounded-lg border border-ghost-green/30 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  className="text-3xl text-ghost-green animate-pulse-green"
                  style={{ animationDelay: `${star * 0.2}s` }}
                >
                  ⭐
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ghost-black/80 to-transparent" />
        </div>
      ),
    },
  ];

  useEffect(() => {
    const observers = featureRefs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleFeatures((prev) => new Set(prev).add(index));
            }
          });
        },
        { threshold: 0.2 }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return (
    <section className="py-16 sm:py-24">
      {/* Section Header */}
      <div className="text-center mb-16 animate-fade-in">
        <h2 className="font-creepster text-4xl sm:text-5xl md:text-6xl text-ghost-green text-glow-lg mb-4">
          Explore the Paranormal
        </h2>
        <p className="text-lg sm:text-xl text-ghost-gray max-w-2xl mx-auto">
          Join a community of ghost hunters and paranormal enthusiasts documenting the unexplained
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {features.map((feature, index) => (
          <div
            key={index}
            ref={(el) => {
              featureRefs.current[index] = el;
            }}
            className={`
              bg-ghost-near-black border border-ghost-green/20 rounded-lg p-6 sm:p-8
              transition-all duration-500 hover:border-ghost-green/50 hover:shadow-green-glow
              ${visibleFeatures.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            {/* Illustration */}
            <div className="mb-6">
              {feature.illustration}
            </div>

            {/* Content */}
            <div className="flex items-start gap-4">
              <div className="text-4xl flex-shrink-0">{feature.icon}</div>
              <div>
                <h3 className="font-creepster text-2xl sm:text-3xl text-ghost-green text-glow mb-3">
                  {feature.title}
                </h3>
                <p className="text-ghost-gray leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
