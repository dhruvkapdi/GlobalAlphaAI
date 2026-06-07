import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Globe, Brain, TrendingUp, BarChart3, ArrowRightLeft,
  Newspaper, Settings as SettingsIcon, Menu, X, Zap, Search, LogOut, User,
  Loader2, Bookmark, ChevronsLeft, ChevronsRight, Sparkles, CreditCard,
  Wallet, Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarketTicker } from '@/components/ui/MarketTicker';
import { CommandBar } from '@/components/CommandBar';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { NotificationCenter } from '@/components/layout/NotificationCenter';
import { PremiumBadge } from '@/components/subscription/PremiumBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useUserSettings, useUpdateUserSettings } from '@/hooks/useUserSettings';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/globe', label: 'Globe Explorer', icon: Globe },
  { path: '/ai-insights', label: 'AI Copilot', icon: Brain },
  { path: '/predictions', label: 'Predictions', icon: TrendingUp },
  { path: '/markets', label: 'Global Markets', icon: BarChart3 },
  { path: '/exchange', label: 'Exchange Rates', icon: ArrowRightLeft },
  { path: '/news', label: 'News & Sentiment', icon: Newspaper },
  { path: '/watchlist', label: 'Watchlist', icon: Bookmark },
  { path: '/portfolio', label: 'Portfolio', icon: Wallet },
];

