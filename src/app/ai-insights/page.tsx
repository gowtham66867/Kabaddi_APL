"use client";

import { useState, useEffect } from "react";
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Sparkles, Activity, Target, Zap, RefreshCw, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/store";

interface BehaviorData {
  profile: {
    sessionsLast7Days: number;
    avgSessionDuration: number;
    accuracy: number;
    currentStreak: number;
    longestStreak: number;
    level: number;
    xpRate: number;
    engagementTrend: string;
    timeOfDayPreference: string;
    matchDayEngagement: number;
    nonMatchDayEngagement: number;
    challengeCompletionRate: number;
    riskProfile: string;
    favoriteTeams: string[];
  };
  engagement: {
    overall: number;
    prediction: number;
    social: number;
    consistency: number;
    progression: number;
  };
  difficulty: {
    challengeMultiplier: number;
    suggestedTargets: { daily: number; weekly: number };
    reasoning: string;
  };
  churnAnalysis: {
    risk: string;
    signals: string[];
    intervention: string;
  };
  aiAnalysis: {
    pattern: string;
    style: string;
    churnRisk: string;
    churnReasoning: string;
    recommendations: string[];
  };
}

interface AIChallenge {
  title: string;
  description: string;
  type: string;
  target: number;
  xpReward: number;
  reasoning: string;
}

