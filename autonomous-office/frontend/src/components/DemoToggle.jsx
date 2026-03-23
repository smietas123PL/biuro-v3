import React, { useState, useEffect } from 'react';
import Button from './ui/Button';

export default function DemoToggle() {
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    let interval;
    if (demo) {
      interval = setInterval(() => {
        // Losuj agenta, któremu zlecimy fikcyjne zadanie (np. dla agenta ID 1 lub 2)
        const agentId = Math.floor(Math.random() * 2) + 1; 
        
        fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: 1,
            agent_id: agentId,
            description: `Automatyczne zgłoszenie #${Math.floor(Math.random() * 1000)} z systemu`
          })
        }).catch(console.error);
        
      }, 8000); // Co 8 sekund
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [demo]);

  return (
    <Button 
      variant={demo ? 'danger' : 'secondary'} 
      onClick={() => setDemo(!demo)}
      style={{ marginLeft: 'var(--space-4)', fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
    >
      {demo ? '⏹ Stop Demo Load' : '▶ Start Demo Load'}
    </Button>
  );
}
