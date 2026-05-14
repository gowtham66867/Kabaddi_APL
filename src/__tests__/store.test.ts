import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@/lib/store";

function resetStore() {
  const { getState } = useGameStore;
  // Clear persisted storage and reset
  localStorage.clear();
  useGameStore.setState(useGameStore.getInitialState());
}

describe("GameStore", () => {
  beforeEach(() => {
    resetStore();
  });

  // ====== USER STATE ======

  describe("Initial State", () => {
    it("should have a valid initial user", () => {
      const { user } = useGameStore.getState();
      expect(user.id).toBe("u1");
      expect(user.level).toBeGreaterThanOrEqual(1);
      expect(user.xp).toBeGreaterThanOrEqual(0);
      expect(user.coins).toBeGreaterThanOrEqual(0);
      expect(user.tier).toBeDefined();
    });

    it("should start with empty predictions", () => {
      const { predictions } = useGameStore.getState();
      expect(predictions).toEqual([]);
    });

    it("should start with empty session logs", () => {
      const { sessionLogs } = useGameStore.getState();
      expect(sessionLogs).toEqual([]);
    });

    it("should start with empty chat history", () => {
      const { chatHistory } = useGameStore.getState();
      expect(chatHistory).toEqual([]);
    });

    it("should start with no live matches", () => {
      const { liveMatches } = useGameStore.getState();
      expect(liveMatches).toEqual({});
    });

    it("should have challenges loaded", () => {
      const { challenges } = useGameStore.getState();
      expect(challenges.length).toBeGreaterThan(0);
    });

    it("should have badges loaded", () => {
      const { badges } = useGameStore.getState();
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  // ====== XP & LEVELING ======

  describe("XP & Leveling", () => {
    it("should add XP to user", () => {
      const initialXP = useGameStore.getState().user.xp;
      useGameStore.getState().addXP(100);
      expect(useGameStore.getState().user.xp).toBe(initialXP + 100);
    });

    it("should recalculate level after XP gain", () => {
      useGameStore.getState().addXP(50000);
      const { user } = useGameStore.getState();
      expect(user.level).toBeGreaterThan(1);
    });

    it("should update tier based on level", () => {
      // Force high XP for Diamond
      useGameStore.getState().addXP(100000);
      const { user } = useGameStore.getState();
      expect(["Gold", "Platinum", "Diamond"]).toContain(user.tier);
    });

    it("should add coins to user", () => {
      const initialCoins = useGameStore.getState().user.coins;
      useGameStore.getState().addCoins(50);
      expect(useGameStore.getState().user.coins).toBe(initialCoins + 50);
    });
  });

  // ====== PREDICTIONS ======

  describe("Predictions", () => {
    it("should add a prediction", () => {
      useGameStore.getState().makePrediction({
        matchId: "m1",
        userId: "u1",
        predictedWinner: "t1",
        predictedScoreDiff: 5,
        predictedRaider: "Pardeep Narwal",
        predictedDefender: "Fazel Atrachali",
      });

      const { predictions } = useGameStore.getState();
      expect(predictions.length).toBe(1);
      expect(predictions[0].matchId).toBe("m1");
      expect(predictions[0].predictedWinner).toBe("t1");
      expect(predictions[0].pointsEarned).toBe(0);
    });

    it("should increment totalPredictions on user", () => {
      const initialTotal = useGameStore.getState().user.totalPredictions;
      useGameStore.getState().makePrediction({
        matchId: "m1",
        userId: "u1",
        predictedWinner: "t1",
      });
      expect(useGameStore.getState().user.totalPredictions).toBe(initialTotal + 1);
    });

    it("should award XP for prediction", () => {
      const initialXP = useGameStore.getState().user.xp;
      useGameStore.getState().makePrediction({
        matchId: "m1",
        userId: "u1",
        predictedWinner: "t1",
      });
      expect(useGameStore.getState().user.xp).toBeGreaterThan(initialXP);
    });

    it("should award coins for prediction", () => {
      const initialCoins = useGameStore.getState().user.coins;
      useGameStore.getState().makePrediction({
        matchId: "m1",
        userId: "u1",
        predictedWinner: "t1",
      });
      expect(useGameStore.getState().user.coins).toBeGreaterThan(initialCoins);
    });

    it("should record prediction timestamp", () => {
      useGameStore.getState().makePrediction({
        matchId: "m1",
        userId: "u1",
        predictedWinner: "t1",
      });
      const { predictionTimestamps } = useGameStore.getState();
      expect(predictionTimestamps.length).toBe(1);
    });

    it("should update streak dates", () => {
      useGameStore.getState().makePrediction({
        matchId: "m1",
        userId: "u1",
        predictedWinner: "t1",
      });
      const { streakDates } = useGameStore.getState();
      expect(streakDates.length).toBeGreaterThanOrEqual(1);
    });

    it("should generate a notification on prediction", () => {
      useGameStore.getState().makePrediction({
        matchId: "m1",
        userId: "u1",
        predictedWinner: "t1",
      });
      const { notifications } = useGameStore.getState();
      expect(notifications.some((n) => n.includes("Prediction submitted"))).toBe(true);
    });
  });

  // ====== PREDICTION SCORING ======

  describe("Prediction Scoring", () => {
    beforeEach(() => {
      resetStore();
      useGameStore.getState().makePrediction({
        matchId: "m1",
        userId: "u1",
        predictedWinner: "t1",
        predictedScoreDiff: 5,
        predictedRaider: "Pardeep Narwal",
        predictedDefender: "Fazel Atrachali",
      });
    });

    it("should score a correct winner prediction", () => {
      useGameStore.getState().scorePrediction("m1", "t1", 5, "Pardeep Narwal", "Fazel Atrachali");
      const pred = useGameStore.getState().predictions[0];
      expect(pred.isCorrect).toBe(true);
      expect(pred.pointsEarned).toBeGreaterThan(0);
    });

    it("should award max points for perfect prediction", () => {
      useGameStore.getState().scorePrediction("m1", "t1", 5, "Pardeep Narwal", "Fazel Atrachali");
      const pred = useGameStore.getState().predictions[0];
      // Winner(50) + ScoreDiff(100) + Raider(75) + Defender(75) = 300
      expect(pred.pointsEarned).toBe(300);
    });

    it("should mark incorrect prediction when winner is wrong", () => {
      useGameStore.getState().scorePrediction("m1", "t2", 5, "Pardeep Narwal", "Fazel Atrachali");
      const pred = useGameStore.getState().predictions[0];
      expect(pred.isCorrect).toBe(false);
    });

    it("should award partial points for correct winner only", () => {
      useGameStore.getState().scorePrediction("m1", "t1", 15, "Someone Else", "Someone Else");
      const pred = useGameStore.getState().predictions[0];
      expect(pred.isCorrect).toBe(true);
      expect(pred.pointsEarned).toBe(50); // Only winner correct
    });

    it("should award score diff bonus when within 3 points", () => {
      useGameStore.getState().scorePrediction("m1", "t1", 7, "X", "Y");
      const pred = useGameStore.getState().predictions[0];
      // Winner(50) + ScoreDiff within 3 of 5 (100) = 150
      expect(pred.pointsEarned).toBe(150);
    });

    it("should not re-score already scored predictions", () => {
      useGameStore.getState().scorePrediction("m1", "t1", 5, "Pardeep Narwal", "Fazel Atrachali");
      const points1 = useGameStore.getState().predictions[0].pointsEarned;

      useGameStore.getState().scorePrediction("m1", "t1", 5, "Pardeep Narwal", "Fazel Atrachali");
      const points2 = useGameStore.getState().predictions[0].pointsEarned;

      expect(points1).toBe(points2);
    });

    it("should update correctPredictions count", () => {
      useGameStore.getState().scorePrediction("m1", "t1", 5, "X", "Y");
      expect(useGameStore.getState().user.correctPredictions).toBeGreaterThanOrEqual(1);
    });

    it("should send notification for correct prediction", () => {
      useGameStore.getState().scorePrediction("m1", "t1", 5, "X", "Y");
      const { notifications } = useGameStore.getState();
      expect(notifications.some((n) => n.includes("Correct prediction"))).toBe(true);
    });

    it("should send notification for incorrect prediction", () => {
      useGameStore.getState().scorePrediction("m1", "t2", 5, "X", "Y");
      const { notifications } = useGameStore.getState();
      expect(notifications.some((n) => n.includes("incorrect"))).toBe(true);
    });
  });

  // ====== CHALLENGES ======

  describe("Challenges", () => {
    it("should complete a challenge", () => {
      const { challenges } = useGameStore.getState();
      const challengeId = challenges[0].id;
      useGameStore.getState().completeChallenge(challengeId);
      const updated = useGameStore.getState().challenges.find((c) => c.id === challengeId);
      expect(updated?.isCompleted).toBe(true);
      expect(updated?.progress).toBe(updated?.target);
    });

    it("should award XP on challenge completion", () => {
      const initialXP = useGameStore.getState().user.xp;
      const { challenges } = useGameStore.getState();
      useGameStore.getState().completeChallenge(challenges[0].id);
      expect(useGameStore.getState().user.xp).toBeGreaterThan(initialXP);
    });

    it("should not complete an already completed challenge", () => {
      const { challenges } = useGameStore.getState();
      const challengeId = challenges[0].id;
      useGameStore.getState().completeChallenge(challengeId);
      const xpAfterFirst = useGameStore.getState().user.xp;
      useGameStore.getState().completeChallenge(challengeId);
      expect(useGameStore.getState().user.xp).toBe(xpAfterFirst);
    });

    it("should send notification on challenge completion", () => {
      const { challenges } = useGameStore.getState();
      useGameStore.getState().completeChallenge(challenges[0].id);
      const { notifications } = useGameStore.getState();
      expect(notifications.some((n) => n.includes("Challenge Complete"))).toBe(true);
    });
  });

  // ====== BADGES ======

  describe("Badges", () => {
    it("should unlock a badge", () => {
      const { badges } = useGameStore.getState();
      const lockedBadge = badges.find((b) => !b.unlockedAt);
      if (!lockedBadge) return;

      useGameStore.getState().unlockBadge(lockedBadge.id);
      const updated = useGameStore.getState().badges.find((b) => b.id === lockedBadge.id);
      expect(updated?.unlockedAt).toBeDefined();
    });

    it("should not re-unlock an already unlocked badge", () => {
      const { badges } = useGameStore.getState();
      const unlockedBadge = badges.find((b) => b.unlockedAt);
      if (!unlockedBadge) return;

      const notifCount = useGameStore.getState().notifications.length;
      useGameStore.getState().unlockBadge(unlockedBadge.id);
      expect(useGameStore.getState().notifications.length).toBe(notifCount);
    });

    it("should add badge to user badges on unlock", () => {
      const { badges } = useGameStore.getState();
      const lockedBadge = badges.find((b) => !b.unlockedAt);
      if (!lockedBadge) return;

      useGameStore.getState().unlockBadge(lockedBadge.id);
      const userBadges = useGameStore.getState().user.badges;
      expect(userBadges.some((b) => b.id === lockedBadge.id)).toBe(true);
    });
  });

  // ====== SESSION TRACKING ======

  describe("Session Tracking", () => {
    it("should start a session", () => {
      useGameStore.getState().startSession();
      expect(useGameStore.getState().currentSession).not.toBeNull();
      expect(useGameStore.getState().currentSession?.startedAt).toBeDefined();
    });

    it("should log actions to current session", () => {
      useGameStore.getState().startSession();
      useGameStore.getState().logAction("test_action");
      const session = useGameStore.getState().currentSession;
      expect(session?.actions.length).toBeGreaterThanOrEqual(1);
      expect(session?.actions.some((a) => a.includes("test_action"))).toBe(true);
    });

    it("should not log actions without a session", () => {
      useGameStore.getState().logAction("orphan_action");
      expect(useGameStore.getState().currentSession).toBeNull();
    });

    it("should end a session and persist it", () => {
      useGameStore.getState().startSession();
      useGameStore.getState().logAction("some_action");
      useGameStore.getState().endSession();

      expect(useGameStore.getState().currentSession).toBeNull();
      expect(useGameStore.getState().sessionLogs.length).toBe(1);
      expect(useGameStore.getState().sessionLogs[0].endedAt).toBeDefined();
    });

    it("should cap session logs at 50", () => {
      for (let i = 0; i < 55; i++) {
        useGameStore.getState().startSession();
        useGameStore.getState().endSession();
      }
      expect(useGameStore.getState().sessionLogs.length).toBeLessThanOrEqual(50);
    });
  });

  // ====== CHAT MEMORY ======

  describe("Chat Memory", () => {
    it("should add a chat message", () => {
      useGameStore.getState().addChatMessage({
        role: "user",
        content: "Hello",
        timestamp: new Date().toISOString(),
      });
      expect(useGameStore.getState().chatHistory.length).toBe(1);
      expect(useGameStore.getState().chatHistory[0].content).toBe("Hello");
    });

    it("should persist multiple messages in order", () => {
      useGameStore.getState().addChatMessage({ role: "user", content: "First", timestamp: new Date().toISOString() });
      useGameStore.getState().addChatMessage({ role: "assistant", content: "Second", timestamp: new Date().toISOString() });
      useGameStore.getState().addChatMessage({ role: "user", content: "Third", timestamp: new Date().toISOString() });

      const history = useGameStore.getState().chatHistory;
      expect(history.length).toBe(3);
      expect(history[0].content).toBe("First");
      expect(history[1].content).toBe("Second");
      expect(history[2].content).toBe("Third");
    });

    it("should cap chat history at 100 messages", () => {
      for (let i = 0; i < 110; i++) {
        useGameStore.getState().addChatMessage({
          role: "user",
          content: `Message ${i}`,
          timestamp: new Date().toISOString(),
        });
      }
      expect(useGameStore.getState().chatHistory.length).toBeLessThanOrEqual(100);
    });

    it("should clear chat history", () => {
      useGameStore.getState().addChatMessage({ role: "user", content: "test", timestamp: new Date().toISOString() });
      useGameStore.getState().clearChatHistory();
      expect(useGameStore.getState().chatHistory.length).toBe(0);
    });
  });

  // ====== LIVE MATCH ======

  describe("Live Match", () => {
    it("should initialize a live match", () => {
      useGameStore.getState().updateLiveMatch("m7", {
        matchId: "m7",
        homeScore: 10,
        awayScore: 8,
        minute: 15,
        status: "live",
        events: ["Match started"],
      });

      const lm = useGameStore.getState().liveMatches["m7"];
      expect(lm).toBeDefined();
      expect(lm.homeScore).toBe(10);
      expect(lm.awayScore).toBe(8);
      expect(lm.status).toBe("live");
    });

    it("should update live match scores", () => {
      useGameStore.getState().updateLiveMatch("m7", {
        matchId: "m7", homeScore: 10, awayScore: 8, minute: 15, status: "live", events: [],
      });
      useGameStore.getState().updateLiveMatch("m7", { homeScore: 12, minute: 16 });

      const lm = useGameStore.getState().liveMatches["m7"];
      expect(lm.homeScore).toBe(12);
      expect(lm.minute).toBe(16);
    });

    it("should complete a live match", () => {
      useGameStore.getState().updateLiveMatch("m7", {
        matchId: "m7", homeScore: 30, awayScore: 25, minute: 40, status: "live", events: [],
      });
      useGameStore.getState().completeLiveMatch("m7", "t1");

      const lm = useGameStore.getState().liveMatches["m7"];
      expect(lm.status).toBe("completed");
      expect(lm.winner).toBe("t1");
    });

    it("should auto-score predictions on match completion", () => {
      // Make a prediction first
      useGameStore.getState().makePrediction({
        matchId: "m7",
        userId: "u1",
        predictedWinner: "t1",
      });

      // Set up and complete live match
      useGameStore.getState().updateLiveMatch("m7", {
        matchId: "m7", homeScore: 30, awayScore: 25, minute: 40, status: "live", events: [],
      });
      useGameStore.getState().completeLiveMatch("m7", "t1");

      const pred = useGameStore.getState().predictions.find((p) => p.matchId === "m7");
      expect(pred?.isCorrect).toBe(true);
    });
  });

  // ====== AI FEEDBACK LOOP ======

  describe("AI Feedback Loop", () => {
    it("should apply a recommendation", () => {
      useGameStore.getState().applyRecommendation("Try harder challenges");
      expect(useGameStore.getState().appliedRecommendations).toContain("Try harder challenges");
    });

    it("should cap applied recommendations at 20", () => {
      for (let i = 0; i < 25; i++) {
        useGameStore.getState().applyRecommendation(`Rec ${i}`);
      }
      expect(useGameStore.getState().appliedRecommendations.length).toBeLessThanOrEqual(20);
    });

    it("should set AI-generated challenges", () => {
      useGameStore.getState().setAIChallenges([
        { id: "x", title: "AI Test", description: "Test", type: "daily", xpReward: 100, progress: 0, target: 3, isCompleted: false, expiresAt: "" },
      ]);
      const { aiChallenges } = useGameStore.getState();
      expect(aiChallenges.length).toBe(1);
      expect(aiChallenges[0].title).toBe("AI Test");
      expect(aiChallenges[0].id).toContain("ai_c_");
    });

    it("should complete an AI-generated challenge", () => {
      useGameStore.getState().setAIChallenges([
        { id: "x", title: "AI Challenge", description: "Desc", type: "daily", xpReward: 75, progress: 0, target: 1, isCompleted: false, expiresAt: "" },
      ]);
      const aiChallengeId = useGameStore.getState().aiChallenges[0].id;
      const xpBefore = useGameStore.getState().user.xp;

      useGameStore.getState().completeChallenge(aiChallengeId);

      const updated = useGameStore.getState().aiChallenges.find((c) => c.id === aiChallengeId);
      expect(updated?.isCompleted).toBe(true);
      expect(useGameStore.getState().user.xp).toBeGreaterThan(xpBefore);
    });
  });

  // ====== NOTIFICATIONS ======

  describe("Notifications", () => {
    it("should add a notification", () => {
      useGameStore.getState().addNotification("Test notification");
      expect(useGameStore.getState().notifications).toContain("Test notification");
    });

    it("should cap notifications at 20", () => {
      for (let i = 0; i < 25; i++) {
        useGameStore.getState().addNotification(`Notif ${i}`);
      }
      expect(useGameStore.getState().notifications.length).toBeLessThanOrEqual(20);
    });

    it("should place newest notification first", () => {
      useGameStore.getState().addNotification("First");
      useGameStore.getState().addNotification("Second");
      expect(useGameStore.getState().notifications[0]).toBe("Second");
    });

    it("should clear notifications", () => {
      useGameStore.getState().addNotification("test");
      useGameStore.getState().clearNotifications();
      expect(useGameStore.getState().notifications.length).toBe(0);
    });
  });
});
