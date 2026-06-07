import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BarChart3, Brain, Globe, Zap, TrendingUp, TrendingDown,
  Newspaper, Target, ArrowRightLeft, Star, Bookmark, Sparkles,
  Shield, Activity, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  { icon: Globe, title: 'Globe Explorer', desc: 'Interactive 3D globe with AI market intelligence for 42 countries. Click any country for deep analysis.', color: 'text-blue-400', bg: 'rgba(37,99,235,0.1)', border: 'rgba(37,99,235,0.2)' },
  { icon: Brain, title: 'AI Copilot', desc: 'Ask anything about markets. Streaming AI responses with real-time data, persistent conversation history.', color: 'text-purple-400', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.2)' },
  { icon: Target, title: 'AI Predictions', desc: 'Buy/sell signals with confidence scores and probability analysis on 100+ stocks and crypto assets.', color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
  { icon: BarChart3, title: 'Global Markets', desc: 'Live indices, forex, 100+ crypto, commodities with real-time data from multiple exchanges.', color: 'text-yellow-400', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  { icon: Newspaper, title: 'News & Sentiment', desc: 'AI-analyzed financial news with real-time bullish/bearish sentiment scoring on every article.', color: 'text-red-400', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
  { icon: Bookmark, title: 'Smart Watchlist', desc: 'Track stocks, crypto, and country markets. Real-time alerts with AI-powered price notifications.', color: 'text-cyan-400', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)' },
];

const stats = [
  { value: '42', label: 'Countries', icon: Globe },
  { value: '164+', label: 'Global Stocks', icon: BarChart3 },
  { value: '100+', label: 'Cryptocurrencies', icon: Activity },
  { value: '15K+', label: 'AI Signals/Day', icon: Sparkles },
];

const ticker = [
  { name: 'S&P 500', value: '5,470', change: 0.37 },
  { name: 'NASDAQ', value: '17,469', change: 1.57 },
  { name: 'BTC', value: '$70,891', change: -1.62 },
  { name: 'ETH', value: '$2,001', change: -0.41 },
  { name: 'NIFTY 50', value: '22,500', change: 0.85 },
  { name: 'EUR/USD', value: '1.1517', change: 0.12 },
  { name: 'Gold', value: '$2,340', change: 0.62 },
  { name: 'FTSE 100', value: '8,446', change: 1.15 },
  { name: 'DAX', value: '18,514', change: -0.46 },
  { name: 'Nikkei 225', value: '39,014', change: 0.29 },
];

const Landing = () => {
  return (
    <div className="min-h-screen text-white overflow-hidden" style={{ background: '#04060f' }}>

      {/* Real earth photo BG — hero only */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/earth-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center -80px',
          filter: 'brightness(0.4) saturate(1.1)',
        }} />
        {/* Gradient fade out below hero */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(4,6,15,0.2) 0%, rgba(4,6,15,0.5) 40%, rgba(4,6,15,0.92) 65%, #04060f 85%)',
        }} />
        {/* Side vigniettes */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(4,6,15,0.6) 0%, transparent 20%, transparent 80%, rgba(4,6,15,0.6) 100%)',
        }} />
        {/* Subtle top atmosphere */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '700px', height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.5), transparent)',
        }} />
      </div>

      {/* NAV */}
      <nav className="relative z-20 border-b border-white/[0.06] backdrop-blur-xl" style={{ background: 'rgba(4,6,15,0.7)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-[18px] font-black gradient-text">Global Alpha AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Markets', 'Pricing'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[13px] text-slate-400 hover:text-white transition-colors font-medium">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/signin" className="text-[13px] text-slate-400 hover:text-white transition-colors font-medium">Sign in</Link>
            <Link to="/signup" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, hsl(221,83%,55%), hsl(258,78%,60%))', boxShadow: '0 0 20px rgba(37,99,235,0.35)' }}>
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* LIVE TICKER */}
      <div className="relative z-10 border-b border-white/[0.05] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', height: '36px' }}>
        <div className="flex items-center h-full ticker-scroll">
          {[...ticker, ...ticker].map((t, i) => (
            <div key={i} className="flex items-center gap-2 mx-6 whitespace-nowrap text-[12px]">
              <span className="font-semibold text-white/80">{t.name}</span>
              <span className="font-mono text-white/60">{t.value}</span>
              <span className={cn('font-mono font-bold flex items-center gap-0.5', t.change >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {t.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {t.change >= 0 ? '+' : ''}{t.change}%
              </span>
              <span className="text-white/10 ml-4">|</span>
            </div>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="relative z-10 min-h-[88vh] flex flex-col items-center justify-center text-center px-4 pt-16 pb-20">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-5 py-2 text-[11px] text-blue-400 font-bold uppercase tracking-[0.15em] mb-8">
            <Sparkles className="h-3 w-3 animate-pulse" /> AI-Powered Market Intelligence
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6">
          <span className="text-white">Live Market</span><br />
          <span className="gradient-text">Intelligence</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Real-time AI signals across global equities, crypto, forex and commodities.<br className="hidden md:block" />
          42 countries. 15,000+ signals daily. Institutional-grade intelligence.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link to="/signup"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-[16px] text-white transition-all"
            style={{ background: 'linear-gradient(135deg, hsl(221,83%,58%), hsl(258,78%,62%))', boxShadow: '0 0 40px rgba(37,99,235,0.45), 0 4px 24px rgba(37,99,235,0.35)' }}>
            Start Free <ArrowRight className="h-5 w-5" />
          </Link>
          <Link to="/signin"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-[16px] text-slate-300 border border-white/[0.1] hover:border-blue-500/40 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            Sign in <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Stats bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black gradient-text">{s.value}</p>
              <p className="text-[12px] text-slate-500 mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 py-24 px-4" style={{ background: 'linear-gradient(to bottom, #04060f, #060912)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-[11px] text-purple-400 font-bold uppercase tracking-wider mb-5">
              <Sparkles className="h-3 w-3" /> Platform Features
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Everything you need to<br /><span className="gradient-text">trade smarter</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Powered by real-time data and institutional-grade AI models
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group p-6 rounded-2xl border transition-all cursor-default"
                style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.07)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = f.border; (e.currentTarget as HTMLElement).style.background = f.bg; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'; }}
              >
                <div className="h-11 w-11 rounded-xl flex items-center justify-center mb-4" style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="font-bold text-[16px] text-white mb-2">{f.title}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl border border-white/[0.08] p-12 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.08))' }}>
            <div className="absolute inset-0 rounded-3xl" style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.2), transparent 60%)',
            }} />
            <div className="relative z-10">
              <Sparkles className="h-8 w-8 text-blue-400 mx-auto mb-5 animate-pulse" />
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Start trading smarter <span className="gradient-text">today</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
                Join 12,000+ traders using AI-powered intelligence to stay ahead of the market.
              </p>
              <Link to="/signup"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-[17px] text-white"
                style={{ background: 'linear-gradient(135deg, hsl(221,83%,58%), hsl(258,78%,62%))', boxShadow: '0 0 40px rgba(37,99,235,0.5)' }}>
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="text-slate-600 text-[12px] mt-4">No credit card required · Free plan always available</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 px-4" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg gradient-bg flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold gradient-text text-[14px]">Global Alpha AI</span>
          </div>
          <p className="text-[12px] text-slate-600">© 2026 Global Alpha AI. AI analysis for informational purposes only. Not financial advice.</p>
          <div className="flex items-center gap-1.5 text-[12px] text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
