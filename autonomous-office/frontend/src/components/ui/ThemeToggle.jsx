import React from 'react';
import Button from './Button';

export default function ThemeToggle({ theme, toggleTheme }) {
  return (
    <Button variant="secondary" onClick={toggleTheme}>
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </Button>
  );
}
