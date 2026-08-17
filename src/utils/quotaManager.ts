import { PlanTier, PlanLimits, QuotaUsage } from '../types';

export const PLAN_DEFINITIONS: Record<PlanTier, PlanLimits> = {
  developer: {
    tier: 'developer',
    name: 'Developer / Free',
    badge: 'Free Forever',
    priceMonthly: 0,
    aiSynthesesLimit: 5,
    simulationsLimit: 50,
    stressTestsLimit: 10,
    exportsLimit: 3,
    hasRos2Export: false,
    hasIsaacSim: false,
    hasSyntheticDataset: false,
    hasComplianceAudit: false,
    hasAirGapped: false,
    seats: 1,
    description: 'Essential sandbox for physical AI evaluation, students, and open research.'
  },
  pro: {
    tier: 'pro',
    name: 'Pro Innovator',
    badge: '★ Most Popular',
    priceMonthly: 79,
    aiSynthesesLimit: 250,
    simulationsLimit: 2500,
    stressTestsLimit: 500,
    exportsLimit: 500,
    hasRos2Export: true,
    hasIsaacSim: true,
    hasSyntheticDataset: false,
    hasComplianceAudit: false,
    hasAirGapped: false,
    seats: 1,
    description: 'High-throughput goal synthesizer with ROS 2 and Isaac Sim export pipelines.'
  },
  team: {
    tier: 'team',
    name: 'Team / Studio',
    badge: 'High Velocity',
    priceMonthly: 399,
    aiSynthesesLimit: 2000,
    simulationsLimit: 25000,
    stressTestsLimit: 5000,
    exportsLimit: 5000,
    hasRos2Export: true,
    hasIsaacSim: true,
    hasSyntheticDataset: true,
    hasComplianceAudit: false,
    hasAirGapped: false,
    seats: 10,
    description: 'Collaborative robotics engineering suites with shared synthetic dataset pipelines.'
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise & Safety',
    badge: 'Zero-Risk SLA',
    priceMonthly: 1500,
    aiSynthesesLimit: 100000, // Effectively Unlimited
    simulationsLimit: 1000000,
    stressTestsLimit: 1000000,
    exportsLimit: 1000000,
    hasRos2Export: true,
    hasIsaacSim: true,
    hasSyntheticDataset: true,
    hasComplianceAudit: true,
    hasAirGapped: true,
    seats: 100,
    description: 'Air-gapped VPC containers, ISO 10218 & FDA safety certification, and custom CAD twins.'
  }
};

const STORAGE_KEY = 'aigenesis_user_quota_v1';
const QUOTA_EVENT = 'aigenesis_quota_changed';

export function getDefaultQuota(): QuotaUsage {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  return {
    plan: 'developer',
    aiSynthesesUsed: 1,
    simulationsUsed: 12,
    stressTestsUsed: 3,
    exportsUsed: 1,
    billingPeriodStart: now.toISOString().split('T')[0],
    billingPeriodEnd: nextMonth.toISOString().split('T')[0],
    apiKey: 'eai_dev_free_09x4a'
  };
}

export function getStoredQuota(): QuotaUsage {
  if (typeof window === 'undefined') return getDefaultQuota();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultQuota();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse quota from storage:', e);
    return getDefaultQuota();
  }
}

export function saveQuota(quota: QuotaUsage): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quota));
    window.dispatchEvent(new CustomEvent(QUOTA_EVENT, { detail: quota }));
  } catch (e) {
    console.error('Failed to save quota:', e);
  }
}

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number;
  remaining: number;
  featureLocked?: boolean;
  requiredPlan?: PlanTier;
  planName: string;
}

