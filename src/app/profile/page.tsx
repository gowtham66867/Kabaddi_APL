"use client";

import { useGameStore } from "@/lib/store";
import {
  User,
  Flame,
  Target,
  Trophy,
  Star,
  TrendingUp,
  Calendar,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tierConfig = {
  Bronze: { color: "from-orange-700 to-orange-900", icon: "🥉", min: 0 },
  Silver: { color: "from-gray-400 to-gray-600", icon: "🥈", min: 10 },
  Gold: { color: "from-yellow-500 to-yellow-700", icon: "🥇", min: 15 },
  Platinum: { color: "from-purple-400 to-purple-700", icon: "💎", min: 20 },
  Diamond: { color: "from-cyan-400 to-blue-600", icon: "💠", min: 25 },
};

export default function ProfilePage() {
  const { user, badges, predictions } = useGameStore();
  const accuracy = user.totalPredictions > 0
    ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
    : 0;

  const xpProgress = Math.min((user.xp / user.xpToNextLevel) * 100, 100);
  const tier = tierConfig[user.tier];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className={cn("rounded-2xl border border-gray-800 bg-gradient-to-br p-6", tier.color, "bg-opacity-10")}>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gray-800 border-2 border-orange-500 flex items-center justify-center text-3xl">
            {user.avatar}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-300">{tier.icon} {user.tier} Tier</span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-300">Level {user.level}</span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-300">Rank #{user.rank}</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-yellow-400">
            <Coins className="h-5 w-5" />
            <span className="text-lg font-bold">{user.coins.toLocaleString()}</span>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-300 mb-1">
            <span>Level {user.level}</span>
            <span>{user.xp.toLocaleString()} / {user.xpToNextLevel.toLocaleString()} XP</span>
            <span>Level {user.level + 1}</span>
          </div>
          <div className="h-3 rounded-full bg-gray-800/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={<Target className="h-5 w-5 text-green-500" />} label="Accuracy" value={`${accuracy}%`} />
        <StatCard icon={<Flame className="h-5 w-5 text-orange-500" />} label="Current Streak" value={String(user.currentStreak)} />
        <StatCard icon={<TrendingUp className="h-5 w-5 text-blue-500" />} label="Best Streak" value={String(user.longestStreak)} />
        <StatCard icon={<Trophy className="h-5 w-5 text-yellow-500" />} label="Correct" value={String(user.correctPredictions)} />
        <StatCard icon={<Calendar className="h-5 w-5 text-purple-500" />} label="Total Predictions" value={String(user.totalPredictions)} />
        <StatCard icon={<Star className="h-5 w-5 text-cyan-500" />} label="Badges" value={`${user.badges.length}/${badges.length}`} />
      </div>

      {/* Badges Showcase */}
      <section>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          Badge Collection
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                "rounded-xl border p-3 text-center",
                badge.unlockedAt
                  ? "border-gray-700 bg-gray-900/50"
                  : "border-gray-800 bg-gray-900/20 opacity-40"
              )}
              title={badge.description}
            >
              <span className={cn("text-2xl block", !badge.unlockedAt && "grayscale")}>{badge.icon}</span>
              <p className="text-xs font-medium mt-1 truncate">{badge.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tier Progression */}
      <section>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-purple-400" />
          Tier Progression
        </h2>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center justify-between">
            {Object.entries(tierConfig).map(([name, config]) => {
              const isActive = name === user.tier;
              const isPast = user.level >= config.min;
              return (
                <div
                  key={name}
                  className={cn(
                    "flex flex-col items-center gap-1",
                    isActive && "scale-110"
                  )}
                >
                  <span className={cn("text-2xl", !isPast && "grayscale opacity-40")}>
                    {config.icon}
                  </span>
                  <span className={cn(
                    "text-xs font-medium",
                    isActive ? "text-orange-400" : isPast ? "text-gray-300" : "text-gray-600"
                  )}>
                    {name}
                  </span>
                  <span className="text-xs text-gray-500">Lv.{config.min}+</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 h-2 rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-700 via-yellow-500 via-purple-500 to-cyan-400"
              style={{ width: `${Math.min((user.level / 25) * 100, 100)}%` }}
            />
          </div>
        </div>
      </section>

      {/* Recent Predictions */}
      <section>
        <h2 className="text-lg font-bold mb-3">Recent Predictions</h2>
        {predictions.length > 0 ? (
          <div className="space-y-2">
            {predictions.slice(-5).reverse().map((pred) => (
              <div key={pred.id} className="rounded-lg border border-gray-800 bg-gray-900/30 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm">Match: {pred.matchId}</p>
                  <p className="text-xs text-gray-400">Predicted: {pred.predictedWinner}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(pred.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-8 text-center">
            <User className="mx-auto h-10 w-10 text-gray-600 mb-2" />
            <p className="text-gray-400 text-sm">No predictions yet. Start predicting to see your history!</p>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}
