'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileSearch,
  Archive,
  Users,
  Bell,
  Globe,
  Sparkles,
  Layers,
  Settings,
  Radio,
  ChevronDown,
  Building2,
  CheckCircle2,
  ExternalLink,
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

const SIDEBAR_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Prompts',
    href: '/prompts',
    icon: FileSearch,
  },
  {
    name: 'Archive Audits',
    href: '/dashboard/archive',
    icon: Archive,
  },
  {
    name: 'Competitor Intel',
    href: '/brand-kit',
    icon: Users,
  },
  {
    name: 'Alerts',
    href: '/dashboard/alerts',
    icon: Bell,
    badge: '2',
  },
  {
    name: 'Websites',
    href: '/visibility-matrix',
    icon: Globe,
  },
  {
    name: 'AI Fix Queue',
    href: '/dashboard/actions',
    icon: Sparkles,
    badge: '3',
  },
  {
    name: 'Custom domains',
    href: '/settings',
    icon: Layers,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [selectedBrand, setSelectedBrand] = React.useState(MOCK_BRAND.name);

  return (
    <aside className="w-64 bg-gray-50/90 dark:bg-zinc-950 border-r border-gray-200/80 dark:border-zinc-800/80 flex flex-col justify-between h-screen sticky top-0 z-30 select-none shrink-0">
      <div className="flex flex-col">
        {/* Logo & Platform Header */}
        <div className="h-16 flex items-center px-5 border-b border-gray-200/60 dark:border-zinc-800/60 gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 shadow-sm">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">
                Beacon
              </span>
              <span className="text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                GEO
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-medium">Agentic SEO & AEO</p>
          </div>
        </div>

        {/* Brand Switcher */}
        <div className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center justify-between p-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-100/80 dark:hover:bg-zinc-800 transition-all text-left shadow-2xs group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-md bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {selectedBrand.charAt(0)}
                </div>
                <div className="min-w-0 truncate">
                  <div className="text-xs font-medium text-gray-900 dark:text-zinc-100 truncate">{selectedBrand}</div>
                  <div className="text-[10px] text-gray-500 dark:text-zinc-400 truncate">{MOCK_BRAND.domain}</div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-zinc-300 transition-colors shrink-0 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel className="text-xs font-semibold text-gray-500">Tracked Brands</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setSelectedBrand(MOCK_BRAND.name)}
                className="flex items-center justify-between cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{MOCK_BRAND.name}</span>
                </div>
                {selectedBrand === MOCK_BRAND.name && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs cursor-pointer text-gray-500 hover:text-gray-900">
                + Add Brand...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-1">
          <nav className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href === '/dashboard' && pathname === '/') ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group',
                    isActive
                      ? 'bg-gray-200/80 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 font-semibold shadow-2xs'
                      : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100/70 dark:hover:bg-zinc-900'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive
                          ? 'text-gray-900 dark:text-zinc-100'
                          : 'text-gray-500 dark:text-zinc-400 group-hover:text-gray-900 dark:group-hover:text-zinc-200'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                        isActive
                          ? 'bg-gray-300/80 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100'
                          : 'bg-gray-200/60 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'
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
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-gray-200/60 dark:border-zinc-800/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-semibold text-xs shrink-0">
              CM
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-gray-900 dark:text-zinc-100 truncate">Cam McArthur</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Pro Workspace
              </div>
            </div>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        </div>
      </div>
    </aside>
  );
}
