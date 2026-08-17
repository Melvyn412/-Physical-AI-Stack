import { useState, useEffect, useCallback } from 'react';
import { QuotaUsage, PlanLimits, PlanTier } from '../types';
import { 
  getStoredQuota, 
  saveQuota, 
  PLAN_DEFINITIONS, 
  checkQuota, 
  consumeQuota, 
  updatePlanTier, 
  resetUsageMetrics, 
  simulateExhaustedQuota,
  activatePayPalOrder,
  checkUrlForPayPalCheckout,
  QuotaCheckResult 
} from '../utils/quotaManager';

export function useQuota() {
  const [quota, setQuota] = useState<QuotaUsage>(getStoredQuota());

  useEffect(() => {
    // Check if user just returned from a PayPal checkout redirect
    const ppCheck = checkUrlForPayPalCheckout();
    if (ppCheck.activated) {
      setQuota(getStoredQuota());
    }

    // Sync with backend subscription database
    const current = getStoredQuota();
    if (current.customerEmail || current.paypalOrderId || current.licenseKey) {
      const params = new URLSearchParams();
      if (current.customerEmail) params.append('email', current.customerEmail);
      if (current.paypalOrderId) params.append('orderId', current.paypalOrderId);
      if (current.licenseKey) params.append('apiKey', current.licenseKey);

      fetch(`/api/paypal/subscription-status?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          if (data.hasSubscription && data.subscription) {
            const sub = data.subscription;
            if (sub.status === 'COMPLETED' || sub.status === 'ACTIVE') {
              if (current.plan !== sub.tier || !current.isPayPalActive) {
                activatePayPalOrder({
                  tier: sub.tier,
                  orderId: sub.orderId,
                  payerId: sub.payerId,
                  licenseKey: sub.licenseKey,
                  email: sub.payerEmail,
                  billingCycle: sub.billingCycle
                });
                setQuota(getStoredQuota());
              }
            } else if (sub.status === 'CANCELLED' || sub.status === 'REFUNDED') {
              if (current.plan !== 'developer') {
                updatePlanTier('developer');
                setQuota(getStoredQuota());
              }
            }
          }
        })
        .catch(err => console.warn('[Quota Sync] Backend subscription check failed:', err));
    }

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<QuotaUsage>;
      if (customEvent.detail) {
        setQuota(customEvent.detail);
      } else {
        setQuota(getStoredQuota());
      }
    };

    window.addEventListener('aigenesis_quota_changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('aigenesis_quota_changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const limits: PlanLimits = PLAN_DEFINITIONS[quota.plan] || PLAN_DEFINITIONS.developer;

  const changePlan = useCallback((newPlan: PlanTier) => {
    const updated = updatePlanTier(newPlan);
    setQuota(updated);
  }, []);

  const activatePayPal = useCallback((params: {
    tier: PlanTier;
    orderId?: string;
    payerId?: string;
    licenseKey?: string;
    email?: string;
    billingCycle?: 'monthly' | 'annual';
  }) => {
    const updated = activatePayPalOrder(params);
    setQuota(updated);
  }, []);

  const reset = useCallback(() => {
    const updated = resetUsageMetrics();
    setQuota(updated);
  }, []);

  const fillToLimit = useCallback(() => {
    const updated = simulateExhaustedQuota();
    setQuota(updated);
  }, []);

  const check = useCallback((action: 'ai_synthesize' | 'simulation_run' | 'stress_test' | 'export_code' | 'compliance_audit') => {
    return checkQuota(action);
  }, []);

  const consume = useCallback((action: 'ai_synthesize' | 'simulation_run' | 'stress_test' | 'export_code' | 'compliance_audit') => {
    const res = consumeQuota(action);
    setQuota(getStoredQuota());
    return res;
  }, []);

  return {
    quota,
    limits,
    changePlan,
    activatePayPal,
    reset,
    fillToLimit,
    check,
    consume
  };
}


