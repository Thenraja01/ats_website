import { NavLink } from 'react-router-dom';
import { LogOut, ChevronRight } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { WORKSPACE_NAV } from './workspaceList';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-md">
        <span className="font-heading text-sm font-bold">H</span>
      </div>
      <div>
        <p className="font-heading text-sm leading-tight font-bold">
          HireMind <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI</span>
        </p>
        <p className="text-[10px] leading-tight text-muted-foreground">Career Workspace</p>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const dispatch = useDispatch();
  const { theme, resolved } = useTheme();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center border-b border-border px-4">
        <Brand />
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {WORKSPACE_NAV.map((group) => (
          <div key={group.section}>
            <p className="px-3 pb-1.5 text-[10px] font-semibold tracking-widest text-muted-foreground/70 uppercase">
              {group.section}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/dashboard' || item.href === '/career-vault' || item.href === '/resume-studio' || item.href === '/ats-analyzer' || item.href === '/interview/reports' || item.href === '/interview/project'}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/12 text-primary'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )
                  }
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-sidebar-accent">
              <Avatar className="size-8 border border-border">
                <AvatarFallback className="bg-primary/15 text-primary">ME</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">My Workspace</span>
                <span className="block truncate text-[11px] text-muted-foreground capitalize">
                  {theme} mode · {resolved}
                </span>
              </span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-52">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => dispatch(logout())}>
              <LogOut className="text-destructive" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}