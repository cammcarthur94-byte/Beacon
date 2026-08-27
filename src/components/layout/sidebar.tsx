'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  Grid3X3,
  Settings,
  Radio,
  ChevronDown,
  Sparkles,
  Building2,
  CheckCircle2,
  ExternalLink,
  CreditCard,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_BRAND } from '@/lib/mock-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NAV_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Action Center',
    href: '/dashboard/actions',
    icon: Zap,
    badge: '3 Fixes',
  },
  {
    name: 'Brand Kit',
    href: '/brand-kit',
    icon: Layers,
    badge: '4 Competitors',
  },
  {
    name: 'Visibility Matrix',
    href: '/visibility-matrix',
    icon: Grid3X3,
    badge: '6 Queries',
  },
  {
    name: 'Billing & Plans',
    href: '/billing',
    icon: CreditCard,
    badge: null,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    badge: null,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [selectedBrand, setSelectedBrand] = React.useState(MOCK_BRAND.name);

  return (
    <aside className="w-64 border-r border-border bg-card/60 backdrop-blur-xl flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div className="flex flex-col">
        {/* Logo & App Title */}
        <div className="h-16 flex items-center px-5 border-b border-border/80 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
                BEACON
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/20">
                GEO
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">Generative Engine Optimization</p>
          </div>
        </div>

        {/* Brand Switcher */}
        <div className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border bg-background/50 hover:bg-accent hover:border-border transition-all text-left group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                  {selectedBrand.charAt(0)}
                </div>
                <div className="min-w-0 truncate">
                  <div className="text-xs font-semibold text-foreground truncate">{selectedBrand}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{MOCK_BRAND.domain}</div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Active Brands</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setSelectedBrand(MOCK_BRAND.name)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="font-medium text-xs">{MOCK_BRAND.name}</span>
                </div>
                {selectedBrand === MOCK_BRAND.name && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                + Connect New Brand...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Navigation */}
        <div className="px-3 py-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-3 pb-2">
            Navigation
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group',
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-md border font-normal',
                        isActive
                          ? 'bg-primary/20 text-primary border-primary/30'
                          : 'bg-muted text-muted-foreground border-border'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Live Engine Audit Monitor Widget */}
        <div className="px-3 mt-4">
          <div className="p-3 rounded-xl border border-border/80 bg-gradient-to-b from-card/80 to-background/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Vercel Cron Active
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-medium">Daily 00:00 UTC</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Automated multi-engine audit runs every 24h across 5 AI platforms.
            </p>
            <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Next Audit: in 7h 42m</span>
              <span className="text-primary hover:underline cursor-pointer flex items-center gap-0.5">
                Logs <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-border/80">
        <div className="flex items-center justify-between p-2 rounded-lg bg-background/40 border border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              AV
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">Alex Vance</div>
              <div className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Pro Workspace
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>
      </div>
    </aside>
  );
}
