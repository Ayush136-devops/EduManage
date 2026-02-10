// Clean up the base URL to ensure no trailing slash issues
const API_BASE = process.env.REACT_APP_API_URL 
  ? process.env.REACT_APP_API_URL.replace(/\/$/, '') 
  : 'http://localhost:5000';

export async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('access_token');
  const headers = { ...(opts.headers || {}) };
  
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  if (opts.body && !(opts.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Ensure path starts with a slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // This will now correctly produce: https://...onrender.com/api/get_projects
  const res = await fetch(`${API_BASE}${cleanPath}`, { ...opts, headers });
  return res;
}

export default API_BASE;