export default function AIInsightsPage() {
  const [behaviorData, setBehaviorData] = useState<BehaviorData | null>(null);
  const [aiChallenges, setAIChallenges] = useState<AIChallenge[]>([]);
  const [nudge, setNudge] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [isRealData, setIsRealData] = useState(false);
  const store = useGameStore();

  useEffect(() => {
    fetchBehaviorData();
    fetchNudge();
  }, []);

  async function fetchBehaviorData() {
    try {
      // Send real store snapshot to behavior API
      const snapshot = {
        user: store.user,
        predictions: store.predictions,
        challenges: store.challenges,
        badges: store.badges,
        sessionLogs: store.sessionLogs,
        predictionTimestamps: store.predictionTimestamps,
        streakDates: store.streakDates,
        chatHistory: store.chatHistory,
        appliedRecommendations: store.appliedRecommendations,
      };
      const res = await fetch("/api/ai/behavior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      });
      const data = await res.json();
      setBehaviorData(data);
      setIsRealData(data.isRealData || false);
    } catch (err) {
      console.error("Failed to fetch behavior data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchNudge() {
    try {
      const res = await fetch("/api/ai/nudge");
      const data = await res.json();
      setNudge(data.nudge);
    } catch (err) {
      console.error("Failed to fetch nudge:", err);
    }
  }

  async function generateChallenges() {
    setChallengesLoading(true);
    try {
      const res = await fetch("/api/ai/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentChallenges: [] }),
      });
      const data = await res.json();
      setAIChallenges(data.challenges || []);
    } catch (err) {
      console.error("Failed to generate challenges:", err);
    } finally {
      setChallengesLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="mx-auto h-8 w-8 text-purple-400 animate-pulse" />
          <p className="text-gray-400 text-sm mt-2">AI analyzing your behavior...</p>
        </div>
      </div>
    );
  }

  const data = behaviorData!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-400" />
          AI Insights & Personalization
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-gray-400 text-sm">
            Powered by Gemini AI • Your behavior drives adaptive experiences
          </p>
          {isRealData && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
              <CheckCircle className="h-3 w-3" /> Live Data
            </span>
          )}
        </div>
      </div>

      {/* Personalized Nudge */}
      {nudge && (
        <div className="rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-red-500/5 p-4 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-orange-400 shrink-0" />
          <p className="text-sm text-orange-200 flex-1">{nudge}</p>
          <span className="text-xs text-gray-500 shrink-0">AI Nudge</span>
        </div>
      )}

      {/* Engagement Score Card */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-400" />
          Your Engagement DNA
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <ScoreRing label="Overall" score={data.engagement.overall} color="from-green-400 to-emerald-500" />
          <ScoreRing label="Prediction" score={data.engagement.prediction} color="from-blue-400 to-cyan-500" />
          <ScoreRing label="Consistency" score={data.engagement.consistency} color="from-orange-400 to-red-500" />
          <ScoreRing label="Progression" score={data.engagement.progression} color="from-purple-400 to-pink-500" />
          <ScoreRing label="Social" score={data.engagement.social} color="from-yellow-400 to-orange-500" />
        </div>
      </div>

      {/* Behavior Analysis */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Pattern Analysis */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            AI Behavior Analysis
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Engagement Pattern</span>
              <span className="text-xs font-medium text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full">
                {data.aiAnalysis?.pattern || "Regular Evening"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Prediction Style</span>
              <span className="text-xs font-medium text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full">
                {data.profile.riskProfile}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Time Preference</span>
              <span className="text-xs font-medium text-green-300 bg-green-500/10 px-2 py-0.5 rounded-full">
                {data.profile.timeOfDayPreference}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">XP Rate</span>
              <span className="text-xs font-medium text-yellow-300 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                {data.profile.xpRate} XP/day
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Favorite Teams</span>
              <span className="text-xs font-medium text-orange-300">
                {data.profile.favoriteTeams?.join(", ")}
              </span>
            </div>
          </div>
        </div>

        {/* Churn Risk */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            Churn Risk Assessment
          </h3>
          <div className={cn(
            "rounded-lg p-3 mb-3",
            data.churnAnalysis.risk === "low" ? "bg-green-500/10 border border-green-500/20" :
            data.churnAnalysis.risk === "medium" ? "bg-yellow-500/10 border border-yellow-500/20" :
            "bg-red-500/10 border border-red-500/20"
          )}>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-bold capitalize",
                data.churnAnalysis.risk === "low" ? "text-green-400" :
                data.churnAnalysis.risk === "medium" ? "text-yellow-400" : "text-red-400"
              )}>
                {data.churnAnalysis.risk} Risk
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {data.aiAnalysis?.churnReasoning || "User shows consistent engagement patterns"}
            </p>
          </div>
          {data.churnAnalysis.signals.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 font-medium">Signals:</p>
              {data.churnAnalysis.signals.map((signal, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                  <TrendingDown className="h-3 w-3 text-red-400" />
                  {signal}
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-gray-800">
            <p className="text-xs text-gray-500 font-medium mb-1">Recommended Intervention:</p>
            <p className="text-xs text-gray-300">{data.churnAnalysis.intervention}</p>
          </div>
        </div>
      </div>

      {/* Adaptive Difficulty */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-orange-400" />
          Adaptive Difficulty Engine
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-gray-800/50">
            <p className="text-2xl font-bold text-orange-400">{data.difficulty.challengeMultiplier}x</p>
            <p className="text-xs text-gray-400">Difficulty Multiplier</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-800/50">
            <p className="text-2xl font-bold text-blue-400">{data.difficulty.suggestedTargets.daily}</p>
            <p className="text-xs text-gray-400">Daily Target</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-800/50">
            <p className="text-2xl font-bold text-purple-400">{data.difficulty.suggestedTargets.weekly}</p>
            <p className="text-xs text-gray-400">Weekly Target</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3 bg-gray-800/50 rounded-lg p-2">
          <span className="font-medium text-gray-300">AI Reasoning:</span> {data.difficulty.reasoning}
        </p>
      </div>

      {/* AI Recommendations with feedback loop */}
      {data.aiAnalysis?.recommendations && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            AI Recommendations
            <span className="text-xs text-gray-500 font-normal ml-auto">
              {store.appliedRecommendations.length} applied
            </span>
          </h3>
          <div className="space-y-2">
            {data.aiAnalysis.recommendations.map((rec, i) => {
              const isApplied = store.appliedRecommendations.includes(rec);
              return (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-yellow-400 shrink-0">→</span>
                  <span className="flex-1">{rec}</span>
                  <button
                    onClick={() => {
                      if (!isApplied) {
                        store.applyRecommendation(rec);
                        store.addXP(15);
                        store.addNotification(`🤖 Applied AI recommendation: "${rec.substring(0, 40)}..."`);
                      }
                    }}
                    disabled={isApplied}
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full shrink-0 transition-colors",
                      isApplied
                        ? "bg-green-500/20 text-green-400"
                        : "border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                    )}
                  >
                    {isApplied ? "Applied" : "Apply"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI-Generated Challenges */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-400" />
            AI-Generated Challenges (Adaptive)
          </h3>
          <button
            onClick={generateChallenges}
            disabled={challengesLoading}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-green-500/30 bg-green-500/5 text-green-400 hover:bg-green-500/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", challengesLoading && "animate-spin")} />
            Generate New
          </button>
        </div>

        {aiChallenges.length === 0 && !challengesLoading && (
          <p className="text-sm text-gray-500 text-center py-4">
            Click &ldquo;Generate New&rdquo; to create AI-personalized challenges based on your behavior
          </p>
        )}

        {challengesLoading && (
          <div className="text-center py-4">
            <Brain className="mx-auto h-6 w-6 text-purple-400 animate-pulse" />
            <p className="text-xs text-gray-400 mt-2">Gemini is crafting personalized challenges...</p>
          </div>
        )}

        {aiChallenges.length > 0 && (
          <div className="space-y-3">
            {aiChallenges.map((challenge, i) => (
              <div key={i} className="rounded-lg border border-gray-700 bg-gray-800/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      challenge.type === "daily" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                    )}>
                      {challenge.type}
                    </span>
                    <h4 className="font-medium text-sm">{challenge.title}</h4>
                  </div>
                  <span className="text-sm font-bold text-yellow-400">+{challenge.xpReward} XP</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 ml-1">{challenge.description}</p>
                <p className="text-xs text-gray-600 mt-1 ml-1 italic">Target: {challenge.target} • {challenge.reasoning}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreRing({ label, score, color }: { label: string; score: number; color: string }) {
  const circumference = 2 * Math.PI * 30;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="30" fill="none" stroke="#374151" strokeWidth="6" />
          <circle
            cx="40"
            cy="40"
            r="30"
            fill="none"
            stroke="url(#grad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="grad">
              <stop offset="0%" stopColor="currentColor" />
              <stop offset="100%" stopColor="currentColor" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold">{score}</span>
        </div>
      </div>
      <span className="text-xs text-gray-400 mt-1">{label}</span>
    </div>
  );
}
