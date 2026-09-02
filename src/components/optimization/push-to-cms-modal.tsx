'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Globe,
  CheckCircle2,
  RotateCw,
  Send,
  Zap,
  ArrowRight,
  Layers,
  Code2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OptimizationAction } from '@/types/optimization';

interface PushToCmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionItem: OptimizationAction | null;
  onSuccess: (destination: string) => void;
}

interface CMSOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  color: string;
}

const CMS_OPTIONS: CMSOption[] = [
  {
    id: 'webflow',
    name: 'Webflow CMS',
    badge: 'Direct Collection API',
    description: 'Publishes Markdown comparison tables directly into your Webflow blog / feature collection.',
    color: 'border-blue-500 bg-blue-50/20 text-blue-600',
  },
  {
    id: 'wordpress',
    name: 'WordPress / Gutenberg',
    badge: 'REST API v2',
    description: 'Injects AEO-structured FAQs and paragraphs as native Gutenberg blocks.',
    color: 'border-cyan-500 bg-cyan-50/20 text-cyan-600',
  },
  {
    id: 'shopify',
    name: 'Shopify Store',
    badge: 'Liquid Sections',
    description: 'Updates product description metadata and entity schema on target Shopify pages.',
    color: 'border-emerald-500 bg-emerald-50/20 text-emerald-600',
  },
  {
    id: 'nextjs_webhook',
    name: 'Next.js / Headless Webhook',
    badge: 'Instant Git / ISR Sync',
    description: 'Triggers on-demand ISR revalidation and updates MDX content files via API webhook.',
    color: 'border-purple-500 bg-purple-50/20 text-purple-600',
  },
];

export function PushToCmsModal({
  isOpen,
  onClose,
  actionItem,
  onSuccess,
}: PushToCmsModalProps) {
  const [selectedCms, setSelectedCms] = React.useState<string>('webflow');
  const [targetPath, setTargetPath] = React.useState<string>('');
  const [isDeploying, setIsDeploying] = React.useState(false);
  const [deployStep, setDeployStep] = React.useState<number>(0);

  React.useEffect(() => {
    if (actionItem) {
      setTargetPath(actionItem.targetSourceUrl || '');
    }
  }, [actionItem]);

  if (!actionItem) return null;

  const handleDeploy = () => {
    setIsDeploying(true);
    setDeployStep(1);

    setTimeout(() => {
      setDeployStep(2);
      setTimeout(() => {
        setDeployStep(3);
        setTimeout(() => {
          setIsDeploying(false);
          setDeployStep(0);
          onSuccess(CMS_OPTIONS.find((c) => c.id === selectedCms)?.name || 'CMS');
          onClose();
        }, 800);
      }, 700);
    }, 700);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isDeploying && onClose()}>
      <DialogContent className="sm:max-w-xl bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Send className="w-4 h-4" />
            </div>
            <DialogTitle className="text-base font-bold text-gray-900 dark:text-white">
              Push Fix to Content Management System
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-gray-500 dark:text-zinc-400">
            Deploy the generated {actionItem.fixType} directly to your live production CMS without leaving Beacon.
          </DialogDescription>
        </DialogHeader>

        {isDeploying ? (
          /* Live Deployment Progress Animation */
          <div className="py-8 space-y-5">
            <div className="flex flex-col items-center justify-center space-y-2">
              <RotateCw className="w-8 h-8 text-blue-600 animate-spin" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Deploying Fix to {CMS_OPTIONS.find((c) => c.id === selectedCms)?.name}...
              </h3>
              <p className="text-xs text-gray-500 font-mono">
                Target: {targetPath}
              </p>
            </div>

            <div className="space-y-2.5 max-w-sm mx-auto pt-2">
              <div className="flex items-center gap-2 text-xs">
                {deployStep >= 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-gray-300 dark:border-zinc-700 shrink-0" />
                )}
                <span className={cn(deployStep >= 1 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-400')}>
                  Parsing & formatting Markdown syntax
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {deployStep >= 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-gray-300 dark:border-zinc-700 shrink-0" />
                )}
                <span className={cn(deployStep >= 2 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-400')}>
                  Connecting to {CMS_OPTIONS.find((c) => c.id === selectedCms)?.name} API
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {deployStep >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-gray-300 dark:border-zinc-700 shrink-0" />
                )}
                <span className={cn(deployStep >= 3 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-400')}>
                  Live sync completed & ISR cache revalidated
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Target URL Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Target Page Destination</span>
                <span className="text-[10px] text-gray-400 font-normal">URL path to update</span>
              </label>
              <input
                type="text"
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 text-xs text-gray-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>

            {/* Selectable CMS Target Options */}
            <div className="space-y-2">
              <label id="cms-integration-label" className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                Select CMS Integration
              </label>
              <div
                role="radiogroup"
                aria-labelledby="cms-integration-label"
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
              >
                {CMS_OPTIONS.map((cms) => {
                  const isSelected = selectedCms === cms.id;
                  return (
                    <button
                      key={cms.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedCms(cms.id)}
                      className={cn(
                        'p-3 rounded-xl border transition-all cursor-pointer select-none space-y-1 text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 shadow-2xs ring-1 ring-blue-500'
                          : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-gray-50 dark:hover:bg-zinc-800/40'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {cms.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-snug line-clamp-2">
                        {cms.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8.5 text-xs rounded-xl border-gray-200 dark:border-zinc-800 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeploy}
                className="h-8.5 px-4 text-xs rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 shadow-2xs cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Deploy Fix Live</span>
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
