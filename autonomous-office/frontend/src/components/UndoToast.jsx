import React, { useEffect } from 'react';

export default function UndoToast({ message, onUndo, onTimeout }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onTimeout) onTimeout();
    }, 5000); // Znika po 5 sekundach
    
    return () => clearTimeout(timer);
  }, [onTimeout]);

  return (
    <div style={{ position: 'fixed', bottom: 'var(--space-4)', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', zIndex: 'var(--z-toast)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center', boxShadow: 'var(--shadow-lg)' }}>
      <span>{message}</span>
      <button onClick={onUndo} style={{ background: 'var(--color-accent-dim)', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 'bold', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>Undo</button>
    </div>
  );
}
