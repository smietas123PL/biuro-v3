import React from 'react';

export default function Card({ children, className = '' }) {
  const style = {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
    padding: 'var(--space-4)',
    border: '1px solid var(--color-border)',
    marginBottom: 'var(--space-4)'
  };

  return <div style={style} className={className}>{children}</div>;
}
