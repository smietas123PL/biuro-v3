import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

export default function ApprovalsPanel() {
  const [pendingTasks, setPendingTasks] = useState([]);

  const fetchApprovals = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/tasks/pending/approvals`)
      .then(res => res.json())
      .then(setPendingTasks)
      .catch(console.error);
  };

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id, action) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${id}/${action}`, { method: 'PATCH' });
    fetchApprovals();
  };

  return (
    <Card>
      <h2>Oczekujące Zatwierdzenia</h2>
      <p style={{ color: 'var(--color-text-2)' }}>Zadania wstrzymane przez system bezpieczeństwa i reguły budżetowe.</p>

      {pendingTasks.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
          <p style={{ color: 'var(--color-accent)' }}>✅ Brak zadań do zatwierdzenia. Agenci pracują autonomicznie.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {pendingTasks.map(task => (
            <li key={task.id} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem', backgroundColor: 'var(--color-surface-2)' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--color-warning)', color: '#000', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', marginRight: '0.5rem' }}>WYMAGA ZGODY</span>
                <strong>ID: {task.id}</strong>
              </div>
              <p style={{ margin: '0.5rem 0' }}>{task.description}</p>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <Button variant="primary" onClick={() => handleAction(task.id, 'approve')}>Zatwierdź</Button>
                <Button variant="danger" onClick={() => handleAction(task.id, 'reject')}>Odrzuć</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
