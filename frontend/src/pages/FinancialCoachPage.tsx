import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import {
  askCoach, getCoachContext, getEducationalCards,
  type FinancialContext, type EducationalCard, type CoachMessage,
} from "@/lib/api";
import {
  Bot, Send, BookOpen, Shield, IndianRupee, ChevronRight, Lightbulb, X,
} from "lucide-react";

export default function FinancialCoachPage() {
  const { getIdToken } = useAuth();
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm your FinBridge AI Financial Coach. I analyze your real-time bank ledger, cash flow buffers, and trust score to provide personalized advice on working capital, loans, and expense discipline. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<FinancialContext | null>(null);
  const [educationCards, setEducationCards] = useState<EducationalCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<EducationalCard | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    const initData = async () => {
      try {
        const token = await getIdToken();
        if (token) {
          const [ctx, edu] = await Promise.allSettled([getCoachContext(token), getEducationalCards()]);
          if (ctx.status === "fulfilled") setContext(ctx.value);
          if (edu.status === "fulfilled") setEducationCards(edu.value.cards || []);
        }
      } catch (err) { console.error(err); }
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
      if (!token) throw new Error("Auth required");
      const res = await askCoach({ question: q, history: messages.slice(-6) }, token);
      setMessages((prev) => [...prev, { role: "assistant", content: res.answer }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "I'm in offline mode right now. Based on MSME benchmarks: Maintain a 45-day cash buffer, keep loan repayment burden under 30% of net margin, and digitize supplier transactions to improve your FinBridge Trust Score.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "How can I improve my Trust Score to 80+?",
    "Is my cash flow safe for a ₹3 Lakh loan?",
    "What government subsidies can I claim?",
    "How do I reduce my expense ratio?",
  ];

  return (
    <DashboardLayout>
      <div className="space-y-5 page-enter">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-ai">FT-01</span>
            <span className="badge badge-muted">AI Coach</span>
          </div>
          <h1 className="text-h1 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--ai-soft)" }}>
              <Bot size={18} style={{ color: "var(--ai)" }} />
            </div>
            AI Financial Coach
          </h1>
          <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Context-aware advisor grounded in your live ledger, cash flow, and credit metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chat Window */}
          <div className="lg:col-span-8 card flex flex-col" style={{ height: "640px" }}>
            {/* Context Bar */}
            {context && (
              <div className="px-4 py-2.5 flex items-center justify-between text-xs"
                style={{ background: "var(--brand-50)", borderBottom: "1px solid var(--brand-100)" }}>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium" style={{ color: "var(--brand-800)" }}>
                    <Shield size={12} style={{ color: "var(--brand-700)" }} />
                    Trust: <strong>{context.trust_score}</strong>
                  </span>
                  <span className="flex items-center gap-1.5 font-medium" style={{ color: "var(--success-text)" }}>
                    <IndianRupee size={12} style={{ color: "var(--success)" }} />
                    Margin: <strong>₹{Math.round(context.net_cash_flow).toLocaleString()}</strong>
                  </span>
                  <span className="hidden sm:inline" style={{ color: "var(--text-muted)" }}>
                    Ratio: {context.expense_ratio.toFixed(1)}%
                  </span>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--brand-700)" }}>
                  Live Context Active
                </span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4" style={{ background: "var(--background)" }}>
              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <div key={idx} className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: isUser ? "var(--brand-700)" : "var(--ai-soft)",
                        border: isUser ? "none" : "1px solid rgba(116,87,200,0.2)",
                        color: isUser ? "#fff" : "var(--ai)",
                      }}>
                      {isUser ? "U" : <Bot size={14} />}
                    </div>
                    <div className={`chat-bubble ${isUser ? "chat-bubble-user" : "chat-bubble-ai"}`}>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-end gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                    style={{ background: "var(--ai-soft)", border: "1px solid rgba(116,87,200,0.2)", color: "var(--ai)" }}>
                    <Bot size={14} />
                  </div>
                  <div className="chat-bubble chat-bubble-ai flex items-center gap-1.5">
                    {[0, 0.2, 0.4].map((d, i) => (
                      <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: "var(--ai)", animationDelay: `${d}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto"
              style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
              <span className="text-[10px] font-semibold uppercase tracking-wider flex-shrink-0" style={{ color: "var(--text-muted)", letterSpacing: "0.05em" }}>
                Try:
              </span>
              {samplePrompts.map((p, i) => (
                <button key={i} onClick={() => handleSend(p)}
                  className="px-2.5 py-1 rounded-full text-xs whitespace-nowrap flex-shrink-0 transition-all hover:shadow-sm"
                  style={{
                    background: "var(--brand-50)", border: "1px solid var(--brand-100)",
                    color: "var(--brand-800)", fontSize: "11px",
                  }}>
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 flex items-center gap-2"
              style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
              <input
                type="text"
                className="input"
                style={{ borderRadius: "999px", fontSize: "13px", padding: "0.5rem 1rem" }}
                placeholder="Ask about working capital, loans, or trust score improvement..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="btn btn-primary"
                style={{ borderRadius: "999px", padding: "0.5rem 0.875rem", minHeight: "38px" }}
              >
                <Send size={14} />
              </button>
            </div>
          </div>

          {/* Knowledge Base */}
          <div className="lg:col-span-4 card p-5 space-y-4 flex flex-col" style={{ maxHeight: "640px" }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={14} style={{ color: "var(--brand-700)" }} />
                <h3 className="font-semibold" style={{ color: "var(--brand-900)", fontSize: "14px" }}>Knowledge Base</h3>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Core concepts for creditworthiness, working capital, and loan sanction terms.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {educationCards.length > 0 ? (
                educationCards.map((card) => (
                  <div key={card.id} onClick={() => setSelectedCard(card)}
                    className="p-3.5 rounded-xl cursor-pointer transition-all hover:shadow-md group"
                    style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="badge badge-ai text-[9px]">{card.topic}</span>
                      <ChevronRight size={13} style={{ color: "var(--text-muted)" }}
                        className="transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <h4 className="text-xs font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>{card.title}</h4>
                    <p className="text-[11px] line-clamp-2" style={{ color: "var(--text-muted)" }}>{card.summary}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl" style={{ background: "var(--warning-soft)", border: "1px solid rgba(216,155,34,0.2)" }}>
                  <p className="font-bold flex items-center gap-1.5 text-xs mb-1" style={{ color: "var(--warning-text)" }}>
                    <Lightbulb size={13} /> Debt-Service Coverage (DSCR)
                  </p>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--warning-text)" }}>
                    Lenders look for a DSCR of 1.3x or higher. Your net cash surplus should exceed monthly EMI by at least 30%.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Knowledge Card Modal */}
        {selectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(23,40,37,0.4)", backdropFilter: "blur(4px)" }}>
            <div className="card max-w-lg w-full p-6 space-y-4 animate-scale-up" style={{ boxShadow: "var(--shadow-lg)" }}>
              <div className="flex items-center justify-between">
                <span className="badge badge-ai">{selectedCard.topic}</span>
                <button onClick={() => setSelectedCard(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: "var(--text-muted)" }}>
                  <X size={16} />
                </button>
              </div>

              <h3 className="font-bold" style={{ color: "var(--brand-900)", fontSize: "17px" }}>{selectedCard.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{selectedCard.detailed_explanation}</p>

              <div className="alert alert-success text-sm">
                <Lightbulb size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p className="font-semibold mb-0.5">Actionable Tip</p>
                  <p>{selectedCard.practical_tip}</p>
                </div>
              </div>

              {selectedCard.sample_question && (
                <button
                  onClick={() => { setSelectedCard(null); handleSend(selectedCard.sample_question); }}
                  className="btn btn-outline w-full text-sm"
                  style={{ justifyContent: "flex-start", gap: "0.5rem" }}
                >
                  <Bot size={14} />
                  Ask: "{selectedCard.sample_question}"
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
