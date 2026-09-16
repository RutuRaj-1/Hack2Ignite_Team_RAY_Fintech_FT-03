import React from "react";
import { AlertTriangle } from "lucide-react";
import { RiskBadge } from "./RiskBadge";
import type { FraudAlertResponse } from "@/lib/api";

interface FraudAlertCardProps {
  alert: FraudAlertResponse;
  className?: string;
}

export function FraudAlertCard({ alert, className = "" }: FraudAlertCardProps) {
  const isHighRisk = alert.risk_level === "HIGH";
  
  return (
    <div className={`glass-card p-5 border-l-4 ${isHighRisk ? 'border-l-red-500' : 'border-l-amber-500'} ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-5 h-5 ${isHighRisk ? 'text-red-400' : 'text-amber-400'}`} />
          <h4 className="font-semibold text-white">
            {alert.transaction ? alert.transaction.merchant || "Unknown Merchant" : "Transaction Alert"}
          </h4>
        </div>
        <RiskBadge level={alert.risk_level} />
      </div>
      
      {alert.transaction && (
        <div className="text-sm text-gray-300 mb-3 font-mono">
          ₹{alert.transaction.amount.toLocaleString()} • {new Date(alert.transaction.transaction_date).toLocaleDateString()}
        </div>
      )}
      
      <div className="space-y-2 mt-3">
        {alert.detected_reasons.map((reason, idx) => (
          <div key={idx} className="text-xs bg-white/5 rounded p-2 text-gray-400 border border-white/5">
            <strong className="text-gray-300 block mb-1">{reason.rule_name}</strong>
            {reason.reason}
          </div>
        ))}
      </div>
    </div>
  );
}
