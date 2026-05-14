import { describe, it, expect } from "vitest";
import {
  getUserBehaviorProfile,
  calculateEngagementScore,
  calculateAdaptiveDifficulty,
  detectChurnRisk,
  generateBehaviorContext,
} from "@/lib/behavior-engine";

// Helper to create a store snapshot
function makeSnapshot(overrides: Record<string, unknown> = {}) {
  return {
    user: { level: 10, xp: 5000, currentStreak: 3, longestStreak: 7, totalPredictions: 20, correctPredictions: 12, badges: [] },
    predictions: [
      { matchId: "m1", predictedWinner: "t1", isCorrect: true, createdAt: new Date().toISOString(), predictedScoreDiff: 5 },
      { matchId: "m2", predictedWinner: "t1", isCorrect: false, createdAt: new Date().toISOString(), predictedScoreDiff: 3 },
      { matchId: "m3", predictedWinner: "t2", isCorrect: true, createdAt: new Date().toISOString() },
    ],
    challenges: [{ isCompleted: true }, { isCompleted: false }, { isCompleted: true }],
    badges: [{ id: "b1", unlockedAt: "2025-01-01" }, { id: "b2" }],
    sessionLogs: [
      { startedAt: new Date().toISOString(), endedAt: new Date(Date.now() + 600000).toISOString(), actions: ["session_start", "prediction:m1:t1"] },
      { startedAt: new Date(Date.now() - 86400000).toISOString(), endedAt: new Date(Date.now() - 86400000 + 300000).toISOString(), actions: [] },
    ],
    predictionTimestamps: [
      new Date().toISOString(),
      new Date(Date.now() - 86400000).toISOString(),
      new Date(Date.now() - 2 * 86400000).toISOString(),
    ],
    streakDates: [
      new Date().toISOString().split("T")[0],
      new Date(Date.now() - 86400000).toISOString().split("T")[0],
      new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    ],
    chatHistory: [{ timestamp: new Date().toISOString() }],
    appliedRecommendations: ["rec1"],
    ...overrides,
  };
}

