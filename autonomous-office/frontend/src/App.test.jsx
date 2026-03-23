import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock import.meta.env
vi.stubGlobal('import.meta', {
  env: {
    VITE_API_URL: 'http://localhost:3000'
  }
});

describe('App', () => {
  it('renders correctly', () => {
    // Mock fetch for anything it might hit on mount
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve([])
    }));

    // Mock onboarding done
    localStorage.setItem('onboardingDone', 'true');

    render(<App />);
    expect(screen.getByText(/Autonomiczne Biuro/i)).toBeInTheDocument();
  });
});
