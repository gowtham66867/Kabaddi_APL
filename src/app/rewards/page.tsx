"use client";

import { useGameStore } from "@/lib/store";
import { Gift, Lock, Coins, Star, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const rarityColors = {
  common: "border-gray-600 bg-gray-800/50",
  rare: "border-blue-500/30 bg-blue-500/5",
  epic: "border-purple-500/30 bg-purple-500/5",
  legendary: "border-yellow-500/30 bg-yellow-500/5 glow-gold",
};

const rarityText = {
  common: "text-gray-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-yellow-400",
};

const shopItems = [
  { id: "s1", name: "Profile Frame: Fire", cost: 500, icon: "🔥", description: "Animated fire frame for your profile" },
  { id: "s2", name: "Prediction Boost", cost: 300, icon: "⚡", description: "2x XP on your next 3 predictions" },
  { id: "s3", name: "Streak Shield", cost: 750, icon: "🛡️", description: "Protect your streak for 1 missed day" },
  { id: "s4", name: "Custom Title: Kabaddi King", cost: 1000, icon: "👑", description: "Show off your title on leaderboard" },
  { id: "s5", name: "Lucky Charm", cost: 400, icon: "🍀", description: "+10% bonus on correct predictions for a week" },
  { id: "s6", name: "Team Jersey Badge", cost: 600, icon: "👕", description: "Display your favorite team's badge" },
];

export default function RewardsPage() {
  const { badges, user } = useGameStore();

  const unlockedBadges = badges.filter((b) => b.unlockedAt);
  const lockedBadges = badges.filter((b) => !b.unlockedAt);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="h-6 w-6 text-purple-400" />
          Rewards & Badges
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Collect badges and spend coins in the shop
        </p>
      </div>

      {/* Coin Balance */}
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Coins className="h-8 w-8 text-yellow-400" />
          <div>
            <p className="text-sm text-gray-400">Your Balance</p>
            <p className="text-2xl font-bold text-yellow-400">{user.coins.toLocaleString()} Coins</p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-400">
          <p>Earn coins by making predictions,</p>
          <p>completing challenges & leveling up</p>
        </div>
      </div>

      {/* Unlocked Badges */}
      <section>
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-yellow-400" />
          Your Badges ({unlockedBadges.length}/{badges.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {unlockedBadges.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                "rounded-xl border p-4 text-center card-hover",
                rarityColors[badge.rarity]
              )}
            >
              <span className="text-3xl block mb-2">{badge.icon}</span>
              <p className="font-semibold text-sm">{badge.name}</p>
              <p className={cn("text-xs capitalize mt-1", rarityText[badge.rarity])}>
                {badge.rarity}
              </p>
              <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Locked Badges */}
      <section>
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-gray-500" />
          Locked Badges
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {lockedBadges.map((badge) => (
            <div
              key={badge.id}
              className="rounded-xl border border-gray-800 bg-gray-900/30 p-4 text-center opacity-70"
            >
              <span className="text-3xl block mb-2 grayscale">{badge.icon}</span>
              <p className="font-semibold text-sm">{badge.name}</p>
              <p className={cn("text-xs capitalize mt-1", rarityText[badge.rarity])}>
                {badge.rarity}
              </p>
              {badge.progress !== undefined && (
                <div className="mt-2">
                  <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gray-600"
                      style={{ width: `${(badge.progress / badge.requirement) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{badge.progress}/{badge.requirement}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Shop */}
      <section>
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
          <ShoppingBag className="h-5 w-5 text-green-400" />
          Coin Shop
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {shopItems.map((item) => {
            const canAfford = user.coins >= item.cost;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 card-hover"
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex items-center gap-1 text-sm font-bold text-yellow-400">
                    <Coins className="h-3.5 w-3.5" />
                    {item.cost}
                  </div>
                </div>
                <h3 className="font-semibold text-sm mt-2">{item.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                <button
                  className={cn(
                    "mt-3 w-full rounded-lg py-2 text-xs font-semibold transition-all",
                    canAfford
                      ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                      : "bg-gray-800 text-gray-500 cursor-not-allowed"
                  )}
                  disabled={!canAfford}
                >
                  {canAfford ? "Purchase" : "Not enough coins"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
