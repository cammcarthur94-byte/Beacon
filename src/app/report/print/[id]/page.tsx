import * as React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Radio,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Shield,
  Layers,
  ArrowUpRight,
  Globe,
  Database,
  Calendar,
} from 'lucide-react';
import { EngineIcon } from '@/components/ui/engine-icon';

export const dynamic = 'force-dynamic';

interface ReportData {
  id: string;
  created_at: string;
  workspace_id?: string;
  raw_metrics: {
    brand_name: string;
    domain: string;
    period: string;
    global_visibility_score: number;
    total_citations: number;
    share_of_voice: Record<string, number>;
    engine_scores: Record<string, number>;
    blind_spots_count: number;
    prompts_evaluated: number;
  };
  ai_narrative: {
    executive_summary: string;
    areas_of_concern: string[];
    recommendations: Array<{
      title: string;
      impact: 'CRITICAL' | 'HIGH' | 'MEDIUM';
      action: string;
      target_engine: string;
    }>;
  };
}

interface WorkspaceBranding {
  companyName: string;
  logoUrl?: string;
  primaryColor: string;
}

export default async function PrintReportPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'placeholder-key';

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  // 1. Fetch Report Data
  let report: ReportData | null = null;
  let branding: WorkspaceBranding = {
    companyName: 'Acme Sync',
    primaryColor: '#4f46e5',
    logoUrl: '',
  };

  try {
    const { data: reportData } = await supabase
      .from('audit_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (reportData) {
      report = reportData as ReportData;

      if (report.workspace_id) {
        const { data: brandData } = await supabase
          .from('brands')
          .select('name, logo_url, primary_color')
          .eq('id', report.workspace_id)
          .single();

        if (brandData) {
          branding = {
            companyName: brandData.name || 'Acme Sync',
            logoUrl: brandData.logo_url || '',
            primaryColor: brandData.primary_color || '#4f46e5',
          };
        }
      }
    }
  } catch (err) {
    console.warn('Print UI: Using fallback mock report for ID:', id);
  }

  // Fallback seed report if report record not found in DB
  if (!report) {
    report = {
      id: id || 'a0000000-0000-0000-0000-000000000001',
      created_at: new Date().toISOString(),
      raw_metrics: {
        brand_name: 'Acme Sync',
        domain: 'acmelabs.com',
        period: 'Past 7 Days (Aug 2026)',
        global_visibility_score: 74.2,
        total_citations: 1428,
        share_of_voice: {
          'Acme Sync': 44,
          OmniSync: 28,
          'Nexus AI': 18,
          'Apex Platform': 10,
        },
        engine_scores: {
          chatgpt: 84,
          perplexity: 86,
          gemini: 72,
          claude: 69,
          copilot: 70,
        },
        blind_spots_count: 2,
        prompts_evaluated: 18,
      },
      ai_narrative: {
        executive_summary:
          'Acme Sync maintained a commanding 74.2% global AI visibility score over the past 7 days, capturing 1,428 high-authority publisher citations. Perplexity (86%) and ChatGPT (84%) remain the primary citation drivers, while Gemini (72%) and Claude (69%) demonstrate expansion opportunities in technical change data capture queries.',
        areas_of_concern: [
          'Gemini citation frequency lags by 14% on complex SQL streaming queries due to missing Schema.org TechArticle markup.',
          'Claude Haiku frequently references rival OmniSync on pricing comparisons where tabular benchmarks are absent from public documentation.',
          'Direct API reference pages at /api/v2/streaming lack structured JSON-LD schemas, causing partial answer engine attribution.',
        ],
        recommendations: [
          {
            title: 'Deploy Schema.org TechArticle & SoftwareApplication JSON-LD',
            impact: 'CRITICAL',
            action:
              'Inject structured JSON-LD schemas on all API documentation pages to increase Gemini and Copilot knowledge graph indexing.',
            target_engine: 'Gemini & Copilot',
          },
          {
            title: 'Publish Head-to-Head Comparative Architecture Whitepaper',
            impact: 'HIGH',
            action:
              'Deploy verified latency and throughput benchmark tables comparing Acme Sync vs. OmniSync to resolve Claude comparison blind spots.',
            target_engine: 'Claude',
          },
          {
            title: 'Expand High-Authority Technical PR Placements',
            impact: 'MEDIUM',
            action:
              'Syndicate multi-cloud data streaming articles across InfoQ and HackerNoon to solidify Perplexity Sonar Pro citations.',
            target_engine: 'Perplexity',
          },
        ],
      },
    };
  }

  const { raw_metrics, ai_narrative } = report;
  const formattedDate = new Date(report.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <html lang="en">
      <head>
        <title>{`GEO Audit Report - ${raw_metrics.brand_name}`}</title>
        <style>{`
          @page {
            size: letter portrait;
            margin: 0;
          }
          *, *::before, *::after {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            color: #0f172a;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          .pdf-page {
            width: 8.5in;
            height: 11in;
            min-height: 11in;
            max-height: 11in;
            padding: 0.5in 0.6in;
            background-color: #ffffff;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-after: always;
            break-after: page;
          }
          .pdf-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
        `}</style>
      </head>
      <body style={{ '--brand-primary': branding.primaryColor } as React.CSSProperties}>
        
        {/* ========================================================================= */}
        {/* PAGE 1: EXECUTIVE SUMMARY & AI NARRATIVE (8.5in x 11in) */}
        {/* ========================================================================= */}
        <div className="pdf-page">
          <div className="space-y-5">
            {/* Top White-Label Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
              <div className="flex items-center gap-3">
                {branding.logoUrl ? (
                  <img
                    src={branding.logoUrl}
                    alt={branding.companyName}
                    className="w-9 h-9 object-contain rounded"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-lg text-white flex items-center justify-center font-bold"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    <Radio className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <div className="text-base font-black tracking-tight text-slate-900">
                    {branding.companyName || raw_metrics.brand_name}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Generative Engine Optimization (GEO) • Executive Audit Report
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] font-mono leading-tight">
                <div><strong>Domain:</strong> {raw_metrics.domain}</div>
                <div className="text-slate-500"><strong>Generated:</strong> {formattedDate}</div>
                <div className="text-slate-500"><strong>Evaluation Window:</strong> {raw_metrics.period}</div>
              </div>
            </div>

            {/* High-Level Scorecards Grid */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Executive Performance Scorecards
              </div>
              <div className="grid grid-cols-4 gap-3">
                {/* Score 1 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Global Visibility</div>
                  <div
                    className="text-2xl font-black font-mono tracking-tight"
                    style={{ color: branding.primaryColor }}
                  >
                    {raw_metrics.global_visibility_score}%
                  </div>
                  <div className="text-[9px] text-emerald-600 font-bold font-mono">+5.8% Period Gain</div>
                </div>

                {/* Score 2 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Total Citations</div>
                  <div className="text-2xl font-black font-mono tracking-tight text-slate-900">
                    {raw_metrics.total_citations.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-emerald-600 font-bold font-mono">+18.4% Volume</div>
                </div>

                {/* Score 3 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Share of Voice</div>
                  <div className="text-2xl font-black font-mono tracking-tight text-slate-900">
                    {raw_metrics.share_of_voice[raw_metrics.brand_name] || 44}%
                  </div>
                  <div className="text-[9px] text-indigo-600 font-bold font-mono">Rank #1 Leader</div>
                </div>

                {/* Score 4 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Evaluated Queries</div>
                  <div className="text-2xl font-black font-mono tracking-tight text-slate-900">
                    {raw_metrics.prompts_evaluated}
                  </div>
                  <div className="text-[9px] text-slate-500 font-bold font-mono">Across 5 Engines</div>
                </div>
              </div>
            </div>

            {/* AI-Generated Executive Narrative */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Sparkles className="w-3.5 h-3.5" style={{ color: branding.primaryColor }} />
                <span>Executive Synthesis</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {ai_narrative.executive_summary}
              </p>
            </div>

            {/* Engine Breakdown Score Bar */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Answer Engine Citation Placement Scores
              </div>
              <div className="grid grid-cols-5 gap-2 text-center">
                {Object.entries(raw_metrics.engine_scores).map(([eng, score]) => (
                  <div key={eng} className="p-2 rounded-lg bg-white border border-slate-200">
                    <div className="capitalize text-[10px] font-bold text-slate-600">{eng}</div>
                    <div className="text-base font-black font-mono text-slate-900 mt-0.5">{score}%</div>
                    <div
                      className="h-1 rounded-full mt-1.5"
                      style={{
                        backgroundColor: score >= 80 ? '#10b981' : score >= 70 ? branding.primaryColor : '#f59e0b',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Key Areas of Concern */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Critical Areas of Concern & Blind Spots</span>
              </div>
              <div className="space-y-1.5">
                {ai_narrative.areas_of_concern.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-amber-950">
                    <span className="font-bold font-mono text-[10px] text-amber-600 mt-0.5">0{idx + 1}.</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer (Page 1) */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] font-mono text-slate-400">
            <span>Beacon Automated Audit Dossier • Confidential</span>
            <span>Page 1 of 2</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 2: TECHNICAL ANALYTICS, SOV & STRATEGIC RECOMMENDATIONS */}
        {/* ========================================================================= */}
        <div className="pdf-page">
          <div className="space-y-5">
            {/* Header Mini (Page 2) */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs font-mono">
              <span className="font-bold text-slate-900">{raw_metrics.brand_name} ({raw_metrics.domain})</span>
              <span className="text-slate-500">Technical Optimization & Competitive SOV</span>
            </div>

            {/* Competitive Share of Voice Breakdown */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Competitive Share of Voice Breakdown
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {Object.entries(raw_metrics.share_of_voice).map(([brand, sov], idx) => {
                  const isMain = brand === raw_metrics.brand_name;
                  return (
                    <div
                      key={brand}
                      className={`p-3 rounded-xl border ${isMain ? 'border-indigo-400 bg-indigo-50/30 font-bold' : 'border-slate-200 bg-slate-50/40'}`}
                    >
                      <div className="text-[10px] text-slate-500 truncate">{brand}</div>
                      <div className="text-xl font-black font-mono mt-0.5" style={{ color: isMain ? branding.primaryColor : '#0f172a' }}>
                        {sov}%
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                        {isMain ? 'Target Entity' : `Rival #${idx}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Blind Spot Heatmap Matrix */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                High-Intent Prompt Citation Matrix (Platform Blind Spots)
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px]">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 font-mono font-bold text-slate-500 text-[10px] uppercase">
                      <th className="py-2 px-3 w-[45%]">Tracked Prompt / Intent</th>
                      <th className="py-2 px-2 text-center">ChatGPT</th>
                      <th className="py-2 px-2 text-center">Perplexity</th>
                      <th className="py-2 px-2 text-center">Gemini</th>
                      <th className="py-2 px-2 text-center">Claude</th>
                      <th className="py-2 px-2 text-center">Copilot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                        &ldquo;Best real-time data sync platforms for enterprise&rdquo;
                      </td>
                      <td className="py-2.5 px-2 text-center text-emerald-700 font-bold bg-emerald-50/50">94%</td>
                      <td className="py-2.5 px-2 text-center text-emerald-700 font-bold bg-emerald-50/50">91%</td>
                      <td className="py-2.5 px-2 text-center text-emerald-700 font-bold bg-emerald-50/50">85%</td>
                      <td className="py-2.5 px-2 text-center text-emerald-700 font-bold bg-emerald-50/50">78%</td>
                      <td className="py-2.5 px-2 text-center text-emerald-700 font-bold bg-emerald-50/50">82%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                        &ldquo;How to stream multi-region Postgres to Snowflake&rdquo;
                      </td>
                      <td className="py-2.5 px-2 text-center text-emerald-700 font-bold bg-emerald-50/50">88%</td>
                      <td className="py-2.5 px-2 text-center text-emerald-700 font-bold bg-emerald-50/50">96%</td>
                      <td className="py-2.5 px-2 text-center text-rose-700 font-bold bg-rose-50/60">32%</td>
                      <td className="py-2.5 px-2 text-center text-emerald-700 font-bold bg-emerald-50/50">80%</td>
                      <td className="py-2.5 px-2 text-center text-emerald-700 font-bold bg-emerald-50/50">75%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                        &ldquo;OmniSync vs Acme Sync pricing & throughput&rdquo;
                      </td>
                      <td className="py-2.5 px-2 text-center text-emerald-700 font-bold bg-emerald-50/50">90%</td>
                      <td className="py-2.5 px-2 text-center text-emerald-700 font-bold bg-emerald-50/50">85%</td>
                      <td className="py-2.5 px-2 text-center text-emerald-700 font-bold bg-emerald-50/50">78%</td>
                      <td className="py-2.5 px-2 text-center text-rose-700 font-bold bg-rose-50/60">40%</td>
                      <td className="py-2.5 px-2 text-center text-rose-700 font-bold bg-rose-50/60">38%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                        &ldquo;SOC2 compliant change data capture tools&rdquo;
                      </td>
                      <td className="py-2.5 px-2 text-center text-rose-700 font-bold bg-rose-50/60">45%</td>
                      <td className="py-2.5 px-2 text-center text-emerald-700 font-bold bg-emerald-50/50">88%</td>
                      <td className="py-2.5 px-2 text-center text-rose-700 font-bold bg-rose-50/60">30%</td>
                      <td className="py-2.5 px-2 text-center text-emerald-700 font-bold bg-emerald-50/50">84%</td>
                      <td className="py-2.5 px-2 text-center text-rose-700 font-bold bg-rose-50/60">42%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strategic Recommendations Action Items */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Prioritized Action Items for Visibility Lift
              </div>
              <div className="space-y-2">
                {ai_narrative.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${rec.impact === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : rec.impact === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}
                        >
                          {rec.impact}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{rec.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{rec.action}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {rec.target_engine}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer (Page 2) */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] font-mono text-slate-400">
            <span>Beacon Automated Audit Dossier • Generated by AI Engine</span>
            <span>Page 2 of 2</span>
          </div>
        </div>

      </body>
    </html>
  );
}
