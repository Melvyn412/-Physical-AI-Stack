import React from 'react';
import { 
  X, AlertTriangle, ShieldAlert, Sparkles, Zap, ArrowRight, 
  Check, Lock, RefreshCw, Layers, ShieldCheck, Crown
} from 'lucide-react';
import { PlanTier, PlanLimits } from '../types';
import { PLAN_DEFINITIONS } from '../utils/quotaManager';

interface QuotaBarrierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPricing: () => void;
  onQuickUpgrade: (targetPlan: PlanTier) => void;
  barrierInfo: {
    title: string;
    description: string;
    currentPlan: PlanTier;
    recommendedPlan: PlanTier;
    used: number;
    limit: number;
    featureName: string;
  } | null;
}

export const QuotaBarrierModal: React.FC<QuotaBarrierModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPricing,
  onQuickUpgrade,
  barrierInfo
}) => {
  if (!isOpen || !barrierInfo) return null;

  const currentPlanDef = PLAN_DEFINITIONS[barrierInfo.currentPlan] || PLAN_DEFINITIONS.developer;
  const recommendedPlanDef = PLAN_DEFINITIONS[barrierInfo.recommendedPlan] || PLAN_DEFINITIONS.pro;

  const isFeatureLocked = barrierInfo.limit === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-amber-500/10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="flex items-start gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl shrink-0">
            {isFeatureLocked ? (
              <Lock className="w-6 h-6 text-amber-400 animate-pulse" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-amber-400 animate-pulse" />
            )}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              <span>{isFeatureLocked ? 'Tier Barrier Triggered' : 'Monthly Quota Limit Reached'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
              {barrierInfo.title}
            </h3>
          </div>
        </div>

        {/* Barrier Description & Current Meter */}
        <div className="space-y-4 font-sans text-xs">
          <p className="text-slate-300 leading-relaxed">
            {barrierInfo.description}
          </p>

          {!isFeatureLocked && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{barrierInfo.featureName} Usage:</span>
                <span className="text-amber-400 font-bold">{barrierInfo.used} / {barrierInfo.limit} used (100%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-red-500 h-full w-full" />
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>Current Plan: {currentPlanDef.name}</span>
                <span>Resets on next billing cycle</span>
              </div>
            </div>
          )}

          {/* Recommended Tier Upgrade Card */}
          <div className="p-4 bg-gradient-to-br from-slate-950 to-slate-900 border border-cyan-500/40 rounded-2xl space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">Recommended: {recommendedPlanDef.name}</span>
              </div>
              <span className="text-xs font-bold text-cyan-400">
                ${recommendedPlanDef.priceMonthly}/mo
              </span>
            </div>

            <ul className="space-y-1.5 text-[11px] text-slate-300 font-sans">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span><strong>{recommendedPlanDef.aiSynthesesLimit.toLocaleString()}</strong> Custom AI Goal Syntheses / mo</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span><strong>{recommendedPlanDef.simulationsLimit.toLocaleString()}</strong> 1000Hz Physical Simulation Rollouts</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Full ROS 2 & NVIDIA Isaac Sim Code Exporter</span>
              </li>
            </ul>

            <button
              id="barrier-upgrade-btn"
              onClick={() => {
                onQuickUpgrade(barrierInfo.recommendedPlan);
                onClose();
              }}
              className="w-full py-2.5 bg-[#FFC439] hover:bg-[#F2BA36] active:bg-[#E2AF32] text-[#003087] font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <span className="font-extrabold italic"><span className="text-[#003087]">Pay</span><span className="text-[#0079C1]">Pal</span></span>
              <span className="font-sans font-bold text-slate-900 ml-1">Upgrade to {recommendedPlanDef.name}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => {
              onClose();
              onNavigateToPricing();
            }}
            className="text-cyan-400 hover:text-cyan-300 underline font-mono text-[11px] flex items-center gap-1"
          >
            <span>Compare all 4 plans</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-mono text-xs font-semibold transition-all"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};
