const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('access_token');
  const headers = { ...(opts.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (opts.body && !(opts.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  return res;
}

export default API_BASE;