const quickActions = [
  { path: '/ai-insights', label: 'AI Copilot', icon: Brain },
  { path: '/portfolio', label: 'Portfolio', icon: Wallet },
  { path: '/watchlist', label: 'Alerts', icon: Bell },
  { path: '/pricing', label: 'Upgrade Pro', icon: Sparkles },
];

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sidebar:collapsed') === '1';
  });
  const [commandOpen, setCommandOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: settings } = useUserSettings();
  const updateSettings = useUpdateUserSettings();
  const { plan, isPro } = useSubscription();

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Always dark mode — light mode removed
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar:collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      toast({ title: 'Signed out', description: 'You have been logged out successfully.' });
      navigate('/signin');
    } catch (error: any) {
      toast({ title: 'Logout failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoggingOut(false);
    }
  };

  const userInitials = profile
    ? `${(profile.first_name || '')[0] || ''}${(profile.last_name || '')[0] || ''}`.toUpperCase() || 'U'
    : (user?.email?.[0] || 'U').toUpperCase();

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : (user?.email?.split('@')[0] || 'User');

  const renderNav = (compact: boolean) => (
    <nav className="flex-1 py-2 space-y-0.5 px-2 overflow-y-auto min-h-0">
      {navItems.map(item => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            title={compact ? item.label : undefined}
            className={cn(
              'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 overflow-hidden',
              active
                ? 'nav-active text-blue-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]',
              compact && 'justify-center px-2'
            )}
          >
            <item.icon className={cn(
              'h-4 w-4 flex-shrink-0 transition-all',
              active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
            )} />
            {!compact && <span className="truncate">{item.label}</span>}
            {active && !compact && (
              <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex relative">
      <AmbientBackground variant="subtle" />
      <CommandBar open={commandOpen} onClose={() => setCommandOpen(false)} />

      {/* ===== DESKTOP SIDEBAR — fully static ===== */}
      <aside className={cn(
        'hidden lg:flex flex-col h-screen sticky top-0 transition-[width] duration-300 ease-out flex-shrink-0',
        'border-r border-white/[0.06]',
        'bg-[hsl(222,47%,3%)/0.88] backdrop-blur-xl',
        collapsed ? 'w-[68px]' : 'w-[216px]'
      )}>
        {/* Logo */}
        <div className={cn(
          'flex items-center gap-2.5 border-b border-white/[0.06] h-14 flex-shrink-0',
          collapsed ? 'justify-center px-3' : 'px-4'
        )}>
          <div className="h-8 w-8 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0 animate-glow-pulse shadow-lg shadow-blue-500/30">
            <Zap className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[14px] gradient-text leading-tight tracking-tight">Global Alpha</p>
              <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500">AI Terminal</p>
            </div>
          )}
        </div>

        {/* Search */}
        <div className={cn('px-2 pt-3 pb-1 flex-shrink-0')}>
          {!collapsed ? (
            <button
              onClick={() => setCommandOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.07] bg-white/[0.03] text-[12px] text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] hover:border-blue-500/30 transition-all"
            >
              <Search className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="flex-1 text-left">Search...</span>
              <kbd className="text-[9px] border border-white/[0.1] rounded px-1.5 py-0.5 bg-white/[0.04] font-mono">⌘K</kbd>
            </button>
          ) : (
            <button
              onClick={() => setCommandOpen(true)}
              className="w-full flex items-center justify-center h-9 rounded-xl border border-white/[0.07] bg-white/[0.03] text-slate-500 hover:text-blue-400 hover:border-blue-500/30 transition-all"
              title="Search (⌘K)"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav label */}
        {!collapsed && (
          <p className="px-5 pt-3 pb-1 text-[9px] uppercase tracking-[0.15em] text-slate-600 font-semibold flex-shrink-0">
            Navigation
          </p>
        )}

        {/* Nav items — flex-1 with min-h-0 so it scrolls if needed */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {renderNav(collapsed)}

          {/* Quick actions */}
          {!collapsed && (
            <div className="px-2 pb-3 flex-shrink-0">
              <p className="px-3 text-[9px] uppercase tracking-[0.15em] text-slate-600 mb-2 font-semibold">Quick Actions</p>
              <div className="grid grid-cols-2 gap-1.5">
                {quickActions.map(qa => (
                  <button
                    key={qa.label}
                    onClick={() => navigate(qa.path)}
                    className="group flex flex-col items-start gap-1.5 p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-blue-500/30 hover:bg-blue-500/[0.06] transition-all"
                  >
                    <qa.icon className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    <span className="text-[10px] font-semibold text-slate-500 group-hover:text-slate-300 leading-tight">{qa.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===== PINNED FOOTER — ALWAYS VISIBLE ===== */}
        <div className="flex-shrink-0 border-t border-white/[0.06]" style={{ background: 'rgba(8,12,24,0.95)' }}>
          <div className="px-2 pt-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                'w-full flex items-center gap-2 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-colors',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed
                ? <ChevronsRight className="h-4 w-4" />
                : <><ChevronsLeft className="h-4 w-4" /><span>Collapse</span></>
              }
            </button>
          </div>
          <div className="px-2 pb-2">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Sign out"
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/[0.08] transition-colors',
                collapsed && 'justify-center px-2'
              )}
            >
              {loggingOut
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <LogOut className="h-4 w-4" />
              }
              {!collapsed && <span>{loggingOut ? 'Signing out...' : 'Sign out'}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 26 }}
              className="fixed left-0 top-0 bottom-0 w-60 z-50 lg:hidden flex flex-col border-r border-white/[0.06]"
              style={{ background: 'rgba(8, 12, 24, 0.96)' }}
            >
              <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-sm gradient-text">Global Alpha AI</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {renderNav(false)}
              </div>
              <div className="border-t border-white/[0.06] p-2 flex-shrink-0">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/[0.08] transition-colors"
                >
                  {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                  <span>Sign out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header bar */}
        <header className="h-14 flex items-center px-3 md:px-5 gap-3 sticky top-0 z-30 border-b border-white/[0.06]"
          style={{ background: 'rgba(8, 12, 24, 0.75)', backdropFilter: 'blur(20px)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Ticker */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <MarketTicker />
          </div>

          {/* Search */}
          <button
            onClick={() => setCommandOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[12px] text-slate-500 hover:text-slate-300 hover:border-blue-500/30 transition-all"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
            <kbd className="text-[9px] border border-white/[0.1] rounded px-1 py-0.5 font-mono">⌘K</kbd>
          </button>
          <button onClick={() => setCommandOpen(true)} className="md:hidden p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400">
            <Search className="h-4 w-4" />
          </button>

          <NotificationCenter />

          {/* User avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07] hover:border-blue-500/40 transition-all">
                <div className="h-7 w-7 rounded-full gradient-bg flex items-center justify-center shadow-md shadow-blue-500/30">
                  <span className="text-[11px] font-bold text-white">{userInitials}</span>
                </div>
                <span className="hidden sm:inline text-[13px] font-medium text-slate-300 max-w-[100px] truncate">{displayName}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 border-white/[0.1] shadow-2xl p-1"
              style={{ background: 'hsl(222, 42%, 8%)', backdropFilter: 'blur(20px)' }}>
              <div className="px-3 py-3">
                <p className="text-sm font-semibold truncate text-white">{displayName}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  {isPro ? (
                    <PremiumBadge tier={plan === 'enterprise' ? 'enterprise' : 'pro'} />
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400 border border-white/[0.08]">
                      <Sparkles className="h-2.5 w-2.5" /> Free Plan
                    </span>
                  )}
                  {!isPro && (
                    <button onClick={() => navigate('/pricing')} className="text-[10px] font-bold text-blue-400 hover:underline">
                      Upgrade →
                    </button>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem onClick={() => navigate('/settings')} className="text-xs cursor-pointer rounded-lg text-slate-300">
                <User className="h-3.5 w-3.5 mr-2 text-slate-500" /> Account & Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="text-xs cursor-pointer rounded-lg text-slate-300">
                <SettingsIcon className="h-3.5 w-3.5 mr-2 text-slate-500" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/pricing')} className="text-xs cursor-pointer rounded-lg text-slate-300">
                <CreditCard className="h-3.5 w-3.5 mr-2 text-slate-500" /> Subscription & Plans
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem onClick={handleLogout} disabled={loggingOut} className="text-xs cursor-pointer text-red-400 focus:text-red-400 rounded-lg">
                {loggingOut ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <LogOut className="h-3.5 w-3.5 mr-2" />}
                {loggingOut ? 'Signing out...' : 'Sign Out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-auto pb-20 lg:pb-0">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
};
