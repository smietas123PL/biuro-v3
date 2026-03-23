import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/globals.css';

// Global Fetch interceptor for Authorization
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  try {
    // Clone options to avoid mutating original
    const newOptions = { ...options };
    const headers = { ...(options.headers || {}) };
    
    if (!headers['X-API-Key'] && !headers['x-api-key']) {
      headers['X-API-Key'] = import.meta.env.VITE_APP_API_KEY || 'biuro-secret-key';
    }
    
    newOptions.headers = headers;
    return await originalFetch(url, newOptions);
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
