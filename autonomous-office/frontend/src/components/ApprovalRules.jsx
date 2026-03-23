import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

export default function ApprovalRules() {
  const [rules, setRules] = useState([]);
  const [newRuleLabel, setNewRuleLabel] = useState('');

  const fetchRules = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/companies/1/approval-rules`)
      .then(res => res.json())
      .then(setRules)
      .catch(console.error);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!newRuleLabel.trim()) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/companies/1/approval-rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        condition_type: 'cost_exceeds',
        threshold_value: '5.0',
        label: newRuleLabel
      })
    });
    setNewRuleLabel('');
    fetchRules();
  };

  return (
    <Card>
      <h2>Zasady Autoryzacji</h2>
      <p style={{ color: 'var(--color-text-2)' }}>Skonfiguruj, jakie zadania i koszty wymagają zatwierdzenia przez człowieka.</p>

      <form onSubmit={handleAddRule} style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
        <input 
          type="text" 
          value={newRuleLabel} 
          onChange={e => setNewRuleLabel(e.target.value)} 
          placeholder="Nowa reguła (np. Koszt > 5$)"
          style={{ flex: 1, padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
        />
        <Button variant="secondary" type="submit">Dodaj regułę</Button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {rules.map(rule => (
          <li key={rule.id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{rule.label}</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-2)' }}>Condition: {rule.condition_type} &gt; {rule.threshold_value}</div>
            </div>
            <span style={{ color: rule.enabled ? 'var(--color-accent)' : 'var(--color-danger)', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {rule.enabled ? 'AKTYWNA' : 'WYŁĄCZONA'}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
