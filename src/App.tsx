import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import ServicesPage from './ServicesPage';
import LoginPage from './LoginPage';
import ParticleText from './ParticleText';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname + window.location.hash);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname + window.location.hash);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    // Wait for the particles to fully settle (1600ms + 420ms stagger)
    // Then start a smooth 1s fade out
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 2500);

    // Remove from DOM after fade is complete
    const removeTimer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const isServices = currentPath.toLowerCase().includes('services');
  const isLogin = currentPath.toLowerCase().includes('login');

  return (
    <>
      {loading && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100vh', 
            background: '#09090f', // Dark background for the preloader
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: fadingOut ? 0 : 1,
            transition: 'opacity 1s ease-in-out',
            pointerEvents: fadingOut ? 'none' : 'auto'
          }}
        >
          <div style={{ width: '100%', height: '360px' }}>
            <ParticleText
              text="Handoverly AI"
              particleSize={2.2}
              density={4}
              color="#f8fafc"
              highlightColor="#2563EB" // using brand blue as highlight
              scatter={190}
              gatherDuration={1600}
              stagger={420}
              pointerRepel={42}
              repelRadius={120}
              idleDrift={0.8}
              trigger="mount"
              fontSize="clamp(3.5rem, 13vw, 9rem)"
              fontWeight={800}
              fontFamily="inherit"
              glow
            />
          </div>
        </div>
      )}
      
      {isLogin ? <LoginPage /> : isServices ? <ServicesPage /> : <LandingPage />}
    </>
  );
};

export default App;
