import { useEffect, useState } from 'react';

export interface UserPreferences {
  interests: string[];
  risk: 'conservative' | 'balanced' | 'aggressive' | null;
  style: 'day' | 'swing' | 'long' | 'ai-assisted' | null;
  favorites: string[];
  onboardedAt: string | null;
}

const KEY = 'gaai:preferences';
const PINS_KEY = 'gaai:watchlist-pins';
const ALERTS_KEY = 'gaai:watchlist-alerts';

const DEFAULT: UserPreferences = {
  interests: [],
  risk: null,
  style: null,
  favorites: [],
  onboardedAt: null,
};

export function getStoredPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

export function useUserPreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(() => getStoredPreferences());

  const update = (patch: Partial<UserPreferences>) => {
    setPrefs(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  const reset = () => {
    localStorage.removeItem(KEY);
    setPrefs(DEFAULT);
  };

  return { prefs, update, reset, isOnboarded: !!prefs.onboardedAt };
}

export function useWatchlistPins() {
  const [pins, setPins] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(PINS_KEY) || '[]'); } catch { return []; }
  });

  const toggle = (id: string) => {
    setPins(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(PINS_KEY, JSON.stringify(next));
      return next;
    });
  };

  return { pins, toggle };
}

export function useWatchlistAlerts() {
  const [alerts, setAlerts] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem(ALERTS_KEY) || '{}'); } catch { return {}; }
  });

  const toggle = (id: string) => {
    setAlerts(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(ALERTS_KEY, JSON.stringify(next));
      return next;
    });
  };

  return { alerts, toggle };
}
