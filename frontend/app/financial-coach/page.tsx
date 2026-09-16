"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  askCoach,
  getCoachContext,
  getEducationalCards,
  type FinancialContext,
  type CoachMessage,
  type EducationalCard,
} from "@/lib/api";
import {
  ShieldCheck,
  Sparkles,
  Bot,
  User,
  Send,
  RefreshCw,
  BookOpen,
  IndianRupee,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  Loader2,
  Lightbulb,
  CreditCard,
  Layers,
  ArrowRight,
} from "lucide-react";

interface ChatMessageItem {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

function formatINR(val: number): string {
  if (Math.abs(val) >= 100000) {
    return `₹${(val / 100000).toFixed(2)}L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

const QUICK_PROMPTS = [
  "Can I afford a ₹50,000 loan?",
  "Why is my financial trust score low?",
  "Why was this transaction flagged?",
  "How can I improve my cash flow?",
  "What does EMI mean?",
  "What is repayment burden?",
];

function CoachContent() {
  const { firebaseUser, getIdToken, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [context, setContext] = useState<FinancialContext | null>(null);
  const [cards, setCards] = useState<EducationalCard[]>([]);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [loadingContext, setLoadingContext] = useState(true);
  const [isAnswering, setIsAnswering] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "education">("chat");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const initialQueryHandled = useRef(false);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAnswering]);

  // Load context & educational cards
  const loadInitialData = useCallback(async () => {
    try {
      const token = await getIdToken();
      if (!token) return;

      const [ctx, eduRes] = await Promise.all([
        getCoachContext(token),
        getEducationalCards(),
      ]);

      setContext(ctx);
      setCards(eduRes.cards);

      // Set initial coach welcome message if empty
      setMessages((prev) => {
        if (prev.length > 0) return prev;
        return [
          {
            role: "assistant",
            content: `Hello! I'm your FINBRIDGE AI Financial Coach. I interpret your actual financial telemetry—monthly cash flows, credit trust score (${ctx.trust_score}/100), and repayment capacity—to help you build credit and make sound borrowing choices.\n\nAsk me any question below, or select one of the quick prompts to get started!`,
            timestamp: new Date().toISOString(),
          },
        ];
      });
    } catch (err) {
      console.error("Failed to load coach context:", err);
    } finally {
      setLoadingContext(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/login");
      return;
    }
    if (firebaseUser) {
      loadInitialData();
    }
  }, [authLoading, firebaseUser, router, loadInitialData]);

  const handleSendMessage = useCallback(async (queryToSend?: string) => {
    const query = (queryToSend || inputQuery).trim();
    if (!query || isAnswering) return;

    const token = await getIdToken();
    if (!token) return;

    // Add user message to state
    const userMsg: ChatMessageItem = {
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsAnswering(true);

    try {
      // Prepare history
      const historyPayload: CoachMessage[] = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await askCoach(
        {
          question: query,
          history: historyPayload,
        },
        token
      );

      const assistantMsg: ChatMessageItem = {
        role: "assistant",
        content: response.answer,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Unable to process request: ${e.message || "Please check your network or try again."}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsAnswering(false);
    }
  }, [inputQuery, isAnswering, getIdToken, messages]);

  // Handle URL query param `?q=...`
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !initialQueryHandled.current && !loadingContext && firebaseUser) {
      initialQueryHandled.current = true;
      handleSendMessage(q);
    }
  }, [searchParams, loadingContext, firebaseUser, handleSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (authLoading || (loadingContext && !context)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30 pb-16 flex flex-col">
      {/* ── Top Navigation Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium"
            >
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
              <span>FINBRIDGE</span>
            </Link>
            <span className="text-slate-600">/</span>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <h1 className="text-base font-semibold text-white">AI Financial Coach</h1>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
              FT-01 Live
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/credit-profile"
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              <span>Trust Score ({context?.trust_score ?? "—"}/100)</span>
            </Link>
            <Link
              href="/loan"
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <CreditCard className="h-3.5 w-3.5 text-indigo-400" />
              <span>Loan Hub</span>
            </Link>
            <button
              onClick={() => {
                setLoadingContext(true);
                loadInitialData();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Refresh Telemetry Context"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Real-Time Deterministic Financial Context Strip ──────────────── */}
      {context && (
        <div className="border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-sm px-6 py-3">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Trust Score
              </span>
              <span className="text-base font-bold text-cyan-400">
                {context.trust_score}
                <span className="text-[10px] text-slate-500 font-normal">/100</span>
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Monthly Revenue
              </span>
              <span className="text-base font-bold text-white">
                {formatINR(context.monthly_revenue)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Net Cash Flow
              </span>
              <span
                className={`text-base font-bold ${
                  context.net_cash_flow >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {context.net_cash_flow >= 0 ? "+" : ""}
                {formatINR(context.net_cash_flow)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Expense Ratio
              </span>
              <span className="text-base font-bold text-purple-300">
                {(context.expense_ratio * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Estimated EMI
              </span>
              <span className="text-base font-bold text-amber-400">
                {formatINR(context.estimated_emi)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Projected Surplus
              </span>
              <span
                className={`text-base font-bold ${
                  context.projected_surplus >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {context.projected_surplus >= 0 ? "+" : ""}
                {formatINR(context.projected_surplus)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout (Chat on Left, Educational Cards on Right) ──────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mobile Tab Switcher */}
        <div className="lg:hidden col-span-1 flex gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 ${
              activeTab === "chat"
                ? "bg-purple-600 text-white"
                : "bg-slate-900 text-slate-400"
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>AI Advisor</span>
          </button>
          <button
            onClick={() => setActiveTab("education")}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 ${
              activeTab === "education"
                ? "bg-purple-600 text-white"
                : "bg-slate-900 text-slate-400"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Financial Literacy ({cards.length})</span>
          </button>
        </div>

        {/* Left Column: Chat Conversation (8 Cols) */}
        <div
          className={`lg:col-span-8 flex flex-col h-[76vh] rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden ${
            activeTab === "chat" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  FINBRIDGE Advisory Engine
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Deterministic analytics grounded with Local Ollama LLM
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              <Info className="h-3 w-3 text-purple-400" />
              <span>MSME Behavior Guidance</span>
            </div>
          </div>

          {/* Chat Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[90%] sm:max-w-[82%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-purple-600/20 border border-purple-500/30 text-purple-300"
                  }`}
                >
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div className="space-y-1.5">
                  <div
                    className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 rounded-tr-none"
                        : "bg-slate-950/80 border border-slate-800 text-slate-200 shadow-md rounded-tl-none space-y-3"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {msg.role === "assistant" && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                        <Sparkles className="h-3 w-3 text-purple-400" />
                        <span>Based on prototype telemetry. Never constitutes regulated advice.</span>
                      </div>
                    )}
                  </div>

                  {msg.timestamp && (
                    <div
                      className={`text-[10px] text-slate-500 px-1 ${
                        msg.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isAnswering && (
              <div className="flex gap-3 max-w-[80%] mr-auto">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-none p-4 bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center gap-2 text-xs">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                  <span>Synthesizing grounded explanation from your data...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-[11px] text-slate-400 whitespace-nowrap mr-1 flex items-center gap-1">
                <Lightbulb className="h-3 w-3 text-amber-400" />
                Quick Prompts:
              </span>
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isAnswering}
                  className="px-2.5 py-1 rounded-full border border-slate-700 bg-slate-900/80 hover:bg-slate-800 hover:border-purple-500/40 text-slate-300 text-[11px] whitespace-nowrap transition disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isAnswering}
              placeholder="Ask about cash flow, EMI affordability, trust score factors, or schemes..."
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || isAnswering}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isAnswering ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <Send className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Contextual Financial Literacy Hub (4 Cols) */}
        <div
          className={`lg:col-span-4 flex flex-col h-[76vh] rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden ${
            activeTab === "education" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Literacy Modules
                </h3>
                <p className="text-[11px] text-slate-400">Essential small-business finance</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              7 Lessons
            </span>
          </div>

          {/* Cards List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                    {card.topic}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">FT-01</span>
                </div>

                <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition">
                  {card.title}
                </h4>

                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                  {card.summary}
                </p>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 italic">
                    Tip: {card.practical_tip.slice(0, 36)}...
                  </span>
                  <button
                    onClick={() => {
                      if (activeTab === "education") setActiveTab("chat");
                      handleSendMessage(card.sample_question);
                    }}
                    className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
                  >
                    <span>Ask Coach</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Callout */}
          <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Need loan simulation?</span>
            <Link
              href="/loan/simulator"
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Try Simulator</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function FinancialCoachPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <CoachContent />
    </Suspense>
  );
}
