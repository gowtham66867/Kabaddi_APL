"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/store";
import { matches, challenges } from "@/lib/data";
import { useState, useEffect } from "react";
import LiveMatchSimulator from "@/components/LiveMatchSimulator";
import {
  Flame,
  Target,
  Trophy,
  Zap,
  ChevronRight,
  TrendingUp,
  Calendar,
  Brain,
  Sparkles,
} from "lucide-react";

function XPProgressBar({ xp, xpToNext, level }: { xp: number; xpToNext: number; level: number }) {
  const progress = Math.min((xp / xpToNext) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>Level {level}</span>
        <span>{xp.toLocaleString()} / {xpToNext.toLocaleString()} XP</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: typeof matches[0] }) {
  return (
    <div className="card-hover rounded-xl border border-gray-800 bg-gray-900/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          match.status === "live"
            ? "bg-red-500/20 text-red-400 animate-pulse"
            : match.status === "upcoming"
            ? "bg-blue-500/20 text-blue-400"
            : "bg-gray-700 text-gray-300"
        }`}>
          {match.status === "live" ? " LIVE" : match.status === "upcoming" ? "Upcoming" : "Completed"}
        </span>
        <span className="text-xs text-gray-500">{match.date} • {match.time}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{match.homeTeam.logo}</span>
          <div>
            <p className="font-semibold text-sm">{match.homeTeam.shortName}</p>
            {match.homeScore !== undefined && (
              <p className="text-lg font-bold text-white">{match.homeScore}</p>
            )}
          </div>
        </div>
        <span className="text-gray-500 text-xs font-medium">VS</span>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="font-semibold text-sm">{match.awayTeam.shortName}</p>
            {match.awayScore !== undefined && (
              <p className="text-lg font-bold text-white">{match.awayScore}</p>
            )}
          </div>
          <span className="text-2xl">{match.awayTeam.logo}</span>
        </div>
      </div>
      {match.status === "upcoming" && (
        <Link
          href="/predict"
          className="mt-3 block w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-500 py-2 text-center text-sm font-semibold text-white hover:from-orange-600 hover:to-red-600 transition-all"
        >
          Predict Now →
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const { user, notifications } = useGameStore();
  const [nudge, setNudge] = useState<string>("");

  useEffect(() => {
    fetch("/api/ai/nudge")
      .then((r) => r.json())
      .then((d) => setNudge(d.nudge))
      .catch(() => {});
  }, []);

  const liveMatches = matches.filter((m) => m.status === "live");
  const upcomingMatches = matches.filter((m) => m.status === "upcoming").slice(0, 4);
  const activeChallenges = challenges.filter((c) => !c.isCompleted).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* AI Personalized Nudge */}
      {nudge && (
        <div className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-blue-500/5 p-4 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-purple-400 shrink-0" />
          <p className="text-sm text-purple-200 flex-1">{nudge}</p>
          <Link href="/ai-insights" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 shrink-0">
            <Brain className="h-3.5 w-3.5" /> AI Insights
          </Link>
        </div>
      )}

      {/* Welcome & XP */}
      <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back! 👋</h1>
            <p className="text-gray-400 text-sm mt-1">Season 11 • Match Day 45</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Your Tier</div>
            <div className="text-lg font-bold text-yellow-400"> 🏅 {user.tier}</div>
          </div>
        </div>
        <XPProgressBar xp={user.xp} xpToNext={user.xpToNextLevel} level={user.level} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
          <Flame className="mx-auto h-6 w-6 text-orange-500 mb-1" />
          <p className="text-2xl font-bold">{user.currentStreak}</p>
          <p className="text-xs text-gray-400">Day Streak</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
          <Target className="mx-auto h-6 w-6 text-green-500 mb-1" />
          <p className="text-2xl font-bold">{Math.round((user.correctPredictions / user.totalPredictions) * 100)}%</p>
          <p className="text-xs text-gray-400">Accuracy</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
          <Trophy className="mx-auto h-6 w-6 text-yellow-500 mb-1" />
          <p className="text-2xl font-bold">#{user.rank}</p>
          <p className="text-xs text-gray-400">Global Rank</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
          <TrendingUp className="mx-auto h-6 w-6 text-blue-500 mb-1" />
          <p className="text-2xl font-bold">{user.correctPredictions}</p>
          <p className="text-xs text-gray-400">Correct</p>
        </div>
      </div>

      {/* Live Match Simulation */}
      {liveMatches.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Live Now — Real-time Simulation
            </h2>
          </div>
          <LiveMatchSimulator />
        </section>
      )}

      {/* Upcoming Matches */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            Upcoming Matches
          </h2>
          <Link href="/predict" className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {upcomingMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>

      {/* Active Challenges */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Active Challenges
          </h2>
          <Link href="/challenges" className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-2">
          {activeChallenges.map((challenge) => (
            <div key={challenge.id} className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    challenge.type === "daily" ? "bg-green-500/20 text-green-400" :
                    challenge.type === "weekly" ? "bg-blue-500/20 text-blue-400" :
                    "bg-purple-500/20 text-purple-400"
                  }`}>{challenge.type}</span>
                  <h3 className="font-medium text-sm">{challenge.title}</h3>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                      style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{challenge.progress}/{challenge.target}</span>
                </div>
              </div>
              <div className="ml-4 text-right">
                <span className="text-sm font-bold text-yellow-400">+{challenge.xpReward} XP</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {notifications.slice(0, 5).map((notif, i) => (
              <div key={i} className="rounded-lg border border-gray-800 bg-gray-900/30 px-4 py-2 text-sm text-gray-300">
                {notif}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
