import { create } from 'zustand';

export const useStore = create((set) => ({
  companyId: 1, // Domyślna firma z bazy (Moja Firma)
  apiKeys: JSON.parse(localStorage.getItem('apiKeys')) || {
    openai: '',
    anthropic: '',
    google: ''
  },
  setCompanyId: (id) => set({ companyId: id }),
  setApiKeys: (keys) => {
    localStorage.setItem('apiKeys', JSON.stringify(keys));
    set({ apiKeys: keys });
  }
}));
