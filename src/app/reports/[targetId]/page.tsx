'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Printer,
  ArrowLeft,
  RotateCw,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ExecutiveAuditDocument } from '@/components/reports/ExecutiveAuditDocument';
import { GeneratedAuditReport } from '@/app/api/reports/generate/route';

interface ReportPageProps {
  params: { targetId: string };
}

export default function DedicatedReportPage({ params }: ReportPageProps) {
  const { targetId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const auditId = searchParams.get('auditId') || searchParams.get('id');
  const autoPrint = searchParams.get('autoPrint') === 'true' || searchParams.get('print') === 'true';

  const [report, setReport] = React.useState<GeneratedAuditReport | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [isExportingPdf, setIsExportingPdf] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchReport = React.useCallback(async (forceFresh: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const payload: { targetId?: string; auditId?: string } = { targetId };
      if (auditId && !forceFresh) {
        payload.auditId = auditId;
      }

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success && data.report) {
        setReport(data.report);
      } else {
        throw new Error(data.error || 'Failed to generate report');
      }
    } catch (err: any) {
      console.error('Error loading report:', err);
      setError(err.message || 'An unexpected error occurred while compiling the report');
    } finally {
      setIsLoading(false);
    }
  }, [targetId, auditId]);

  React.useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Auto trigger print when loaded if query param requested it
  React.useEffect(() => {
    if (!isLoading && report && autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isLoading, report, autoPrint]);

  const handlePrint = () => {
    window.print();
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await fetchReport(true);
    setIsRegenerating(false);
  };

  const handleDownloadServerlessPdf = () => {
    if (!report?.id) return;
    setIsExportingPdf(true);
    const exportUrl = `/api/export?id=${report.id}`;
    window.open(exportUrl, '_blank');
    setTimeout(() => setIsExportingPdf(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-zinc-950 py-6 px-4 sm:px-6 lg:px-8 print:p-0 print:m-0 print:bg-white">
      {/* ========================================================================= */}
      {/* Top Floating Control Bar (Hidden when Printing) */}
      {/* ========================================================================= */}
      <header className="max-w-5xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 gap-1.5 cursor-pointer"
          >
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </Button>
          <div className="hidden sm:block h-5 w-px bg-slate-200 dark:bg-zinc-800" />
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Executive GEO Audit View</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isLoading || isRegenerating}
            className="rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 gap-1.5 cursor-pointer"
          >
            <RotateCw className={cn('w-4 h-4', isRegenerating && 'animate-spin text-indigo-600')} />
            <span>{isRegenerating ? 'Analyzing...' : 'New Snapshot'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadServerlessPdf}
            disabled={isLoading || !report || isExportingPdf}
            className="rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 gap-1.5 cursor-pointer"
          >
            <Download className={cn('w-4 h-4', isExportingPdf && 'animate-bounce text-indigo-600')} />
            <span>{isExportingPdf ? 'Exporting PDF...' : 'Serverless PDF'}</span>
          </Button>

          <Button
            onClick={handlePrint}
            disabled={isLoading || !report}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print View</span>
          </Button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* Main Content Area */}
      {/* ========================================================================= */}
      <main className="max-w-5xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-8 space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
              <RotateCw className="w-7 h-7 text-indigo-600 animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Compiling Executive Audit Report...
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm">
                Evaluating historical delta shifts, calculating multi-engine Share of Voice, and synthesizing Gemini 3.7 Flash insights.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-3xl bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/50 p-8 space-y-4 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <RotateCw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Unable to generate report
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md">{error}</p>
            <Button onClick={() => fetchReport(true)} className="mt-2 rounded-xl bg-indigo-600 text-white">
              Retry Generation
            </Button>
          </div>
        ) : report ? (
          <ExecutiveAuditDocument report={report} />
        ) : null}
      </main>
    </div>
  );
}
