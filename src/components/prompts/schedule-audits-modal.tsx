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
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Sparkles, CheckCircle2, RotateCw, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAuditSchedule, saveAuditSchedule, ScheduleFrequency } from '@/lib/actions/schedules';

interface ScheduleAuditsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  brandId?: string;
  brandName?: string;
}

export function ScheduleAuditsModal({
  isOpen,
  onOpenChange,
  brandId,
  brandName = 'Your Brand',
}: ScheduleAuditsModalProps) {
  const [frequency, setFrequency] = React.useState<ScheduleFrequency>('weekly');
  const [isEnabled, setIsEnabled] = React.useState(true);
  const [lastRunAt, setLastRunAt] = React.useState<string | null>(null);
  const [nextRunAt, setNextRunAt] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  // Load existing schedule when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setSavedSuccess(false);
      getAuditSchedule(brandId).then((res) => {
        if (res.success && res.data) {
          setFrequency(res.data.frequency || 'weekly');
          setIsEnabled(res.data.is_enabled ?? true);
          setLastRunAt(res.data.last_run_at);
          setNextRunAt(res.data.next_run_at);
        }
        setIsLoading(false);
      });
    }
  }, [isOpen, brandId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await saveAuditSchedule({
      brand_id: brandId,
      frequency,
      is_enabled: isEnabled,
    });
    setIsSaving(false);

    if (res.success && res.data) {
      setNextRunAt(res.data.next_run_at);
      setSavedSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setSavedSuccess(false);
      }, 1200);
    }
  };

  const frequencies: { key: ScheduleFrequency; label: string; desc: string; icon: string }[] = [
    {
      key: 'daily',
      label: 'Daily Audits',
      desc: 'Dispatches prompts once every 24 hours at 00:00 UTC',
      icon: '⚡',
    },
    {
      key: 'weekly',
      label: 'Weekly Audits',
      desc: 'Dispatches prompts every Monday at 00:00 UTC',
      icon: '📅',
    },
    {
      key: 'monthly',
      label: 'Monthly Audits',
      desc: 'Dispatches prompts on the 1st of every month',
      icon: '📊',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 dark:text-white">
                Automated Audit Schedule
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Configure background AI audit intervals powered by Vercel Cron for {brandName}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-xs text-gray-500">
            <RotateCw className="w-5 h-5 text-blue-600 animate-spin" />
            <span>Loading schedule preferences...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            {/* Active Schedule Toggle Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-800/40">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span>Automated Background Auditing</span>
                  <span className={cn(
                    'text-[10px] font-mono px-1.5 py-0.2 rounded font-medium border',
                    isEnabled
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200/60'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 border-gray-200'
                  )}>
                    {isEnabled ? 'Active' : 'Paused'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                  When active, Vercel Cron evaluates all active prompts without manual trigger.
                </p>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            {/* Frequency Selection Options */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                Audit Frequency Interval
              </label>
              <div className="grid grid-cols-1 gap-2">
                {frequencies.map((f) => {
                  const isSelected = frequency === f.key;
                  return (
                    <div
                      key={f.key}
                      onClick={() => setFrequency(f.key)}
                      className={cn(
                        'p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none',
                        isSelected
                          ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 ring-1 ring-blue-500 shadow-xs'
                          : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-700'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">{f.icon}</span>
                        <div>
                          <div className="text-xs font-semibold text-gray-900 dark:text-zinc-100">
                            {f.label}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                            {f.desc}
                          </div>
                        </div>
                      </div>
                      <div className={cn(
                        'w-4 h-4 rounded-full border flex items-center justify-center transition-all',
                        isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 dark:border-zinc-700'
                      )}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Execution Forecast */}
            <div className="p-3 rounded-xl border border-gray-200/60 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-gray-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Next Scheduled Cycle:</span>
                </span>
                <span className="font-mono font-semibold text-gray-900 dark:text-zinc-100">
                  {nextRunAt ? new Date(nextRunAt).toLocaleString() : 'Forecast on save'}
                </span>
              </div>
              {lastRunAt && (
                <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-zinc-500">
                  <span>Last Automated Execution:</span>
                  <span className="font-mono">{new Date(lastRunAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-9 px-4 rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="h-9 px-5 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Schedule Saved!</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Save Schedule</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
