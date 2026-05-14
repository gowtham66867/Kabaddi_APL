"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Target, Trophy, Gift, User, Zap, Brain } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/predict", label: "Predictions", icon: Target },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/challenges", label: "Challenges", icon: Zap },
  { href: "/ai-insights", label: "AI Insights", icon: Brain },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-14 md:left-0 md:border-r md:border-gray-800 md:bg-gray-950 md:pt-6">
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
