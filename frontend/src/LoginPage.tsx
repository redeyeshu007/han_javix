import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './login.css';

const LoginPage: React.FC = () => {
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
      
      // Determine dashboard route based on role
      let dashboardRoute = '/admin/dashboard';
      if (authenticatedUser) {
        switch (authenticatedUser.role) {
          case 'super_admin': dashboardRoute = '/admin/dashboard'; break;
          case 'builder_admin': dashboardRoute = '/admin/builder-dashboard'; break;
          case 'project_manager': dashboardRoute = '/admin/projects'; break;
          case 'site_engineer': dashboardRoute = '/admin/inspections'; break;
          case 'crm': dashboardRoute = '/admin/customers'; break;
          case 'accounts': dashboardRoute = '/admin/accounts'; break;
          case 'contractor': dashboardRoute = '/admin/contractor-tasks'; break;
          case 'customer': dashboardRoute = '/admin/customer-dashboard'; break;
          default: dashboardRoute = '/admin/dashboard';
        }
      }

      // Determine where to redirect based on role or intended destination
      const from = (location.state as any)?.from?.pathname || dashboardRoute;
      navigate(from, { replace: true });
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
    <div className="login-page">
      {/* LEFT SIDE */}
      <div className="login-left">
        <div className="login-brand">HANDOVERLY AI</div>
        
        <div className="login-quote-container">
          <div className="login-quote">
            “A better handover starts<br />
            long before the keys are delivered.”
          </div>
          <div className="login-subquote">
            Every project has a finish.<br />
            Every handover has a story.
          </div>
        </div>

        <div className="login-footer-text">
          BUILDER HANDOVER OS<br />
          <br />
          BUILD · INSPECT · RESOLVE · HANDOVER · CARE
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">
        <div className="login-form-container">
          <img src="/logo.png" alt="Handoverly AI Logo" className="login-logo" />
          
          <h1 className="login-heading">Welcome back.</h1>
          <p className="login-description">Sign in to continue to your Handoverly workspace.</p>

          <form onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}
            
            <div className="login-form-group">
              <label htmlFor="email" className="login-label">Email address *</label>
              <input
                type="email"
                id="email"
                className="login-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="password" className="login-label">Password *</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="login-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="rememberMe" style={{ cursor: 'pointer' }} />
                <label htmlFor="rememberMe" style={{ fontSize: '14px', color: '#64748B', cursor: 'pointer' }}>Remember me</label>
              </div>
              <a href="/forgot-password" className="login-forgot">Forgot password?</a>
            </div>

            <button type="submit" className="login-button" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <div className="login-security-text">
            Secure access to your Handoverly workspace.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
