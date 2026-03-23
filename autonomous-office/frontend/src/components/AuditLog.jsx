import React, { useEffect, useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = () => {
    setLoading(true);
    fetch(import.meta.env.VITE_API_URL + '/api/audit')
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>System Audit Log</h2>
        <Button variant="secondary" onClick={fetchLogs} disabled={loading}>
          {loading ? 'Odświeżanie...' : 'Odśwież Logi'}
        </Button>
      </div>

      <div style={{ maxHeight: '500px', overflowY: 'auto', backgroundColor: 'var(--color-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
        {logs.length === 0 ? (
          <p style={{ color: 'var(--color-text-2)', textAlign: 'center' }}>Brak zdarzeń w systemie.</p>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '0.5rem', width: '20%' }}>Data</th>
                <th style={{ padding: '0.5rem', width: '20%' }}>Agent</th>
                <th style={{ padding: '0.5rem', width: '20%' }}>Akcja</th>
                <th style={{ padding: '0.5rem', width: '40%' }}>Szczegóły</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px dashed var(--color-border-2)' }}>
                  <td style={{ padding: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-2)' }}>{new Date(log.ts).toLocaleString()}</td>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{log.agent_name || 'System'}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.4rem', 
                      borderRadius: 'var(--radius-sm)', 
                      fontSize: '0.75rem',
                      backgroundColor: log.action.includes('ERROR') ? 'var(--color-danger)' : 'var(--color-accent-dim)',
                      color: log.action.includes('ERROR') ? '#fff' : 'var(--color-text)'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem', fontSize: '0.9rem' }}>{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
