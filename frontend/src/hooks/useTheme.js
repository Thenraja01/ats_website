import { applyTheme, resolveTheme, useThemeStore } from '../store/themeStore';

export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  return { theme, resolved: resolveTheme(theme), setTheme, toggleTheme };
}

export { applyTheme };