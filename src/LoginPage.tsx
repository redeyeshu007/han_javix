import React, { useState } from 'react';
import './login.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setError('Unable to sign in. Please check your email and password.');
    }, 1500);
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
              <label htmlFor="email" className="login-label">Email address</label>
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
              <label htmlFor="password" className="login-label">Password</label>
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

            <a href="#" className="login-forgot">Forgot password?</a>

            <button type="submit" className="login-button" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <div className="login-signup">
            Don't have an account? <a href="#">Create one</a>
          </div>

          <div className="login-security-text">
            Secure access to your Handoverly workspace.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
