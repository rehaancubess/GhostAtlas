import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationBarProps {
  className?: string;
}

export function NavigationBar({ className = '' }: NavigationBarProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoTapCount, setLogoTapCount] = useState(0);

  const isActive = (path: string) => location.pathname === path;

  const handleLogoClick = () => {
    const newCount = logoTapCount + 1;
    setLogoTapCount(newCount);

    // Unlock admin panel after 7 taps
    if (newCount === 7) {
      window.location.href = '/admin/panel';
    }

    // Reset counter after 2 seconds of inactivity
    setTimeout(() => {
      setLogoTapCount(0);
    }, 2000);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav
      className={`sticky top-0 z-50 bg-ghost-black/80 backdrop-blur-md border-b-2 border-ghost-green/30 hover:border-ghost-red/30 transition-colors duration-500 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center cursor-pointer group"
          >
            <span className="font-creepster text-2xl sm:text-3xl transition-all duration-300">
              <span className="text-ghost-green text-glow group-hover:text-glow-lg">Ghost</span>
              <span className="text-ghost-red text-glow-red group-hover:text-glow-red-lg">Atlas</span>
            </span>
          </Link>

          {/* Desktop Navigation - Empty but kept for future use */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation items removed - web app is stories-only */}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-ghost-gray hover:text-ghost-green hover:bg-ghost-near-black transition-all duration-300"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Hidden since no nav items */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-ghost-red/30 bg-ghost-near-black/95 backdrop-blur-md animate-fade-in shadow-glow-red-lg">
          <div className="px-4 pt-2 pb-4 text-center">
            <p className="text-ghost-gray text-sm">
              📱 Download the mobile app for full features
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}
