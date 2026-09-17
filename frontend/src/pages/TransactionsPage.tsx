import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import {
  getTransactions,
  uploadTransactionsCsv,
  seedDemoData,
  type TransactionResponse,
  type UploadSummary,
  ApiError,
} from "@/lib/api";
import {
  Receipt,
  Upload,
  Sparkles,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
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

  useEffect(() => {
    fetchTxns();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);
    setErrorMsg(null);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Authentication token not available");
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
    setSeeding(true);
    setErrorMsg(null);
    try {
      const token = await getIdToken();
      if (!token) return;
      await seedDemoData(token);
      await fetchTxns();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to seed demo data");
    } finally {
      setSeeding(false);
    }
  };

  const categories = Array.from(new Set(transactions.map((t) => t.category))).filter(Boolean);

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      (t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (t.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.amount.toString().includes(searchTerm);

    const matchesType = selectedType === "all" || t.transaction_type === selectedType;
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const formatCurrency = (val: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Receipt className="text-blue-400" size={26} />
              Financial Transaction Ingestion
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Upload bank statements, UPI records, and GST ledger data for algorithmic risk modeling.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
              id="csv-upload-input"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn btn-primary text-xs flex items-center gap-2"
            >
              <Upload size={14} className={uploading ? "animate-spin" : ""} />
              {uploading ? "Uploading & Validating..." : "Upload CSV"}
            </button>

            <button
              onClick={handleSeed}
              disabled={seeding}
              className="btn btn-secondary text-xs flex items-center gap-2"
            >
              <Sparkles size={14} className={seeding ? "animate-spin text-amber-400" : "text-amber-400"} />
              {seeding ? "Generating..." : "Seed Demo Records"}
            </button>
          </div>
        </div>

        {/* Upload Summary Feedback */}
        {uploadResult && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 flex items-start gap-3">
            <CheckCircle2 size={18} className="mt-0.5 text-emerald-400 flex-shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-emerald-200">CSV Processed Successfully</p>
              <p>
                {uploadResult.accepted_rows} rows ingested into analytical datastore ({uploadResult.rejected_rows} rejected).
              </p>
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-2 text-rose-300 font-mono text-[11px] space-y-0.5 max-h-24 overflow-y-auto">
                  {uploadResult.errors.map((e, idx) => (
                    <div key={idx}>Row {e.row}: {e.reason}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 text-rose-400 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-rose-200">Transaction Processing Notice</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Filters and search */}
        <div className="glass-card p-4 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search merchant, category, or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setSelectedType("all")}
                className={`px-3 py-1 rounded-md transition-all ${
                  selectedType === "all" ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedType("credit")}
                className={`px-3 py-1 rounded-md transition-all ${
                  selectedType === "credit" ? "bg-emerald-600 text-white font-medium" : "text-slate-400 hover:text-white"
                }`}
              >
                Credits
              </button>
              <button
                onClick={() => setSelectedType("debit")}
                className={`px-3 py-1 rounded-md transition-all ${
                  selectedType === "debit" ? "bg-rose-600 text-white font-medium" : "text-slate-400 hover:text-white"
                }`}
              >
                Debits
              </button>
            </div>

            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            <button
              onClick={fetchTxns}
              className="p-2 rounded-lg bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white"
              title="Refresh transactions"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-blue-400" : ""} />
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="glass-card border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-white/5 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Merchant / Counterparty</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => {
                    const isCredit = tx.transaction_type === "credit";
                    return (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400">{tx.transaction_date}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              isCredit
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {isCredit ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                            {tx.transaction_type.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-white">
                          {tx.merchant || "Standard Settlement"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-white/5 text-[11px] text-slate-300 capitalize">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                          {tx.description || "—"}
                        </td>
                        <td className={`py-3 px-4 text-right font-mono font-bold ${isCredit ? "text-emerald-400" : "text-slate-200"}`}>
                          {isCredit ? "+" : "-"} {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                      {loading ? "Loading transaction ledger..." : "No matching transactions found. Upload a CSV or generate demo records."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-white/5 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
            <span>Showing {filteredTransactions.length} of {total} records</span>
            <span className="font-mono text-[11px] text-slate-500">256-bit hashed financial integrity</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
