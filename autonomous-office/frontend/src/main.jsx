import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/globals.css';

// Global Fetch interceptor for Authorization
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  const headers = new Headers(options.headers || {});
  if (!headers.has('X-API-Key')) {
    headers.set('X-API-Key', import.meta.env.VITE_APP_API_KEY || 'biuro-secret-key');
  }
  return originalFetch(url, { ...options, headers });
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
