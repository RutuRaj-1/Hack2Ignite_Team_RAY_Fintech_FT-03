import React from "react";
import { Lightbulb, ArrowRight } from "lucide-react";
import type { EducationalCard } from "@/lib/api";

interface InsightCardProps {
  card: EducationalCard;
  className?: string;
  onClick?: () => void;
}

export function InsightCard({ card, className = "", onClick }: InsightCardProps) {
  return (
    <div 
      className={`glass-card p-5 group cursor-pointer hover:border-blue-500/50 transition-all ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
          <Lightbulb className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-bold text-white text-lg">{card.title}</h4>
            <span className="text-xs font-semibold px-2 py-1 bg-white/5 text-gray-300 rounded">
              {card.topic}
            </span>
          </div>
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
            {card.summary}
          </p>
          <div className="flex items-center text-sm font-medium text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
            Learn more <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
