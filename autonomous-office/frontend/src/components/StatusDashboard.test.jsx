import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import StatusDashboard from './StatusDashboard';

// Mock import.meta.env
vi.stubGlobal('import.meta', {
  env: {
    VITE_API_URL: 'http://localhost:3000'
  }
});

describe('StatusDashboard', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
      if (url.includes('/api/agents')) {
        return Promise.resolve({ json: () => Promise.resolve([{ id: 1 }, { id: 2 }]) });
      }
      if (url.includes('/api/goals')) {
        return Promise.resolve({ json: () => Promise.resolve([{ id: 10 }]) });
      }
      return Promise.resolve({ json: () => Promise.resolve([]) });
    }));
  });

  it('renders and displays statistics', async () => {
    render(<StatusDashboard />);
    
    expect(screen.getByText('System Status')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Active Agents
      expect(screen.getByText('1')).toBeInTheDocument(); // Goals Defined
    });
  });
});
