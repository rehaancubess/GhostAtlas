import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { validateConfig } from '@/utils/config';
import { useInitializeApp } from '@/hooks';
import { PageLayout } from '@/components/layout';
import { StoriesPage } from '@/pages/StoriesPage';
import { StoryDetailPage } from '@/pages/StoryDetailPage';
import { AdminPanelPage } from '@/pages/AdminPanelPage';

// Placeholder pages - will be implemented in later tasks

function TermsPage() {
  return (
    <div className="py-8">
      <h1 className="font-creepster text-4xl text-ghost-green mb-4 text-glow">
        Terms of Use
      </h1>
      <p className="text-ghost-gray">Terms of use coming soon...</p>
    </div>
  );
}

function PrivacyPage() {
  return (
    <div className="py-8">
      <h1 className="font-creepster text-4xl text-ghost-green mb-4 text-glow">
        Privacy Policy
      </h1>
      <p className="text-ghost-gray">Privacy policy coming soon...</p>
    </div>
  );
}

function AppContent() {
  // Initialize app-level state (device ID, etc.)
  useInitializeApp();

  useEffect(() => {
    validateConfig();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<PageLayout><StoriesPage /></PageLayout>} />
      <Route path="/encounter/:id" element={<PageLayout><StoryDetailPage /></PageLayout>} />
      <Route path="/admin/panel" element={<PageLayout><AdminPanelPage /></PageLayout>} />
      <Route path="/terms" element={<PageLayout><TermsPage /></PageLayout>} />
      <Route path="/privacy" element={<PageLayout><PrivacyPage /></PageLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
