import React, { useEffect, useState } from 'react';
import Card from './ui/Card';

export default function CostDashboard() {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/agents`)
      .then(res => res.json())
      .then(data => setAgents(data))
      .catch(console.error);
  }, []);

  const totalBudget = agents.reduce((acc, a) => acc + (a.initial_budget || 0), 0);
  const remainingBudget = agents.reduce((acc, a) => acc + (a.budget || 0), 0);
  const spentBudget = totalBudget - remainingBudget;

  return (
    <Card>
      <h2>Cost Dashboard</h2>
      <p style={{ color: 'var(--color-text-2)', marginBottom: 'var(--space-4)' }}>Monitorowanie wydatków API w ramach przypisanych budżetów.</p>

      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div style={{ flex: 1, padding: 'var(--space-4)', backgroundColor: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-accent)' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-2)' }}>Total Allocated Budget</p>
          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>${totalBudget.toFixed(2)}</p>
        </div>
        <div style={{ flex: 1, padding: 'var(--space-4)', backgroundColor: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-danger)' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-2)' }}>Total Spent</p>
          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>${spentBudget.toFixed(2)}</p>
        </div>
        <div style={{ flex: 1, padding: 'var(--space-4)', backgroundColor: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-info)' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-2)' }}>Remaining Global Budget</p>
          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>${remainingBudget.toFixed(2)}</p>
        </div>
      </div>

      <h3>Breakdown per Agent</h3>
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: 'var(--space-2)' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            <th style={{ padding: '0.5rem' }}>Agent Name</th>
            <th style={{ padding: '0.5rem' }}>Model</th>
            <th style={{ padding: '0.5rem' }}>Allocated</th>
            <th style={{ padding: '0.5rem' }}>Spent</th>
            <th style={{ padding: '0.5rem' }}>Remaining</th>
          </tr>
        </thead>
        <tbody>
          {agents.map(agent => {
            const spent = (agent.initial_budget || 0) - (agent.budget || 0);
            return (
              <tr key={agent.id} style={{ borderBottom: '1px dashed var(--color-border-2)' }}>
                <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{agent.name}</td>
                <td style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-2)' }}>{agent.model}</td>
                <td style={{ padding: '0.5rem' }}>${(agent.initial_budget || 0).toFixed(2)}</td>
                <td style={{ padding: '0.5rem', color: 'var(--color-danger)' }}>${spent.toFixed(2)}</td>
                <td style={{ padding: '0.5rem', color: 'var(--color-accent)' }}>${(agent.budget || 0).toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
