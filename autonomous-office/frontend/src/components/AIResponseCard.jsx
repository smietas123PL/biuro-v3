import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import CopyButton from './CopyButton';
import Button from './ui/Button';
import ContinueTaskModal from './ContinueTaskModal';

export default function AIResponseCard({ taskId, agentId }) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContinueModal, setShowContinueModal] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}/response`)
      .then(res => res.json())
      .then(data => {
        setResponse(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [taskId]);

  const handleContinue = async (additionalPrompt) => {
    // Logika dodająca nowe zadanie "kontynuujące" poprzedni wątek
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: 1,
          agent_id: agentId,
          description: `Kontynuacja: ${additionalPrompt}`,
          parent_task_id: taskId
        })
      });
      // W realnym scenariuszu można pokazać Toast o sukcesie
    } catch (err) {
      console.error('Failed to continue task:', err);
    }
  };

  if (loading) return <div style={{ padding: '1rem', color: 'var(--color-text-2)' }}>Ładowanie odpowiedzi...</div>;
  if (!response || !response.response) return <div style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Oczekiwanie na wynik (agent przetwarza)...</div>;

  return (
    <div style={{ marginTop: '0.5rem', backgroundColor: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-accent)' }}>
      {showContinueModal && (
        <ContinueTaskModal 
          onClose={() => setShowContinueModal(false)} 
          onContinue={handleContinue} 
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h4 style={{ margin: 0, color: 'var(--color-text)' }}>Odpowiedź AI:</h4>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => setShowContinueModal(true)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>💬 Kontynuuj wątek</Button>
          <CopyButton text={response.response} />
        </div>
      </div>
      <p style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-text-2)' }}>
        {response.response}
      </p>
      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
        Koszt wygenerowania: ${response.cost?.toFixed(4)}
      </div>
    </div>
  );
}
