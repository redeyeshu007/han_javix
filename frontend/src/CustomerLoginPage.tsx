import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { getDashboardRoute } from './utils/roleUtils';
import './customer-login.css';

const CustomerLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const authenticatedUser = await login(email, password);
      
      let dashboardRoute = '/customer-login';
      if (authenticatedUser) {
        dashboardRoute = getDashboardRoute(authenticatedUser.role);
      }

      // Determine where to redirect based on role or intended destination
      const from = (location.state as any)?.from?.pathname;
      const finalRoute = from && from !== '/customer-login' ? from : dashboardRoute;
      navigate(finalRoute, { replace: true });
    } catch (err: any) {
      if (err.message) {
        setError(err.message);
      } else if (err.status >= 500) {
        setError('Unable to sign in right now. Please try again.');
      } else {
        setError('Invalid email or password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="customer-login-page">
      <div className="customer-login-container">
        <img src="/logo.png" alt="Handoverly AI Logo" className="customer-login-logo" />
        
        <h1 className="customer-login-heading">Welcome Home</h1>
        <p className="customer-login-description">Sign in to track your property handover, inspections, and final milestones.</p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="customer-login-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}
          
          <div className="customer-form-group">
            <label htmlFor="email" className="customer-login-label">Email address</label>
            <input
              type="email"
              id="email"
              className="customer-login-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="customer-form-group">
            <label htmlFor="password" className="customer-login-label">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="customer-login-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              className="customer-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="rememberMe" style={{ cursor: 'pointer', accentColor: '#0F172A' }} />
              <label htmlFor="rememberMe" style={{ fontSize: '14px', color: '#64748B', cursor: 'pointer', fontWeight: 500 }}>Remember me</label>
            </div>
            <Link to="/forgot-password" className="customer-forgot">Forgot password?</Link>
          </div>

          <button type="submit" className="customer-login-button" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in to Workspace'}
          </button>
        </form>

        <div className="builder-login-link">
          Are you a builder or team member? <Link to="/login">Go to Team Portal</Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerLoginPage;
