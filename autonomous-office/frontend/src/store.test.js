import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './store';

describe('useStore', () => {
  beforeEach(() => {
    // Reset store state if needed, though Zustand persists in memory for vitest
    // We can also clear sessionStorage as it is used by store.js
    sessionStorage.clear();
  });

  it('initializes with default values', () => {
    const state = useStore.getState();
    expect(state.companyId).toBe(1);
    expect(state.apiKeys.openai).toBe('');
  });

  it('updates companyId via setCompanyId', () => {
    const { setCompanyId } = useStore.getState();
    setCompanyId(5);
    expect(useStore.getState().companyId).toBe(5);
  });

  it('updates apiKeys via setApiKeys and persists to sessionStorage', () => {
    const { setApiKeys } = useStore.getState();
    const newKeys = { openai: 'sk-test', anthropic: 'at-test', google: 'g-test' };
    setApiKeys(newKeys);
    
    expect(useStore.getState().apiKeys.openai).toBe('sk-test');
    expect(JSON.parse(sessionStorage.getItem('apiKeys')).openai).toBe('sk-test');
  });
});
