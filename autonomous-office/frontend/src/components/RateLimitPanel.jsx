import React, { useEffect, useState } from 'react';
import Card from './ui/Card';

export default function RateLimitPanel() {
  const [tools, setTools] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/companies/1/rate-limits`)
      .then(res => res.json())
      .then(setTools)
      .catch(console.error);
  }, []);

  return (
    <Card>
      <h2>Rate Limits & Narzędzia</h2>
      <p style={{ color: 'var(--color-text-2)' }}>Podgląd zarejestrowanych narzędzi systemowych oraz nałożonych na nich limitów.</p>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
        {tools.map(tool => (
          <li key={tool.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <strong style={{ color: 'var(--color-text)' }}>{tool.name}</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Schema: {tool.schema || '{}'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-accent)' }}>
                Limit: {tool.limit_per_hour === 0 ? 'Brak limitu' : `${tool.limit_per_hour} / godz.`}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
