import { create } from 'zustand';

interface ThemeStore {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  getSceneColors: () => {
    background: string;
    gridColor: string;
    textColor: string;
    ambientLight: number;
  };
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'dark',
  
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'dark' ? 'light' : 'dark'
  })),
  
  getSceneColors: () => {
    const theme = get().theme;
    return theme === 'dark' ? {
      background: '#0a0a0a',
      gridColor: '#334155',
      textColor: '#ffffff',
      ambientLight: 0.3
    } : {
      background: '#f8fafc',
      gridColor: '#cbd5e1',
      textColor: '#1e293b',
      ambientLight: 0.8
    };
  }
}));
