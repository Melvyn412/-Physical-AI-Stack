import { useEffect, useRef } from 'react';
import { ActiveTab } from '../types';

function getOrGenerateId(key: string, prefix: string): string {
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch (_) {
    return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export function useAnalyticsTracker(activeTab: ActiveTab) {
  const visitorIdRef = useRef<string>('');
  const sessionIdRef = useRef<string>('');
  const lastTabRef = useRef<string>('');

  useEffect(() => {
    visitorIdRef.current = getOrGenerateId('aigen_visitor_id', 'vis');
    sessionIdRef.current = getOrGenerateId('aigen_session_id', 'sess');
  }, []);

  // Track pageviews on active tab transition
  useEffect(() => {
    if (activeTab === lastTabRef.current) return;
    lastTabRef.current = activeTab;

    const payload = {
      sessionId: sessionIdRef.current || getOrGenerateId('aigen_session_id', 'sess'),
      visitorId: visitorIdRef.current || getOrGenerateId('aigen_visitor_id', 'vis'),
      tab: activeTab,
      eventType: 'pageview',
      path: `/#${activeTab}`,
      referrer: document.referrer || (window.location.search.includes('utm_source=linkedin') ? 'LinkedIn Defence Outreach' : 'Direct / Executive Referral')
    };

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {
      // Non-blocking telemetry
    });
  }, [activeTab]);

  const trackAction = (actionName: string, details?: Record<string, any>) => {
    const payload = {
      sessionId: sessionIdRef.current || getOrGenerateId('aigen_session_id', 'sess'),
      visitorId: visitorIdRef.current || getOrGenerateId('aigen_visitor_id', 'vis'),
      tab: activeTab,
      eventType: 'action',
      details: { action: actionName, ...details },
      path: `/#${activeTab}`
    };

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {
      // Non-blocking telemetry
    });
  };

  return { trackAction };
}
