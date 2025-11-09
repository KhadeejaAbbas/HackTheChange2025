"use client";
import React, { useEffect, useRef } from "react";
import ChatMessage, { ChatMessageProps } from "./ChatMessage";

interface ChatBoxProps {
  chatHistory: ChatMessageProps[];
}

export default function ChatBox({ chatHistory }: ChatBoxProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Scroll to bottom when chatHistory changes
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [chatHistory]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-[60vh] max-h-[70vh] overflow-y-auto" ref={containerRef}>
      {chatHistory.map((m, idx) => (
        <ChatMessage key={idx} {...m} />
      ))}
    </div>
  );
}
