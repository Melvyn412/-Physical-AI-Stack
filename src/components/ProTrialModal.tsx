import React, { useState } from 'react';
import { 
  X, Sparkles, ShieldCheck, Check, ArrowRight, Zap, 
  CreditCard, Clock, Cpu, CheckCircle2, Lock, Terminal
} from 'lucide-react';
import { useQuota } from '../hooks/useQuota';

interface ProTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrialStarted?: () => void;
}

export const ProTrialModal: React.FC<ProTrialModalProps> = ({
  isOpen,
  onClose,
  onTrialStarted
}) => {
  const { quota, startTrial } = useQuota();
  const [workEmail, setWorkEmail] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isActivating, setIsActivating] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleActivateTrial = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsActivating(true);

    setTimeout(() => {
      startTrial(workEmail.trim() || undefined);
      setIsActivating(false);
      setIsSuccess(true);
      if (onTrialStarted) {
        onTrialStarted();
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-cyan-500/10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 via-emerald-500/20 to-indigo-500/20 border border-cyan-500/40 rounded-2xl shrink-0">
                <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>No Credit Card Required • Zero Risk</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  Start Your 14-Day Pro Trial
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Evaluate real-time 1 kHz kinematics, ROS 2 pipelines, and AI goal syntheses before seeking team procurement.
                </p>
              </div>
            </div>

            {/* Feature List Grid */}
            <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl space-y-2.5 text-xs font-sans">
              <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wide">
                What you unlock immediately:
              </div>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>250 Custom AI Goal Syntheses</strong> across 5 stack layers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>2,500 Physical Simulation Rollouts</strong> at 1000Hz motor loop</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full <strong>ROS 2, MoveIt 2 & NVIDIA Isaac Sim</strong> code exports</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Zero automatic renewal charges</strong> — we never ask for your card</span>
                </li>
              </ul>
            </div>

            {/* Email Form */}
            <form onSubmit={handleActivateTrial} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">
                  Work / University Email <span className="text-slate-500 font-normal">(optional for receipt & key)</span>:
                </label>
                <input
                  type="email"
                  placeholder="e.g. alex.chen@robotics-lab.com"
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isActivating}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isActivating ? (
                    <span>Provisioning 14-Day Sandbox...</span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>Activate 14-Day Pro Access (Instant)</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-500">
                  By activating, you receive 14 days of full Pro tier access. No commitment, cancel anytime.
                </p>
              </div>
            </form>
          </>
        ) : (
          /* Success Screen */
          <div className="py-4 text-center space-y-5">
            <div className="inline-flex p-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white">
                Pro Trial Activated!
              </h3>
              <p className="text-xs text-emerald-300 font-mono">
                14 Days of Full Pro Access Unlocked
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl max-w-md mx-auto space-y-2 text-xs font-mono text-left">
              <div className="flex justify-between text-slate-400">
                <span>Active Tier:</span>
                <span className="text-cyan-400 font-bold">Pro Innovator (14d Trial)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Credit Card Status:</span>
                <span className="text-emerald-400 font-bold">None On File (Zero Charge)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Valid Until:</span>
                <span className="text-slate-200">{quota.trialEndDate || '14 Days from now'}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Start Testing in 5-Layer Simulator →
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
