import React, { useState, useEffect } from 'react';
import Card from './ui/Card';

export default function StatusDashboard() {
  const [stats, setStats] = useState({ agents: 0, goals: 0, pendingTasks: 0 });

  useEffect(() => {
    // W rzeczywistości te dane pochodziłyby z dedykowanego endpointu /api/stats
    // Tutaj wykonujemy parę szybkich strzałów aby odzwierciedlić aktywność MVP
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/agents`).then(r => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/goals`).then(r => r.json())
    ]).then(([agentsData, goalsData]) => {
      setStats({
        agents: agentsData.length || 0,
        goals: goalsData.length || 0,
        pendingTasks: 0 // Mock dla MVP, normalnie np. queue stats
      });
    }).catch(console.error);
  }, []);

  return (
    <Card>
      <h2>System Status</h2>
      <p style={{ color: 'var(--color-accent)' }}>All systems operational.</p>
      
      <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
        <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', flex: 1 }}>
          <h3 style={{ margin: 0, color: 'var(--color-text-2)' }}>Active Agents</h3>
          <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>{stats.agents}</p>
        </div>
        <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', flex: 1 }}>
          <h3 style={{ margin: 0, color: 'var(--color-text-2)' }}>Goals Defined</h3>
          <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>{stats.goals}</p>
        </div>
        <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', flex: 1 }}>
          <h3 style={{ margin: 0, color: 'var(--color-text-2)' }}>Tasks in Queue</h3>
          <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>{stats.pendingTasks}</p>
        </div>
      </div>
    </Card>
  );
}
