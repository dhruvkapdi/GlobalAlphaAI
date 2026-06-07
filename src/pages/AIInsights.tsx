import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Send, Sparkles, TrendingUp, Loader2, Plus, Trash2,
  MessageSquare, Globe, PieChart, AlertTriangle, BarChart3, User,
  Copy, Check, ChevronDown,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  getConversations, createConversation, deleteConversation,
  getMessages, saveMessage, streamChat, updateConversationTitle,
  type Conversation,
} from '@/services/chatService';

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts?: string;
  streaming?: boolean;
}

const QUICK = [
  { icon: TrendingUp,    label: 'Best AI Stocks',    prompt: 'What are the best AI stocks to buy right now? Show specific data and confidence levels.' },
  { icon: Globe,         label: 'Emerging Markets',  prompt: 'Analyze emerging market opportunities. Compare India, Brazil, Vietnam with real data.' },
  { icon: PieChart,      label: 'Portfolio Review',  prompt: 'Suggest optimal portfolio allocation for risk management in current market conditions.' },
  { icon: AlertTriangle, label: 'Risk Analysis',     prompt: 'What are the biggest market risks right now? Include specific indices and country data.' },
  { icon: BarChart3,     label: 'Sector Outlook',    prompt: 'Which sectors will outperform in the next 6 months? Use current sector performance data.' },
  { icon: Brain,         label: 'Global Sentiment',  prompt: 'Summarize current global market sentiment across all regions with specific numbers.' },
];

