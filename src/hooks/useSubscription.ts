import { useEffect, useState } from 'react';

export type PlanTier = 'free' | 'pro' | 'enterprise';

const KEY = 'gaai:plan';

export const PLAN_FEATURES: Record<PlanTier, {
  label: string;
  badge: string;
  signalLimit: number;
  watchlistLimit: number;
  premiumSignals: boolean;
  advancedSentiment: boolean;
  portfolioAnalyzer: boolean;
  realtimeAlerts: boolean;
  macroIntel: boolean;
  apiAccess: boolean;
}> = {
  free: {
    label: 'Free',
    badge: 'Free',
    signalLimit: 5,
    watchlistLimit: 5,
    premiumSignals: false,
    advancedSentiment: false,
    portfolioAnalyzer: false,
    realtimeAlerts: false,
    macroIntel: false,
    apiAccess: false,
  },
  pro: {
    label: 'Pro',
    badge: 'Pro',
    signalLimit: Infinity,
    watchlistLimit: Infinity,
    premiumSignals: true,
    advancedSentiment: true,
    portfolioAnalyzer: true,
    realtimeAlerts: true,
    macroIntel: true,
    apiAccess: false,
  },
  enterprise: {
    label: 'Enterprise',
    badge: 'Enterprise',
    signalLimit: Infinity,
    watchlistLimit: Infinity,
    premiumSignals: true,
    advancedSentiment: true,
    portfolioAnalyzer: true,
    realtimeAlerts: true,
    macroIntel: true,
    apiAccess: true,
  },
};

function read(): PlanTier {
  if (typeof window === 'undefined') return 'free';
  const v = localStorage.getItem(KEY) as PlanTier | null;
  return v === 'pro' || v === 'enterprise' ? v : 'free';
}

let listeners: Array<(t: PlanTier) => void> = [];

export function useSubscription() {
  const [plan, setPlan] = useState<PlanTier>(() => read());

  useEffect(() => {
    const l = (t: PlanTier) => setPlan(t);
    listeners.push(l);
    return () => { listeners = listeners.filter(x => x !== l); };
  }, []);

  const setPlanTier = (t: PlanTier) => {
    localStorage.setItem(KEY, t);
    listeners.forEach(l => l(t));
  };

  const features = PLAN_FEATURES[plan];
  return {
    plan,
    setPlan: setPlanTier,
    features,
    isPro: plan === 'pro' || plan === 'enterprise',
    isEnterprise: plan === 'enterprise',
    isFree: plan === 'free',
  };
}
