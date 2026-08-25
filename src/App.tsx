import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StackOverview } from './components/StackOverview';
import { ObjectiveExecutor } from './components/ObjectiveExecutor';
import { ArchitectureImpact } from './components/ArchitectureImpact';
import { PricingPage } from './components/PricingPage';
import { CustomObjectiveModal } from './components/CustomObjectiveModal';
import { Ros2IsaacExporter } from './components/Ros2IsaacExporter';
import { SwarmSandbox } from './components/SwarmSandbox';
import { UrdfKinematicsBuilder } from './components/UrdfKinematicsBuilder';
import { SafetyAuditExporter } from './components/SafetyAuditExporter';
import { HardwareStressSimulator } from './components/HardwareStressSimulator';
import { SlamStudio } from './components/SlamStudio';
import { PidControllerStudio } from './components/PidControllerStudio';
import { KinematicsIkStudio } from './components/KinematicsIkStudio';
import { BehaviorTreeStudio } from './components/BehaviorTreeStudio';
import { QuotaBarrierModal, BarrierData } from './components/QuotaBarrierModal';
import { QuotaUsageModal } from './components/QuotaUsageModal';
import { DynamicDecomposition, StackPillar, ActiveTab, PlanTier } from './types';
import { useQuota } from './hooks/useQuota';
import { Cpu, Sparkles, Activity, Layers, BookOpen, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState<boolean>(false);
  const [barrierModalData, setBarrierModalData] = useState<BarrierData | null>(null);

  const [customDecomposition, setCustomDecomposition] = useState<DynamicDecomposition | null>(null);
  const [customObjectiveTitle, setCustomObjectiveTitle] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  const { quota, limits, changePlan, reset, fillToLimit } = useQuota();

  // Check backend server health & Gemini API key status
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasApiKey === 'boolean') {
          setHasApiKey(data.hasApiKey);
        }
      })
      .catch((err) => {
        console.warn('Health check warning:', err);
      });
  }, []);

  const handleDecomposedCustomGoal = (decomposition: DynamicDecomposition, title: string) => {
    setCustomDecomposition(decomposition);
    setCustomObjectiveTitle(title);
    setActiveTab('simulator');
  };

  const handleSelectPillarFromOverview = (pillarId: StackPillar) => {
    setActiveTab('simulator');
  };

  const handleUpgradePlan = (tier: PlanTier) => {
    changePlan(tier);
    setBarrierModalData(null);
    setActiveTab('pricing');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation Organized by Plans & Editions */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasApiKey={hasApiKey}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
        onOpenQuotaModal={() => setIsQuotaModalOpen(true)}
        onOpenBarrier={setBarrierModalData}
        onSwitchPlan={changePlan}
      />

      {/* Main App Workspace */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-10">
        {activeTab === 'landing' && (
          <LandingPage
            onNavigate={setActiveTab}
            onOpenCustomModal={() => setIsCustomModalOpen(true)}
          />
        )}

        {activeTab === 'simulator' && (
          <div className="space-y-10">
            <ObjectiveExecutor
              customDecomposition={customDecomposition}
              customObjectiveTitle={customObjectiveTitle}
              onOpenCustomModal={() => setIsCustomModalOpen(true)}
            />
            {/* Embedded Live Hardware Stress Test Simulator */}
            <div className="pt-6 border-t border-slate-900">
              <HardwareStressSimulator
                onOpenBarrier={setBarrierModalData}
                onNavigateToPricing={() => setActiveTab('pricing')}
              />
            </div>
          </div>
        )}

        {activeTab === 'slam' && (
          <SlamStudio
            onOpenBarrier={setBarrierModalData}
            onNavigateToPricing={() => setActiveTab('pricing')}
          />
        )}

        {activeTab === 'pid' && (
          <PidControllerStudio
            onOpenBarrier={setBarrierModalData}
            onNavigateToPricing={() => setActiveTab('pricing')}
          />
        )}

        {activeTab === 'ik' && (
          <KinematicsIkStudio
            onOpenBarrier={setBarrierModalData}
            onNavigateToPricing={() => setActiveTab('pricing')}
          />
        )}

        {activeTab === 'bt' && (
          <BehaviorTreeStudio
            onOpenBarrier={setBarrierModalData}
            onNavigateToPricing={() => setActiveTab('pricing')}
          />
        )}

        {activeTab === 'export' && (
          <Ros2IsaacExporter
            onOpenBarrier={setBarrierModalData}
            onNavigateToPricing={() => setActiveTab('pricing')}
          />
        )}

        {activeTab === 'swarm' && (
          <SwarmSandbox
            onOpenBarrier={setBarrierModalData}
            onNavigateToPricing={() => setActiveTab('pricing')}
          />
        )}

        {activeTab === 'kinematics' && (
          <UrdfKinematicsBuilder onOpenBarrier={setBarrierModalData} />
        )}

        {activeTab === 'compliance' && (
          <SafetyAuditExporter
            onOpenBarrier={setBarrierModalData}
            onNavigateToPricing={() => setActiveTab('pricing')}
            onQuickUpgrade={handleUpgradePlan}
          />
        )}

        {activeTab === 'pillars' && (
          <StackOverview onSelectPillar={handleSelectPillarFromOverview} />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureImpact />
        )}

        {activeTab === 'pricing' && (
          <PricingPage
            onOpenQuotaModal={() => setIsQuotaModalOpen(true)}
          />
        )}
      </main>

      {/* Modal for Custom Real-World Goal Decomposition */}
      <CustomObjectiveModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onDecomposed={handleDecomposedCustomGoal}
        onOpenBarrier={setBarrierModalData}
        onNavigateToPricing={() => setActiveTab('pricing')}
      />

      {/* Modal for Quota Usage & Rate Limit Testing */}
      <QuotaUsageModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        quota={quota}
        limits={limits}
        onChangePlan={changePlan}
        onResetUsage={reset}
        onFillToLimit={fillToLimit}
        onNavigateToPricing={() => {
          setIsQuotaModalOpen(false);
          setActiveTab('pricing');
        }}
      />

      {/* Modal for Quota & Tier Barriers */}
      {barrierModalData && (
        <QuotaBarrierModal
          isOpen={!!barrierModalData}
          onClose={() => setBarrierModalData(null)}
          barrierInfo={barrierModalData}
          onNavigateToPricing={() => {
            setBarrierModalData(null);
            setActiveTab('pricing');
          }}
          onQuickUpgrade={handleUpgradePlan}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>AIGENESIS.TECH // Physical Intelligence Tech Stack</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Reasoning</span>
            <span>•</span>
            <span>Agents</span>
            <span>•</span>
            <span>Multimodality</span>
            <span>•</span>
            <span>World Models</span>
            <span>•</span>
            <span>Robotics</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