export default function AIInsights() {
  const { user } = useAuth();
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // KEY FIX: store accumulated content in a ref so callbacks always see current value
  const accRef = useRef('');
  const streamIdRef = useRef('');

  // Load conversations
  useEffect(() => {
    if (!user) return;
    setLoadingConvos(true);
    getConversations().then(d => { setConvos(d); setLoadingConvos(false); }).catch(() => setLoadingConvos(false));
  }, [user]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeId) { setMsgs([]); return; }
    setLoadingMsgs(true);
    getMessages(activeId).then(d => {
      setMsgs(d.map(m => ({ id: m.id, role: m.role, content: m.content, ts: m.created_at })));
      setLoadingMsgs(false);
    }).catch(() => setLoadingMsgs(false));
  }, [activeId]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const newConvo = useCallback(async () => {
    try {
      const c = await createConversation('New Conversation');
      setConvos(p => [c, ...p]);
      setActiveId(c.id);
      setMsgs([]);
      inputRef.current?.focus();
    } catch { toast({ title: 'Failed to create conversation', variant: 'destructive' }); }
  }, []);

  const deleteConvo = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
      setConvos(p => p.filter(c => c.id !== id));
      if (activeId === id) { setActiveId(null); setMsgs([]); }
    } catch { toast({ title: 'Failed to delete', variant: 'destructive' }); }
  }, [activeId]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || busy || !user) return;
    setInput('');

    // Ensure we have a conversation
    let convId = activeId;
    if (!convId) {
      try {
        const title = text.slice(0, 55) + (text.length > 55 ? '...' : '');
        const c = await createConversation(title);
        setConvos(p => [c, ...p]);
        setActiveId(c.id);
        convId = c.id;
      } catch { toast({ title: 'Failed to start conversation', variant: 'destructive' }); return; }
    }

    // Build history BEFORE adding user message to state
    const history = msgs.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    history.push({ role: 'user', content: text });

    // Add user message optimistically
    const userId = `u-${Date.now()}`;
    setMsgs(p => [...p, { id: userId, role: 'user', content: text, ts: new Date().toISOString() }]);

    // Save user message to DB
    saveMessage(convId, 'user', text).then(saved => {
      setMsgs(p => p.map(m => m.id === userId ? { ...m, id: saved.id } : m));
    }).catch(() => {});

    // Update convo title if first message
    if (msgs.length === 0) {
      const title = text.slice(0, 55) + (text.length > 55 ? '...' : '');
      updateConversationTitle(convId, title).catch(() => {});
      setConvos(p => p.map(c => c.id === convId ? { ...c, title } : c));
    }

    // Add streaming placeholder
    const sid = `s-${Date.now()}`;
    streamIdRef.current = sid;
    accRef.current = '';
    setBusy(true);
    setMsgs(p => [...p, { id: sid, role: 'assistant', content: '', streaming: true }]);

    await streamChat({
      messages: history,
      conversationId: convId,
      onDelta: (chunk: string) => {
        // Accumulate in ref — no stale closure issue
        accRef.current += chunk;
        const currentAcc = accRef.current;
        const currentSid = streamIdRef.current;
        // Force immediate state update
        setMsgs(p => p.map(m => m.id === currentSid ? { ...m, content: currentAcc } : m));
      },
      onDone: () => {
        const finalContent = accRef.current;
        const currentSid = streamIdRef.current;
        setBusy(false);
        setMsgs(p => p.map(m => m.id === currentSid ? { ...m, content: finalContent, streaming: false } : m));
        // Save AI response
        if (finalContent && convId) {
          saveMessage(convId, 'assistant', finalContent).then(saved => {
            setMsgs(p => p.map(m => m.id === currentSid ? { ...m, id: saved.id } : m));
          }).catch(() => {});
        }
      },
      onError: (err: string) => {
        setBusy(false);
        const currentSid = streamIdRef.current;
        setMsgs(p => p.filter(m => m.id !== currentSid));
        toast({ title: 'AI Error', description: err, variant: 'destructive' });
      },
    });
  }, [activeId, busy, user, msgs]);

  const copyMsg = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const isEmpty = msgs.length === 0 && !loadingMsgs;

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">

        {/* ── SIDEBAR ── */}
        <aside className="w-[240px] xl:w-[260px] flex-shrink-0 hidden md:flex flex-col border-r"
          style={{ background: 'rgba(4,6,18,0.92)', backdropFilter: 'blur(24px)', borderColor: 'rgba(255,255,255,0.07)' }}>

          <div className="p-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <button onClick={newConvo}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, hsl(221,83%,55%), hsl(258,78%,60%))' }}>
              <Plus className="h-4 w-4" /> New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {loadingConvos
              ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg mb-1" style={{ background: 'rgba(255,255,255,0.05)' }} />)
              : convos.length === 0
              ? (
                <div className="text-center py-10">
                  <MessageSquare className="h-7 w-7 mx-auto mb-2 opacity-20 text-white" />
                  <p className="text-[11px] text-slate-600">No conversations</p>
                </div>
              )
              : convos.map(c => (
                <button key={c.id} onClick={() => setActiveId(c.id)}
                  className="w-full text-left px-3 py-2.5 rounded-xl transition-all group flex items-start gap-2"
                  style={{
                    background: activeId === c.id ? 'rgba(37,99,235,0.18)' : 'transparent',
                    border: `1px solid ${activeId === c.id ? 'rgba(96,165,250,0.28)' : 'transparent'}`,
                  }}>
                  <MessageSquare className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 opacity-40 text-white" style={{ color: activeId === c.id ? '#60a5fa' : undefined, opacity: activeId === c.id ? 1 : 0.4 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate" style={{ color: activeId === c.id ? '#e2e8f0' : '#64748b' }}>{c.title}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      {new Date(c.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <button onClick={e => deleteConvo(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-500/15 flex-shrink-0">
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </button>
                </button>
              ))
            }
          </div>
        </aside>

        {/* ── MAIN CHAT ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}
          <div className="h-12 flex items-center justify-between px-5 flex-shrink-0 border-b"
            style={{ background: 'rgba(4,6,18,0.7)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, hsl(221,83%,55%), hsl(258,78%,60%))' }}>
                <Brain className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white leading-none">AI Market Intelligence</p>
                <p className="text-[10px] text-slate-500 leading-none mt-0.5">Powered by real-time global market data</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-semibold">Live</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {isEmpty ? (
              /* Empty state */
              <div className="h-full flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, hsl(221,83%,55%), hsl(258,78%,60%))' }}>
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-[22px] font-black text-white mb-2">What do you want to know?</h2>
                <p className="text-slate-500 text-[13px] text-center mb-8 max-w-sm">
                  Ask anything about stocks, markets, countries, sectors, crypto, or macro trends.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-xl">
                  {QUICK.map(q => (
                    <button key={q.label} onClick={() => send(q.prompt)}
                      className="flex items-center gap-2 p-3 rounded-xl text-left transition-all hover:-translate-y-0.5"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(96,165,250,0.3)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'}>
                      <q.icon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <span className="text-[12px] font-medium text-slate-300">{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto w-full px-4 py-5 space-y-5">
                {loadingMsgs
                  ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />)
                  : msgs.map((msg, i) => (
                    <motion.div key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>

                      {/* AI avatar */}
                      {msg.role === 'assistant' && (
                        <div className="h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-1"
                          style={{ background: 'linear-gradient(135deg, hsl(221,83%,55%), hsl(258,78%,60%))' }}>
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}

                      <div className={cn('flex flex-col gap-1 max-w-[78%]', msg.role === 'user' && 'items-end')}>
                        {/* Bubble */}
                        <div className="px-4 py-3 rounded-2xl text-[13px] leading-relaxed"
                          style={msg.role === 'user' ? {
                            background: 'linear-gradient(135deg, hsl(221,83%,55%), hsl(258,78%,62%))',
                            borderRadius: '18px 18px 4px 18px',
                            color: 'white',
                            boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
                          } : {
                            background: 'rgba(12,16,42,0.85)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '4px 18px 18px 18px',
                            color: '#cbd5e1',
                          }}>

                          {msg.role === 'assistant' && (
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#a78bfa' }}>
                              Global Alpha AI
                            </p>
                          )}

                          {/* Content */}
                          {msg.streaming && !msg.content ? (
                            <div className="flex items-center gap-1.5 py-1">
                              {[0,1,2].map(d => (
                                <div key={d} className="h-2 w-2 rounded-full bg-blue-400 animate-bounce"
                                  style={{ animationDelay: `${d * 0.15}s` }} />
                              ))}
                            </div>
                          ) : msg.role === 'assistant' ? (
                            <div className="prose prose-sm max-w-none"
                              style={{
                                color: '#cbd5e1',
                                ['--tw-prose-body' as any]: '#cbd5e1',
                                ['--tw-prose-bold' as any]: '#f1f5f9',
                                ['--tw-prose-headings' as any]: '#f1f5f9',
                              }}>
                              <ReactMarkdown
                                components={{
                                  p: ({children}) => <p className="mb-2 last:mb-0 text-slate-300 text-[13px] leading-relaxed">{children}</p>,
                                  strong: ({children}) => <strong className="font-bold text-white">{children}</strong>,
                                  h1: ({children}) => <h1 className="text-[15px] font-bold text-white mb-2 mt-3">{children}</h1>,
                                  h2: ({children}) => <h2 className="text-[14px] font-bold text-white mb-1.5 mt-2.5">{children}</h2>,
                                  h3: ({children}) => <h3 className="text-[13px] font-semibold text-slate-200 mb-1 mt-2">{children}</h3>,
                                  ul: ({children}) => <ul className="ml-4 mb-2 space-y-1">{children}</ul>,
                                  ol: ({children}) => <ol className="ml-4 mb-2 space-y-1 list-decimal">{children}</ol>,
                                  li: ({children}) => <li className="text-slate-300 text-[13px]">{children}</li>,
                                  code: ({children}) => <code className="px-1.5 py-0.5 rounded text-[12px] font-mono" style={{ background: 'rgba(96,165,250,0.15)', color: '#93c5fd' }}>{children}</code>,
                                  hr: () => <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />,
                                }}
                              >{msg.content}</ReactMarkdown>
                              {msg.streaming && (
                                <span className="inline-block h-3.5 w-0.5 ml-0.5 bg-blue-400 animate-pulse rounded-full" style={{ verticalAlign: 'middle' }} />
                              )}
                            </div>
                          ) : (
                            <p>{msg.content}</p>
                          )}
                        </div>

                        {/* Actions */}
                        {msg.role === 'assistant' && !msg.streaming && msg.content && (
                          <button onClick={() => copyMsg(msg.content, msg.id)}
                            className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-400 transition-colors px-1">
                            {copied === msg.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            {copied === msg.id ? 'Copied' : 'Copy'}
                          </button>
                        )}
                      </div>

                      {/* User avatar */}
                      {msg.role === 'user' && (
                        <div className="h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-1"
                          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                          <User className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))
                }
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* ── INPUT ── */}
          <div className="flex-shrink-0 px-4 py-3 border-t"
            style={{ background: 'rgba(4,6,18,0.85)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="max-w-3xl mx-auto flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
                }}
                placeholder="Ask about any stock, market, sector, country, or macro trend..."
                rows={1}
                disabled={busy}
                className="flex-1 resize-none text-[13px] outline-none placeholder:text-slate-600 text-white"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.11)',
                  borderRadius: '14px',
                  padding: '11px 14px',
                  minHeight: '44px',
                  maxHeight: '120px',
                  lineHeight: '1.5',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(96,165,250,0.4)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.11)'; }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || busy}
                className="flex-shrink-0 flex items-center justify-center transition-all active:scale-95"
                style={{
                  width: '44px', height: '44px', borderRadius: '14px',
                  background: input.trim() && !busy
                    ? 'linear-gradient(135deg, hsl(221,83%,55%), hsl(258,78%,60%))'
                    : 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: input.trim() && !busy ? '0 0 20px rgba(37,99,235,0.4)' : 'none',
                  cursor: input.trim() && !busy ? 'pointer' : 'not-allowed',
                  opacity: busy ? 0.65 : 1,
                }}>
                {busy
                  ? <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#60a5fa' }} />
                  : <Send className="h-4 w-4 text-white" />}
              </button>
            </div>
            <p className="text-[10px] text-center mt-2" style={{ color: 'rgba(255,255,255,0.18)' }}>
              AI analysis for informational purposes only. Not financial advice. — Global Alpha AI by Dhruv Kapdi
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
