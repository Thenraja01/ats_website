import { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LogOut, ChevronRight, User, Sparkles, ShieldCheck, Settings, ExternalLink } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { WORKSPACE_NAV } from './workspaceList';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getMasterCareerProfile } from '../../services/careerProfileSync';
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
    <div className="flex items-center gap-3 px-1">
      {/* Elevated Gradient Brand Icon */}
      <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0084FF] via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 ring-1 ring-white/20 transition-transform hover:scale-105">
        <span className="font-heading text-base font-black tracking-tight">H</span>
        <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-sidebar" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="font-heading text-sm font-bold tracking-tight text-foreground">
            HireMind
          </p>
          <span className="rounded-md bg-[#0084FF]/10 px-1.5 py-0.2 text-[10px] font-black text-[#0084FF] border border-[#0084FF]/20">
            AI
          </span>
        </div>
        <p className="text-[10px] font-medium text-muted-foreground/90 truncate">
          Career OS Platform
        </p>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const dispatch = useDispatch();
  const { theme, resolved } = useTheme();
  const authUser = useSelector((state) => state.auth?.user);

  const profile = useMemo(() => getMasterCareerProfile(), []);
  const candidateName = profile?.personalInfo?.fullName || authUser?.name || 'My Workspace';
  const candidateRole = profile?.personalInfo?.headline || authUser?.role || 'Software Engineer';
  const initials = candidateName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'HM';

  const location = useLocation();

  const isItemActive = (href) => {
    if (href === '/dashboard') return location.pathname === '/dashboard';
    if (href === '/resumes') {
      return (
        location.pathname.startsWith('/resume') ||
        location.pathname.startsWith('/builder')
      );
    }
    if (href === '/ats-analyzer') {
      return (
        location.pathname.startsWith('/ats') ||
        location.pathname.startsWith('/jd')
      );
    }
    if (href === '/interviews') {
      return location.pathname.startsWith('/interview');
    }
    if (href === '/learning') {
      return location.pathname.startsWith('/learning');
    }
    if (href === '/profile') {
      return (
        location.pathname.startsWith('/profile') ||
        location.pathname.startsWith('/vault') ||
        location.pathname.startsWith('/career-vault') ||
        location.pathname.startsWith('/portfolio')
      );
    }
    return location.pathname === href;
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 bg-sidebar/95 backdrop-blur-xl shadow-xs lg:flex z-20">
      {/* ── Brand Header ── */}
      <div className="flex h-16 items-center border-b border-border/60 px-4">
        <Brand />
      </div>

      {/* ── Minimalist Navigation Tree ── */}
      <nav className="flex-1 space-y-4 px-3 py-4">
        {WORKSPACE_NAV.map((group) => (
          <div key={group.section} className="space-y-1">
            <p className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-muted-foreground/75 uppercase flex items-center justify-between">
              <span>{group.section}</span>
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isItemActive(item.href);
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-150',
                      active
                        ? 'bg-primary/10 text-primary font-semibold shadow-2xs border border-primary/20 before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-1 before:rounded-r-full before:bg-[#0084FF]'
                        : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'size-4 shrink-0 transition-transform group-hover:scale-110',
                        active && 'text-[#0084FF]'
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Elevated User Footer Widget ── */}
      <div className="border-t border-border/60 p-3 bg-muted/10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 rounded-xl border border-border/50 bg-card/60 p-2 text-left transition-all hover:bg-card hover:border-primary/40 hover:shadow-2xs">
              <div className="relative shrink-0">
                <Avatar className="size-8 border border-border/80">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-card" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-foreground leading-tight">
                  {candidateName}
                </p>
                <p className="truncate text-[10px] text-muted-foreground mt-0.5 leading-tight">
                  {candidateRole}
                </p>
              </div>

              <ChevronRight className="size-3.5 text-muted-foreground/70 shrink-0" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" side="top" className="w-56 rounded-xl">
            <DropdownMenuLabel className="font-normal p-2">
              <p className="text-xs font-bold text-foreground">{candidateName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{authUser?.email || 'Logged in candidate'}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to="/profile" className="flex items-center gap-2 cursor-pointer text-xs">
                <User className="size-3.5 text-muted-foreground" />
                Career Vault Profile
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/settings" className="flex items-center gap-2 cursor-pointer text-xs">
                <Settings className="size-3.5 text-muted-foreground" />
                Workspace Settings
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => dispatch(logout())}
              className="text-xs text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <LogOut className="size-3.5 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}