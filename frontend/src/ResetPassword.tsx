import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
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
          
          <h1 className="login-heading">Reset Password</h1>
          <p className="login-description">Enter a new secure password for your account.</p>

          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ padding: '16px', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '8px', marginBottom: '24px' }}>
                Password reset successfully.
              </div>
              <button className="login-button" onClick={() => navigate('/login')}>Back to Login</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="login-error">{error}</div>}

              <div className="login-form-group">
                <label htmlFor="password" className="login-label">New Password *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="login-input"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="login-form-group">
                <label htmlFor="confirmPassword" className="login-label">Confirm New Password *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  className="login-input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

              <button type="submit" className="login-button" disabled={isSubmitting}>
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
