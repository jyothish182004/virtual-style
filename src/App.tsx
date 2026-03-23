import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Studio } from './pages/Studio';
import { Wardrobe } from './pages/Wardrobe';
import { Concierge } from './pages/Concierge';
import { Profile } from './pages/Profile';
import { useAuth } from './hooks/useAuth';
import { useWardrobe } from './hooks/useWardrobe';
import { useProfile } from './hooks/useProfile';
import { TRENDS } from './constants';

import { LoadingScreen } from './components/LoadingScreen';
import { AnimatePresence } from 'motion/react';

function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { wardrobe, loading: wardrobeLoading, addToWardrobe, removeFromWardrobe } = useWardrobe(user);
  const { profile, loading: profileLoading, saving: profileSaving, saveProfile } = useProfile(user);

  return (
    <Router>
      <AnimatePresence mode="wait">
        {authLoading && <LoadingScreen key="loading" />}
      </AnimatePresence>

      <div className="min-h-screen bg-white text-brand-black selection:bg-brand-gold selection:text-white">
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#141414',
              color: '#fff',
              borderRadius: '1.5rem',
              padding: '1.5rem 2rem',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }
          }}
        />
        
        <Navbar user={user} signIn={signIn} />

        <main className="pt-40 pb-20 px-4 md:px-8">
          <Routes>
            <Route path="/" element={<Home recentCreations={wardrobe.slice(0, 4)} trendingTrends={TRENDS} />} />
            <Route path="/studio" element={<Studio user={user} profile={profile} addToWardrobe={addToWardrobe} />} />
            <Route path="/wardrobe" element={<Wardrobe user={user} wardrobe={wardrobe} removeFromWardrobe={removeFromWardrobe} signIn={signIn} />} />
            <Route path="/concierge" element={<Concierge user={user} />} />
            <Route path="/profile" element={<Profile user={user} profile={profile} saveProfile={saveProfile} saving={profileSaving} signOut={signOut} signIn={signIn} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
