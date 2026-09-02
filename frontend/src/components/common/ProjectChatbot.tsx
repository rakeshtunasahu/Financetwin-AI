import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  Database,
  Terminal,
  Zap,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkle
} from 'lucide-react';
import { assistantApi, AssistantChatResponse } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggested_actions?: string[];
  deep_link?: string;
  related_metrics?: Record<string, any>;
  timestamp: Date;
}

const DEFAULT_STARTER_PROMPTS = [
  { label: '📊 Live Revenue Stats', prompt: 'What is our current revenue at risk and recovered total?' },
  { label: '🔄 10-Step Lifecycle', prompt: 'Explain the 10-step autonomous recovery lifecycle' },
  { label: '⚖️ 4-Pass Matching', prompt: 'How does the 4-pass conservative reconciliation engine work?' },
  { label: '📐 Expected Math', prompt: 'How is Expected Recovery calculated mathematically?' },
  { label: '🛡️ 3 RBAC Roles', prompt: 'What are the 3 enterprise RBAC personas and permissions?' },
  { label: '🔍 Revenue Leakage', prompt: 'Where is revenue leaking across our payment channels?' },
  { label: '🇮🇳 Hindi: Project Overview', prompt: 'RevenueRescue AI project kya karta hai aur kaise kaam karta hai?' }
];

