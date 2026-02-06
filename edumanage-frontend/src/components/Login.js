import React, { useState } from 'react';
import supabase from '../supabaseClient';

export default function Login({ onLogin, onSwitchToRegister }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Use Supabase Google OAuth
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
      if (error) setError(error.message || 'Failed to start Google sign-in');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-dual-box">
        <div className="auth-image-col">
          <div className="welcome-text">
            <h1>Welcome Back!</h1>
            <p>EduManage Project Dashboard</p>
          </div>
        </div>
        <div className="auth-form-col">
          <h2>Sign In</h2>
          <form className="dual-form" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="username"
              value={form.email}
              required
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              value={form.password}
              required
              onChange={handleChange}
            />
            {error && <div className="auth-error">{error}</div>}
            <button className="auth-btn-main" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="switch-link">
            Don't have an account?{' '}
            <button className="link-btn" onClick={onSwitchToRegister}>Register</button>
          </div>
        </div>
      </div>
    </div>
  );
}
