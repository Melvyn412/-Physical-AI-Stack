import React, { useState, useEffect } from 'react';
import { 
  Activity, Users, Building2, Globe2, ShieldAlert, 
  TrendingUp, Clock, ArrowUpRight, Search, Filter, 
  Download, RefreshCw, Sparkles, ExternalLink, 
  CheckCircle2, ChevronRight, Eye, Laptop, 
  Share2, Zap, Radio, Layers, BarChart3, 
  Terminal, ShieldCheck, FileSpreadsheet, Copy, Check
} from 'lucide-react';
import { IdentifiedCompany, AnalyticsSummary, ActiveTab } from '../types';

interface ExecutiveAnalyticsDashboardProps {
  onNavigateTab?: (tab: ActiveTab) => void;
}

type SubTab = 'companies' | 'funnel' | 'campaigns' | 'integrations';

export const ExecutiveAnalyticsDashboard: React.FC<ExecutiveAnalyticsDashboardProps> = ({ onNavigateTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('companies');
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [companies, setCompanies] = useState<IdentifiedCompany[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [industryFilter, setIndustryFilter] = useState<string>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<IdentifiedCompany | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationToast, setSimulationToast] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Fetch live stats & identified companies
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, compsRes] = await Promise.all([
        fetch('/api/analytics/stats'),
        fetch(`/api/analytics/companies?industry=${industryFilter === 'ALL' ? '' : industryFilter}&query=${encodeURIComponent(searchQuery)}`)
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (compsRes.ok) {
        const compsData = await compsRes.json();
        setCompanies(compsData.companies || []);
      }
    } catch (err) {
      console.warn('Failed to fetch analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // 15s live refresh
    return () => clearInterval(interval);
  }, [industryFilter]);

  // Handle Search submit / debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`/api/analytics/companies?industry=${industryFilter === 'ALL' ? '' : industryFilter}&query=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.companies) setCompanies(data.companies);
        })
        .catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Simulate an incoming live B2B visitor
  const handleSimulateVisitor = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/analytics/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        setSimulationToast(`Live Visitor Identified: ${data.company.name} (${data.company.location})`);
        await fetchData();
        setTimeout(() => setSimulationToast(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    window.location.href = '/api/analytics/export-csv';
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const industries = [
    { id: 'ALL', label: 'All Industries' },
    { id: 'Defense & Aerospace', label: 'Defense & Aerospace' },
    { id: 'Surgical & Medical', label: 'Surgical & Medical' },
    { id: 'Autonomous Systems', label: 'Autonomous Systems' },
    { id: 'Industrial Robotics', label: 'Industrial Robotics' },
    { id: 'Research & Government', label: 'Research & Gov' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn font-sans pb-16">
      {/* Simulation Alert Banner */}
      {simulationToast && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-indigo-500/20 border border-emerald-500/50 flex items-center justify-between text-sm shadow-xl shadow-emerald-500/10 animate-bounce">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-300 font-mono font-bold">{simulationToast}</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">B2B Reverse-IP Deanonymization Active</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>LIVE B2B TELEMETRY CONSOLE</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Reverse-IP Deanonymization Online</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            Executive Visitor Intelligence & Analytics
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Real-time telemetry showing defense contractors, medical robotics manufacturers, and research labs actively evaluating AIGENESIS, their navigation paths, and 14-day trial conversions.
          </p>
        </div>

        {/* Action Controls */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition cursor-pointer"
            title="Refresh Live Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleSimulateVisitor}
            disabled={isSimulating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-mono font-bold shadow-lg shadow-cyan-600/20 transition cursor-pointer"
            title="Simulate an incoming high-intent defense visit to test deanonymization"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Simulate B2B Visitor</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-mono font-semibold border border-cyan-500/30 hover:border-cyan-400 transition cursor-pointer"
            title="Export deanonymized accounts to CSV (HubSpot & Salesforce compatible)"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Leads CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Active Live Visitors */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>LIVE NOW</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-time</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight flex items-baseline gap-2">
            <span>{stats?.activeNow || 6}</span>
            <span className="text-xs text-emerald-400 font-semibold font-sans">concurrent sessions</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>Local & incoming sessions</span>
          </div>
        </div>

        {/* Identified Enterprise Accounts */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>DEANONYMIZED ACCOUNTS</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight flex items-baseline gap-2">
            <span>{stats?.uniqueCompaniesCount || 10}</span>
            <span className="text-xs text-indigo-400 font-semibold font-sans">companies</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono flex items-center gap-1">
            <span className="text-indigo-400 font-bold">100%</span>
            <span>B2B reverse-IP identified</span>
          </div>
        </div>

        {/* Total Pageviews & Sessions */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>TOTAL PAGEVIEWS</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight flex items-baseline gap-2">
            <span>{stats?.totalPageviews || 382}</span>
            <span className="text-xs text-cyan-400 font-semibold font-sans">views</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 font-bold">+24.8%</span>
            <span>this week</span>
          </div>
        </div>

        {/* 14-Day Pro Trial Conversions */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>14-DAY PRO TRIALS</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight flex items-baseline gap-2">
            <span>{stats?.trialConversionsCount || 19}</span>
            <span className="text-xs text-emerald-400 font-semibold font-sans">trials active</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono flex items-center gap-1">
            <span className="text-emerald-400 font-bold">{stats?.trialConversionRatePct || 3.9}%</span>
            <span>conversion velocity</span>
          </div>
        </div>

        {/* Average High-Intent Duration */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>AVG TIME ON SITE</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight flex items-baseline gap-2">
            <span>6m 52s</span>
            <span className="text-xs text-amber-400 font-semibold font-sans">dwell time</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono flex items-center gap-1">
            <span className="text-amber-400 font-bold">4.8x</span>
            <span>industry benchmark</span>
          </div>
        </div>
      </div>

      {/* Live Recent Activity Ticker */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">Recent Activity Feed:</span>
        </div>
        <div className="flex-1 overflow-x-auto no-scrollbar whitespace-nowrap text-slate-300">
          {stats?.recentActivity?.[0] ? (
            <span className="inline-flex items-center gap-2">
              <span className="text-white font-bold">{stats.recentActivity[0].companyName}</span>
              <span className="text-slate-500">•</span>
              <span className="text-cyan-300">{stats.recentActivity[0].action}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{stats.recentActivity[0].module}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-500">{stats.recentActivity[0].location} ({stats.recentActivity[0].timestamp})</span>
            </span>
          ) : (
            <span>Monitoring live HTTP requests and telemetry events...</span>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto no-scrollbar font-mono text-xs">
        <button
          onClick={() => setActiveSubTab('companies')}
          className={`inline-flex items-center gap-2 px-5 py-3 border-b-2 font-semibold transition cursor-pointer ${
            activeSubTab === 'companies'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Identified B2B Accounts ({companies.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('funnel')}
          className={`inline-flex items-center gap-2 px-5 py-3 border-b-2 font-semibold transition cursor-pointer ${
            activeSubTab === 'funnel'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Conversion Funnel & Attention Matrix</span>
        </button>

        <button
          onClick={() => setActiveSubTab('campaigns')}
          className={`inline-flex items-center gap-2 px-5 py-3 border-b-2 font-semibold transition cursor-pointer ${
            activeSubTab === 'campaigns'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>LinkedIn Campaigns & NATO Demographics</span>
        </button>

        <button
          onClick={() => setActiveSubTab('integrations')}
          className={`inline-flex items-center gap-2 px-5 py-3 border-b-2 font-semibold transition cursor-pointer ${
            activeSubTab === 'integrations'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>External Analytics Setup (GA4 / PostHog)</span>
        </button>
      </div>

      {/* Sub-Tab 1: Identified Enterprise Accounts (Deanonymization Table) */}
      {activeSubTab === 'companies' && (
        <div className="space-y-6">
          {/* Filters & Search Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by company, city, module (e.g. BAE Systems, da Vinci, GPS-Denied)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* Industry Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {industries.map(ind => (
                <button
                  key={ind.id}
                  onClick={() => setIndustryFilter(ind.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition cursor-pointer ${
                    industryFilter === ind.id
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {ind.label}
                </button>
              ))}
            </div>
          </div>

          {/* Companies List */}
          <div className="grid grid-cols-1 gap-4">
            {companies.map((comp) => {
              const isHot = comp.intentLevel === 'HOT LEAD';
              const isTrial = comp.status === 'Trial Activated';

              return (
                <div
                  key={comp.id}
                  className={`p-6 rounded-2xl bg-slate-900 border transition-all duration-200 hover:border-cyan-500/60 ${
                    isTrial
                      ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-900'
                      : isHot
                      ? 'border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Company Identity */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl font-bold font-mono text-cyan-400 shrink-0 shadow-md">
                        {comp.flag}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                            <span>{comp.name}</span>
                            <span className="text-xs text-slate-400 font-sans font-normal">({comp.domain})</span>
                          </h3>

                          {/* Status Badge */}
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                            isTrial 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                              : comp.status === 'Active Now'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {comp.status}
                          </span>

                          {/* Intent Badge */}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                            isHot 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          }`}>
                            Intent: {comp.intentScore}/100 • {comp.intentLevel}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                            {comp.industry}
                          </span>
                          <span>•</span>
                          <span>{comp.location}</span>
                          <span>•</span>
                          <span>{comp.size}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">Campaign: {comp.sourceCampaign}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action & Decision Maker */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                      <div className="text-right hidden sm:block">
                        <div className="text-[11px] text-slate-500 font-mono">Recommended Stakeholder</div>
                        <div className="text-xs text-slate-300 font-mono font-semibold">{comp.likelyDecisionMaker}</div>
                      </div>

                      <button
                        onClick={() => setSelectedCompany(comp)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-mono border border-slate-700 hover:border-cyan-500/40 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Journey</span>
                      </button>
                    </div>
                  </div>

                  {/* Modules Explored Chips */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-mono">Evaluated Modules:</span>
                    {comp.modulesExplored.map((mod, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300"
                      >
                        {mod}
                      </span>
                    ))}
                    <span className="text-[11px] text-slate-500 font-mono ml-auto">
                      Last Active: {comp.lastSeen}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Conversion Funnel & Attention Matrix */}
      {activeSubTab === 'funnel' && stats && (
        <div className="space-y-8">
          {/* Conversion Funnel */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <span>Executive Conversion Funnel</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tracking progression from landing page exploration to 14-day free pro trial onboarding.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full font-bold">
                19 Active Trials (3.9% Net Conversion)
              </span>
            </div>

            <div className="space-y-4">
              {stats.funnel.map((step, idx) => {
                const widthPct = Math.max(12, step.conversionPct);
                return (
                  <div key={idx} className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span className="font-semibold text-white">{step.step}</span>
                      <span className="text-cyan-400 font-bold">{step.count} sessions ({step.conversionPct.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Module Attention Heatmap */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Module Attention & Time-Spent Distribution</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Where aerospace and robotics decision-makers spend the highest concentration of engineering time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.topModules.map((mod) => (
                <div key={mod.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
                  <div className="flex justify-between items-start text-xs">
                    <span className="font-bold text-white max-w-[70%]">{mod.name}</span>
                    <span className="text-cyan-400 font-extrabold">{mod.pct}% of visits</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${mod.pct * 3}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{mod.views} recorded sessions</span>
                    <span>Avg dwell: {Math.floor(mod.timeSpentSec / 60)}m {mod.timeSpentSec % 60}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: LinkedIn Campaigns & NATO Demographics */}
      {activeSubTab === 'campaigns' && stats && (
        <div className="space-y-8">
          {/* LinkedIn Campaign Tracker */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-cyan-400" />
                  <span>Outreach Channel & Campaign Attribution</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Performance metrics for the LinkedIn outreach messages crafted for Melvyn and the defense sector.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-3 px-4">Campaign / Referral Channel</th>
                    <th className="py-3 px-4">Visitor Sessions</th>
                    <th className="py-3 px-4">Enterprise Leads</th>
                    <th className="py-3 px-4">Trial Conv. Rate</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stats.topReferrers.map((ref, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        {ref.source.includes('Defence') ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        )}
                        <span>{ref.source}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-bold">{ref.visits}</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-bold">{ref.leads} companies</td>
                      <td className="py-3.5 px-4 text-cyan-300 font-bold">{ref.conversionRate.toFixed(1)}%</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Active Traffic
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* NATO & Geographic Distribution */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-indigo-400" />
              <span>Geographic & Defense Territory Distribution</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.geoDistribution.map((geo, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono space-y-1">
                  <div className="text-xs text-slate-400">{geo.country}</div>
                  <div className="text-xl font-bold text-white">{geo.visits} visits</div>
                  <div className="text-[11px] text-cyan-400">{geo.companies} identified orgs</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: External Analytics Setup (GA4 / PostHog) */}
      {activeSubTab === 'integrations' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <span>Dual-Stream to External Web Analytics Providers</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              While AIGENESIS includes this built-in B2B Deanonymization and live telemetry console out of the box, you can also dual-stream your traffic to Google Analytics 4, PostHog, or B2B IP Deanonymizers (Leadfeeder, Snitcher) by pasting the snippet below into <code className="text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">index.html</code>.
            </p>
          </div>

          {/* GA4 Snippet */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Google Analytics 4 (GA4) Tag
              </span>
              <button
                onClick={() => copyToClipboard(`<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-MEASUREMENT_ID');
</script>`, 'ga4')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              >
                {copiedSnippet === 'ga4' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet === 'ga4' ? 'Copied!' : 'Copy Script'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto text-cyan-300 text-[11px] leading-relaxed">
{`<!-- Google tag (gtag.js) - Replace G-MEASUREMENT_ID with your GA4 ID -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-MEASUREMENT_ID');
</script>`}
            </pre>
          </div>

          {/* PostHog Snippet */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                PostHog (Product Analytics & Session Replay)
              </span>
              <button
                onClick={() => copyToClipboard(`<script>
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init('YOUR_PROJECT_API_KEY', {api_host: 'https://eu.posthog.com'})
</script>`, 'posthog')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              >
                {copiedSnippet === 'posthog' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet === 'posthog' ? 'Copied!' : 'Copy Script'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto text-indigo-300 text-[11px] leading-relaxed">
{`<script>
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init('YOUR_PROJECT_API_KEY', {api_host: 'https://eu.posthog.com'})
</script>`}
            </pre>
          </div>
        </div>
      )}

      {/* Modal / Drawer for Inspecting a Company's Step-by-Step Journey */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedCompany.flag}</span>
                  <h3 className="text-xl font-bold text-white font-mono">{selectedCompany.name}</h3>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedCompany.industry} • {selectedCompany.location} • {selectedCompany.domain}
                </p>
              </div>

              <button
                onClick={() => setSelectedCompany(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Journey Meta Pill */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500">Inbound Campaign: </span>
                <span className="text-emerald-400 font-bold">{selectedCompany.sourceCampaign}</span>
              </div>
              <div>
                <span className="text-slate-500">Likely Stakeholder: </span>
                <span className="text-cyan-300 font-bold">{selectedCompany.likelyDecisionMaker}</span>
              </div>
            </div>

            {/* Chronological Action Timeline */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Chronological Navigation Trace
              </h4>

              <div className="relative pl-6 space-y-6 border-l-2 border-slate-800">
                {selectedCompany.journey.map((item, idx) => (
                  <div key={idx} className="relative group">
                    <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-cyan-400 border-4 border-slate-900" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-white">{item.action}</span>
                        <span className="text-slate-500">{item.timestamp}</span>
                      </div>
                      <div className="text-[11px] font-mono text-cyan-400">
                        Module: {item.module}
                      </div>
                      {item.details && (
                        <div className="text-[11px] text-slate-400 font-sans">
                          {item.details}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-mono">
                Total Visits: {selectedCompany.totalVisits} • Total Pageviews: {selectedCompany.totalPageviews}
              </span>
              <button
                onClick={() => setSelectedCompany(null)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs transition cursor-pointer"
              >
                Close Journey Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
