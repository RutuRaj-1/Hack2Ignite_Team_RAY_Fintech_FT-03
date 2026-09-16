"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/DashboardLayout";
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
  ChevronRight,
  Info,
  Loader2,
  Lightbulb,
  CreditCard,
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
  const { firebaseUser, getIdToken, authLoading } = useAuth();
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAnswering]);

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

    const userMsg: ChatMessageItem = {
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsAnswering(true);

    try {
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

  if (loadingContext && !context) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-100px)] space-y-4">
        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-400" />
              AI Financial Coach
            </h1>
            <p className="text-sm text-gray-400 mt-1">FT-01 · Live Advisory Engine</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setLoadingContext(true);
                loadInitialData();
              }}
              className="btn btn-outline !py-1.5 !px-3 !text-xs"
              title="Refresh Telemetry Context"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Refresh Context
            </button>
          </div>
        </div>

        {/* ── Real-Time Deterministic Financial Context Strip ──────────────── */}
        {context && (
          <div className="glass-card p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-2 rounded-lg bg-black/20 border border-white/5">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Trust Score</span>
                <span className="text-base font-bold text-cyan-400">
                  {context.trust_score}
                  <span className="text-[10px] text-gray-500 font-normal">/100</span>
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/20 border border-white/5">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Monthly Revenue</span>
                <span className="text-base font-bold text-white">{formatINR(context.monthly_revenue)}</span>
              </div>
              <div className="p-2 rounded-lg bg-black/20 border border-white/5">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Net Cash Flow</span>
                <span className={`text-base font-bold ${context.net_cash_flow >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {context.net_cash_flow >= 0 ? "+" : ""}{formatINR(context.net_cash_flow)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/20 border border-white/5">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Expense Ratio</span>
                <span className="text-base font-bold text-purple-300">{(context.expense_ratio * 100).toFixed(1)}%</span>
              </div>
              <div className="p-2 rounded-lg bg-black/20 border border-white/5">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Estimated EMI</span>
                <span className="text-base font-bold text-amber-400">{formatINR(context.estimated_emi)}</span>
              </div>
              <div className="p-2 rounded-lg bg-black/20 border border-white/5">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Projected Surplus</span>
                <span className={`text-base font-bold ${context.projected_surplus >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {context.projected_surplus >= 0 ? "+" : ""}{formatINR(context.projected_surplus)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Main Layout ────────────────────────────────────────── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          {/* Mobile Tab Switcher */}
          <div className="lg:hidden col-span-1 flex gap-2">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 ${
                activeTab === "chat" ? "bg-purple-600 text-white" : "bg-black/20 text-gray-400 border border-white/5"
              }`}
            >
              <Bot className="h-4 w-4" />
              <span>AI Advisor</span>
            </button>
            <button
              onClick={() => setActiveTab("education")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 ${
                activeTab === "education" ? "bg-purple-600 text-white" : "bg-black/20 text-gray-400 border border-white/5"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Literacy ({cards.length})</span>
            </button>
          </div>

          {/* Left Column: Chat Conversation (8 Cols) */}
          <div className={`lg:col-span-8 flex flex-col h-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden ${activeTab === "chat" ? "flex" : "hidden lg:flex"}`}>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 max-w-[90%] sm:max-w-[82%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                    msg.role === "user" ? "bg-indigo-600 text-white" : "bg-purple-600/20 border border-purple-500/30 text-purple-300"
                  }`}>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className="space-y-1.5">
                    <div className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-black/40 border border-white/5 text-gray-200 rounded-tl-none space-y-3"
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.role === "assistant" && (
                        <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                          <Sparkles className="h-3 w-3 text-purple-400" />
                          <span>Based on prototype telemetry.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isAnswering && (
                <div className="flex gap-3 max-w-[80%] mr-auto">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none p-4 bg-black/40 border border-white/5 text-gray-300 flex items-center gap-2 text-xs">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                    <span>Synthesizing explanation...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-4 py-2 border-t border-white/5 bg-black/20">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="text-[11px] text-gray-400 whitespace-nowrap mr-1 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3 text-amber-400" /> Quick Prompts:
                </span>
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isAnswering}
                    className="px-2.5 py-1 rounded-full border border-white/10 bg-black/40 hover:bg-white/5 hover:border-purple-500/40 text-gray-300 text-[11px] whitespace-nowrap transition disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 border-t border-white/10 bg-black/40 flex items-center gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAnswering}
                placeholder="Ask about cash flow, EMI affordability, or trust score..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputQuery.trim() || isAnswering}
                className="btn btn-primary !bg-purple-600 hover:!bg-purple-500 !border-purple-600 disabled:opacity-40"
              >
                {isAnswering ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span className="hidden sm:inline">Send</span><Send className="h-3.5 w-3.5 sm:ml-1" /></>}
              </button>
            </div>
          </div>

          {/* Right Column: Educational Cards (4 Cols) */}
          <div className={`lg:col-span-4 flex flex-col h-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden ${activeTab === "education" ? "flex" : "hidden lg:flex"}`}>
            <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Literacy Modules</h3>
                  <p className="text-[11px] text-gray-400">Essential MSME finance</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cards.map((card) => (
                <div key={card.id} className="p-3.5 rounded-2xl border border-white/5 bg-black/20 hover:border-white/10 transition space-y-2 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                      {card.topic}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition">{card.title}</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3">{card.summary}</p>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 italic max-w-[70%] truncate">Tip: {card.practical_tip}</span>
                    <button
                      onClick={() => {
                        if (activeTab === "education") setActiveTab("chat");
                        handleSendMessage(card.sample_question);
                      }}
                      className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      Ask <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function FinancialCoachPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      </DashboardLayout>
    }>
      <CoachContent />
    </Suspense>
  );
}
