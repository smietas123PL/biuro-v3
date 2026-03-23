import React, { useState, useEffect, useRef } from 'react';
import Card from './ui/Card';

export default function CommandPalette({ onClose, setTab }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const commands = [
    { name: 'Go to Agents', action: () => setTab('agents') },
    { name: 'Go to Status', action: () => setTab('status') },
    { name: 'Go to Finance', action: () => setTab('finance') },
    { name: 'Go to Audit Log', action: () => setTab('log') },
    { name: 'Go to Settings', action: () => setTab('settings') },
  ];

  const filteredCommands = commands.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const executeCommand = (cmd) => {
    cmd.action();
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 'var(--z-modal)' }} onClick={onClose}>
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '500px' }} onClick={e => e.stopPropagation()}>
        <Card style={{ padding: '0', overflow: 'hidden' }}>
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Type a command or search..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              fontSize: '1.1rem',
              border: 'none', 
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              outline: 'none'
            }} 
          />
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '300px', overflowY: 'auto' }}>
            {filteredCommands.length === 0 ? (
              <li style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>No commands found.</li>
            ) : (
              filteredCommands.map((cmd, i) => (
                <li 
                  key={i} 
                  onClick={() => executeCommand(cmd)}
                  style={{ 
                    padding: '0.75rem 1rem', 
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--color-border-2)',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {cmd.name}
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
