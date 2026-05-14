"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot, User, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/store";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickPrompts = [
  "Who will win tonight?",
  "How's my prediction accuracy?",
  "Give me a tip",
  "Explain do-or-die raids",
];

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const { chatHistory, addChatMessage, clearChatHistory, logAction } = useGameStore();

  // Hydrate messages from persisted chat history
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (chatHistory.length > 0) {
      setMessages(chatHistory.map((m) => ({ role: m.role, content: m.content })));
    } else {
      setMessages([
        {
          role: "assistant",
          content: "Hey! I'm KabaddiGuru 🏏 Your AI companion for Pro Kabaddi predictions. Ask me about match analysis, player stats, or tips to improve your prediction game!",
        },
      ]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function persistMessage(role: "user" | "assistant", content: string) {
    addChatMessage({ role, content, timestamp: new Date().toISOString() });
  }

  async function handleSend(text?: string) {
    const message = text || input.trim();
    if (!message || isLoading) return;

    const userMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    persistMessage("user", message);
    logAction(`chat:${message.substring(0, 50)}`);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: messages }),
      });
      const data = await res.json();
      const content = data.response || "Sorry, I couldn't process that. Try again!";
      const assistantMessage: Message = { role: "assistant", content };
      setMessages((prev) => [...prev, assistantMessage]);
      persistMessage("assistant", content);
    } catch {
      const errContent = "Connection issue. Please try again!";
      setMessages((prev) => [...prev, { role: "assistant", content: errContent }]);
      persistMessage("assistant", errContent);
    } finally {
      setIsLoading(false);
    }
  }

  function handleClearChat() {
    clearChatHistory();
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared! How can I help you? 🏏",
      },
    ]);
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center",
          isOpen
            ? "bg-gray-800 rotate-0"
            : "bg-gradient-to-r from-orange-500 to-red-500 hover:scale-110 glow-orange"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-40 right-4 md:bottom-22 md:right-6 z-50 w-[350px] md:w-[400px] rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-gray-800 px-4 py-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">KabaddiGuru AI</h3>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Powered by Gemini
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <button onClick={handleClearChat} className="text-gray-500 hover:text-gray-300" title="Clear chat">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[350px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="h-6 w-6 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-orange-400" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm max-w-[80%]",
                    msg.role === "user"
                      ? "bg-orange-500/20 text-orange-100"
                      : "bg-gray-800 text-gray-200"
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-orange-400" />
                </div>
                <div className="bg-gray-800 rounded-xl px-4 py-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-700 text-gray-400 hover:border-orange-500 hover:text-orange-400 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-800 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask KabaddiGuru..."
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="rounded-lg bg-orange-500 p-2 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