export function checkQuota(action: 'ai_synthesize' | 'simulation_run' | 'stress_test' | 'export_code' | 'compliance_audit'): QuotaCheckResult {
  const quota = getStoredQuota();
  const limits = PLAN_DEFINITIONS[quota.plan];

  switch (action) {
    case 'ai_synthesize': {
      const current = quota.aiSynthesesUsed;
      const limit = limits.aiSynthesesLimit;
      const remaining = Math.max(0, limit - current);
      if (current >= limit) {
        return {
          allowed: false,
          reason: `You have reached your limit of ${limit} Custom AI Goal Syntheses on the ${limits.name} plan.`,
          current,
          limit,
          remaining: 0,
          requiredPlan: quota.plan === 'developer' ? 'pro' : 'team',
          planName: limits.name
        };
      }
      return { allowed: true, current, limit, remaining, planName: limits.name };
    }

    case 'simulation_run': {
      const current = quota.simulationsUsed;
      const limit = limits.simulationsLimit;
      const remaining = Math.max(0, limit - current);
      if (current >= limit) {
        return {
          allowed: false,
          reason: `You have reached your monthly limit of ${limit} 1000Hz physical simulation runs on the ${limits.name} plan.`,
          current,
          limit,
          remaining: 0,
          requiredPlan: 'pro',
          planName: limits.name
        };
      }
      return { allowed: true, current, limit, remaining, planName: limits.name };
    }

    case 'stress_test': {
      const current = quota.stressTestsUsed;
      const limit = limits.stressTestsLimit;
      const remaining = Math.max(0, limit - current);
      if (current >= limit) {
        return {
          allowed: false,
          reason: `You have reached your limit of ${limit} hardware stress tests on the ${limits.name} plan.`,
          current,
          limit,
          remaining: 0,
          requiredPlan: 'pro',
          planName: limits.name
        };
      }
      return { allowed: true, current, limit, remaining, planName: limits.name };
    }

    case 'export_code': {
      const current = quota.exportsUsed;
      const limit = limits.exportsLimit;
      const remaining = Math.max(0, limit - current);
      if (!limits.hasRos2Export && current >= limit) {
        return {
          allowed: false,
          reason: `Free tier allows up to ${limit} preview exports. Upgrade to Pro Innovator for unlimited ROS 2 & NVIDIA Isaac Sim scripts.`,
          current,
          limit,
          remaining: 0,
          featureLocked: true,
          requiredPlan: 'pro',
          planName: limits.name
        };
      }
      if (current >= limit) {
        return {
          allowed: false,
          reason: `Monthly export limit of ${limit} scripts reached on ${limits.name}.`,
          current,
          limit,
          remaining: 0,
          requiredPlan: 'team',
          planName: limits.name
        };
      }
      return { allowed: true, current, limit, remaining, planName: limits.name };
    }

    case 'compliance_audit': {
      if (!limits.hasComplianceAudit) {
        return {
          allowed: false,
          reason: `Formal ISO 10218 and FDA 14971 Safety Audit certification requires the Enterprise & Safety tier.`,
          current: 0,
          limit: 0,
          remaining: 0,
          featureLocked: true,
          requiredPlan: 'enterprise',
          planName: limits.name
        };
      }
      return { allowed: true, current: 1, limit: 100, remaining: 99, planName: limits.name };
    }

    default:
      return { allowed: true, current: 0, limit: 100, remaining: 100, planName: limits.name };
  }
}

export function consumeQuota(action: 'ai_synthesize' | 'simulation_run' | 'stress_test' | 'export_code' | 'compliance_audit'): QuotaCheckResult {
  const check = checkQuota(action);
  if (!check.allowed) return check;

  const quota = getStoredQuota();
  if (action === 'ai_synthesize') quota.aiSynthesesUsed += 1;
  if (action === 'simulation_run') quota.simulationsUsed += 1;
  if (action === 'stress_test') quota.stressTestsUsed += 1;
  if (action === 'export_code') quota.exportsUsed += 1;

  saveQuota(quota);

  const limits = PLAN_DEFINITIONS[quota.plan];
  const newCurrent = action === 'ai_synthesize' 
    ? quota.aiSynthesesUsed 
    : action === 'simulation_run' 
    ? quota.simulationsUsed 
    : action === 'stress_test' 
    ? quota.stressTestsUsed 
    : quota.exportsUsed;

  const limit = action === 'ai_synthesize'
    ? limits.aiSynthesesLimit
    : action === 'simulation_run'
    ? limits.simulationsLimit
    : action === 'stress_test'
    ? limits.stressTestsLimit
    : limits.exportsLimit;

  return {
    allowed: true,
    current: newCurrent,
    limit,
    remaining: Math.max(0, limit - newCurrent),
    planName: limits.name
  };
}

