import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  currentUser,
  badges as allBadges,
  challenges as allChallenges,
  teams,
  type UserProfile,
  type Badge,
  type Challenge,
  type Prediction,
} from "./data";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface SessionLog {
  startedAt: string;
  endedAt?: string;
  actions: string[];
}

interface LiveMatch {
  matchId: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: "live" | "completed";
  events: string[];
  winner?: string;
}

interface GameState {
  user: UserProfile;
  badges: Badge[];
  challenges: Challenge[];
  predictions: Prediction[];
  notifications: string[];

  // Session tracking (real data)
  sessionLogs: SessionLog[];
  currentSession: SessionLog | null;
  predictionTimestamps: string[];
  lastPredictionDate: string | null;
  streakDates: string[];

  // Chat memory (persistent)
  chatHistory: ChatMessage[];

  // Live match state
  liveMatches: Record<string, LiveMatch>;

  // AI recommendation state (feedback loop)
  appliedRecommendations: string[];
  aiChallenges: Challenge[];

  // Actions
  makePrediction: (prediction: Omit<Prediction, "id" | "createdAt" | "pointsEarned">) => void;
  scorePrediction: (matchId: string, winnerId: string, scoreDiff: number, topRaider: string, topDefender: string) => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  updateStreak: () => void;
  completeChallenge: (challengeId: string) => void;
  unlockBadge: (badgeId: string) => void;
  addNotification: (message: string) => void;
  clearNotifications: () => void;

  // Session tracking
  startSession: () => void;
  logAction: (action: string) => void;
  endSession: () => void;

  // Chat memory
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;

  // Live match
  updateLiveMatch: (matchId: string, update: Partial<LiveMatch>) => void;
  completeLiveMatch: (matchId: string, winnerId: string) => void;

  // AI feedback loop
  applyRecommendation: (rec: string) => void;
  setAIChallenges: (challenges: Challenge[]) => void;
}

function calculateLevel(xp: number): { level: number; xpToNextLevel: number } {
  const baseXP = 500;
  const multiplier = 1.3;
  let level = 1;
  let totalXPNeeded = baseXP;

  while (xp >= totalXPNeeded) {
    level++;
    totalXPNeeded += Math.floor(baseXP * Math.pow(multiplier, level - 1));
  }

  return { level, xpToNextLevel: totalXPNeeded };
}

