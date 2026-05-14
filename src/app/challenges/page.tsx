"use client";

import { useGameStore } from "@/lib/store";
import { Zap, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChallengesPage() {
  const { challenges, completeChallenge } = useGameStore();

  const daily = challenges.filter((c) => c.type === "daily");
  const weekly = challenges.filter((c) => c.type === "weekly");
  const seasonal = challenges.filter((c) => c.type === "seasonal");

  function ChallengeCard({ challenge }: { challenge: typeof challenges[0] }) {
    const progress = (challenge.progress / challenge.target) * 100;
    const isAlmostDone = progress >= 80;

    return (
      <div
        className={cn(
          "rounded-xl border p-4 card-hover",
          challenge.isCompleted
            ? "border-green-500/30 bg-green-500/5"
            : "border-gray-800 bg-gray-900/50"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {challenge.isCompleted ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <Zap className="h-4 w-4 text-yellow-400" />
              )}
              <h3 className={cn("font-semibold text-sm", challenge.isCompleted && "text-green-300")}>
                {challenge.title}
              </h3>
            </div>
            <p className="text-xs text-gray-400 ml-6">{challenge.description}</p>
          </div>
          <div className="text-right shrink-0 ml-3">
            <span className="text-sm font-bold text-yellow-400">+{challenge.xpReward}</span>
            <span className="text-xs text-gray-500 block">XP</span>
          </div>
        </div>

        <div className="mt-3 ml-6">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-400">
              {challenge.progress}/{challenge.target}
            </span>
            <span className="text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(challenge.expiresAt).toLocaleDateString()}
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                challenge.isCompleted
                  ? "bg-green-500"
                  : isAlmostDone
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                  : "bg-gradient-to-r from-blue-500 to-cyan-400"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {!challenge.isCompleted && progress >= 100 && (
          <button
            onClick={() => completeChallenge(challenge.id)}
            className="mt-3 ml-6 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:from-green-600 hover:to-emerald-600"
          >
            Claim Reward 🎁
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-400" />
          Challenges
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Complete challenges to earn bonus XP and level up faster!
        </p>
      </div>

      {/* Adaptive tip */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 flex items-start gap-3">
        <TrendingUp className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-300">Personalized for You</p>
          <p className="text-xs text-gray-400 mt-1">
            Based on your activity, we&apos;ve highlighted challenges that match your play style.
            Focus on streak challenges to maximize your XP gains!
          </p>
        </div>
      </div>

      {/* Daily */}
      <section>
        <h2 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Daily Challenges
        </h2>
        <div className="space-y-3">
          {daily.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      </section>

      {/* Weekly */}
      <section>
        <h2 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Weekly Challenges
        </h2>
        <div className="space-y-3">
          {weekly.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      </section>

      {/* Seasonal */}
      <section>
        <h2 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-purple-500" />
          Season Challenges
        </h2>
        <div className="space-y-3">
          {seasonal.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
