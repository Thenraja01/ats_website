import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MEDIA = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

export function resolveTheme(theme) {
  if (theme === 'system') {
    return MEDIA && MEDIA.matches ? 'dark' : 'light';
  }
  return theme === 'dark' ? 'dark' : 'light';
}

export function applyTheme(theme) {
  const root = document.documentElement;
  const effective = resolveTheme(theme);
  root.setAttribute('data-theme', effective);
  root.style.colorScheme = effective;
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      toggleTheme: () => {
        const current = get().theme;
        const order = { light: 'dark', dark: 'system', system: 'light' };
        get().setTheme(order[current] || 'light');
      },
    }),
    {
      name: 'hiremind_theme',
      partialize: (s) => ({ theme: s.theme }),
    }
  )
);