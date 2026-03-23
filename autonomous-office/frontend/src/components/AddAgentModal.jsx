import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

export default function AddAgentModal({ onClose, onAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    model: 'gpt-3.5-turbo',
    initial_budget: 1.00
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: 1, // Domyślnie bierzemy główną firmę
          ...formData
        })
      });
      if (onAdded) onAdded();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const inputStyle = {
    width: '100%', padding: 'var(--space-2)', marginBottom: 'var(--space-4)', 
    borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', 
    backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text)'
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 'var(--z-modal)' }}>
      <Card style={{ minWidth: '400px' }}>
        <h2>Add New Agent</h2>
        
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 'var(--space-1)' }}>Agent Name</label>
          <input style={inputStyle} required placeholder="np. Asystent HR" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />

          <label style={{ display: 'block', marginBottom: 'var(--space-1)' }}>Role / Prompt</label>
          <input style={inputStyle} required placeholder="np. Jesteś ekspertem HR..." value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />

          <label style={{ display: 'block', marginBottom: 'var(--space-1)' }}>Model</label>
          <select style={inputStyle} value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})}>
            <option value="gpt-3.5-turbo">OpenAI GPT-3.5</option>
            <option value="gpt-4o">OpenAI GPT-4o</option>
            <option value="claude-3-opus">Anthropic Claude 3 Opus</option>
            <option value="gemini-1.5-pro">Google Gemini 1.5</option>
          </select>

          <label style={{ display: 'block', marginBottom: 'var(--space-1)' }}>Budget Limit ($)</label>
          <input style={inputStyle} type="number" step="0.01" value={formData.initial_budget} onChange={e => setFormData({...formData, initial_budget: parseFloat(e.target.value)})} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button variant="primary" type="submit">Deploy Agent</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
