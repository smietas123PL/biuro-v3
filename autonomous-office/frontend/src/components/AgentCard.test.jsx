import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AgentCard from './AgentCard';

// Mock import.meta.env
vi.stubGlobal('import.meta', {
  env: {
    VITE_API_URL: 'http://localhost:3000'
  }
});

describe('AgentCard', () => {
  const mockAgents = [
    { id: 1, name: 'Agent 1', model: 'gpt-4', budget: 10, initial_budget: 100, status: 'ready' },
    { id: 2, name: 'Agent 2', model: 'gemini', budget: 5, initial_budget: 50, status: 'working' }
  ];

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
      if (url.includes('/api/agents')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockAgents)
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }));
  });

  it('renders agents dashboard and lists agents', async () => {
    render(<AgentCard />);
    
    expect(screen.getByText('Agents Dashboard')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Agent 1')).toBeInTheDocument();
      expect(screen.getByText('Agent 2')).toBeInTheDocument();
    });
    
    expect(screen.getByText('gpt-4')).toBeInTheDocument();
    expect(screen.getByText('gemini')).toBeInTheDocument();
  });

  it('shows "New Agent" button', () => {
    render(<AgentCard />);
    expect(screen.getByText('+ New Agent')).toBeInTheDocument();
  });
});
