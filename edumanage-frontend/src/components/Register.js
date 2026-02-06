import React, { useState } from 'react';
import supabase from '../supabaseClient';

export default function Register({ onSwitchToLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Use Supabase Google OAuth (registration via Google)
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
        <div className="auth-image-col register-welcome">
          <div className="welcome-text">
            <h1>Welcome!</h1>
            <p>Get started with a free account</p>
          </div>
        </div>
        <div className="auth-form-col">
          <h2>Register</h2>
          <form className="dual-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              autoComplete="name"
              value={form.name}
              required
              onChange={handleChange}
            />
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
              autoComplete="new-password"
              value={form.password}
              required
              onChange={handleChange}
            />
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}
            <button className="auth-btn-main" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <div className="switch-link">
            Already have an account?{' '}
            <button className="link-btn" onClick={onSwitchToLogin}>Sign In</button>
          </div>
        </div>
      </div>
    </div>
  );
}
