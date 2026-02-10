import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import './App.css';
import supabase from './supabaseClient';

function App() {
  const [page, setPage] = useState('loading'); 
  const [user, setUser] = useState(null);

  const syncWithBackend = async (session) => {
    if (!session) {
      setPage('login');
      return;
    }

    try {
      // Use the full URL to avoid relative path issues during dev
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: session.access_token }),
      });
      
      const info = await res.json();
      
      if (info.status === 'success') {
        setUser({ name: info.name, professor_id: info.professor_id });
        setPage('dashboard');
      } else {
        console.error('Backend rejected login:', info.message);
        setPage('login');
      }
    } catch (err) {
      console.error('Sync error:', err);
      setPage('login');
    }
  };

  useEffect(() => {
    // 1. Initial Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        syncWithBackend(session);
      } else {
        setPage('login');
      }
    });

    // 2. Listen for Auth Changes (Google Redirect landing)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        syncWithBackend(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setPage('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (page === 'loading') {
    return (
      <div className="auth-container">
        <div className="auth-bg"></div>
        <div className="loading-spinner-container">
          <span className="logo-icon">🎓</span>
          <p></p>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <main>
        {page === 'dashboard' ? (
          <Dashboard user={user} onLogout={() => supabase.auth.signOut()} />
        ) : (
          <Auth />
        )}
      </main>
      <footer className="footer">
        &copy; 2026 EduManage
      </footer>
    </div>
  );
}

export default App;