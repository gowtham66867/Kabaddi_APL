"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { matches, raidersOfMatch, defendersOfMatch } from "@/lib/data";
import { Target, CheckCircle, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import AIMatchInsight from "@/components/AIMatchInsight";

type PredictionForm = {
  matchId: string;
  winner: string;
  topRaider: string;
  topDefender: string;
  scoreDiff: number;
};

export default function PredictPage() {
  const { makePrediction, predictions } = useGameStore();
  const [activePrediction, setActivePrediction] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<PredictionForm>>({});
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  const upcomingMatches = matches.filter((m) => m.status === "upcoming");
  const alreadyPredicted = new Set(predictions.map((p) => p.matchId));

  function handleSubmit(matchId: string) {
    if (!form.winner) return;

    makePrediction({
      matchId,
      userId: "u1",
      predictedWinner: form.winner,
      predictedScoreDiff: form.scoreDiff,
      predictedRaider: form.topRaider,
      predictedDefender: form.topDefender,
      isCorrect: undefined,
    });

    setSubmitted((prev) => new Set([...prev, matchId]));
    setActivePrediction(null);
    setForm({});
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-orange-400" />
          Match Predictions
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Predict match outcomes to earn XP, coins, and climb the leaderboard!
        </p>
      </div>

      {/* Prediction multiplier info */}
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-start gap-3">
        <Zap className="h-5 w-5 text-yellow-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-yellow-300">Bonus Multipliers Active!</p>
          <p className="text-xs text-gray-400 mt-1">
            🎯 Correct winner: +50 XP • 📊 Score diff within 3: +100 XP • ⭐ Top raider correct: +75 XP • 🛡️ Top defender correct: +75 XP
          </p>
        </div>
      </div>

      {/* Match List */}
      <div className="space-y-4">
        {upcomingMatches.map((match) => {
          const isPredicted = alreadyPredicted.has(match.id) || submitted.has(match.id);
          const isActive = activePrediction === match.id;

          return (
            <div
              key={match.id}
              className={cn(
                "rounded-xl border bg-gray-900/50 overflow-hidden transition-all",
                isActive ? "border-orange-500/50 glow-orange" : "border-gray-800",
                isPredicted && "border-green-500/30"
              )}
            >
              {/* Match Header */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{match.date} • {match.time}</span>
                    <span className="text-gray-600">•</span>
                    <span>{match.venue}</span>
                  </div>
                  {isPredicted && (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <CheckCircle className="h-3.5 w-3.5" /> Predicted
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{match.homeTeam.logo}</span>
                    <div>
                      <p className="font-bold">{match.homeTeam.name}</p>
                      <p className="text-xs text-gray-400">W{match.homeTeam.wins} L{match.homeTeam.losses}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-gray-500 bg-gray-800 px-3 py-1 rounded-full">VS</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold">{match.awayTeam.name}</p>
                      <p className="text-xs text-gray-400">W{match.awayTeam.wins} L{match.awayTeam.losses}</p>
                    </div>
                    <span className="text-3xl">{match.awayTeam.logo}</span>
                  </div>
                </div>

                {/* AI Match Insight */}
                <AIMatchInsight match={match} />

                {!isPredicted && !isActive && (
                  <button
                    onClick={() => setActivePrediction(match.id)}
                    className="mt-4 w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-500 py-2.5 text-sm font-semibold text-white hover:from-orange-600 hover:to-red-600 transition-all"
                  >
                    Make Prediction
                  </button>
                )}
              </div>

              {/* Prediction Form */}
              {isActive && (
                <div className="border-t border-gray-800 bg-gray-900/80 p-4 space-y-4">
                  {/* Winner Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Who will win? <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setForm({ ...form, winner: match.homeTeam.id })}
                        className={cn(
                          "rounded-lg border p-3 text-center transition-all",
                          form.winner === match.homeTeam.id
                            ? "border-orange-500 bg-orange-500/10 text-orange-300"
                            : "border-gray-700 hover:border-gray-600"
                        )}
                      >
                        <span className="text-2xl block mb-1">{match.homeTeam.logo}</span>
                        <span className="text-sm font-medium">{match.homeTeam.shortName}</span>
                      </button>
                      <button
                        onClick={() => setForm({ ...form, winner: match.awayTeam.id })}
                        className={cn(
                          "rounded-lg border p-3 text-center transition-all",
                          form.winner === match.awayTeam.id
                            ? "border-orange-500 bg-orange-500/10 text-orange-300"
                            : "border-gray-700 hover:border-gray-600"
                        )}
                      >
                        <span className="text-2xl block mb-1">{match.awayTeam.logo}</span>
                        <span className="text-sm font-medium">{match.awayTeam.shortName}</span>
                      </button>
                    </div>
                  </div>

                  {/* Score Difference */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Predicted Score Difference (optional, +100 XP bonus)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      placeholder="e.g. 5"
                      value={form.scoreDiff || ""}
                      onChange={(e) => setForm({ ...form, scoreDiff: Number(e.target.value) })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Top Raider */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Top Raider of the Match (optional, +75 XP bonus)
                    </label>
                    <select
                      value={form.topRaider || ""}
                      onChange={(e) => setForm({ ...form, topRaider: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="">Select a raider...</option>
                      {raidersOfMatch.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Top Defender */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Top Defender of the Match (optional, +75 XP bonus)
                    </label>
                    <select
                      value={form.topDefender || ""}
                      onChange={(e) => setForm({ ...form, topDefender: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="">Select a defender...</option>
                      {defendersOfMatch.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setActivePrediction(null); setForm({}); }}
                      className="flex-1 rounded-lg border border-gray-700 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSubmit(match.id)}
                      disabled={!form.winner}
                      className={cn(
                        "flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-all",
                        form.winner
                          ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          : "bg-gray-700 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      Submit Prediction 🎯
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {upcomingMatches.length === 0 && (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-600 mb-3" />
          <p className="text-gray-400">No upcoming matches to predict right now.</p>
          <p className="text-gray-500 text-sm mt-1">Check back soon!</p>
        </div>
      )}
    </div>
  );
}
