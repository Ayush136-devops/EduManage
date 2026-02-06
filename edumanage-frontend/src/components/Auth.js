import React, { useState, useRef, useEffect } from 'react';
import supabase from '../supabaseClient';

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [login, setLogin] = useState({ email: '', password: '' });
  const [register, setRegister] = useState({ name: '', email: '', password: '' });
  const emailRef = useRef(null);

  useEffect(() => {
    if (emailRef.current) emailRef.current.focus();
  }, [mode]);

  const handleChange = (e, type) => {
    const { name, value } = e.target;
    if (type === 'login') {
      setLogin(prev => ({ ...prev, [name]: value }));
    } else {
      setRegister(prev => ({ ...prev, [name]: value }));
    }
  };

  const isVitEmail = (email) => /@vit\.edu$/i.test(email.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Start Supabase Google OAuth (redirect). Both login & register use Google.
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
      if (error) {
        setError(error.message || 'Failed to start Google sign-in');
      }
      // On success, the page will redirect to Google and back. After redirect App will exchange session with the backend.
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background Gradient */}
      <div className="auth-bg"></div>

      {/* Main Content */}
      <div className="auth-wrapper">
        {/* Left Panel - VIT Branding */}
        <div className="auth-panel auth-panel-left">
          <div className="auth-brand">
            <div className="brand-logo">
              <span className="logo-icon">🎓</span>
            </div>
            <h1 className="brand-title">EduManage</h1>
            <p className="brand-subtitle">Vishwakarma Institute of Technology</p>
            <p className="brand-tagline">
              Manage Projects. Track Progress. Achieve Excellence.
            </p>
          </div>
          <div className="auth-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <p>Streamlined project management</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <p>Real-time collaboration</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <p>Advanced analytics & insights</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="auth-panel auth-panel-right">
          <div className="auth-card">
            {/* Header */}
            <div className="auth-header">
              <h2 className="auth-title">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="auth-subtitle">
                {mode === 'login'
                  ? 'Sign in to your professor account'
                  : 'Join EduManage and start managing projects'}
              </p>
            </div>

            {/* Alert Messages */}
            {error && (
              <div className="auth-alert alert-error">
                <span className="alert-icon">⚠️</span>
                <p>{error}</p>
                <button
                  className="alert-close"
                  onClick={() => setError('')}
                  aria-label="Close error"
                >
                  ×
                </button>
              </div>
            )}

            {success && (
              <div className="auth-alert alert-success">
                <span className="alert-icon">✓</span>
                <p>{success}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {mode === 'register' && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Dr. John Smith"
                    value={register.name}
                    onChange={(e) => handleChange(e, 'register')}
                    required
                    autoComplete="name"
                    className="form-input"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  ref={emailRef}
                  id="email"
                  type="email"
                  name="email"
                  placeholder="professor@vit.edu.in"
                  value={mode === 'login' ? login.email : register.email}
                  onChange={(e) => handleChange(e, mode)}
                  required
                  autoComplete="email"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={mode === 'login' ? login.password : register.password}
                  onChange={(e) => handleChange(e, mode)}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-submit"
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-mini"></span>
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : mode === 'login' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Footer - Mode Toggle */}
            <div className="auth-footer">
              {mode === 'login' ? (
                <>
                  <p>
                    New professor?
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => {
                        setMode('register');
                        setError('');
                        setSuccess('');
                      }}
                    >
                      Create an account
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Already registered?
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => {
                        setMode('login');
                        setError('');
                        setSuccess('');
                      }}
                    >
                      Sign in here
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="auth-footer-info">
            <p>© 2025 EduManage. Vishwakarma Institute of Technology. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