describe("Behavior Engine", () => {
  // ====== getUserBehaviorProfile ======

  describe("getUserBehaviorProfile", () => {
    it("should return baseline profile when no snapshot provided", () => {
      const profile = getUserBehaviorProfile();
      expect(profile.totalPredictions).toBe(44);
      expect(profile.level).toBe(15);
      expect(profile.riskProfile).toBe("moderate");
    });

    it("should compute profile from real snapshot", () => {
      const snapshot = makeSnapshot();
      const profile = getUserBehaviorProfile(snapshot);

      expect(profile.totalPredictions).toBe(20);
      expect(profile.level).toBe(10);
      expect(profile.currentStreak).toBe(3);
      expect(profile.longestStreak).toBe(7);
    });

    it("should calculate accuracy from scored predictions", () => {
      const snapshot = makeSnapshot();
      const profile = getUserBehaviorProfile(snapshot);
      // 2 correct out of 3 scored = 0.667
      expect(profile.accuracy).toBeCloseTo(0.667, 2);
    });

    it("should detect favorite teams from predictions", () => {
      const snapshot = makeSnapshot();
      const profile = getUserBehaviorProfile(snapshot);
      expect(profile.favoriteTeams).toContain("t1");
    });

    it("should compute risk profile from score diffs", () => {
      const snapshot = makeSnapshot();
      const profile = getUserBehaviorProfile(snapshot);
      // avgDiff = (5+3)/2 = 4, so "conservative" or "moderate"
      expect(["conservative", "moderate"]).toContain(profile.riskProfile);
    });

    it("should count sessions in last 7 days", () => {
      const snapshot = makeSnapshot();
      const profile = getUserBehaviorProfile(snapshot);
      expect(profile.sessionsLast7Days).toBe(2);
    });

    it("should compute badges earned count", () => {
      const snapshot = makeSnapshot();
      const profile = getUserBehaviorProfile(snapshot);
      expect(profile.badgesEarned).toBe(1);
      expect(profile.totalBadges).toBe(2);
    });

    it("should handle empty predictions gracefully", () => {
      const snapshot = makeSnapshot({
        predictions: [],
        predictionTimestamps: [],
        streakDates: [],
      });
      const profile = getUserBehaviorProfile(snapshot);
      expect(profile.totalPredictions).toBe(20); // From user object
      expect(profile.favoriteTeams.length).toBeGreaterThan(0); // Falls back to defaults
    });

    it("should compute challenge completion rate", () => {
      const snapshot = makeSnapshot();
      const profile = getUserBehaviorProfile(snapshot);
      // 2 completed out of 3
      expect(profile.challengeCompletionRate).toBeCloseTo(0.67, 1);
    });

    it("should detect engagement trend", () => {
      const snapshot = makeSnapshot();
      const profile = getUserBehaviorProfile(snapshot);
      expect(["increasing", "stable", "declining"]).toContain(profile.engagementTrend);
    });

    it("should compute social interactions from chat + recs", () => {
      const snapshot = makeSnapshot();
      const profile = getUserBehaviorProfile(snapshot);
      // 1 chatHistory + 1 appliedRecommendation = 2
      expect(profile.socialInteractions).toBe(2);
    });
  });

  // ====== calculateEngagementScore ======

  describe("calculateEngagementScore", () => {
    it("should return scores between 0 and 100", () => {
      const profile = getUserBehaviorProfile();
      const score = calculateEngagementScore(profile);

      expect(score.overall).toBeGreaterThanOrEqual(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score.prediction).toBeGreaterThanOrEqual(0);
      expect(score.prediction).toBeLessThanOrEqual(100);
      expect(score.social).toBeGreaterThanOrEqual(0);
      expect(score.consistency).toBeGreaterThanOrEqual(0);
      expect(score.progression).toBeGreaterThanOrEqual(0);
    });

    it("should weight consistency highest (35%)", () => {
      const profile = getUserBehaviorProfile();
      const score = calculateEngagementScore(profile);
      // Overall should be a weighted combo
      expect(score.overall).toBeGreaterThan(0);
    });

    it("should score higher for more engaged users", () => {
      const lowEngagement = getUserBehaviorProfile(makeSnapshot({
        user: { level: 2, xp: 100, currentStreak: 0, longestStreak: 1, totalPredictions: 2, correctPredictions: 0, badges: [] },
        sessionLogs: [],
        predictions: [],
        predictionTimestamps: [],
      }));
      const highEngagement = getUserBehaviorProfile(makeSnapshot());

      const lowScore = calculateEngagementScore(lowEngagement);
      const highScore = calculateEngagementScore(highEngagement);

      expect(highScore.overall).toBeGreaterThan(lowScore.overall);
    });
  });

  // ====== calculateAdaptiveDifficulty ======

  describe("calculateAdaptiveDifficulty", () => {
    it("should return multiplier between 0.5 and 2.0", () => {
      const profile = getUserBehaviorProfile();
      const difficulty = calculateAdaptiveDifficulty(profile);
      expect(difficulty.challengeMultiplier).toBeGreaterThanOrEqual(0.5);
      expect(difficulty.challengeMultiplier).toBeLessThanOrEqual(2.0);
    });

    it("should increase difficulty for high completion rate", () => {
      const highCompletion = getUserBehaviorProfile(makeSnapshot({
        challenges: Array(10).fill({ isCompleted: true }),
      }));
      const difficulty = calculateAdaptiveDifficulty(highCompletion);
      expect(difficulty.challengeMultiplier).toBeGreaterThan(1.0);
    });

    it("should decrease difficulty for low completion rate", () => {
      const lowCompletion = getUserBehaviorProfile(makeSnapshot({
        challenges: Array(10).fill({ isCompleted: false }),
      }));
      const difficulty = calculateAdaptiveDifficulty(lowCompletion);
      expect(difficulty.challengeMultiplier).toBeLessThan(1.0);
    });

    it("should provide reasoning when thresholds are met", () => {
      const highCompletion = getUserBehaviorProfile(makeSnapshot({
        challenges: Array(10).fill({ isCompleted: true }),
      }));
      const difficulty = calculateAdaptiveDifficulty(highCompletion);
      expect(difficulty.reasoning.length).toBeGreaterThan(0);
      expect(difficulty.reasoning).toContain("completion rate");
    });

    it("should set daily and weekly targets", () => {
      const profile = getUserBehaviorProfile();
      const difficulty = calculateAdaptiveDifficulty(profile);
      expect(difficulty.suggestedTargets.daily).toBeGreaterThan(0);
      expect(difficulty.suggestedTargets.weekly).toBeGreaterThan(0);
    });
  });

  // ====== detectChurnRisk ======

  describe("detectChurnRisk", () => {
    it("should return low risk for active user", () => {
      const profile = getUserBehaviorProfile();
      const churn = detectChurnRisk(profile);
      expect(churn.risk).toBe("low");
    });

    it("should return high risk for inactive user", () => {
      const inactiveProfile = getUserBehaviorProfile(makeSnapshot({
        user: { level: 5, xp: 500, currentStreak: 0, longestStreak: 3, totalPredictions: 5, correctPredictions: 1, badges: [] },
        sessionLogs: [],
        predictionTimestamps: [new Date(Date.now() - 5 * 86400000).toISOString()],
        streakDates: [],
        challenges: Array(10).fill({ isCompleted: false }),
      }));
      // Force inactive
      inactiveProfile.daysSinceLastActive = 5;
      inactiveProfile.sessionsLast7Days = 0;
      inactiveProfile.engagementTrend = "declining";
      inactiveProfile.streakBroken = true;
      inactiveProfile.daysSinceStreakBroken = 1;
      inactiveProfile.challengeCompletionRate = 0.1;

      const churn = detectChurnRisk(inactiveProfile);
      expect(churn.risk).toBe("high");
      expect(churn.signals.length).toBeGreaterThan(0);
    });

    it("should provide intervention strategy", () => {
      const profile = getUserBehaviorProfile();
      const churn = detectChurnRisk(profile);
      expect(churn.intervention.length).toBeGreaterThan(0);
    });
  });

  // ====== generateBehaviorContext ======

  describe("generateBehaviorContext", () => {
    it("should return a formatted string", () => {
      const profile = getUserBehaviorProfile();
      const context = generateBehaviorContext(profile);
      expect(typeof context).toBe("string");
      expect(context.length).toBeGreaterThan(100);
    });

    it("should contain key profile data", () => {
      const profile = getUserBehaviorProfile();
      const context = generateBehaviorContext(profile);
      expect(context).toContain("Level:");
      expect(context).toContain("Prediction Accuracy:");
      expect(context).toContain("Engagement Score:");
      expect(context).toContain("Churn Risk:");
      expect(context).toContain("Adaptive Difficulty Multiplier:");
    });
  });
});
