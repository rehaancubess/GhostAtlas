import { Button } from '@/components/common/Button';

interface HeroSectionProps {
  onExploreClick: () => void;
}

export function HeroSection({ onExploreClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />
        <div className="particle particle-5" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 animate-fade-in">
        {/* Logo */}
        <h1 className="font-creepster text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-ghost-green text-glow-xl mb-6 animate-glow-pulse">
          Ghost<span className="text-ghost-red shadow-red-glow-xl">Atlas</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl md:text-3xl text-ghost-gray mb-4 max-w-3xl mx-auto">
          Where the <span className="text-ghost-red font-bold">paranormal</span> meets reality
        </p>
        
        <p className="text-base sm:text-lg md:text-xl text-ghost-gray/80 mb-12 max-w-2xl mx-auto">
          Explore real ghost encounters, share your own paranormal experiences, 
          and discover haunted locations near you
        </p>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button
            variant="primary"
            size="large"
            onClick={onExploreClick}
            className="w-full sm:w-auto min-w-[200px]"
          >
            Explore Stories
          </Button>
        </div>

        {/* App Download CTA */}
        <div className="mt-8 p-6 bg-ghost-dark-gray/50 border-2 border-ghost-red/30 rounded-lg max-w-2xl mx-auto backdrop-blur-sm">
          <p className="text-ghost-gray text-sm sm:text-base mb-3">
            Want to <span className="text-ghost-red font-semibold">submit your own encounter</span>, explore the haunted map, or verify locations?
          </p>
          <p className="text-ghost-green text-lg font-semibold text-glow">
            📱 Download the mobile app for the full experience
          </p>
        </div>
      </div>

      {/* CSS for particles */}
      <style>{`
        .particle {
          position: absolute;
          border-radius: 50%;
          filter: blur(30px);
          animation: float-particle 15s ease-in-out infinite;
        }
        
        .particle-1, .particle-3, .particle-5 {
          background: radial-gradient(
            circle,
            rgba(0, 255, 65, 0.3) 0%,
            rgba(0, 255, 65, 0.1) 30%,
            transparent 70%
          );
        }
        
        .particle-2, .particle-4 {
          background: radial-gradient(
            circle,
            rgba(255, 0, 64, 0.3) 0%,
            rgba(255, 0, 64, 0.1) 30%,
            transparent 70%
          );
        }

        .particle-1 {
          width: 150px;
          height: 150px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
          animation-duration: 18s;
        }

        .particle-2 {
          width: 100px;
          height: 100px;
          top: 20%;
          right: 15%;
          animation-delay: 2s;
          animation-duration: 20s;
        }

        .particle-3 {
          width: 120px;
          height: 120px;
          bottom: 15%;
          left: 20%;
          animation-delay: 4s;
          animation-duration: 22s;
        }

        .particle-4 {
          width: 80px;
          height: 80px;
          bottom: 25%;
          right: 25%;
          animation-delay: 6s;
          animation-duration: 16s;
        }

        .particle-5 {
          width: 110px;
          height: 110px;
          top: 50%;
          left: 50%;
          animation-delay: 8s;
          animation-duration: 24s;
        }

        @keyframes float-particle {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translate(50px, -50px) scale(1.2);
            opacity: 0.5;
          }
          50% {
            transform: translate(-30px, 30px) scale(0.8);
            opacity: 0.2;
          }
          75% {
            transform: translate(60px, 20px) scale(1.1);
            opacity: 0.4;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .particle {
            animation: none;
            opacity: 0.2;
          }
        }
      `}</style>
    </section>
  );
}
