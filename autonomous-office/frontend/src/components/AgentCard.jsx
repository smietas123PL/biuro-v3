import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import TaskList from './TaskList';
import AddAgentModal from './AddAgentModal';
import Button from './ui/Button';
import PromptVersionManager from './PromptVersionManager';
import UndoToast from './UndoToast';

export default function AgentCard() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletedAgent, setDeletedAgent] = useState(null);

  const fetchAgents = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/agents`)
      .then(res => res.json())
      .then(data => {
        setAgents(data);
        if (data.length > 0 && !selectedAgent) setSelectedAgent(data[0].id);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleDelete = (id, name, e) => {
    e.stopPropagation();
    fetch(`${import.meta.env.VITE_API_URL}/api/agents/${id}`, { method: 'DELETE' }).then(() => {
       setDeletedAgent({ id, name });
       fetchAgents();
       if (selectedAgent === id) setSelectedAgent(null);
    });
  };

  const handleUndoDelete = () => {
    // Logika powrotu polegałaby na zrobieniu POST do /agents od nowa, tu symulujemy w UI dla MVP
    setDeletedAgent(null);
    fetchAgents(); // Uproszczone z racji braku endpointu /restore
  };

  return (
    <div>
      {showModal && <AddAgentModal onClose={() => setShowModal(false)} onAdded={fetchAgents} />}
      {deletedAgent && (
         <UndoToast 
            message={`Usunięto agenta: ${deletedAgent.name}`} 
            onUndo={handleUndoDelete} 
            onTimeout={() => setDeletedAgent(null)} 
         />
      )}
      
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Agents Dashboard</h2>
          <Button variant="primary" onClick={() => setShowModal(true)}>+ New Agent</Button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {agents.map(agent => (
            <div 
              key={agent.id} 
              style={{ 
                padding: '1rem', 
                border: selectedAgent === agent.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                minWidth: '200px',
                backgroundColor: 'var(--color-surface-2)'
              }}
              onClick={() => setSelectedAgent(agent.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 0.5rem 0' }}>
                <h3 style={{ margin: 0 }}>{agent.name}</h3>
                <span onClick={(e) => handleDelete(agent.id, agent.name, e)} style={{ cursor: 'pointer', color: 'var(--color-danger)', fontSize: '1.2rem' }}>&times;</span>
              </div>
              <p style={{ margin: '0.2rem 0', fontSize: '0.9rem', color: 'var(--color-text-2)' }}>{agent.model}</p>
              <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}>Status: 
                <span style={{ color: agent.status === 'working' ? 'var(--color-warning)' : 'var(--color-accent)', marginLeft: '0.5rem', fontWeight: 'bold' }}>
                  {agent.status}
                </span>
              </p>
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                <strong>Budget:</strong> ${agent.budget?.toFixed(2) || '0.00'} / ${agent.initial_budget?.toFixed(2) || '0.00'}
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {selectedAgent && (
        <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
          <div style={{ flex: 1 }}><TaskList agentId={selectedAgent} /></div>
          <div style={{ flex: 1 }}><PromptVersionManager agentId={selectedAgent} /></div>
        </div>
      )}
    </div>
  );
}

