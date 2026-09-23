import { useThemeStore } from '../store/themeStore';
import { Toaster } from 'sonner';

export default function ThemedToaster() {
  const theme = useThemeStore((s) => s.theme);
  const effective = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  return <Toaster position="top-right" theme={effective} richColors closeButton />;
}