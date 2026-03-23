import React from 'react';
import Card from './ui/Card';

export default function HotkeyCheatSheet() {
  return (
    <div style={{ position: 'fixed', bottom: 'var(--space-4)', right: 'var(--space-4)', zIndex: 'var(--z-tooltip)' }}>
      <Card style={{ padding: '1rem', border: '1px solid var(--color-accent)' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-accent)' }}>⌨️ Hotkeys</h4>
        <ul style={{ listStyle: 'none', fontSize: '0.85rem', margin: 0, padding: 0, lineHeight: '1.6' }}>
          <li><b style={{color: 'var(--color-text)'}}>d</b> - Toggle Theme</li>
          <li><b style={{color: 'var(--color-text)'}}>1-5</b> - Switch Tabs</li>
          <li><b style={{color: 'var(--color-text)'}}>Ctrl/Cmd + K</b> - Command Palette</li>
          <li><b style={{color: 'var(--color-text)'}}>?</b> - Toggle this help</li>
          <li><b style={{color: 'var(--color-text)'}}>Esc</b> - Close Modals</li>
        </ul>
      </Card>
    </div>
  );
}
