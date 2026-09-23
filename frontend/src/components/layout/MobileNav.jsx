import { NavLink, useLocation } from 'react-router-dom';
import { Search, Menu, Home } from 'lucide-react';
import { WORKSPACE_NAV } from './workspaceList';
import { cn } from '@/lib/utils';
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const PRIMARY_TABS = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/career-vault', icon: null, label: 'Vault' },
  { href: '/resume-studio', icon: null, label: 'Studio' },
  { href: '/jobs', icon: null, label: 'Jobs' },
];

export default function MobileNav({ onSearch }) {
  const location = useLocation();

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <span className="font-heading text-sm font-bold">
            HireMind <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onSearch}
            className="flex size-9 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-muted-foreground"
            aria-label="Search"
          >
            <Search className="size-4" />
          </button>
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="flex size-9 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-muted-foreground"
                aria-label="Menu"
              >
                <Menu className="size-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="font-heading text-base">
                  HireMind <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI</span>
                </SheetTitle>
              </SheetHeader>
              <SheetBody>
                <nav className="space-y-4">
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
                            end
                            className={({ isActive }) =>
                              cn(
                                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium',
                                isActive
                                  ? 'bg-primary/12 text-primary'
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

      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-border bg-background/90 backdrop-blur md:hidden">
        {PRIMARY_TABS.map((tab) => {
          const active = location.pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.href}
              to={tab.href}
              end={tab.href === '/dashboard'}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium"
            >
              <span
                className={cn(
                  'flex items-center justify-center rounded-md px-3 py-1 transition-colors',
                  active ? 'bg-primary/12 text-primary' : 'text-muted-foreground'
                )}
              >
                {Icon ? <Icon className="size-4" /> : null}
              </span>
              {tab.label}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}