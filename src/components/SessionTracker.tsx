"use client";

import { useEffect } from "react";
import { useGameStore } from "@/lib/store";

export default function SessionTracker() {
  const { startSession, endSession, currentSession } = useGameStore();

  useEffect(() => {
    // Start session on mount
    startSession();

    // End session on tab close / navigate away
    const handleBeforeUnload = () => {
      endSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        endSession();
      } else if (document.visibilityState === "visible" && !currentSession) {
        startSession();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      endSession();
    };
  }, []);

  return null; // Invisible tracker component
}
