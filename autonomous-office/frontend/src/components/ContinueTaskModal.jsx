import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

export default function ContinueTaskModal({ onClose, onContinue }) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      onContinue(prompt);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 'var(--z-modal)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Card style={{ minWidth: '400px' }}>
        <h2>Kontynuuj konwersację</h2>
        <p style={{ color: 'var(--color-text-2)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Dodaj kolejną instrukcję do tego zadania, aby agent mógł je rozwinąć.
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="np. Skróć to proszę do 3 punktów..."
            style={{ 
              width: '100%', 
              padding: 'var(--space-2)', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--color-border)', 
              backgroundColor: 'var(--color-surface)', 
              color: 'var(--color-text)',
              marginBottom: '1rem'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="secondary" onClick={onClose} type="button">Anuluj</Button>
            <Button variant="primary" type="submit">Przekaż wytyczne</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
