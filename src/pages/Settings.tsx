import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, User, Palette, Bell, Globe, Database, Loader2,
  LogOut, KeyRound, Brain, CreditCard, Link2, CheckCircle2, Sparkles,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useUserSettings, useUpdateUserSettings } from '@/hooks/useUserSettings';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: loadingProfile } = useProfile();
  const { data: settings, isLoading: loadingSettings } = useUserSettings();
  const updateProfile = useUpdateProfile();
  const updateSettings = useUpdateUserSettings();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [defaultRegion, setDefaultRegion] = useState('Global');
  const [displayCurrency, setDisplayCurrency] = useState('USD');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setDefaultRegion(profile.default_region || 'Global');
      setDisplayCurrency(profile.display_currency || 'USD');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({ first_name: firstName, last_name: lastName });
      toast({ title: 'Profile updated' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleSaveRegion = async () => {
    try {
      await updateProfile.mutateAsync({ default_region: defaultRegion, display_currency: displayCurrency });
      toast({ title: 'Preferences saved' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const toggleSetting = async (key: string, value: boolean) => {
    try {
      await updateSettings.mutateAsync({ [key]: value });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };


  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><SettingsIcon className="h-6 w-6 text-primary" /> Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your preferences and account</p>
        </div>

        <GlassCard className="p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><User className="h-4 w-4" /> Profile</h3>
          {loadingProfile ? (
            <div className="space-y-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] text-muted-foreground uppercase tracking-wider">First Name</label><Input value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1 bg-card/60" /></div>
                <div><label className="text-[10px] text-muted-foreground uppercase tracking-wider">Last Name</label><Input value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1 bg-card/60" /></div>
              </div>
              <div><label className="text-[10px] text-muted-foreground uppercase tracking-wider">Email</label><Input value={user?.email || ''} readOnly className="mt-1 bg-card/60 opacity-60" /></div>
              <Button onClick={handleSaveProfile} disabled={updateProfile.isPending} className="gradient-bg text-primary-foreground hover:opacity-90" size="sm">
                {updateProfile.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                Save Changes
              </Button>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Palette className="h-4 w-4" /> Appearance</h3>
          {loadingSettings ? <Skeleton className="h-6 w-full" /> : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-[10px] text-muted-foreground">Toggle between dark and light themes</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-6 rounded-full relative" style={{background:'linear-gradient(135deg,hsl(221,83%,55%),hsl(258,78%,60%))'}}>
                  <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 translate-x-6 transition-transform" />
                </div>
                <span className="text-[11px] text-slate-500">Always Dark</span>
              </div>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</h3>
          {loadingSettings ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}</div>
          ) : (
            <div className="space-y-3">
              {[
                { key: 'price_alerts', label: 'Price alerts' },
                { key: 'ai_predictions_alerts', label: 'AI predictions' },
                { key: 'market_news_alerts', label: 'Market news' },
                { key: 'portfolio_update_alerts', label: 'Portfolio updates' },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between">
                  <span className="text-sm">{n.label}</span>
                  <button
                    onClick={() => toggleSetting(n.key, !(settings as any)?.[n.key])}
                    className={cn('w-10 h-5 rounded-full relative transition-colors', (settings as any)?.[n.key] ? 'bg-primary' : 'bg-muted')}
                  >
                    <div className={cn('w-4 h-4 rounded-full bg-primary-foreground absolute top-0.5 transition-transform', (settings as any)?.[n.key] ? 'translate-x-5' : 'translate-x-0.5')} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Globe className="h-4 w-4" /> Region & Currency</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Default Region</label>
              <select value={defaultRegion} onChange={e => setDefaultRegion(e.target.value)} className="w-full mt-1 bg-card border border-border/50 rounded-lg px-3 py-2 text-sm">
                <option>Global</option><option>North America</option><option>Europe</option><option>Asia</option><option>South America</option><option>Africa</option><option>Oceania</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Display Currency</label>
              <select value={displayCurrency} onChange={e => setDisplayCurrency(e.target.value)} className="w-full mt-1 bg-card border border-border/50 rounded-lg px-3 py-2 text-sm">
                <option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="JPY">JPY (¥)</option><option value="INR">INR (₹)</option><option value="CNY">CNY (¥)</option><option value="AUD">AUD ($)</option><option value="CAD">CAD ($)</option>
              </select>
            </div>
          </div>
          <Button onClick={handleSaveRegion} disabled={updateProfile.isPending} className="mt-4 gradient-bg text-primary-foreground hover:opacity-90" size="sm">
            {updateProfile.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
            Save Preferences
          </Button>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><KeyRound className="h-4 w-4" /> Security</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (!user?.email) return;
                try {
                  await supabase.auth.resetPasswordForEmail(user.email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                  });
                  toast({ title: 'Password reset email sent', description: 'Check your inbox for the reset link.' });
                } catch (e: any) {
                  toast({ title: 'Error', description: e.message, variant: 'destructive' });
                }
              }}
              className="w-full justify-start"
            >
              <KeyRound className="h-3.5 w-3.5 mr-2" /> Reset Password
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/');
              }}
              className="w-full justify-start"
            >
              <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
            </Button>
          </div>
        </GlassCard>

        {/* AI Preferences */}
        <AIPreferencesCard />

        {/* Subscription */}
        <SubscriptionCard />

        {/* Connected Accounts */}
        <ConnectedAccountsCard userEmail={user?.email || ''} />

        <GlassCard className="p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Database className="h-4 w-4" /> Backend Status</h3>
          <div className="p-3 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <p className="text-sm font-medium text-success">Supabase Connected</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Real-time data sync, authentication, and storage enabled</p>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
};

const AIPreferencesCard = () => {
  const { prefs, update } = useUserPreferences();
  const RISKS: Array<{ k: 'conservative' | 'balanced' | 'aggressive'; label: string }> = [
    { k: 'conservative', label: 'Conservative' },
    { k: 'balanced', label: 'Balanced' },
    { k: 'aggressive', label: 'Aggressive' },
  ];
  const STYLES: Array<{ k: 'day' | 'swing' | 'long' | 'ai-assisted'; label: string }> = [
    { k: 'day', label: 'Day Trader' },
    { k: 'swing', label: 'Swing' },
    { k: 'long', label: 'Long Term' },
    { k: 'ai-assisted', label: 'AI-Assisted' },
  ];
  return (
    <GlassCard className="p-5">
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Brain className="h-4 w-4" /> AI Preferences</h3>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk profile</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {RISKS.map(r => (
              <button
                key={r.k}
                onClick={() => { update({ risk: r.k }); toast({ title: 'AI risk profile updated' }); }}
                className={cn(
                  'text-xs px-3 py-2 rounded-lg border transition-all',
                  prefs.risk === r.k
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border/60 hover:border-primary/30 text-muted-foreground'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Trading style</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
            {STYLES.map(s => (
              <button
                key={s.k}
                onClick={() => { update({ style: s.k }); toast({ title: 'Trading style updated' }); }}
                className={cn(
                  'text-xs px-3 py-2 rounded-lg border transition-all',
                  prefs.style === s.k
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border/60 hover:border-primary/30 text-muted-foreground'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

const SubscriptionCard = () => {
  const { plan, isPro } = useSubscription();
  const navigate = useNavigate();
  return (
    <GlassCard className="p-5">
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><CreditCard className="h-4 w-4" /> Subscription</h3>
      <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-foreground/[0.02]">
        <div>
          <p className="text-sm font-semibold capitalize flex items-center gap-2">
            {plan} Plan {isPro && <Sparkles className="h-3.5 w-3.5 text-accent" />}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {isPro ? 'Full access to AI Copilot, unlimited signals, advanced analytics.' : 'Upgrade for unlimited AI insights and portfolio analyzer.'}
          </p>
        </div>
        <Button size="sm" onClick={() => navigate('/pricing')} className="gradient-bg text-primary-foreground hover:opacity-90">
          {isPro ? 'Manage' : 'Upgrade'}
        </Button>
      </div>
    </GlassCard>
  );
};

const ConnectedAccountsCard = ({ userEmail }: { userEmail: string }) => {
  const accounts = [
    { name: 'Email', value: userEmail, connected: true },
    { name: 'Google', value: 'Not connected', connected: false },
    { name: 'Brokerage (Plaid)', value: 'Coming soon', connected: false },
  ];
  return (
    <GlassCard className="p-5">
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Link2 className="h-4 w-4" /> Connected Accounts</h3>
      <div className="space-y-2">
        {accounts.map(a => (
          <div key={a.name} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-foreground/[0.02]">
            <div>
              <p className="text-xs font-semibold">{a.name}</p>
              <p className="text-[10px] text-muted-foreground truncate max-w-[220px]">{a.value}</p>
            </div>
            {a.connected ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-success px-2 py-1 rounded-md bg-success/10 border border-success/20">
                <CheckCircle2 className="h-3 w-3" /> Connected
              </span>
            ) : (
              <button
                onClick={() => toast({ title: 'Coming soon', description: `${a.name} integration is on the roadmap.` })}
                className="text-[10px] px-2.5 py-1 rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                Connect
              </button>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default SettingsPage;
