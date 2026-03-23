import React, { useEffect, useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

export default function TemplateLoader() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/templates`)
      .then(res => res.json())
      .then(setTemplates)
      .catch(console.error);
  }, []);

  const loadTemplate = async (id) => {
    setLoading(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/templates/${id}/apply`, {
        method: 'POST'
      });
      // W normalnej apce tutaj pokazalibyśmy Toast o sukcesie
      alert('Szablon załadowany pomyślnie. Nowe role zostały zaktualizowane w bazie.');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 style={{ margin: '0 0 1rem 0' }}>Wczytaj gotowy szablon firmy</h2>
      <p style={{ color: 'var(--color-text-2)', marginBottom: '1rem' }}>Szybko uruchom nowych agentów opartych na predefiniowanych schematach.</p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {templates.map(t => (
          <Button 
            key={t.id} 
            variant="secondary" 
            disabled={loading}
            onClick={() => loadTemplate(t.id)}
          >
            {t.name}
          </Button>
        ))}
      </div>
    </Card>
  );
}
