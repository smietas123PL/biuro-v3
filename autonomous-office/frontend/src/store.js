import { create } from 'zustand';

export const useStore = create((set) => ({
  companyId: 1, // Domyślna firma z bazy (Moja Firma)
  apiKeys: JSON.parse(sessionStorage.getItem('apiKeys')) || {
    openai: '',
    anthropic: '',
    google: ''
  },
  setCompanyId: (id) => set({ companyId: id }),
  setApiKeys: (keys) => {
    sessionStorage.setItem('apiKeys', JSON.stringify(keys));
    set({ apiKeys: keys });
  }
}));
