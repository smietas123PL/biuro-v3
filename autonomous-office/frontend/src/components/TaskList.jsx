import React, { useEffect, useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import AIResponseCard from './AIResponseCard';

export default function TaskList({ agentId }) {
  const [tasks, setTasks] = useState([]);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  useEffect(() => {
    if (!agentId) return;
    const fetchTasks = () => {
      fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${agentId}`)
        .then(res => res.json())
        .then(data => setTasks(data))
        .catch(console.error);
    };
    
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [agentId]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskDesc.trim()) return;
    
    setIsSubmitting(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: 1, // Domyślnie bierzemy główną firmę
          agent_id: agentId,
          description: newTaskDesc
        })
      });
      setNewTaskDesc('');
      // Zmuszenie do szybkiego refreshu zamiast czekać 5 sekund
      fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${agentId}`)
        .then(res => res.json())
        .then(data => setTasks(data));
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Task List</h2>
      </div>

      <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input 
          type="text" 
          value={newTaskDesc}
          onChange={(e) => setNewTaskDesc(e.target.value)}
          placeholder="Wpisz nowe zadanie dla agenta..." 
          disabled={isSubmitting}
          style={{
            flex: 1,
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)'
          }}
        />
        <Button variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Zlecanie...' : 'Zleć'}
        </Button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.length === 0 ? (
          <li>No active tasks</li>
        ) : (
          tasks.map(task => (
            <li 
              key={task.id} 
              style={{ 
                padding: '0.75rem', 
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
              >
                <span style={{ 
                  fontSize: '0.8rem', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: task.status === 'completed' ? 'var(--color-accent-dim)' : 'var(--color-surface-3)',
                  color: task.status === 'completed' ? 'var(--color-accent)' : 'var(--color-text-2)',
                  fontWeight: 'bold',
                  minWidth: '80px',
                  textAlign: 'center'
                }}>
                  {task.status.toUpperCase()}
                </span>
                <span style={{ flex: 1 }}>{task.description}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>{expandedTaskId === task.id ? '▲' : '▼'}</span>
              </div>
              
              {expandedTaskId === task.id && (
                <AIResponseCard taskId={task.id} agentId={agentId} />
              )}
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}

