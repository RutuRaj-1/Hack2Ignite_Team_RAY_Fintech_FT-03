import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import {
  getTransactions, uploadTransactionsCsv, seedDemoData,
  type TransactionResponse, type UploadSummary, ApiError,
} from "@/lib/api";
import {
  Receipt, Upload, Sparkles, Search, ArrowUpRight, ArrowDownLeft,
  AlertCircle, CheckCircle2, RefreshCw,
} from "lucide-react";

export default function TransactionsPage() {
  const { getIdToken } = useAuth();
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "credit" | "debit">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTxns = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const token = await getIdToken();
      if (!token) return;
      const res = await getTransactions(token, 200, 0);
      setTransactions(res.transactions || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTxns(); }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadResult(null); setErrorMsg(null);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Auth token unavailable");
      const res = await uploadTransactionsCsv(token, file);
      setUploadResult(res);
      await fetchTxns();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to parse and upload CSV");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSeed = async () => {
    setSeeding(true); setErrorMsg(null);
    try {
      const token = await getIdToken();
      if (!token) return;
      await seedDemoData(token);
      await fetchTxns();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to seed demo data");
    } finally {
      setSeeding(false); }
  };

  const categories = Array.from(new Set(transactions.map((t) => t.category))).filter(Boolean);

  const filtered = transactions.filter((t) => {
    const matchSearch =
      (t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (t.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.amount.toString().includes(searchTerm);
    const matchType = selectedType === "all" || t.transaction_type === selectedType;
    const matchCat  = selectedCategory === "all" || t.category === selectedCategory;
    return matchSearch && matchType && matchCat;
  });

  const formatCurrency = (val: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(num);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 page-enter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-brand">Ledger</span>
            </div>
            <h1 className="text-h1 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-50)" }}>
                <Receipt size={18} style={{ color: "var(--brand-700)" }} />
              </div>
              Transactions
            </h1>
            <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Upload bank statements, UPI records, and GST data for risk modeling.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap self-start">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" id="csv-upload-input" />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn btn-primary flex items-center gap-2">
              <Upload size={14} className={uploading ? "animate-spin" : ""} />
              {uploading ? "Uploading..." : "Upload CSV"}
            </button>
            <button onClick={handleSeed} disabled={seeding} className="btn btn-secondary flex items-center gap-2">
              <Sparkles size={14} className={seeding ? "animate-spin" : ""} style={{ color: "var(--warning)" }} />
              {seeding ? "Generating..." : "Demo Data"}
            </button>
          </div>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <div className="alert alert-success">
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <div className="text-sm">
              <p className="font-semibold mb-0.5">CSV Processed Successfully</p>
              <p>{uploadResult.accepted_rows} rows ingested ({uploadResult.rejected_rows} rejected).</p>
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-2 space-y-0.5 max-h-20 overflow-y-auto">
                  {uploadResult.errors.map((e, i) => (
                    <p key={i} className="text-xs font-mono">Row {e.row}: {e.reason}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-danger">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <div className="text-sm">
              <p className="font-semibold mb-0.5">Notice</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="input-icon w-full md:w-80">
            <Search className="icon" size={16} />
            <input
              type="text"
              className="input"
              placeholder="Search merchant, category, or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
              {[
                { key: "all",    label: "All" },
                { key: "credit", label: "Credits" },
                { key: "debit",  label: "Debits" },
              ].map((opt) => (
                <button key={opt.key}
                  onClick={() => setSelectedType(opt.key as typeof selectedType)}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: selectedType === opt.key ? (opt.key === "credit" ? "var(--success)" : opt.key === "debit" ? "var(--danger)" : "var(--brand-700)") : "transparent",
                    color: selectedType === opt.key ? "#fff" : "var(--text-muted)",
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>

            {categories.length > 0 && (
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input" style={{ maxWidth: "180px" }}>
                <option value="all">All Categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}

            <button onClick={fetchTxns} className="btn btn-ghost btn-sm" aria-label="Refresh" style={{ padding: "0.45rem" }}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Merchant / Counterparty</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((tx) => {
                    const isCredit = tx.transaction_type === "credit";
                    return (
                      <tr key={tx.id}>
                        <td className="text-xs" style={{ color: "var(--text-muted)" }}>{tx.transaction_date}</td>
                        <td>
                          <span className={`badge ${isCredit ? "badge-success" : "badge-danger"} gap-0.5`}>
                            {isCredit ? <ArrowDownLeft size={9} /> : <ArrowUpRight size={9} />}
                            {tx.transaction_type.toUpperCase()}
                          </span>
                        </td>
                        <td className="font-medium" style={{ color: "var(--text-primary)" }}>
                          {tx.merchant || "Standard Settlement"}
                        </td>
                        <td>
                          <span className="badge badge-muted capitalize">{tx.category}</span>
                        </td>
                        <td className="max-w-xs truncate text-xs" style={{ color: "var(--text-muted)" }}>
                          {tx.description || "—"}
                        </td>
                        <td className="text-right">
                          <span className="text-financial font-bold" style={{ color: isCredit ? "var(--success)" : "var(--text-primary)" }}>
                            {isCredit ? "+" : "−"} {formatCurrency(tx.amount)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center" style={{ color: "var(--text-muted)" }}>
                      {loading ? "Loading ledger..." : "No matching transactions. Upload CSV or generate demo records."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 flex items-center justify-between text-xs"
            style={{ borderTop: "1px solid var(--border)", background: "var(--background)", color: "var(--text-muted)" }}>
            <span>Showing {filtered.length} of {total} records</span>
            <span>256-bit encrypted ledger integrity</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
