import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

export default function PromptVersionManager({ agentId }) {
  const [versions, setVersions] = useState([]);
  const [newPrompt, setNewPrompt] = useState('');

  const fetchVersions = () => {
    if (!agentId) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/agents/${agentId}/prompt-versions`)
      .then(res => res.json())
      .then(setVersions)
      .catch(console.error);
  };

  useEffect(() => {
    fetchVersions();
  }, [agentId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newPrompt.trim()) return;
    
    await fetch(`${import.meta.env.VITE_API_URL}/api/agents/${agentId}/prompt-versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: versions.length > 0 ? versions[0].version + 1 : 1,
        label: `v${versions.length > 0 ? versions[0].version + 1 : 1}`,
        system_prompt: newPrompt,
        notes: 'Manualna aktualizacja promptu z UI'
      })
    });
    setNewPrompt('');
    fetchVersions();
  };

  if (!agentId) return null;

  return (
    <Card>
      <h2>Menedżer Promptów</h2>
      <p style={{ color: 'var(--color-text-2)' }}>Zarządzanie system-promptem Agenta i jego ewolucją.</p>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '1rem 0' }}>
        <textarea 
          value={newPrompt} 
          onChange={e => setNewPrompt(e.target.value)} 
          placeholder="Wpisz nową dyrektywę System Prompt dla tego agenta..."
          rows={3}
          style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
        />
        <Button variant="secondary" type="submit" style={{ alignSelf: 'flex-start' }}>Zapisz nową wersję</Button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {versions.length === 0 ? (
          <li style={{ color: 'var(--color-text-muted)' }}>Brak zapamiętanych wersji promptu.</li>
        ) : (
          versions.map(v => (
            <li key={v.id} style={{ padding: '0.75rem', borderBottom: '1px dashed var(--color-border)', display: 'flex', gap: '1rem' }}>
              <strong style={{ minWidth: '40px' }}>{v.label}</strong>
              <span style={{ flex: 1, fontSize: '0.9rem', color: 'var(--color-text)' }}>{v.system_prompt}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date(v.created_at).toLocaleDateString()}</span>
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}
