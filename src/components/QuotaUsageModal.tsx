import React, { useState } from 'react';
import { 
  X, Gauge, Sparkles, Activity, Flame, Terminal, ShieldAlert, CheckCircle2, 
  Crown, RefreshCw, Zap, ArrowRight, ShieldCheck, Lock, AlertTriangle, Key
} from 'lucide-react';
import { PlanTier, PlanLimits, QuotaUsage } from '../types';
import { PLAN_DEFINITIONS } from '../utils/quotaManager';

interface QuotaUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  quota: QuotaUsage;
  limits: PlanLimits;
  onChangePlan: (plan: PlanTier) => void;
  onResetUsage: () => void;
  onFillToLimit: () => void;
  onNavigateToPricing: () => void;
}

export const QuotaUsageModal: React.FC<QuotaUsageModalProps> = ({
  isOpen,
  onClose,
  quota,
  limits,
  onChangePlan,
  onResetUsage,
  onFillToLimit,
  onNavigateToPricing
}) => {
  if (!isOpen) return null;

  const plansList: PlanTier[] = ['developer', 'pro', 'team', 'enterprise'];

  const getPercentage = (used: number, limit: number) => {
    if (limit >= 100000) return Math.min(100, Math.round((used / 500) * 100)); // Enterprise soft representation
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const aiPercent = getPercentage(quota.aiSynthesesUsed, limits.aiSynthesesLimit);
  const simPercent = getPercentage(quota.simulationsUsed, limits.simulationsLimit);
  const stressPercent = getPercentage(quota.stressTestsUsed, limits.stressTestsLimit);
  const exportPercent = getPercentage(quota.exportsUsed, limits.exportsLimit);

  const getBarColor = (percent: number) => {
    if (percent >= 100) return 'bg-gradient-to-r from-amber-500 to-red-500';
    if (percent >= 75) return 'bg-gradient-to-r from-amber-400 to-amber-500';
    return 'bg-gradient-to-r from-emerald-500 to-cyan-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-cyan-500/10 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl">
              <Gauge className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Active Tier: {limits.name}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  {limits.badge}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                Workspace Quota & Rate Limit Barriers
              </h3>
            </div>
          </div>
        </div>

        {/* Plan Switcher Bar */}
        <div className="space-y-2">
          <label className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Switch Active Plan / Tier (Test Barrier System):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {plansList.map((tier) => {
              const def = PLAN_DEFINITIONS[tier];
              const isActive = quota.plan === tier;
              return (
                <button
                  key={tier}
                  onClick={() => onChangePlan(tier)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{def.name.split('/')[0]}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {def.priceMonthly === 0 ? 'Free' : `£${def.priceMonthly}/mo`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Usage Progress Meters */}
        <div className="space-y-4 bg-slate-950/90 border border-slate-800 rounded-2xl p-5">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Current Billing Cycle Quota Usage</span>
            <span className="text-[10px] text-slate-500">Period: {quota.billingPeriodStart} to {quota.billingPeriodEnd}</span>
          </h4>

          {/* Meter 1: AI Goal Syntheses */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Custom AI Goal Syntheses (Gemini):</span>
              </span>
              <span className={`font-bold ${aiPercent >= 100 ? 'text-red-400' : aiPercent >= 80 ? 'text-amber-400' : 'text-cyan-300'}`}>
                {quota.aiSynthesesUsed} / {limits.aiSynthesesLimit >= 100000 ? 'Unlimited' : limits.aiSynthesesLimit}
                <span className="text-[10px] text-slate-500 ml-1">({aiPercent}%)</span>
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-300 ${getBarColor(aiPercent)}`} style={{ width: `${aiPercent}%` }} />
            </div>
            {aiPercent >= 100 && (
              <p className="text-[10px] text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>Barrier Active: Limit reached. Further AI syntheses will prompt an upgrade.</span>
              </p>
            )}
          </div>

          {/* Meter 2: Physical Simulation Rollouts */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>1000Hz Physical Simulation Rollouts:</span>
              </span>
              <span className={`font-bold ${simPercent >= 100 ? 'text-red-400' : 'text-emerald-300'}`}>
                {quota.simulationsUsed} / {limits.simulationsLimit >= 100000 ? 'Unlimited' : limits.simulationsLimit}
                <span className="text-[10px] text-slate-500 ml-1">({simPercent}%)</span>
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-300 ${getBarColor(simPercent)}`} style={{ width: `${simPercent}%` }} />
            </div>
          </div>

          {/* Meter 3: Hardware Stress & Fault Tests */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Hardware Stress & Edge Fault Injections:</span>
              </span>
              <span className={`font-bold ${stressPercent >= 100 ? 'text-red-400' : 'text-amber-300'}`}>
                {quota.stressTestsUsed} / {limits.stressTestsLimit >= 100000 ? 'Unlimited' : limits.stressTestsLimit}
                <span className="text-[10px] text-slate-500 ml-1">({stressPercent}%)</span>
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-300 ${getBarColor(stressPercent)}`} style={{ width: `${stressPercent}%` }} />
            </div>
          </div>

          {/* Meter 4: Code & Kinematic Exports */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>ROS 2 / Isaac Sim Code Exports:</span>
              </span>
              <span className={`font-bold ${exportPercent >= 100 ? 'text-red-400' : 'text-indigo-300'}`}>
                {quota.exportsUsed} / {limits.exportsLimit >= 100000 ? 'Unlimited' : limits.exportsLimit}
                <span className="text-[10px] text-slate-500 ml-1">({exportPercent}%)</span>
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-300 ${getBarColor(exportPercent)}`} style={{ width: `${exportPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Feature Entitlements Matrix Checklist */}
        <div className="space-y-2">
          <h4 className="text-[10px] text-slate-400 uppercase tracking-wider">
            Tier Feature Entitlements:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${limits.hasRos2Export ? 'bg-slate-950 border-emerald-500/30 text-slate-200' : 'bg-slate-950/40 border-slate-800/60 text-slate-500'}`}>
              <span className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>ROS 2 Python / C++ Generator</span>
              </span>
              {limits.hasRos2Export ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-slate-600" />}
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${limits.hasIsaacSim ? 'bg-slate-950 border-emerald-500/30 text-slate-200' : 'bg-slate-950/40 border-slate-800/60 text-slate-500'}`}>
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>NVIDIA Isaac Sim Exporter</span>
              </span>
              {limits.hasIsaacSim ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-slate-600" />}
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${limits.hasSyntheticDataset ? 'bg-slate-950 border-emerald-500/30 text-slate-200' : 'bg-slate-950/40 border-slate-800/60 text-slate-500'}`}>
              <span className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Synthetic Sensor Datasets</span>
              </span>
              {limits.hasSyntheticDataset ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-slate-600" />}
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${limits.hasComplianceAudit ? 'bg-slate-950 border-emerald-500/30 text-slate-200' : 'bg-slate-950/40 border-slate-800/60 text-slate-500'}`}>
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>ISO 10218 / FDA Safety Audit</span>
              </span>
              {limits.hasComplianceAudit ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-slate-600" />}
            </div>
          </div>
        </div>

        {/* Active API Token Box */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400">Active API Token:</span>
            <code className="text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
              {quota.apiKey}
            </code>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase">Authorized</span>
        </div>

        {/* Interactive Testing & Upgrade Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={onResetUsage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Usage (0)</span>
            </button>

            <button
              onClick={onFillToLimit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-all"
              title="Test what happens when quota reaches 100%"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate 100% Limit</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onNavigateToPricing();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            <span>View All Plans & Pricing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
