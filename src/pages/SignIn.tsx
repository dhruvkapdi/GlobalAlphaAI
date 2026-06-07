import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, Loader2, TrendingUp, Globe, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email, password);
      toast({ title: 'Welcome back', description: 'Successfully signed in.' });
      navigate('/dashboard');
    } catch (error: any) {
      toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white flex overflow-hidden" style={{ background: '#04060f' }}>

      {/* ── LEFT — Real earth bg with content */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] relative overflow-hidden p-12">
        {/* Earth image bg */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'url(/earth-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          filter: 'brightness(0.55) saturate(1.2)',
        }} />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(4,6,15,0.5)] via-transparent to-[rgba(4,6,15,0.9)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(4,6,15,0.3)] via-transparent to-[rgba(4,6,15,0.7)]" />

        {/* Atmosphere glow at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.6), transparent)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-[16px] gradient-text leading-tight">Global Alpha AI</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">AI Terminal</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-[11px] text-blue-400 font-semibold uppercase tracking-wider mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" /> Live Market Intelligence
            </div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              The World's Most<br />
              <span className="gradient-text">Advanced AI</span><br />
              Market Terminal
            </h2>
            <p className="text-slate-400 text-[15px] leading-relaxed max-w-sm">
              Real-time signals, AI predictions, and institutional-grade analytics across 40+ countries worldwide.
            </p>
          </motion.div>

          {/* Feature pills */}
          <div className="mt-8 flex flex-col gap-3">
            {[
              { icon: TrendingUp, text: 'AI-powered buy/sell signals with 85%+ accuracy', color: 'text-emerald-400' },
              { icon: Globe, text: 'Coverage across 42 countries and all asset classes', color: 'text-blue-400' },
              { icon: Brain, text: 'Real-time sentiment analysis on 15,000+ signals daily', color: 'text-purple-400' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3 backdrop-blur-sm">
                <f.icon className={`h-4 w-4 flex-shrink-0 ${f.color}`} />
                <span className="text-[13px] text-slate-300">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 text-[12px] text-slate-500">
          Trusted by 12,000+ traders worldwide · Real-time data · AI-powered insights
        </div>
      </div>

      {/* ── RIGHT — Sign in form */}
      <div className="flex-1 flex items-center justify-center p-6 relative"
        style={{ background: 'linear-gradient(135deg, #06090f 0%, #080d1a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
          className="relative z-10 w-full max-w-[380px]">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl gradient-bg flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold gradient-text">Global Alpha AI</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
            <p className="text-slate-500 text-[14px]">Sign in to your trading terminal</p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-white/[0.08] p-7"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[11px] text-slate-500 uppercase tracking-[0.12em] mb-2 block font-semibold">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/[0.1] bg-white/[0.04] text-white placeholder:text-slate-600 text-[14px] outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] text-slate-500 uppercase tracking-[0.12em] font-semibold">Password</label>
                  <Link to="/forgot-password" className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/[0.1] bg-white/[0.04] text-white placeholder:text-slate-600 text-[14px] outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-[14px] text-white transition-all flex items-center justify-center gap-2 mt-2"
                style={{
                  background: 'linear-gradient(135deg, hsl(221,83%,58%), hsl(258,78%,62%))',
                  boxShadow: loading ? 'none' : '0 0 30px rgba(37,99,235,0.4), 0 4px 20px rgba(37,99,235,0.3)',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
          </div>

          <p className="text-center text-[13px] text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Create account →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;
