import React from "react";
import { User, Sparkles } from "lucide-react";
import type { CoachMessage as ICoachMessage } from "@/lib/api";

interface CoachMessageProps {
  message: ICoachMessage;
}

export function CoachMessage({ message }: CoachMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""} animate-fade-in-up`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
        isUser ? "bg-blue-600/20 text-blue-400" : "bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/20"
      }`}>
        {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
      </div>
      
      <div className={`max-w-[80%] rounded-2xl p-4 ${
        isUser 
          ? "bg-blue-600/10 border border-blue-500/20 text-blue-50 rounded-tr-sm" 
          : "glass-card text-gray-200 rounded-tl-sm"
      }`}>
        {/* Simple markdown parsing for bold and bullet points */}
        <div className="whitespace-pre-wrap text-sm leading-relaxed" dangerouslySetInnerHTML={{
          __html: message.content
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
            .replace(/\* (.*?)\n/g, '<li class="ml-4 list-disc">$1</li>')
        }} />
      </div>
    </div>
  );
}
