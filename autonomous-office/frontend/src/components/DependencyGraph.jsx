import React, { useEffect, useState } from 'react';
import Card from './ui/Card';

export default function DependencyGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/companies/1/graph`)
      .then(res => res.json())
      .then(setGraphData)
      .catch(console.error);
  }, []);

  return (
    <Card>
      <h2>Struktura Organizacyjna Agentów</h2>
      <p style={{ color: 'var(--color-text-2)' }}>Wizualizacja hierarchii delegacji i zależności miedzy agentami.</p>
      
      <div style={{ minHeight: '150px', backgroundColor: 'var(--color-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border-2)' }}>
        {graphData.nodes.length === 0 ? (
          <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '2rem' }}>Brak struktury do wyświetlenia.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {graphData.nodes.map(node => {
              const children = graphData.links.filter(l => l.source === node.id).map(l => l.target);
              const parentInfo = graphData.links.find(l => l.target === node.id);
              
              return (
                <li key={node.id} style={{ marginBottom: '0.5rem', display: 'flex', gap: '1rem' }}>
                  <strong>{node.label}</strong> (ID: {node.id})
                  {parentInfo && <span style={{ color: 'var(--color-text-2)' }}>↳ Raportuje do: {parentInfo.source}</span>}
                  {children.length > 0 && <span style={{ color: 'var(--color-accent)' }}>↳ Zarządza: {children.join(', ')}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