export default function ProjectChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '👋 **Hello! I am your RevenueRescue AI Copilot.**\n\nI have complete, end-to-end knowledge of our autonomous revenue recovery platform — including the **4-Pass Reconciliation Engine**, **10-Step Autonomous Recovery Lifecycle**, **Expected Recovery Mathematics**, **3 Enterprise RBAC Roles**, **Scikit-Learn Anomaly Models**, and **Live Database Telemetry**.\n\nAap mujhse **Hindi, Hinglish, ya English** mein koi bhi question pooch sakte hain! How can I assist your recovery operations today?',
      suggested_actions: [
        'Show Live Revenue Stats',
        'Explain 10-Step Lifecycle',
        'How 4-Pass Matching Works',
        'Ye project kya karta hai?'
      ],
      timestamp: new Date()
    }
  ]);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const res: AssistantChatResponse = await assistantApi.chat(
        text,
        historyPayload,
        location.pathname,
        currentUser?.role || 'RECOVERY_ADMIN'
      );

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        suggested_actions: res.suggested_actions,
        deep_link: res.deep_link,
        related_metrics: res.related_metrics,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Connection issue**: Could not retrieve response (${err.message || 'Server error'}). Please ensure backend API is running.`,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content:
          '🧹 **Chat history cleared.**\n\nI am ready for your next question about RevenueRescue AI architecture, live database telemetry, 10-step recovery lifecycle, 4-pass reconciliation, or math formulas!',
        suggested_actions: [
          'Show Live Revenue Stats',
          'Explain 10-Step Workflow',
          'Calculate Expected Recovery',
          'Ye project kya karta hai?'
        ],
        timestamp: new Date()
      }
    ]);
  };

  const handleDeepLink = (path: string) => {
    if (path.startsWith('http')) {
      window.open(path, '_blank');
    } else {
      navigate(path);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    }
  };

  // Structured Markdown Parser with Electric Accent Styling
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-200">
        {lines.map((line, idx) => {
          // Table row detector
          if (line.startsWith('|') && line.endsWith('|')) {
            const cells = line.split('|').filter((c) => c.trim().length > 0);
            if (line.includes('---')) {
              return <div key={idx} className="h-px bg-indigo-800/40 my-1" />;
            }
            return (
              <div key={idx} className="grid grid-cols-2 gap-2 py-1 px-2.5 rounded-lg bg-indigo-950/40 border border-indigo-900/50 font-mono text-xs">
                {cells.map((cell, cIdx) => (
                  <span key={cIdx} className={cIdx === 0 ? 'text-slate-300 font-semibold' : 'text-cyan-300 font-bold text-right'}>
                    {cell.trim().replace(/\*\*/g, '')}
                  </span>
                ))}
              </div>
            );
          }

          // Headers
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="text-xs font-bold text-cyan-400 mt-2.5 flex items-center gap-1.5"><Sparkle className="w-3 h-3 text-violet-400" />{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('## ') || line.startsWith('# ')) {
            return <h3 key={idx} className="text-sm font-extrabold text-white mt-3 pb-1 border-b border-indigo-900/50">{line.replace(/^#+\s/, '')}</h3>;
          }

          // Bullet points
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const bulletText = line.trim().substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 ml-1">
                <span className="text-cyan-400 text-xs mt-0.5 font-bold">•</span>
                <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(bulletText) }} />
              </div>
            );
          }

          // Numbered lists (1. , 2. )
          if (/^\d+\.\s/.test(line.trim())) {
            const num = line.trim().match(/^(\d+\.)\s/)?.[1];
            const text = line.trim().replace(/^\d+\.\s/, '');
            return (
              <div key={idx} className="flex items-start gap-2 ml-1">
                <span className="text-violet-400 font-mono font-bold text-xs shrink-0">{num}</span>
                <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(text) }} />
              </div>
            );
          }

          // Code blocks
          if (line.startsWith('```') || line.endsWith('```')) {
            return <div key={idx} className="text-[11px] font-mono text-cyan-300 bg-slate-950/90 px-2.5 py-1.5 rounded-lg border border-indigo-900/60 shadow-inner">{line.replace(/```[a-z]*/g, '')}</div>;
          }

          // Empty line
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }

          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
          );
        })}
      </div>
    );
  };

  const formatInlineMarkdown = (text: string) => {
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-indigo-200 italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-950 text-cyan-300 font-mono text-[11px] border border-indigo-900/70">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-cyan-400 underline font-semibold hover:text-cyan-300">$1</a>');
    return formatted;
  };

  return (
    <>
      {/* Floating Action Button (Electric Violet/Cyan Gradient) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-950/90 border border-violet-500/40 text-slate-200 text-xs px-3.5 py-1.5 rounded-full shadow-2xl shadow-violet-950/80 backdrop-blur-md animate-in fade-in slide-in-from-right">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-bold text-xs bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
              RevenueRescue AI Copilot
            </span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-2xl shadow-violet-900/60 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-violet-300/40"
            aria-label="Open RevenueRescue AI Copilot"
          >
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full border-2 border-slate-950 flex items-center justify-center animate-pulse">
              <span className="w-1.5 h-1.5 bg-slate-950 rounded-full"></span>
            </div>
            <Cpu className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
          </button>
        </div>
      )}

      {/* Floating Chatbot Window (Electric Dark Glassmorphism) */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-out flex flex-col bg-slate-950/95 border border-indigo-500/40 shadow-2xl shadow-violet-950/90 backdrop-blur-2xl rounded-2xl overflow-hidden ${
            isExpanded
              ? 'inset-4 sm:inset-10'
              : 'bottom-4 right-4 w-[calc(100vw-32px)] sm:w-[490px] h-[650px] max-h-[calc(100vh-32px)]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 border-b border-indigo-900/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-600/30 border border-violet-400/40">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text">
                    RevenueRescue AI Copilot
                  </h3>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold uppercase">
                    ACTIVE
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1 text-indigo-300">
                    <Database className="w-3 h-3 text-cyan-400" /> Grounded Telemetry
                  </span>
                  <span>•</span>
                  <span className="text-violet-300">Bilingual Engine</span>
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                title="Clear Chat History"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:block p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                title={isExpanded ? 'Restore Size' : 'Expand Size'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
                title="Close Copilot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Persona & Context Banner */}
          <div className="px-4 py-1.5 bg-indigo-950/50 border-b border-indigo-900/40 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-indigo-400 font-medium">Screen Context:</span>
              <span className="font-mono text-cyan-300 truncate">{location.pathname}</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 shrink-0">
              <span>Role:</span>
              <strong className="text-violet-300">{currentUser?.role || 'RECOVERY_ADMIN'}</strong>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-lg ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 text-white rounded-br-none border border-violet-400/30'
                      : 'bg-slate-900/90 border border-indigo-900/60 text-slate-200 rounded-bl-none shadow-indigo-950/40'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="text-xs sm:text-sm font-medium whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div>
                      {renderFormattedContent(msg.content)}

                      {/* Related Metrics Card */}
                      {msg.related_metrics && (
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-indigo-900/50 grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-900/40">
                            <span className="text-[10px] text-slate-400 font-mono block">At Risk</span>
                            <span className="text-xs font-bold text-amber-400 font-mono">
                              ₹{Number(msg.related_metrics.total_at_risk || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-900/40">
                            <span className="text-[10px] text-slate-400 font-mono block">Recovered</span>
                            <span className="text-xs font-bold text-cyan-400 font-mono">
                              ₹{Number(msg.related_metrics.total_recovered || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Deep Link Action Button */}
                      {msg.deep_link && (
                        <div className="mt-3 pt-2 border-t border-indigo-900/50">
                          <button
                            onClick={() => handleDeepLink(msg.deep_link!)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-violet-950/80 to-indigo-950/80 hover:from-violet-900/80 hover:to-indigo-900/80 border border-indigo-700/60 rounded-xl text-xs font-bold text-cyan-300 transition-all cursor-pointer group"
                          >
                            <span className="flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Jump to Action Workspace</span>
                            </span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-cyan-400" />
                          </button>
                        </div>
                      )}

                      {/* Action Suggestion Chips */}
                      {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-indigo-900/50 space-y-1.5">
                          <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider block font-bold">
                            💡 Recommended Follow-Ups:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.suggested_actions.map((act, i) => (
                              <button
                                key={i}
                                onClick={() => handleSendMessage(act)}
                                className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-800/60 text-cyan-300 hover:text-white font-medium transition-all text-left cursor-pointer"
                              >
                                {act}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <span className="text-[9px] text-slate-500 font-mono block text-right mt-1.5">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-violet-600/40 border border-violet-500/50 flex items-center justify-center text-violet-200 shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Thinking Indicator */}
            {loading && (
              <div className="flex gap-3 justify-start items-center animate-in fade-in">
                <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-cyan-400 shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-slate-900/90 border border-indigo-900/60 rounded-2xl rounded-bl-none px-4 py-2.5 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  <span className="text-xs text-indigo-300 font-mono ml-2">Analyzing Live Telemetry & Policies...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Prompts */}
          <div className="px-3 py-2 bg-slate-950 border-t border-indigo-900/40 overflow-x-auto shrink-0 flex items-center gap-1.5 no-scrollbar">
            <span className="text-[10px] font-mono text-indigo-400 uppercase shrink-0 font-bold">Quick:</span>
            {DEFAULT_STARTER_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.prompt)}
                className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/60 text-slate-300 hover:text-cyan-300 transition-all font-medium cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-950 border-t border-indigo-900/50 shrink-0">
            <div className="flex items-end gap-2 bg-slate-900/95 border border-indigo-800/60 focus-within:border-cyan-400/80 rounded-xl p-2 transition-all shadow-inner">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask RevenueRescue AI in Hindi or English (Enter to send)..."
                rows={1}
                className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 resize-none outline-none max-h-28 overflow-y-auto px-1 py-0.5"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || loading}
                className="p-2 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 disabled:opacity-30 text-white transition-all cursor-pointer shrink-0 shadow-md shadow-indigo-950"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1.5 px-1">
              <span>Press <strong>Enter</strong> to send • <strong>Shift+Enter</strong> for newline</span>
              <span className="text-cyan-400 font-semibold">RevenueRescue AI v2.0</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
