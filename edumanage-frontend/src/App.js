import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import './App.css';
import { apiFetch } from './api';
import supabase from './supabaseClient';

function App() {
  const [page, setPage] = useState('login'); // login, register, dashboard
  const [user, setUser] = useState(null);

  useEffect(() => {
    // On app load, check if Supabase has an authenticated session (post-OAuth redirect)
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        if (session && session.access_token) {
          // Exchange with backend to create server session
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: session.access_token }),
          });
          const info = await res.json();
          if (info.status === 'success') {
            setUser({ name: info.name, professor_id: info.professor_id });
            setPage('dashboard');
          }
        }
      } catch (err) {
        console.error('Error completing auth:', err);
      }
    })();

    // Listen for auth changes (optional)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sessionData) => {
      if (sessionData?.session?.access_token) {
        fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: sessionData.session.access_token }),
        }).then(r => r.json()).then(info => {
          if (info.status === 'success') {
            setUser({ name: info.name, professor_id: info.professor_id });
            setPage('dashboard');
          }
        }).catch(console.error);
      }
    });

    return () => {
      if (listener && listener.subscription) listener.subscription.unsubscribe && listener.subscription.unsubscribe();
    };
  }, []);

  const onLogin = (userData) => {
    setUser(userData);
    setPage('dashboard');
  };

  const onLogout = () => {
    // Clear server session and local supabase session
    apiFetch('/logout', { method: 'POST' }).finally(() => {
      supabase.auth.signOut();
      setUser(null);
      setPage('login');
    });
  }; 

  return (
    <div className="app">
      <main>
        {(page === 'login' || page === 'register') && <Auth onLogin={onLogin} />}
        {page === 'dashboard' && <Dashboard user={user} onLogout={onLogout} />}
      </main>

      <footer className="footer">
        &copy; 2025 EduManage
      </footer>
    </div>
  );
}

export default App;
