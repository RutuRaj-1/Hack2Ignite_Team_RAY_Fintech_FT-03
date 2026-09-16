"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  uploadTransactionsCsv,
  getTransactions,
  type TransactionResponse,
  type UploadSummary,
  ApiError,
} from "@/lib/api";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  PieChart,
  BarChart2,
  X,
  CloudUpload,
} from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  Revenue: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Inventory: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Rent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Utilities: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  Salary: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  Marketing: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  Transportation: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "Loan Payment": "text-red-400 bg-red-500/10 border-red-500/20",
  Miscellaneous: "text-gray-400 bg-gray-500/10 border-gray-500/20",
};

const PAGE_SIZE = 20;

export default function TransactionsPage() {
  const { firebaseUser, authLoading, getIdToken } = useAuth();

  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loadingTxns, setLoadingTxns] = useState(true);

  // Upload state
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadSummary | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load transactions ────────────────────────────────────────────────────
  const loadTransactions = useCallback(
    async (pageNum: number) => {
      const idToken = await getIdToken();
      if (!idToken) return;
      setLoadingTxns(true);
      try {
        const data = await getTransactions(
          idToken,
          PAGE_SIZE,
          pageNum * PAGE_SIZE
        );
        setTransactions(data.transactions);
        setTotal(data.total);
      } catch {
        // no-op
      } finally {
        setLoadingTxns(false);
      }
    },
    [getIdToken]
  );

  useEffect(() => {
    if (!authLoading && firebaseUser) {
      loadTransactions(page);
    }
  }, [firebaseUser, authLoading, page, loadTransactions]);

  // ── Upload handler ───────────────────────────────────────────────────────
  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setUploadError("Only .csv files are accepted.");
        return;
      }
      setUploading(true);
      setUploadError(null);
      setUploadResult(null);
      try {
        const idToken = await getIdToken();
        if (!idToken) throw new Error("Not authenticated");
        const result = await uploadTransactionsCsv(idToken, file);
        setUploadResult(result);
        // Reload first page
        setPage(0);
        await loadTransactions(0);
      } catch (err) {
        if (err instanceof ApiError) {
          setUploadError(err.message);
        } else {
          setUploadError("Upload failed. Please try again.");
        }
      } finally {
        setUploading(false);
      }
    },
    [getIdToken, loadTransactions]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const formatAmount = (amount: string, type: string) => {
    const num = parseFloat(amount);
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
    return type === "credit" ? `+${formatted}` : `-${formatted}`;
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ── Page header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Transactions</h1>
            <p className="text-sm text-gray-400 mt-1">
              Upload your bank statement CSV and view all categorized transactions.
            </p>
          </div>
          <Link
            href="/analytics"
            className="btn btn-outline"
          >
            <PieChart className="w-3.5 h-3.5" />
            View Analytics
            <ArrowUpRight className="w-3 h-3 ml-1" />
          </Link>
        </div>

        {/* ── CSV Upload Zone ── */}
        <div
          id="csv-upload-zone"
          className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer ${
            dragging
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-700 bg-black/20 hover:border-blue-500/50 hover:bg-blue-500/5"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={onFileChange}
            id="csv-file-input"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-sm font-medium text-blue-400">
                Processing your CSV file…
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <CloudUpload className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">
                  Drop your CSV file here (Demo Data) or{" "}
                  <span className="text-blue-400">click to browse</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Required columns: date, description, amount, type, merchant
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FileText className="w-3.5 h-3.5" />
                <span>CSV format only</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Upload error ── */}
        {uploadError && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-300">Upload Failed</p>
              <p className="text-xs text-red-400/80 mt-0.5">{uploadError}</p>
            </div>
            <button
              onClick={() => setUploadError(null)}
              className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Upload result ── */}
        {uploadResult && (
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Upload Complete
                </h3>
                <p className="text-xs text-gray-400">{uploadResult.message}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-black/20 rounded-xl p-4 text-center border border-white/5">
                <p className="text-2xl font-bold text-white">
                  {uploadResult.total_rows}
                </p>
                <p className="text-xs text-gray-400 mt-1">Total Rows</p>
              </div>
              <div className="bg-emerald-500/5 rounded-xl p-4 text-center border border-emerald-500/10">
                <p className="text-2xl font-bold text-emerald-400">
                  {uploadResult.accepted_rows}
                </p>
                <p className="text-xs text-emerald-400/70 mt-1">Accepted</p>
              </div>
              <div className="bg-red-500/5 rounded-xl p-4 text-center border border-red-500/10">
                <p className="text-2xl font-bold text-red-400">
                  {uploadResult.rejected_rows}
                </p>
                <p className="text-xs text-red-400/70 mt-1">Rejected</p>
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-400 mb-2">
                  Row Errors ({uploadResult.errors.length})
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {uploadResult.errors.map((err, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-gray-400 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-1.5"
                    >
                      <span className="text-red-400 font-mono">
                        Row {err.row}
                      </span>
                      <span>—</span>
                      <span>{err.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Transaction Table ── */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <BarChart2 className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-semibold text-white">
                All Transactions
              </h2>
              <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                {total} total
              </span>
            </div>
          </div>

          {loadingTxns ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Upload className="w-10 h-10 text-gray-600 mb-3" />
              <p className="text-gray-400 font-medium">No transactions yet</p>
              <p className="text-xs text-gray-600 mt-1">
                Upload a CSV file above to get started
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Merchant
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map((txn) => (
                      <tr
                        key={txn.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-3.5 text-xs font-mono text-gray-400 whitespace-nowrap">
                          {txn.transaction_date}
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="text-sm text-gray-200 line-clamp-1 max-w-xs">
                            {txn.description || "—"}
                          </p>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-400 whitespace-nowrap">
                          {txn.merchant || "—"}
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${
                              CATEGORY_COLORS[txn.category] ||
                              CATEGORY_COLORS["Miscellaneous"]
                            }`}
                          >
                            {txn.category}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span
                            className={`text-sm font-semibold font-mono ${
                              txn.transaction_type === "credit"
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {formatAmount(txn.amount, txn.transaction_type)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5">
                  <p className="text-xs text-gray-400">
                    Showing {page * PAGE_SIZE + 1}–
                    {Math.min((page + 1) * PAGE_SIZE, total)} of {total}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      id="prev-page-btn"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="btn btn-ghost !py-1.5 !px-3 !text-xs disabled:opacity-40"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Prev
                    </button>
                    <span className="text-xs text-gray-500 font-medium">
                      {page + 1} / {totalPages}
                    </span>
                    <button
                      id="next-page-btn"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                      disabled={page >= totalPages - 1}
                      className="btn btn-ghost !py-1.5 !px-3 !text-xs disabled:opacity-40"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── CTA to Analytics ── */}
        {transactions.length > 0 && (
          <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-emerald-900/20">
            <div>
              <h3 className="text-base font-bold text-white">
                Ready to explore your financial insights?
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                View revenue trends, expense breakdown, and cash-flow analysis.
              </p>
            </div>
            <Link
              href="/analytics"
              className="btn btn-primary whitespace-nowrap"
            >
              <TrendingUp className="w-4 h-4" />
              Analytics Dashboard
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
