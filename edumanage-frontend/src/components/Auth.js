import React, { useState } from 'react';
import supabase from '../supabaseClient';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) setError(error.message);
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      // Note: Page will redirect, so loading state usually ends on redirect
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bg"></div>

      <div className="auth-wrapper">
        {/* Left Panel - VIT Branding (UNTOUCHED) */}
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

        {/* Right Panel - Google Flow Integration */}
        <div className="auth-panel auth-panel-right">
          <div className="auth-card">
            <div className="auth-header">
              <h2 className="auth-title">Welcome Back</h2>
              <p className="auth-subtitle">Sign in to your VIT Professor account</p>
            </div>

            {/* Error Messages */}
            {error && (
              <div className="auth-alert alert-error">
                <span className="alert-icon">⚠️</span>
                <p>{error}</p>
                <button className="alert-close" onClick={() => setError('')}>×</button>
              </div>
            )}

            {/* Google Login Button - Replaces the Form */}
            <div className="auth-google-wrapper">
              <button 
                onClick={handleGoogleLogin} 
                className="btn-google-auth"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-mini"></span>
                ) : (
                  <img 
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                    alt="Google" 
                    className="google-icon-svg"
                  />
                )}
                <span>Continue with VIT Google Account</span>
              </button>
              
              <p className="google-disclaimer">
                Access is restricted to <strong>@vit.edu</strong> email addresses only.
              </p>
            </div>

            <div className="auth-footer-divider"></div>
          </div>

          <div className="auth-footer-info">
            <p>© 2026 EduManage. Vishwakarma Institute of Technology. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}