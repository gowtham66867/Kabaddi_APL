"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/store";
import { matches } from "@/lib/data";
import { Radio, Trophy } from "lucide-react";

const EVENTS = [
  "Successful raid by {raider}! +1 point",
  "Super tackle by the defense! +2 points",
  "Do-or-die raid successful! +1 point",
  "Touch point scored by {raider}",
  "Bonus point claimed!",
  "Empty raid - no points",
  "ALL OUT! +2 bonus points!",
  "Super raid by {raider}! +3 points!",
  "Successful tackle in the corner!",
  "Review requested... Overturned!",
];

const RAIDERS = [
  "Pardeep Narwal", "Pawan Sehrawat", "Naveen Kumar", "Arjun Deshwal",
  "Maninder Singh", "Sachin Tanwar",
];

function getRandomEvent(): string {
  const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  const raider = RAIDERS[Math.floor(Math.random() * RAIDERS.length)];
  return event.replace("{raider}", raider);
}

export default function LiveMatchSimulator() {
  const { liveMatches, updateLiveMatch, completeLiveMatch, addNotification } = useGameStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const liveMatchData = matches.filter((m) => m.status === "live");

  useEffect(() => {
    // Auto-start simulation for live matches
    if (liveMatchData.length > 0 && !isSimulating) {
      startSimulation();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function startSimulation() {
    setIsSimulating(true);

    // Initialize live matches
    liveMatchData.forEach((m) => {
      if (!liveMatches[m.id]) {
        updateLiveMatch(m.id, {
          matchId: m.id,
          homeScore: m.homeScore || 0,
          awayScore: m.awayScore || 0,
          minute: 20,
          status: "live",
          events: ["Match simulation started!"],
        });
      }
    });

    // Tick every 3 seconds = 1 match minute
    intervalRef.current = setInterval(() => {
      liveMatchData.forEach((m) => {
        const current = useGameStore.getState().liveMatches[m.id];
        if (!current || current.status === "completed") return;

        const newMinute = current.minute + 1;
        const scoreChange = Math.random();
        let homeAdd = 0;
        let awayAdd = 0;

        if (scoreChange < 0.35) homeAdd = 1;
        else if (scoreChange < 0.45) homeAdd = 2;
        else if (scoreChange < 0.75) awayAdd = 1;
        else if (scoreChange < 0.85) awayAdd = 2;

        const newEvent = getRandomEvent();

        updateLiveMatch(m.id, {
          homeScore: current.homeScore + homeAdd,
          awayScore: current.awayScore + awayAdd,
          minute: newMinute,
          events: [...current.events.slice(-10), `[${newMinute}'] ${newEvent}`],
        });

        // Match ends at minute 40
        if (newMinute >= 40) {
          const finalHome = current.homeScore + homeAdd;
          const finalAway = current.awayScore + awayAdd;
          const winnerId = finalHome >= finalAway ? m.homeTeam.id : m.awayTeam.id;
          const winnerName = finalHome >= finalAway ? m.homeTeam.name : m.awayTeam.name;

          completeLiveMatch(m.id, winnerId);
          addNotification(`🏆 Match Complete! ${winnerName} wins ${finalHome}-${finalAway}!`);

          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            setIsSimulating(false);
          }
        }
      });
    }, 3000);
  }

  if (liveMatchData.length === 0) return null;

  return (
    <div className="space-y-3">
      {liveMatchData.map((m) => {
        const live = liveMatches[m.id];
        if (!live) return null;

        return (
          <div key={m.id} className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-red-400 animate-pulse" />
                <span className="text-xs font-bold text-red-400">
                  LIVE {live.status === "completed" ? "- FULL TIME" : `- ${live.minute}'`}
                </span>
              </div>
              {live.status === "completed" && (
                <div className="flex items-center gap-1 text-xs text-yellow-400">
                  <Trophy className="h-3.5 w-3.5" />
                  Final
                </div>
              )}
            </div>

            {/* Score */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{m.homeTeam.logo}</span>
                <span className="font-bold text-sm">{m.homeTeam.shortName}</span>
              </div>
              <div className="text-center">
                <span className="text-2xl font-black tabular-nums">
                  {live.homeScore} - {live.awayScore}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{m.awayTeam.shortName}</span>
                <span className="text-xl">{m.awayTeam.logo}</span>
              </div>
            </div>

            {/* Events ticker */}
            <div className="max-h-20 overflow-y-auto space-y-1 border-t border-gray-800 pt-2">
              {live.events.slice(-4).reverse().map((event, i) => (
                <p key={i} className="text-xs text-gray-400 truncate">
                  {event}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
