import React, { useState, useEffect } from 'react';
import { useStore } from '../store';

export default function CompanySelector() {
  const [companies, setCompanies] = useState([]);
  const { companyId, setCompanyId } = useStore();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/companies`)
      .then(res => res.json())
      .then(setCompanies)
      .catch(console.error);
  }, []);

  return (
    <select 
      value={companyId}
      onChange={(e) => setCompanyId(parseInt(e.target.value))}
      style={{ 
        marginLeft: 'var(--space-4)',
        padding: '0.2rem var(--space-2)', 
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--color-surface-2)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        fontSize: '0.9rem'
      }}
    >
      {companies.map(c => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );
}
