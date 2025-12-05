import type { ReactNode } from 'react';
import { NavigationBar } from './NavigationBar';
import { Footer } from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  showNav?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function PageLayout({
  children,
  className = '',
  showNav = true,
  showFooter = true,
  maxWidth = 'xl',
}: PageLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  return (
    <div className="min-h-screen flex flex-col bg-ghost-black relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Fog particles using CSS animation - Green and Red */}
        <div className="absolute inset-0 opacity-30">
          <div className="fog-particle fog-particle-1" />
          <div className="fog-particle fog-particle-2" />
          <div className="fog-particle fog-particle-3" />
          <div className="fog-particle-red fog-particle-red-1" />
          <div className="fog-particle-red fog-particle-red-2" />
        </div>

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 gradient-radial opacity-20" />

        {/* Vignette effect */}
        <div className="absolute inset-0 vignette-lg" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Main Content */}
        <main
          className={`flex-1 ${maxWidthClasses[maxWidth]} w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}
        >
          {children}
        </main>

        {/* Footer */}
        {showFooter && <Footer />}
      </div>

      {/* CSS for fog particles */}
      <style>{`
        .fog-particle {
          position: absolute;
          background: radial-gradient(
            circle,
            rgba(0, 255, 65, 0.1) 0%,
            rgba(0, 255, 65, 0.05) 30%,
            transparent 70%
          );
          border-radius: 50%;
          filter: blur(40px);
          animation: float-fog 20s ease-in-out infinite;
        }

        .fog-particle-red {
          position: absolute;
          background: radial-gradient(
            circle,
            rgba(255, 0, 64, 0.08) 0%,
            rgba(255, 0, 64, 0.04) 30%,
            transparent 70%
          );
          border-radius: 50%;
          filter: blur(40px);
          animation: float-fog-red 25s ease-in-out infinite;
        }

        .fog-particle-1 {
          width: 400px;
          height: 400px;
          top: 10%;
          left: -10%;
          animation-delay: 0s;
          animation-duration: 25s;
        }

        .fog-particle-2 {
          width: 500px;
          height: 500px;
          top: 40%;
          right: -15%;
          animation-delay: 5s;
          animation-duration: 30s;
        }

        .fog-particle-3 {
          width: 350px;
          height: 350px;
          bottom: 20%;
          left: 30%;
          animation-delay: 10s;
          animation-duration: 35s;
        }

        .fog-particle-red-1 {
          width: 450px;
          height: 450px;
          top: 30%;
          right: 10%;
          animation-delay: 3s;
          animation-duration: 28s;
        }

        .fog-particle-red-2 {
          width: 380px;
          height: 380px;
          bottom: 15%;
          left: -5%;
          animation-delay: 8s;
          animation-duration: 32s;
        }

        @keyframes float-fog {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translate(30px, -30px) scale(1.1);
            opacity: 0.4;
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
            opacity: 0.2;
          }
          75% {
            transform: translate(40px, 10px) scale(1.05);
            opacity: 0.35;
          }
        }

        @keyframes float-fog-red {
          0%, 100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 0.25;
          }
          25% {
            transform: translate(-25px, 35px) scale(1.15) rotate(90deg);
            opacity: 0.35;
          }
          50% {
            transform: translate(30px, -15px) scale(0.95) rotate(180deg);
            opacity: 0.2;
          }
          75% {
            transform: translate(-35px, -20px) scale(1.08) rotate(270deg);
            opacity: 0.3;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .fog-particle,
          .fog-particle-red {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
