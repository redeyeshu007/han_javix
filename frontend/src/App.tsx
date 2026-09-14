import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './LandingPage';
import ServicesPage from './ServicesPage';
import LoginPage from './LoginPage';
import CustomerLoginPage from './CustomerLoginPage';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import ParticleText from './ParticleText';
import AdminApp from './admin/AdminApp';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const location = useLocation();

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

  const pathname = location.pathname.toLowerCase();
  const isServices = pathname === '/services';
  const isLogin = pathname === '/login';
  const isCustomerLogin = pathname === '/customer-login';
  const isForgotPassword = pathname === '/forgot-password';
  const isResetPassword = pathname === '/reset-password';
  
  const protectedNamespaces = [
    '/admin', '/builder', '/project-admin',
    '/site-engineer', '/accounts', '/contractor', 
    '/customer', '/association'
  ];
  
  const isProtectedPath = protectedNamespaces.some(ns => pathname.startsWith(ns)) || isLogin || isCustomerLogin || isForgotPassword || isResetPassword;

  return (
    <>
      {loading && !isProtectedPath && (
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
      
      {isProtectedPath ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/customer-login" element={<CustomerLoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminApp /></ProtectedRoute>} />
          <Route path="/builder/*" element={<ProtectedRoute allowedRoles={['BUILDER_OWNER']}><AdminApp /></ProtectedRoute>} />
          <Route path="/project-admin/*" element={<ProtectedRoute allowedRoles={['PROJECT_ADMIN']}><AdminApp /></ProtectedRoute>} />
          <Route path="/site-engineer/*" element={<ProtectedRoute allowedRoles={['SITE_ENGINEER']}><AdminApp /></ProtectedRoute>} />
          <Route path="/accounts/*" element={<ProtectedRoute allowedRoles={['ACCOUNTS']}><AdminApp /></ProtectedRoute>} />
          <Route path="/contractor/*" element={<ProtectedRoute allowedRoles={['CONTRACTOR']}><AdminApp /></ProtectedRoute>} />
          <Route path="/customer/*" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><AdminApp /></ProtectedRoute>} />
          <Route path="/association/*" element={<ProtectedRoute allowedRoles={['ASSOCIATION_REPRESENTATIVE']}><AdminApp /></ProtectedRoute>} />
        </Routes>
      ) : (
        isLogin ? <LoginPage /> : isServices ? <ServicesPage /> : <LandingPage />
      )}
    </>
  );
};

export default App;
