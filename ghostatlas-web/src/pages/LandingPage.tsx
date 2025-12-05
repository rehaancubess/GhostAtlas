import { useNavigate } from 'react-router-dom';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';

export function LandingPage() {
  const navigate = useNavigate();

  const handleExploreClick = () => {
    navigate('/stories');
  };

  return (
    <div className="w-full">
      <HeroSection onExploreClick={handleExploreClick} />
      <FeatureShowcase 
        onExploreStoriesClick={handleExploreClick}
        onViewMapClick={handleExploreClick}
      />
    </div>
  );
}
