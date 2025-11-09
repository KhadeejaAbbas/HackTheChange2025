"use client";
import React from "react";

export type Speaker = "doctor" | "patient";

export interface ChatMessageProps {
  speaker: Speaker;
  originalText: string;
  translatedText?: string;
  timestamp: string;
}

export default function ChatMessage({ speaker, originalText, translatedText, timestamp }: ChatMessageProps) {
  const isDoctor = speaker === "doctor";

  const containerClasses = isDoctor ? "justify-start" : "justify-end";
  const bubbleClasses = isDoctor
    ? "bg-blue-600 text-white rounded-br-xl rounded-tr-xl rounded-tl-xl rounded-bl-md"
    : "bg-green-600 text-white rounded-bl-xl rounded-tl-xl rounded-tr-xl rounded-br-md";

  const time = new Date(timestamp);
  const formatted = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(time);

  return (
    <div className={`flex ${containerClasses} mb-4 px-3`}>
      <div className="max-w-[80%]">
        <div className={`p-3 ${bubbleClasses} shadow-sm`}>
          <div className="text-sm font-medium mb-1 capitalize">{isDoctor ? "Doctor" : "Patient"}</div>
          <div className="text-base leading-relaxed">{originalText}</div>
          {translatedText && (
            <div className="text-sm mt-2 opacity-90 italic">{translatedText}</div>
          )}
        </div>
        <div className={`text-xs text-gray-500 mt-1 ${isDoctor ? "text-left" : "text-right"}`}>
          {formatted}
        </div>
      </div>
    </div>
  );
}
