"use client";

import { useState } from "react";
import { Sparkles, Brain, Loader2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/data";

interface AIMatchInsightProps {
  match: Match;
}

export default function AIMatchInsight({ match }: AIMatchInsightProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchInsight() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          matchContext: { venue: match.venue, matchDay: match.matchDay },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setInsight(data.insight);
      setConfidence(data.confidence);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load insight");
    } finally {
      setLoading(false);
    }
  }

  if (!insight && !loading) {
    return (
      <button
        onClick={fetchInsight}
        className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/5 text-purple-400 hover:bg-purple-500/10 transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Get AI Analysis
      </button>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-purple-400 px-3 py-2 rounded-lg border border-purple-500/30 bg-purple-500/5">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>AI is analyzing this match...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-red-400 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/5">
        {error}
        <button onClick={fetchInsight} className="ml-2 underline hover:text-red-300">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 mt-3">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="h-4 w-4 text-purple-400" />
        <span className="text-xs font-semibold text-purple-300">AI Match Analysis</span>
        {confidence && (
          <span className={cn(
            "ml-auto text-xs font-medium flex items-center gap-1 px-2 py-0.5 rounded-full",
            confidence >= 70 ? "bg-green-500/20 text-green-400" :
            confidence >= 55 ? "bg-yellow-500/20 text-yellow-400" :
            "bg-red-500/20 text-red-400"
          )}>
            <TrendingUp className="h-3 w-3" />
            {Math.round(confidence)}% confidence
          </span>
        )}
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">{insight}</p>
      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
        <Sparkles className="h-3 w-3" />
        Powered by Gemini AI • Personalized to your prediction style
      </p>
    </div>
  );
}
