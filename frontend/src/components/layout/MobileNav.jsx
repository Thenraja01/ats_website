import { NavLink, useLocation } from 'react-router-dom';
import { Search, Menu, LayoutDashboard, FileText, ScanSearch, Mic2, Briefcase } from 'lucide-react';
import { WORKSPACE_NAV } from './workspaceList';
import { cn } from '@/lib/utils';
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const PRIMARY_TABS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Command' },
  { href: '/resumes', icon: FileText, label: 'Resumes' },
  { href: '/ats-analyzer', icon: ScanSearch, label: 'ATS Match' },
  { href: '/interviews', icon: Mic2, label: 'Interview' },
  { href: '/profile', icon: Briefcase, label: 'Vault' },
];

export default function MobileNav({ onSearch }) {
  const location = useLocation();

  return (
    <>
      {/* ── Mobile Top Header ── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#0084FF] to-blue-600 text-white font-bold text-xs shadow-xs">
            H
          </div>
          <span className="font-heading text-sm font-bold">
            HireMind <span className="bg-gradient-to-r from-[#0084FF] to-indigo-500 bg-clip-text text-transparent">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onSearch}
            className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground"
            aria-label="Search"
          >
            <Search className="size-4" />
          </button>
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground"
                aria-label="Menu"
              >
                <Menu className="size-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="font-heading text-base flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-md bg-[#0084FF] text-white font-bold text-xs">
                    H
                  </div>
                  HireMind <span className="bg-gradient-to-r from-[#0084FF] to-indigo-500 bg-clip-text text-transparent">AI</span>
                </SheetTitle>
              </SheetHeader>
              <SheetBody>
                <nav className="space-y-4 pt-2">
                  {WORKSPACE_NAV.map((group) => (
                    <div key={group.section} className="space-y-1">
                      <p className="px-3 pb-1 text-[10px] font-bold tracking-wider text-muted-foreground/75 uppercase">
                        {group.section}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map((item) => (
                          <NavLink
                            key={item.href}
                            to={item.href}
                            end
                            className={({ isActive }) =>
                              cn(
                                'flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                                isActive
                                  ? 'bg-primary/12 text-primary font-semibold'
                                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                              )
                            }
                          >
                            <item.icon className="size-4 shrink-0" />
                            {item.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>
              </SheetBody>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-border/80 bg-background/95 backdrop-blur-xl md:hidden shadow-lg">
        {PRIMARY_TABS.map((tab) => {
          const active = location.pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.href}
              to={tab.href}
              end={tab.href === '/dashboard'}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors"
            >
              <span
                className={cn(
                  'flex items-center justify-center rounded-xl p-1.5 transition-all',
                  active ? 'bg-[#0084FF]/12 text-[#0084FF]' : 'text-muted-foreground'
                )}
              >
                {Icon ? <Icon className="size-4" /> : null}
              </span>
              <span className={active ? 'text-[#0084FF] font-semibold' : 'text-muted-foreground'}>
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}