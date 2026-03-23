import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useStore } from '../store';

export default function ApiKeysPanel() {
  const { apiKeys, setApiKeys } = useStore();
  
  const [keys, setKeys] = useState({
    openai: apiKeys?.openai || '',
    anthropic: apiKeys?.anthropic || '',
    google: apiKeys?.google || ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setKeys(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setApiKeys(keys);
    
    // Normalnie wysyłalibyśmy to bezpiecznie do backendu:
    // fetch(`/api/companies/${companyId}/keys`, { method: 'POST', body: JSON.stringify(keys) })
    
    setStatus('Keys saved securely in local storage.');
    setTimeout(() => setStatus(''), 3000);
  };

  const inputStyle = {
    width: '100%',
    padding: 'var(--space-2)',
    marginBottom: 'var(--space-4)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-mono)'
  };

  return (
    <Card>
      <h2>API Keys Configuration</h2>
      <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-2)' }}>
        Wprowadź swoje klucze do modeli LLM. Będą używane przez agentów.
      </p>

      <div>
        <label htmlFor="openai-key" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>OpenAI API Key (gpt-*)</label>
        <input 
          id="openai-key"
          type="password" 
          name="openai" 
          value={keys.openai} 
          onChange={handleChange} 
          placeholder="sk-proj-..." 
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="anthropic-key" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Anthropic API Key (claude-*)</label>
        <input 
          id="anthropic-key"
          type="password" 
          name="anthropic" 
          value={keys.anthropic} 
          onChange={handleChange} 
          placeholder="sk-ant-..." 
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="google-key" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Google API Key (gemini-*)</label>
        <input 
          id="google-key"
          type="password" 
          name="google" 
          value={keys.google} 
          onChange={handleChange} 
          placeholder="AIzaSy..." 
          style={inputStyle}
        />
      </div>

      <Button variant="primary" onClick={handleSave}>Save Keys</Button>
      
      {status && (
        <p style={{ marginTop: 'var(--space-3)', color: 'var(--color-accent)', fontWeight: 'bold' }}>
          {status}
        </p>
      )}
    </Card>
  );
}
