import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/globals.css';

// Global Fetch interceptor for Authorization
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  try {
    const headers = new Headers(options.headers || {});
    if (!headers.has('X-API-Key')) {
      const apiKey = import.meta.env.VITE_APP_API_KEY || 'biuro-secret-key';
      headers.set('X-API-Key', apiKey);
    }
    return await originalFetch(url, { ...options, headers });
  } catch (error) {
    console.error('Fetch interceptor error:', error);
    throw error;
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
