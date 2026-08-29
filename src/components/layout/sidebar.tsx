'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FileSearch,
  Users,
  BarChart3,
  History,
  Globe,
  Sparkles,
  Layers,
  Radio,
  ChevronDown,
  Building2,
  CheckCircle2,
  Sliders,
  Settings,
  Activity,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserBrands, DbBrand } from '@/lib/actions/brands';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavSection {
  title?: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Reports', href: '/reports', icon: FileText, badge: 'NEW' },
    ],
  },
  {
    title: 'Research',
    items: [
      { name: 'Prompts', href: '/prompts', icon: FileSearch },
      { name: 'Competitors', href: '/competitors', icon: Users },
      { name: 'Engine Analytics', href: '/engine-analytics', icon: BarChart3 },
      { name: 'Response History', href: '/responses', icon: History },
      { name: 'Source Intelligence', href: '/visibility-matrix', icon: Globe },
    ],
  },
  {
    title: 'Optimization',
    items: [
      { name: 'AI Fix Queue', href: '/actions', icon: Sparkles, badge: '3' },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { name: 'Brand Kit', href: '/brand-kit', icon: Building2 },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];


export function Sidebar() {
  const pathname = usePathname();
  const [brands, setBrands] = React.useState<DbBrand[]>([]);
  const [selectedBrand, setSelectedBrand] = React.useState<DbBrand>({
    id: 'b-default',
    name: 'Acme Sync',
    domain: 'acmelabs.com',
    industry: 'Technology / SaaS',
    description: '',
    competitors: [],
    created_at: new Date().toISOString(),
  });

  React.useEffect(() => {
    getUserBrands().then((res) => {
      if (res.success && res.data.length > 0) {
        setBrands(res.data);
        setSelectedBrand(res.data[0]);
      }
    });
  }, []);

  return (
    <aside className="w-64 bg-gray-50/90 dark:bg-zinc-950 border-r border-gray-200/80 dark:border-zinc-800/80 flex flex-col justify-between h-screen sticky top-0 z-30 select-none shrink-0 overflow-y-auto print:hidden">
      <div className="flex flex-col">
        {/* Logo & Platform Header */}
        <div className="h-16 flex items-center px-5 border-b border-gray-200/60 dark:border-zinc-800/60 gap-3 shrink-0">
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
        <div className="p-3 pb-1 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center justify-between p-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-100/80 dark:hover:bg-zinc-800 transition-all text-left shadow-2xs group cursor-pointer">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-md bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {selectedBrand.name.charAt(0)}
                </div>
                <div className="min-w-0 truncate">
                  <div className="text-xs font-medium text-gray-900 dark:text-zinc-100 truncate">{selectedBrand.name}</div>
                  <div className="text-[10px] text-gray-500 dark:text-zinc-400 truncate">{selectedBrand.domain || 'acmelabs.com'}</div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-zinc-300 transition-colors shrink-0 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel className="text-xs font-semibold text-gray-500">Tracked Brands</DropdownMenuLabel>
              {brands.length > 0 ? (
                brands.map((b) => (
                  <DropdownMenuItem
                    key={b.id}
                    onClick={() => setSelectedBrand(b)}
                    className="flex items-center justify-between cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{b.name}</span>
                    </div>
                    {selectedBrand.id === b.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem
                  onClick={() => setSelectedBrand(selectedBrand)}
                  className="flex items-center justify-between cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{selectedBrand.name}</span>
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <Link href="/brand-kit">
                <DropdownMenuItem className="text-xs cursor-pointer text-gray-500 hover:text-gray-900">
                  + Add / Configure Brand...
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Structured Navigation Sections */}
        <div className="px-3 py-1 space-y-4">
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={section.title || `sec-${sIdx}`} className="space-y-1">
              {section.title && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-1">
                  {section.title}
                </div>
              )}
              <nav className="space-y-0.5">
                {section.items.map((item) => {
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
                        'flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all group',
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
          ))}
        </div>
      </div>

      {/* Footer Area: User Profile */}
      <div className="p-3 border-t border-gray-200/60 dark:border-zinc-800/60 shrink-0">
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


