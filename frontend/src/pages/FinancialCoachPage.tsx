import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import {
  askCoach,
  getCoachContext,
  getEducationalCards,
  type FinancialContext,
  type EducationalCard,
  type CoachMessage,
} from "@/lib/api";
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Shield,
  DollarSign,
  ChevronRight,
  RefreshCw,
  Lightbulb,
} from "lucide-react";

export default function FinancialCoachPage() {
  const { getIdToken } = useAuth();
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I am FINBRIDGE AI, your algorithmic MSME financial copilot. I analyze your real-time bank ledger, cash flow buffers, and trust score metrics to provide contextual advice on working capital, loans, and expense discipline. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<FinancialContext | null>(null);
  const [educationCards, setEducationCards] = useState<EducationalCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<EducationalCard | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initData = async () => {
      try {
        const token = await getIdToken();
        if (token) {
          const [ctx, edu] = await Promise.allSettled([
            getCoachContext(token),
            getEducationalCards(),
          ]);
          if (ctx.status === "fulfilled") setContext(ctx.value);
          if (edu.status === "fulfilled") setEducationCards(edu.value.cards || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    initData();
  }, []);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    setInput("");
    const newMessages: CoachMessage[] = [...messages, { role: "user", content: q }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const token = await getIdToken();
      if (!token) throw new Error("Authentication token unavailable");

      const res = await askCoach(
        {
          question: q,
          history: messages.slice(-6),
        },
        token
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.answer,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm operating in offline simulated mode right now. Based on standard MSME health benchmarks: Maintain a cash-flow buffer covering at least 45 days of operational expenses, keep loan repayment burden under 30% of net margin, and digitize all supplier transactions to optimize your FINBRIDGE Trust Score.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "How can I improve my FINBRIDGE Trust Score to 80+?",
    "Is my current cash flow safe for a ₹3 Lakh expansion loan?",
    "What government subsidies can my business claim?",
    "How should I optimize my operating expense ratio?",
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Bot className="text-blue-400" size={26} />
              AI Financial Copilot & Strategic Advisor
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Context-aware LLM grounded in your real-time verified ledger, cash-flow metrics, and credit parameters.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chat Container (Left) */}
          <div className="lg:col-span-8 glass-card border border-white/5 flex flex-col h-[650px]">
            {/* Context Telemetry Bar */}
            {context && (
              <div className="p-3 bg-slate-900/90 border-b border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-slate-300">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Shield size={13} className="text-blue-400" /> Score:{" "}
                    <strong className="text-white">{context.trust_score}</strong>
                  </span>
                  <span className="flex items-center gap-1.5 font-mono">
                    <DollarSign size={13} className="text-emerald-400" /> Margin:{" "}
                    <strong className="text-emerald-300">
                      ₹{Math.round(context.net_cash_flow).toLocaleString()}
                    </strong>
                  </span>
                  <span className="hidden sm:inline font-mono text-slate-400">
                    Ratio: {context.expense_ratio.toFixed(1)}%
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Live Grounding Active
                </span>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isUser
                          ? "bg-blue-600 text-white font-mono text-xs font-bold"
                          : "bg-purple-600/30 border border-purple-500/30 text-purple-300"
                      }`}
                    >
                      {isUser ? "U" : <Bot size={16} />}
                    </div>
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-slate-900/80 border border-white/5 text-slate-200 rounded-tl-none space-y-1.5"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/30 text-purple-300 flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 text-xs text-slate-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="font-mono text-[11px] ml-1">Analyzing financial telemetry...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2 border-t border-white/5 bg-slate-900/40 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-mono uppercase text-slate-500 flex-shrink-0">Suggestions:</span>
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-white/5 text-[11px] text-slate-300 whitespace-nowrap flex-shrink-0 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-white/5 bg-slate-900/90 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask any question about working capital, cash flow, or debt management..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="btn btn-primary px-4 py-2.5 rounded-xl flex items-center justify-center disabled:opacity-50"
              >
                <Send size={15} />
              </button>
            </div>
          </div>

          {/* Education & Best Practices Cards (Right) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-card p-5 border border-white/5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <BookOpen className="text-blue-400" size={18} />
                MSME Financial Knowledge Base
              </h3>
              <p className="text-xs text-slate-400">
                Core concepts to improve creditworthiness, working capital health, and loan sanction terms.
              </p>

              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                {educationCards.length > 0 ? (
                  educationCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCard(card)}
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                          {card.topic}
                        </span>
                        <ChevronRight size={14} className="text-slate-500" />
                      </div>
                      <h4 className="text-xs font-bold text-white">{card.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{card.summary}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-xs space-y-2">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <Lightbulb size={14} className="text-amber-400" /> Debt-Service Coverage (DSCR)
                    </p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Lenders look for a DSCR of 1.3x or higher. This means your net cash surplus should exceed total monthly EMI obligations by at least 30%.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Modal */}
        {selectedCard && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-card max-w-lg w-full p-6 border border-white/10 space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                  {selectedCard.topic}
                </span>
                <button onClick={() => setSelectedCard(null)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>

              <h3 className="text-lg font-bold text-white">{selectedCard.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedCard.detailed_explanation}</p>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200">
                <p className="font-bold text-emerald-300">Actionable Rule of Thumb:</p>
                <p className="mt-1">{selectedCard.practical_tip}</p>
              </div>

              {selectedCard.sample_question && (
                <button
                  onClick={() => {
                    const q = selectedCard.sample_question;
                    setSelectedCard(null);
                    handleSend(q);
                  }}
                  className="w-full btn btn-secondary text-xs py-2 text-blue-400"
                >
                  Ask Coach: "{selectedCard.sample_question}"
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
