import React from 'react';

export default function Button({ children, variant = 'primary', onClick, className = '' }) {
  const baseStyle = {
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'background-color var(--transition-fast)'
  };
  
  const variants = {
    primary: { backgroundColor: 'var(--color-accent)', color: '#000' },
    secondary: { backgroundColor: 'var(--color-surface-3)', color: 'var(--color-text)' },
    danger: { backgroundColor: 'var(--color-danger)', color: '#fff' }
  };

  return (
    <button style={{ ...baseStyle, ...variants[variant] }} onClick={onClick} className={className}>
      {children}
    </button>
  );
}