export function updatePlanTier(plan: PlanTier): QuotaUsage {
  const current = getStoredQuota();
  const updated: QuotaUsage = {
    ...current,
    plan,
    apiKey: plan === 'enterprise' 
      ? 'eai_ent_airgap_9921_vpc' 
      : plan === 'team'
      ? 'eai_team_prod_4410_key'
      : plan === 'pro'
      ? 'eai_pro_live_8943_key'
      : 'eai_dev_free_09x4a'
  };
  saveQuota(updated);
  return updated;
}

export function activatePayPalOrder(params: {
  tier: PlanTier;
  orderId?: string;
  payerId?: string;
  licenseKey?: string;
  email?: string;
  billingCycle?: 'monthly' | 'annual';
}): QuotaUsage {
  const current = getStoredQuota();
  const updated: QuotaUsage = {
    ...current,
    plan: params.tier,
    isPayPalActive: true,
    paypalOrderId: params.orderId || `pp_ord_${Date.now().toString(36)}`,
    paypalPayerId: params.payerId || `pp_payer_${Math.random().toString(36).substring(2, 7)}`,
    licenseKey: params.licenseKey || `PAYPAL-AIGEN-${params.tier.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    customerEmail: params.email || 'customer@aigenesis.tech',
    billingCycle: params.billingCycle || 'monthly',
    apiKey: params.tier === 'enterprise'
      ? `pp_ent_key_${Math.random().toString(36).substring(2, 8)}`
      : params.tier === 'team'
      ? `pp_team_key_${Math.random().toString(36).substring(2, 8)}`
      : `pp_pro_key_${Math.random().toString(36).substring(2, 8)}`
  };
  saveQuota(updated);
  return updated;
}

export function checkUrlForPayPalCheckout(): { activated: boolean; tier?: PlanTier; orderId?: string } {
  if (typeof window === 'undefined') return { activated: false };
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const paypalStatus = urlParams.get('paypal_status') || urlParams.get('checkout_status');
    const tier = urlParams.get('tier') as PlanTier | null;
    const orderId = urlParams.get('order_id') || urlParams.get('token') || undefined;
    const payerId = urlParams.get('PayerID') || undefined;
    const license = urlParams.get('license') || undefined;
    const cycle = (urlParams.get('cycle') as 'monthly' | 'annual') || 'monthly';

    if (paypalStatus === 'success' && tier && ['pro', 'team', 'enterprise'].includes(tier)) {
      activatePayPalOrder({
        tier,
        orderId,
        payerId,
        licenseKey: license,
        billingCycle: cycle,
      });

      // Clean up URL query parameters without reloading
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      return { activated: true, tier, orderId };
    }
  } catch (e) {
    console.error('Failed to process PayPal checkout URL:', e);
  }
  return { activated: false };
}

export function resetUsageMetrics(): QuotaUsage {

  const current = getStoredQuota();
  const updated: QuotaUsage = {
    ...current,
    aiSynthesesUsed: 0,
    simulationsUsed: 0,
    stressTestsUsed: 0,
    exportsUsed: 0
  };
  saveQuota(updated);
  return updated;
}

export function simulateExhaustedQuota(): QuotaUsage {
  const current = getStoredQuota();
  const limits = PLAN_DEFINITIONS[current.plan];
  const updated: QuotaUsage = {
    ...current,
    aiSynthesesUsed: limits.aiSynthesesLimit,
    simulationsUsed: limits.simulationsLimit,
    stressTestsUsed: limits.stressTestsLimit,
    exportsUsed: limits.exportsLimit
  };
  saveQuota(updated);
  return updated;
}
