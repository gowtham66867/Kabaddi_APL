"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Target,
  Trophy,
  Gift,
  User,
  Bell,
  Flame,
  Coins,
} from "lucide-react";
import { useGameStore } from "@/lib/store";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/predict", label: "Predict", icon: Target },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, notifications } = useGameStore();

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏏</span>
            <span className="text-lg font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              KabaddiArena
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-semibold text-orange-400">{user.currentStreak}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold text-yellow-400">{user.coins.toLocaleString()}</span>
            </div>
            <div className="relative">
              <Bell className="h-5 w-5 text-gray-400" />
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {notifications.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-full bg-gray-800 px-3 py-1">
              <span className="text-sm">Lv.{user.level}</span>
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-xs">
                {user.avatar}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom nav for mobile, side nav inlined in desktop layout handled by CSS */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-gray-950/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                  isActive ? "text-orange-400" : "text-gray-400 hover:text-gray-200"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-orange-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