function getTier(level: number): UserProfile["tier"] {
  if (level >= 25) return "Diamond";
  if (level >= 20) return "Platinum";
  if (level >= 15) return "Gold";
  if (level >= 10) return "Silver";
  return "Bronze";
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      user: currentUser,
      badges: allBadges,
      challenges: allChallenges,
      predictions: [],
      notifications: [],

      // Real tracking state
      sessionLogs: [],
      currentSession: null,
      predictionTimestamps: [],
      lastPredictionDate: null,
      streakDates: [],

      // Persistent chat memory
      chatHistory: [],

      // Live matches
      liveMatches: {},

      // AI feedback loop
      appliedRecommendations: [],
      aiChallenges: [],

      // ========== SESSION TRACKING ==========

      startSession: () => {
        const now = new Date().toISOString();
        set({
          currentSession: { startedAt: now, actions: [] },
        });
        get().logAction("session_start");
      },

      logAction: (action) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              actions: [...state.currentSession.actions, `${new Date().toISOString()}:${action}`],
            },
          };
        });
      },

      endSession: () => {
        set((state) => {
          if (!state.currentSession) return state;
          const completed = {
            ...state.currentSession,
            endedAt: new Date().toISOString(),
          };
          return {
            sessionLogs: [...state.sessionLogs, completed].slice(-50),
            currentSession: null,
          };
        });
      },

      // ========== PREDICTIONS ==========

      makePrediction: (prediction) => {
        const id = `pred_${Date.now()}`;
        const now = new Date().toISOString();
        const today = getToday();

        const newPrediction: Prediction = {
          ...prediction,
          id,
          pointsEarned: 0,
          createdAt: now,
        };

        set((state) => {
          const updatedPredictions = [...state.predictions, newPrediction];
          const updatedTimestamps = [...state.predictionTimestamps, now];
          const updatedUser = {
            ...state.user,
            totalPredictions: state.user.totalPredictions + 1,
          };

          // Streak: check if user predicted yesterday or this is first prediction
          let updatedStreakDates = [...state.streakDates];
          if (!updatedStreakDates.includes(today)) {
            updatedStreakDates.push(today);
          }

          // Update daily challenge progress
          const updatedChallenges = state.challenges.map((c) => {
            if (c.id === "c1" && !c.isCompleted) {
              const newProgress = Math.min(c.progress + 1, c.target);
              return { ...c, progress: newProgress, isCompleted: newProgress >= c.target };
            }
            if (c.id === "c5" && !c.isCompleted) {
              const newProgress = Math.min(c.progress + 1, c.target);
              return { ...c, progress: newProgress, isCompleted: newProgress >= c.target };
            }
            return c;
          });

          return {
            predictions: updatedPredictions,
            predictionTimestamps: updatedTimestamps,
            lastPredictionDate: today,
            streakDates: updatedStreakDates,
            user: updatedUser,
            challenges: updatedChallenges,
          };
        });

        // Auto-calculate streak from dates
        const dates = get().streakDates.sort().reverse();
        let streak = 0;
        const todayDate = new Date(today);
        for (let i = 0; i < dates.length; i++) {
          const expected = new Date(todayDate);
          expected.setDate(expected.getDate() - i);
          if (dates[i] === expected.toISOString().split("T")[0]) {
            streak++;
          } else break;
        }

        set((state) => ({
          user: {
            ...state.user,
            currentStreak: streak,
            longestStreak: Math.max(streak, state.user.longestStreak),
          },
        }));

        // Award XP for making a prediction
        get().addXP(25);
        get().addCoins(10);
        get().logAction(`prediction:${prediction.matchId}:${prediction.predictedWinner}`);
        get().addNotification("🎯 Prediction submitted! +25 XP, +10 coins");

        // Streak bonus
        const currentStreak = get().user.currentStreak;
        if (currentStreak > 1) {
          const bonusXP = currentStreak * 10;
          get().addXP(bonusXP);
          get().addNotification(`🔥 ${currentStreak}-day streak! +${bonusXP} bonus XP`);
        }

        // Check first prediction badge
        if (get().user.totalPredictions === 1) {
          get().unlockBadge("b1");
        }

        // Check streak badge
        if (currentStreak >= 5) {
          get().unlockBadge("b2");
        }
      },

      // ========== PREDICTION SCORING (FEEDBACK LOOP) ==========

      scorePrediction: (matchId, winnerId, scoreDiff, topRaider, topDefender) => {
        set((state) => {
          let totalXPEarned = 0;
          const updatedPredictions = state.predictions.map((p) => {
            if (p.matchId !== matchId || p.isCorrect !== undefined) return p;

            let points = 0;
            const isWinnerCorrect = p.predictedWinner === winnerId;

            if (isWinnerCorrect) {
              points += 50;
              totalXPEarned += 50;
            }

            if (p.predictedScoreDiff && Math.abs(p.predictedScoreDiff - scoreDiff) <= 3) {
              points += 100;
              totalXPEarned += 100;
            }

            if (p.predictedRaider && p.predictedRaider === topRaider) {
              points += 75;
              totalXPEarned += 75;
            }

            if (p.predictedDefender && p.predictedDefender === topDefender) {
              points += 75;
              totalXPEarned += 75;
            }

            return {
              ...p,
              isCorrect: isWinnerCorrect,
              pointsEarned: points,
            };
          });

          const correctCount = updatedPredictions.filter((p) => p.isCorrect === true).length;

          // Update challenges based on scoring
          const updatedChallenges = state.challenges.map((c) => {
            if (c.id === "c4" && !c.isCompleted) {
              const scored = updatedPredictions.filter((p) => p.isCorrect !== undefined);
              const allCorrect = scored.every((p) => p.isCorrect);
              return { ...c, progress: allCorrect ? scored.length : c.progress };
            }
            return c;
          });

          // Update badges based on correct predictions
          const updatedBadges = state.badges.map((b) => {
            if (b.id === "b3") return { ...b, progress: Math.min(correctCount, b.requirement) };
            if (b.id === "b4") return { ...b, progress: Math.min(correctCount, b.requirement) };
            return b;
          });

          return {
            predictions: updatedPredictions,
            user: {
              ...state.user,
              correctPredictions: correctCount,
            },
            challenges: updatedChallenges,
            badges: updatedBadges,
          };
        });

        const pred = get().predictions.find((p) => p.matchId === matchId);
        if (pred?.isCorrect) {
          get().addXP(pred.pointsEarned);
          get().addCoins(pred.pointsEarned / 2);
          get().addNotification(`✅ Correct prediction for match ${matchId}! +${pred.pointsEarned} XP`);

          // Check guru badge (25 correct)
          if (get().user.correctPredictions >= 25) {
            get().unlockBadge("b3");
          }
          // Check oracle badge (50 correct)
          if (get().user.correctPredictions >= 50) {
            get().unlockBadge("b4");
          }
        } else if (pred) {
          get().addNotification(`❌ Prediction for match ${matchId} was incorrect. Keep trying!`);
        }
      },

      // ========== XP / COINS / STREAK ==========

      addXP: (amount) => {
        set((state) => {
          const newXP = state.user.xp + amount;
          const { level, xpToNextLevel } = calculateLevel(newXP);
          const leveledUp = level > state.user.level;
          const tier = getTier(level);

          if (leveledUp) {
            get().addNotification(`🎉 Level Up! You're now Level ${level}!`);
            get().addCoins(100);
          }

          return {
            user: { ...state.user, xp: newXP, level, xpToNextLevel, tier },
          };
        });
      },

      addCoins: (amount) => {
        set((state) => ({
          user: { ...state.user, coins: state.user.coins + amount },
        }));
      },

      updateStreak: () => {
        // Now handled automatically in makePrediction via streakDates
        const today = getToday();
        set((state) => {
          let dates = [...state.streakDates];
          if (!dates.includes(today)) dates.push(today);
          return { streakDates: dates };
        });
      },

      // ========== CHALLENGES ==========

      completeChallenge: (challengeId) => {
        set((state) => {
          const challenge = state.challenges.find((c) => c.id === challengeId)
            || state.aiChallenges.find((c) => c.id === challengeId);
          if (!challenge || challenge.isCompleted) return state;

          get().addXP(challenge.xpReward);
          get().addCoins(challenge.xpReward / 2);
          get().addNotification(`✅ Challenge Complete: ${challenge.title}! +${challenge.xpReward} XP`);
          get().logAction(`challenge_complete:${challengeId}`);

          return {
            challenges: state.challenges.map((c) =>
              c.id === challengeId ? { ...c, isCompleted: true, progress: c.target } : c
            ),
            aiChallenges: state.aiChallenges.map((c) =>
              c.id === challengeId ? { ...c, isCompleted: true, progress: c.target } : c
            ),
          };
        });
      },

      // ========== BADGES ==========

      unlockBadge: (badgeId) => {
        set((state) => {
          const badge = state.badges.find((b) => b.id === badgeId);
          if (!badge || badge.unlockedAt) return state;

          get().addNotification(`🏅 Badge Unlocked: ${badge.name}!`);
          get().logAction(`badge_unlock:${badgeId}`);

          const updatedBadges = state.badges.map((b) =>
            b.id === badgeId ? { ...b, unlockedAt: new Date().toISOString(), progress: b.requirement } : b
          );

          const userBadges = updatedBadges.filter((b) => b.unlockedAt);

          return {
            badges: updatedBadges,
            user: { ...state.user, badges: userBadges },
          };
        });
      },

      // ========== NOTIFICATIONS ==========

      addNotification: (message) => {
        set((state) => ({
          notifications: [message, ...state.notifications].slice(0, 20),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // ========== CHAT MEMORY ==========

      addChatMessage: (message) => {
        set((state) => ({
          chatHistory: [...state.chatHistory, message].slice(-100),
        }));
      },

      clearChatHistory: () => {
        set({ chatHistory: [] });
      },

      // ========== LIVE MATCH ==========

      updateLiveMatch: (matchId, update) => {
        set((state) => ({
          liveMatches: {
            ...state.liveMatches,
            [matchId]: {
              ...(state.liveMatches[matchId] || { matchId, homeScore: 0, awayScore: 0, minute: 0, status: "live" as const, events: [] }),
              ...update,
            },
          },
        }));
      },

      completeLiveMatch: (matchId, winnerId) => {
        set((state) => ({
          liveMatches: {
            ...state.liveMatches,
            [matchId]: {
              ...state.liveMatches[matchId],
              status: "completed" as const,
              winner: winnerId,
            },
          },
        }));

        // Auto-score predictions for this match
        const lm = get().liveMatches[matchId];
        if (lm) {
          const diff = Math.abs(lm.homeScore - lm.awayScore);
          get().scorePrediction(matchId, winnerId, diff, "Pardeep Narwal", "Fazel Atrachali");
        }
      },

      // ========== AI FEEDBACK LOOP ==========

      applyRecommendation: (rec) => {
        set((state) => ({
          appliedRecommendations: [...state.appliedRecommendations, rec].slice(-20),
        }));
        get().logAction(`ai_rec_applied:${rec.substring(0, 50)}`);
      },

      setAIChallenges: (challenges) => {
        set({
          aiChallenges: challenges.map((c, i) => ({
            ...c,
            id: `ai_c_${Date.now()}_${i}`,
            isCompleted: false,
            progress: 0,
            expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
          })),
        });
        get().logAction("ai_challenges_generated");
      },
    }),
    {
      name: "kabaddi-game-store",
    }
  )
);
