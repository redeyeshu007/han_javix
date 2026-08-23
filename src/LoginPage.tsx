import React, { useState } from 'react';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import { Navbar } from './LandingPage';
import './login.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
  };

  return (
    <div className="login-page">
      <Navbar />
      
      {/* Background with glowing orbs for premium feel */}
      <div className="login-page__bg">
        <div className="login-page__orb login-page__orb--1"></div>
        <div className="login-page__orb login-page__orb--2"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to Handoverly AI to continue</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  id="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <a href="#" className="forgot-password">Forgot password?</a>
              </div>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn--blue btn--lg login-btn">
              Sign In <ArrowRight size={20} />
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <a href="#" className="signup-link">Request Access</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
