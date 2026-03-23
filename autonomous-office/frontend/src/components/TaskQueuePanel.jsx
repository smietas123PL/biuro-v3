import React, { useEffect, useState } from 'react';
import Card from './ui/Card';

export default function TaskQueuePanel() {
  const [queue, setQueue] = useState([]);

  const fetchQueue = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/companies/1/queue`)
      .then(res => res.json())
      .then(setQueue)
      .catch(console.error);
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <h2>Globalna Kolejka Zadań</h2>
      <p style={{ color: 'var(--color-text-2)' }}>Podgląd na wszystkie oczekujące i aktualnie procesowane zadania w całej firmie.</p>
      
      <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '1rem' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {queue.length === 0 ? (
            <li style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)' }}>
              Kolejka jest pusta.
            </li>
          ) : (
            queue.map(t => (
              <li key={t.id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: 'var(--radius-full)', 
                  backgroundColor: t.status === 'working' ? 'var(--color-warning)' : 'var(--color-surface-3)',
                  color: t.status === 'working' ? '#000' : 'var(--color-text-2)',
                  fontWeight: 'bold',
                  minWidth: '80px',
                  textAlign: 'center'
                }}>
                  {t.status.toUpperCase()}
                </span>
                <span style={{ flex: 1 }}>{t.description}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-2)' }}>Agent ID: {t.agent_id}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </Card>
  );
}
