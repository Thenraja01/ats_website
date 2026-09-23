import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const ICONS = { light: Sun, dark: Moon, system: Monitor };

export default function ThemeToggle({ compact = false, className }) {
  const { theme, toggleTheme } = useTheme();
  const Icon = ICONS[theme] || Moon;
  const label = `Theme: ${theme} (click to cycle)`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleTheme}
          aria-label={label}
          className={`flex items-center justify-center rounded-md border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${
            compact ? 'size-8' : 'h-8 w-8'
          } ${className || ''}`}
        >
          <Icon className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}