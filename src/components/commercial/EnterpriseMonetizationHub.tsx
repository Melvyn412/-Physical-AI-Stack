import React, { useState } from 'react';
import { 
  DollarSign, Shield, FileText, Download, CheckCircle2, 
  Sparkles, Layers, Box, Cpu, HardDrive, ShoppingCart, 
  Award, ArrowRight, Zap, Check, Lock, Globe, Building2, 
  FileCode, Terminal, HelpCircle, AlertTriangle, ExternalLink,
  ChevronRight, Calendar, UserCheck, ShieldCheck, Mail
} from 'lucide-react';
import { ActiveTab, PlanTier } from '../../types';
import { useQuota } from '../../hooks/useQuota';

export type CommercialTab = 
  | 'pilot-sow' 
  | 'regulatory-audit' 
  | 'synthetic-data' 
  | 'hardware-dongle' 
  | 'gpu-tokens' 
  | 'air-gapped';

interface EnterpriseMonetizationHubProps {
  initialTab?: CommercialTab;
  onNavigateTab?: (tab: ActiveTab) => void;
  onOpenPricing?: () => void;
}

export const EnterpriseMonetizationHub: React.FC<EnterpriseMonetizationHubProps> = ({
  initialTab = 'pilot-sow',
  onNavigateTab,
  onOpenPricing
}) => {
  const [activeTab, setActiveTab] = useState<CommercialTab>(initialTab);
  const { quota } = useQuota();

  // 1. SOW Generator State
  const [clientCompany, setClientCompany] = useState<string>('BAE Systems Applied Intelligence');
  const [fleetSize, setFleetSize] = useState<number>(25);
  const [targetVertical, setTargetVertical] = useState<'warehouse' | 'surgical' | 'defense' | 'aerospace'>('defense');
  const [selectedSilicon, setSelectedSilicon] = useState<string>('NVIDIA Jetson AGX Orin (64GB)');
  const [selectedStandard, setSelectedStandard] = useState<string>('STANAG 4586 & MIL-STD-810H');
  const [sowSubmitted, setSowSubmitted] = useState<boolean>(false);
  const [copiedSow, setCopiedSow] = useState<boolean>(false);

  // 2. Regulatory Audit State
  const [purchasedAudits, setPurchasedAudits] = useState<string[]>([]);
  const [selectedAuditForPreview, setSelectedAuditForPreview] = useState<string>('fda-surgical');

  // 3. Synthetic Data State
  const [licensedDatasets, setLicensedDatasets] = useState<string[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('dataset-defense-vio');

  // 4. Hardware Dongle State
  const [selectedDongleTier, setSelectedDongleTier] = useState<'standard' | 'extreme'>('extreme');
  const [shippingCountry, setShippingCountry] = useState<string>('United Kingdom');
  const [dongleOrdered, setDongleOrdered] = useState<boolean>(false);

  // 5. GPU Tokens State
  const [tokenBalance, setTokenBalance] = useState<number>(18.5); // Hours
  const [selectedTokenPack, setSelectedTokenPack] = useState<number>(50);

  // 6. Air-Gapped State
  const [airGappedRequested, setAirGappedRequested] = useState<boolean>(false);

  // Calculated Pilot Pricing
  const basePilotFee = 25000;
  const perRobotCost = 600;
  const standardSurcharge = targetVertical === 'defense' ? 12000 : targetVertical === 'surgical' ? 15000 : 5000;
  const totalPilotPrice = basePilotFee + (fleetSize * perRobotCost) + standardSurcharge;
  const calculatedSavings = Math.round(fleetSize * 14500);

  const generatedSowMarkdown = `# ==============================================================================
# STATEMENT OF WORK (SOW) & ENTERPRISE AUTONOMOUS PILOT AGREEMENT
# ISSUED BY: AIGENESIS PHYSICAL AI LTD (UK)
# PREPARED FOR: ${clientCompany.toUpperCase()}
# ==============================================================================

PROJECT CODENAME: PROJECT AETHEL-FRONT-REALIZATION
EFFECTIVE DURATION: 60 CALENDAR DAYS (PHASE 1 DEPLOYMENT)
TOTAL COMMITTED INVESTMENT: £${totalPilotPrice.toLocaleString()} (EXCL. VAT)
ESTIMATED HARDWARE PROTOTYPE DAMAGE AVOIDED: £${calculatedSavings.toLocaleString()} (ROI: ${(calculatedSavings / totalPilotPrice).toFixed(1)}x)

------------------------------------------------------------------------------
1. SCOPE OF TECHNICAL ENGAGEMENT
------------------------------------------------------------------------------
AIGENESIS shall deploy its complete Physical AI & Digital Twin Engine to onboard
and mathematically calibrate ${fleetSize} autonomous units operating in ${targetVertical.toUpperCase()} missions.

• TARGET EDGE SILICON: ${selectedSilicon}
• SAFETY & REGULATORY GATEWAY: ${selectedStandard}
• SIM-TO-REAL ACCURACY TARGET: Ground truth dynamic tracking error <= 0.28%
• MOTOR LOOP INFERENCE BUDGET: Sub-4.0ms deterministic 1000 Hz cycle

------------------------------------------------------------------------------
2. 60-DAY PHASED MILESTONES & DELIVERABLES
------------------------------------------------------------------------------
• MILESTONE 1 (DAYS 1-14): CAD & URDF Ingestion, V-HACD Mass Matrix Identification.
• MILESTONE 2 (DAYS 15-30): HiL CAN-FD / EtherCAT Bus Sniffer Integration & Fault Injection.
• MILESTONE 3 (DAYS 31-45): Edge Silicon TensorRT-LLM FP8 Quantization on Target Boards.
• MILESTONE 4 (DAYS 46-60): ISO/FDA/STANAG Audit-Ready Safety Certificate Sign-off.

------------------------------------------------------------------------------
3. INTELLECTUAL PROPERTY & DATA SOVEREIGNTY
------------------------------------------------------------------------------
• Zero Telemetry Egress: All trained weights and proprietary CAD assemblies remain
  100% the sole and exclusive property of ${clientCompany}.
• Deployment Tier: Sovereign Air-Gapped VPC or Local Secured Hardware Rig.

------------------------------------------------------------------------------
4. EXECUTIVE SIGN-OFF & AUTHORIZATION
------------------------------------------------------------------------------
Client Authorized Officer: __________________________  Date: ____________
AIGENESIS Lead Systems Architect: Dr. Melvyn Davies     Date: ${new Date().toISOString().split('T')[0]}
`;

  return (
    <div className="space-y-8 font-mono text-slate-100 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/70 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enterprise Commercialization & High-Value Revenue Streams</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AIGENESIS Commercial Licensing & Enterprise Suite
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-3xl">
              High-ticket B2B monetization tailored for robotics OEMs, defense contractors, and surgical manufacturers. Generate signed enterprise pilot SOWs, purchase audit-ready regulatory dossiers, license synthetic datasets, order physical HiL gateway kits, and deploy air-gapped clusters.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Pilot Ticket Range</span>
              <span className="text-emerald-400 font-extrabold text-sm">£25k – £120k</span>
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Commercial SLA</span>
              <span className="text-cyan-400 font-extrabold text-sm">15-Min Priority</span>
            </div>
          </div>
        </div>

        {/* 6 Revenue Stream Nav Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-slate-800">
          {[
            { id: 'pilot-sow', label: '1. Pilot SOW Generator', sub: '£25k–£75k Pilot Proposals', icon: FileText, badge: 'High ARR' },
            { id: 'regulatory-audit', label: '2. Regulatory Audit Packs', sub: 'FDA & ISO Dossiers ($5k-$10k)', icon: ShieldCheck, badge: 'Instant Buy' },
            { id: 'synthetic-data', label: '3. Data & Policy Store', sub: 'Pre-Trained LeRobot DaaS', icon: HardDrive, badge: 'Marketplace' },
            { id: 'hardware-dongle', label: '4. Physical HiL Kits', sub: 'WebSerial Hardware Dongles', icon: Box, badge: 'Hardware Rig' },
            { id: 'gpu-tokens', label: '5. Silicon GPU Tokens', sub: 'TensorRT Cloud Compilation', icon: Cpu, badge: 'Usage SaaS' },
            { id: 'air-gapped', label: '6. Sovereign Air-Gap', sub: 'SCIF On-Prem (£150k+/yr)', icon: Lock, badge: 'Defense Tier' }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-3 rounded-2xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                  active
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-white shadow-xl shadow-emerald-500/10 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="text-[8px] px-1.5 py-0.5 rounded font-bold border bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                    {tab.badge}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-[11px] text-white truncate">{tab.label}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{tab.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STREAM 1: Enterprise Pilot & SOW Proposal Generator */}
      {activeTab === 'pilot-sow' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Proposal Configurator */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Enterprise Pilot & SOW Configurator
              </h3>
              <span className="text-[10px] text-emerald-400">Formal Contract</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Company / Organization Name:</label>
                <input
                  type="text"
                  value={clientCompany}
                  onChange={e => setClientCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Robotics Operational Domain:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'defense', label: 'Defense Autonomy' },
                    { id: 'surgical', label: 'Surgical Robotics' },
                    { id: 'warehouse', label: 'Warehouse Logistics' },
                    { id: 'aerospace', label: 'Aerospace & UAVs' }
                  ].map(v => (
                    <button
                      key={v.id}
                      onClick={() => setTargetVertical(v.id as any)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        targetVertical === v.id
                          ? 'bg-emerald-500/20 border-emerald-500/60 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Orchestrated Robot Fleet Size:</span>
                  <span className="text-emerald-400 font-bold">{fleetSize} Autonomous Units</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="100"
                  step="1"
                  value={fleetSize}
                  onChange={e => setFleetSize(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Edge Silicon Target:</label>
                <select
                  value={selectedSilicon}
                  onChange={e => setSelectedSilicon(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-mono text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="NVIDIA Jetson AGX Orin (64GB)">NVIDIA Jetson AGX Orin (64GB)</option>
                  <option value="Hailo-8 M.2 AI Acceleration Core">Hailo-8 M.2 AI Acceleration Core</option>
                  <option value="Tenstorrent Wormhole n150 (RISC-V)">Tenstorrent Wormhole n150 (RISC-V)</option>
                  <option value="Intel x86-64 / Real-Time RT-PREEMPT">Intel x86-64 / Real-Time RT-PREEMPT</option>
                </select>
              </div>

              {/* Financial Summary */}
              <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Fixed 60-Day Pilot Fee:</span>
                  <span className="text-white font-bold">£{totalPilotPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Est. Hardware Damage Saved:</span>
                  <span className="text-emerald-400 font-bold">£{calculatedSavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-900">
                  <span className="text-slate-300 font-bold">Executive ROI Multiple:</span>
                  <span className="text-cyan-400 font-extrabold text-sm">{(calculatedSavings / totalPilotPrice).toFixed(1)}x Return</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live SOW Contract Preview & Sign */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">Synthesized SOW Legal Proposal</h3>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedSowMarkdown);
                    setCopiedSow(true);
                    setTimeout(() => setCopiedSow(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  {copiedSow ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
                  {copiedSow ? 'Copied' : 'Download SOW (.md)'}
                </button>
              </div>

              {/* SOW Text Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] h-96 overflow-y-auto text-slate-300 leading-relaxed">
                <pre>{generatedSowMarkdown}</pre>
              </div>
            </div>

            {/* Submission / Pilot Request Button */}
            <div className="pt-2">
              {sowSubmitted ? (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Proposal authorized and dispatched to AIGENESIS Enterprise Solutions (Ref: SOW-{Math.floor(Math.random() * 8000) + 1000}). Our lead robotics architect will contact you within 15 minutes.</span>
                </div>
              ) : (
                <button
                  onClick={() => setSowSubmitted(true)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Sign & Submit Formal Enterprise Pilot Request (£{totalPilotPrice.toLocaleString()})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STREAM 2: Instant Regulatory Safety Audit Dossier Packs */}
      {activeTab === 'regulatory-audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Instant Regulatory Audit & Compliance Dossier Store
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Audit-ready verification packages for FDA, ISO, and NATO certification. Replaces $150k+ manual safety consulting.
              </p>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              Cryptographically Sealed SHA-256
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 'fda-surgical',
                name: 'FDA 21 CFR 820.30 & IEC 80601-2-77',
                title: 'Surgical Robotics DHF Dossier',
                price: '$7,500',
                priceNum: 7500,
                desc: 'Remote-Centre-of-Motion fulcrum constraint verification (<=0.50mm), trocar collision envelopes, and viscoelastic soft-tissue puncture thresholds.',
                standards: ['FDA 510(k)', 'IEC 62304 Class C', 'ISO 14971']
              },
              {
                id: 'iso-industrial',
                name: 'ISO 13849-1 & ISO 10218-1/2',
                title: 'Industrial Cobot Safety Case',
                price: '$4,999',
                priceNum: 4999,
                desc: 'Performance Level e (PL e) Category 4 safety function evaluation, dynamic speed & separation monitoring (SSM), and sub-millisecond e-stop audit.',
                standards: ['PL e / Cat 4', 'ISO/TS 15066', 'CE Mark']
              },
              {
                id: 'iso-automotive',
                name: 'ISO 26262 ASIL-D & ISO 21448',
                title: 'Autonomous Mobile Robot ASIL-D',
                price: '$8,500',
                priceNum: 8500,
                desc: 'Steer-by-wire failsafe analysis, SOTIF situational hazard triggering condition identification, and hardware architectural metrics (SPFM > 99%).',
                standards: ['ASIL-D', 'ISO 21448 SOTIF', 'VDA 5050']
              },
              {
                id: 'stanag-defense',
                name: 'STANAG 4586 & MIL-STD-810H',
                title: 'Defence Sovereign Assurance Pack',
                price: '$9,999',
                priceNum: 9999,
                desc: 'GPS-denied navigation integrity, Electronic Warfare (EW) anti-jamming factor graph validation, 14.5G vibration stress, and air-gapped security.',
                standards: ['STANAG 4586', 'MIL-STD-810H', 'DEF-STAN 00-56']
              }
            ].map(pack => {
              const isPurchased = purchasedAudits.includes(pack.id);
              return (
                <div
                  key={pack.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase block">{pack.name}</span>
                    <h4 className="font-bold text-sm text-white">{pack.title}</h4>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">{pack.desc}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {pack.standards.map((st, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-900 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-xs">Licensing Fee:</span>
                      <span className="text-emerald-400 font-bold text-base">{pack.price}</span>
                    </div>

                    {isPurchased ? (
                      <button
                        onClick={() => alert(`Downloading cryptographically signed ${pack.title} PDF dossier.`)}
                        className="w-full py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Sealed Dossier (PDF)
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setPurchasedAudits(prev => [...prev, pack.id]);
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Purchase & Export Pack ({pack.price})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STREAM 3: Pre-Trained Foundation Policy & Synthetic Data Store (DaaS) */}
      {activeTab === 'synthetic-data' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Catalog */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  Pre-Trained Policy & Multi-Modal Dataset Marketplace
                </h3>
                <span className="text-[10px] text-slate-400 font-sans">
                  Ready-to-train Hugging Face LeRobot, RLDS, and PyTorch HDF5 episodes.
                </span>
              </div>
              <span className="text-[10px] text-cyan-400 font-bold">1000 Hz Clock Synced</span>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'dataset-warehouse',
                  title: 'Warehouse Pallet Picking & Slip Recovery',
                  episodes: '50,000 Episodes (HDF5)',
                  price: '$4,500',
                  sensors: 'RGB-D + GelSight Tactile Shear + 6D Force/Torque',
                  desc: 'Latin hypercube randomized friction (μ: 0.12 - 0.85) and payload mass variations (10kg - 850kg).'
                },
                {
                  id: 'dataset-surgical',
                  title: 'Laparoscopic Needle Driving & Knot Tying',
                  episodes: '25,000 Episodes (RLDS)',
                  price: '$12,000',
                  sensors: 'Dual Stereo RGB + Viscoelastic Puncture Loadcell',
                  desc: 'Sub-millimeter RCM pivot constraints with tissue puncture elastodynamics and tremor attenuation.'
                },
                {
                  id: 'dataset-defense-vio',
                  title: 'GPS-Denied Brownout & EW Radar Ingestion',
                  episodes: '100,000 Episodes (LeRobot)',
                  price: '$18,500',
                  sensors: '18μs DVS Neuromorphic Events + 77 GHz FMCW Radar',
                  desc: 'Zero-visibility sandstorm brownout and adversarial RF barrage jamming trajectories.'
                },
                {
                  id: 'dataset-humanoid',
                  title: '28-DOF Humanoid Whole-Body Dexterous Manipulation',
                  episodes: '75,000 Episodes (PyTorch)',
                  price: '$15,000',
                  sensors: 'Whole-Body Joint Torques + Tactile Fingertip Arrays',
                  desc: 'Bimanual coordination with dynamic ZMP balance stabilization and bilateral force reflection.'
                }
              ].map(ds => {
                const isSelected = selectedDatasetId === ds.id;
                const isLicensed = licensedDatasets.includes(ds.id);
                return (
                  <div
                    key={ds.id}
                    onClick={() => setSelectedDatasetId(ds.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-950 border-cyan-500/60 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{ds.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                          {ds.episodes}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">{ds.desc}</p>
                      <div className="text-[10px] text-slate-500 font-mono">Sensors: {ds.sensors}</div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-2">
                      <span className="text-emerald-400 font-bold text-sm">{ds.price}</span>
                      {isLicensed ? (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Licensed
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLicensedDatasets(prev => [...prev, ds.id]);
                          }}
                          className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          License
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dataset Inspector */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">Dataset Manifest Inspector</h3>
              <span className="text-[10px] text-emerald-400">Verified Schema</span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-[11px] text-slate-300 space-y-2">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">HDF5 Structure (LeRobot v2.1):</span>
              <pre className="text-cyan-300 text-[10px] leading-relaxed">
{`observations/
  ├── images/
  │   ├── cam_wrist_rgb (640x480x3 @ 60Hz)
  │   └── cam_depth_z (640x480 uint16)
  ├── state/
  │   ├── qpos (7-DOF joint angles)
  │   └── qvel (7-DOF joint velocities)
  └── sensors/
      ├── wrist_wrench (6-axis F/T @ 1kHz)
      └── tactile_shear (64x64 normal field)
action/
  └── target_joint_torques (1000 Hz)
metadata/
  ├── LatinHypercube_seed: 0x8F4A2C
  └── SimToReal_Verified_Gap: 0.28%`}
              </pre>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Compatible Foundation Models:</span>
                <span className="text-white font-bold">OpenVLA, π0, Octo, RT-2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Uncompressed Size:</span>
                <span className="text-slate-300">148.4 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Download Transfer Protocol:</span>
                <span className="text-emerald-400 font-mono">High-Speed S3 / Aspera</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STREAM 4: Physical HiL Hardware Gateway Kit & Dongle Store */}
      {activeTab === 'hardware-dongle' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-amber-400" />
                Physical Hardware Gateway Kit & Dongle Store
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Turn any browser into a microsecond CAN-FD & EtherCAT oscilloscope with our pre-flashed isolated hardware transceivers.
              </p>
            </div>
            <span className="text-xs text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
              Hardware + 1-Year SaaS Bundle
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Kit */}
            <div className={`p-6 rounded-3xl border transition-all ${
              selectedDongleTier === 'standard' ? 'bg-slate-950 border-amber-500/80 shadow-xl' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-base text-white">AIGENESIS HiL Gateway Dongle (Standard)</h4>
                  <span className="text-xs text-slate-400 font-sans">For Developer Workstations & Single-Arm Cells</span>
                </div>
                <span className="text-xl font-extrabold text-amber-400">$1,299</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 mb-6 font-sans">
                <p>• <strong>Dual Isolated CAN-FD Transceivers:</strong> ISO 11898-1 up to 8 Mbps payload bitrate.</p>
                <p>• <strong>Pre-Flashed WebSerial Firmware:</strong> Plug-and-play in Google Chrome / Edge with zero drivers.</p>
                <p>• <strong>Hardware Oscilloscope Shunt:</strong> 24V bus sag and transient brownout detector.</p>
                <p>• <strong>Included SaaS License:</strong> 1-Year AIGENESIS Pro Seat ($948 value included).</p>
              </div>

              <button
                onClick={() => setSelectedDongleTier('standard')}
                className={`w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                  selectedDongleTier === 'standard' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {selectedDongleTier === 'standard' ? 'Selected' : 'Select Standard Kit'}
              </button>
            </div>

            {/* Extreme Enterprise Kit */}
            <div className={`p-6 rounded-3xl border transition-all ${
              selectedDongleTier === 'extreme' ? 'bg-slate-950 border-amber-500/80 shadow-xl shadow-amber-500/10' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-base text-white">Extreme Ruggedized HiL Hardware Rig</h4>
                  <span className="text-xs text-slate-400 font-sans">For Factory Floors, DIN-Rail Racks & Production Cells</span>
                </div>
                <span className="text-xl font-extrabold text-amber-400">$2,499</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 mb-6 font-sans">
                <p>• <strong>Quad CAN-FD + Isolated EtherCAT Slave Controller (ESC):</strong> 1000 Hz Beckhoff ET1100 ASIC.</p>
                <p>• <strong>IP67 Waterproof & Ruggedized CNC Aluminum Enclosure:</strong> -40°C to +85°C industrial rating.</p>
                <p>• <strong>Hardware Fault-Injection Matrix:</strong> Dynamic CRC bit corruption, bus-off, and ground loop stress.</p>
                <p>• <strong>Included SaaS License:</strong> 1-Year AIGENESIS Team Seat ($4,788 value included).</p>
              </div>

              <button
                onClick={() => setSelectedDongleTier('extreme')}
                className={`w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                  selectedDongleTier === 'extreme' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {selectedDongleTier === 'extreme' ? 'Selected' : 'Select Extreme Kit'}
              </button>
            </div>
          </div>

          {/* Checkout & Reservation */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Destination:</span>
              <select
                value={shippingCountry}
                onChange={e => setShippingCountry(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                <option value="United Kingdom">United Kingdom (Express Next-Day)</option>
                <option value="United States">United States (DHL Priority 2-Day)</option>
                <option value="Germany">Germany & EU (DHL Express)</option>
                <option value="Japan">Japan & APAC (FedEx International)</option>
              </select>
            </div>

            {dongleOrdered ? (
              <div className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Hardware Kit Reserved. Dispatch confirmation sent to email.
              </div>
            ) : (
              <button
                onClick={() => setDongleOrdered(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-extrabold cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Order Hardware Kit & Reserve 1-Year License ({selectedDongleTier === 'extreme' ? '$2,499' : '$1,299'})
              </button>
            )}
          </div>
        </div>
      )}

      {/* STREAM 5: Edge Silicon GPU Compilation Credit Tokens */}
      {activeTab === 'gpu-tokens' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                Edge Silicon GPU Cloud Compilation Credits
              </h3>
              <span className="text-[10px] text-purple-300">NVIDIA H100 GPU Farm</span>
            </div>

            <p className="text-xs text-slate-400 font-sans">
              Compiling and quantizing 7B–34B parameter Vision-Language-Action models into FP8/INT4 TensorRT-LLM engines requires dedicated GPU clusters.
            </p>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Your Available Compilation Balance:</span>
                <span className="text-2xl font-extrabold text-purple-400 font-mono">{tokenBalance.toFixed(1)} GPU Hours</span>
              </div>
              <span className="text-xs text-slate-400 font-sans">~13 Model Compilations</span>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Select Token Package:</span>
              {[
                { hours: 10, price: '$99', desc: 'Developer Starter Pack ($9.90/hr)' },
                { hours: 50, price: '$399', desc: 'Production Scale Pack ($7.98/hr · 20% Off)' },
                { hours: 250, price: '$1,499', desc: 'Enterprise Foundry Pack ($5.99/hr · 40% Off)' }
              ].map(pk => (
                <div
                  key={pk.hours}
                  onClick={() => setSelectedTokenPack(pk.hours)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                    selectedTokenPack === pk.hours
                      ? 'bg-purple-500/20 border-purple-500/60 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-white">{pk.hours} GPU Compilation Hours</span>
                    <div className="text-[10px] text-slate-400 font-sans">{pk.desc}</div>
                  </div>
                  <span className="text-purple-400 font-bold text-sm">{pk.price}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setTokenBalance(prev => prev + selectedTokenPack);
                alert(`Added ${selectedTokenPack} GPU Compilation Hours to your balance!`);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Top Up GPU Compute Hours
            </button>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">Estimated GPU Burn-Rate Reference</h3>
              <span className="text-[10px] text-slate-400">FP8 Quantization</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-white font-bold block">OpenVLA-7B (TensorRT-LLM FP8 Engine)</span>
                  <span className="text-[10px] text-slate-400">Target: Jetson AGX Orin 64GB</span>
                </div>
                <span className="text-purple-400 font-mono font-bold">1.4 GPU Hours</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-white font-bold block">Physical Intelligence π0 (Flow-Matching Policy)</span>
                  <span className="text-[10px] text-slate-400">Target: Tenstorrent Wormhole n150</span>
                </div>
                <span className="text-purple-400 font-mono font-bold">2.8 GPU Hours</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-white font-bold block">Octo-Base 93M (Hailo Dataflow Compiler)</span>
                  <span className="text-[10px] text-slate-400">Target: Hailo-8 M.2 Module</span>
                </div>
                <span className="text-purple-400 font-mono font-bold">0.6 GPU Hours</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STREAM 6: Sovereign Air-Gapped On-Premises License (£150k – £350k / year) */}
      {activeTab === 'air-gapped' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                Sovereign Air-Gapped On-Premises Enterprise License
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Zero external telemetry egress. Complete platform deployment inside classified SCIFs, air-gapped clusters, or private cloud VPCs.
              </p>
            </div>
            <span className="text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30">
              Tier 4 SCIF Compliant
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-indigo-400 font-mono text-[10px] uppercase font-bold">1. Zero Cloud Egress</span>
              <h4 className="text-white font-bold font-mono">Air-Gapped Kubernetes & Podman</h4>
              <p className="text-slate-400 text-xs">Self-contained OCI container images with local physics solvers and offline license keys. No outbound ping ever leaves your firewall.</p>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-indigo-400 font-mono text-[10px] uppercase font-bold">2. Dedicated Field Architect</span>
              <h4 className="text-white font-bold font-mono">Named Senior Robotics Lead</h4>
              <p className="text-slate-400 text-xs">Guaranteed 15-minute SLA with an assigned physical AI architect to assist your internal team with hardware bringup and calibration.</p>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-indigo-400 font-mono text-[10px] uppercase font-bold">3. Unlimited Seats & Fleet</span>
              <h4 className="text-white font-bold font-mono">Uncapped Sim-to-Real Swarms</h4>
              <p className="text-slate-400 text-xs">Simulate, certify, and orchestrate up to 500+ physical robots without per-seat or compute overage charges.</p>
            </div>
          </div>

          <div className="p-6 bg-slate-950 border border-indigo-500/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block font-mono">Enterprise Air-Gapped Investment:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white font-mono">£150,000 – £350,000</span>
                <span className="text-xs text-slate-400">/ year (Billed Annually via Wire/PO)</span>
              </div>
            </div>

            {airGappedRequested ? (
              <div className="text-emerald-400 text-xs font-bold flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4" /> Enterprise Air-Gapped SCIF deployment packet dispatched to engineering leadership.
              </div>
            ) : (
              <button
                onClick={() => setAirGappedRequested(true)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                Request Sovereign Air-Gapped Deployment Dossier
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
