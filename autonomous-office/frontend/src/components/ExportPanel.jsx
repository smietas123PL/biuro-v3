import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

export default function ExportPanel() {
  const handleExport = async (type) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/companies/1/export/${type}`);
      const data = await res.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `biuro_export_${type}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  return (
    <Card>
      <h2>Eksport Danych</h2>
      <p style={{ color: 'var(--color-text-2)' }}>Pobierz surowe dane (JSON) dotyczące aktywności swojej firmy dla celów zewnętrznej analityki.</p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Button variant="secondary" onClick={() => handleExport('audit')}>Eksport Logów Audytu</Button>
        <Button variant="secondary" onClick={() => handleExport('tasks')}>Eksport Zadań</Button>
        <Button variant="secondary" onClick={() => handleExport('costs')}>Eksport Odpowiedzi LLM (Koszty)</Button>
      </div>
    </Card>
  );
}
