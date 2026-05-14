"use client";

import { useState } from "react";
import { leaderboard } from "@/lib/data";
import { Trophy, Medal, Flame, Target, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = ["Global", "Friends", "Weekly"] as const;

const tierColors: Record<string, string> = {
  Diamond: "text-cyan-400",
  Platinum: "text-purple-400",
  Gold: "text-yellow-400",
  Silver: "text-gray-300",
  Bronze: "text-orange-600",
};

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Global");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-400" />
          Leaderboard
        </h1>
        <p className="text-gray-400 text-sm mt-1">Season 11 Rankings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-900 p-1 border border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition-all",
              activeTab === tab
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "text-gray-400 hover:text-gray-200"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-3 items-end">
        {/* 2nd place */}
        <div className="text-center">
          <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-4 pt-6">
            <div className="text-3xl mb-2">{leaderboard[1].avatar}</div>
            <Medal className="mx-auto h-5 w-5 text-gray-300 mb-1" />
            <p className="font-semibold text-sm truncate">{leaderboard[1].name}</p>
            <p className="text-xs text-gray-400">Lv.{leaderboard[1].level}</p>
            <p className="text-sm font-bold text-gray-300 mt-1">{leaderboard[1].xp.toLocaleString()} XP</p>
          </div>
        </div>
        {/* 1st place */}
        <div className="text-center">
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 pt-6 glow-gold">
            <Crown className="mx-auto h-6 w-6 text-yellow-400 mb-1" />
            <div className="text-4xl mb-2">{leaderboard[0].avatar}</div>
            <p className="font-bold truncate">{leaderboard[0].name}</p>
            <p className="text-xs text-gray-400">Lv.{leaderboard[0].level}</p>
            <p className="text-sm font-bold text-yellow-400 mt-1">{leaderboard[0].xp.toLocaleString()} XP</p>
          </div>
        </div>
        {/* 3rd place */}
        <div className="text-center">
          <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-4 pt-6">
            <div className="text-3xl mb-2">{leaderboard[2].avatar}</div>
            <Medal className="mx-auto h-5 w-5 text-orange-600 mb-1" />
            <p className="font-semibold text-sm truncate">{leaderboard[2].name}</p>
            <p className="text-xs text-gray-400">Lv.{leaderboard[2].level}</p>
            <p className="text-sm font-bold text-gray-300 mt-1">{leaderboard[2].xp.toLocaleString()} XP</p>
          </div>
        </div>
      </div>

      {/* Full leaderboard */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 text-xs font-medium text-gray-500 border-b border-gray-800">
          <span>#</span>
          <span>Player</span>
          <span className="text-center">Streak</span>
          <span className="text-center">Accuracy</span>
          <span className="text-right">XP</span>
        </div>
        {leaderboard.map((player) => {
          const isUser = player.name === "You";
          return (
            <div
              key={player.rank}
              className={cn(
                "grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-4 py-3 border-b border-gray-800/50 last:border-0",
                isUser && "bg-orange-500/5 border-orange-500/20"
              )}
            >
              <span className={cn("text-sm font-bold w-6", player.rank <= 3 && "text-yellow-400")}>
                {player.rank}
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl shrink-0">{player.avatar}</span>
                <div className="min-w-0">
                  <p className={cn("font-medium text-sm truncate", isUser && "text-orange-400")}>
                    {player.name} {isUser && "(You)"}
                  </p>
                  <p className={cn("text-xs", tierColors[player.tier])}>
                    {player.tier} • Lv.{player.level}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                <span>{player.streak}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Target className="h-3.5 w-3.5 text-green-500" />
                <span>{player.correctPredictions}</span>
              </div>
              <span className="text-sm font-semibold text-right">
                {player.xp.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
