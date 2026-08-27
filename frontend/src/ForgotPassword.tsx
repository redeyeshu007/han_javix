import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSuccess(true);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">HANDOVERLY AI</div>
        <div className="login-quote-container">
          <div className="login-quote">“Secure recovery of your<br />Handoverly workspace.”</div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <img src="/logo.png" alt="Handoverly AI Logo" className="login-logo" />
          
          <h1 className="login-heading">Forgot Password</h1>
          <p className="login-description">Enter your email and we will send a reset link.</p>

          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ padding: '16px', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '8px', marginBottom: '24px' }}>
                Reset link sent to {email}. Please check your inbox.
              </div>
              <button className="login-button" onClick={() => navigate('/login')}>Back to Login</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
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

              <button type="submit" className="login-button" disabled={isSubmitting}>
                {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <a href="/login" className="login-forgot">Back to Login</a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
