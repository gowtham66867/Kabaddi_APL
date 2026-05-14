/**
 * Behavior Analysis Engine
 * Tracks user patterns, calculates engagement metrics,
 * and provides data for AI-driven personalization.
 */

export interface UserBehaviorProfile {
  // Engagement metrics
  sessionsLast7Days: number;
  avgSessionDuration: number; // minutes
  predictionsPerDay: number[];
  lastActiveTimestamp: string;
  daysSinceLastActive: number;

  // Prediction patterns
  totalPredictions: number;
  accuracy: number;
  favoriteTeams: string[];
  riskProfile: "conservative" | "moderate" | "aggressive";
  avgConfidenceWhenCorrect: number;
  avgConfidenceWhenWrong: number;

  // Gamification engagement
  challengeCompletionRate: number;
  streakHistory: number[];
  currentStreak: number;
  longestStreak: number;
  badgesEarned: number;
  totalBadges: number;
  level: number;
  xpRate: number; // XP earned per day average

  // Behavioral signals
  timeOfDayPreference: "morning" | "afternoon" | "evening" | "night";
  matchDayEngagement: number; // 0-1 score
  nonMatchDayEngagement: number; // 0-1 score
  socialInteractions: number;

  // Churn indicators
  engagementTrend: "increasing" | "stable" | "declining";
  streakBroken: boolean;
  daysSinceStreakBroken: number;
}

export interface AdaptiveDifficulty {
  challengeMultiplier: number; // 0.5 = easier, 1.0 = normal, 2.0 = harder
  suggestedTargets: {
    daily: number;
    weekly: number;
  };
  reasoning: string;
}

export interface EngagementScore {
  overall: number; // 0-100
  prediction: number;
  social: number;
  consistency: number;
  progression: number;
}

// Compute real behavior profile from persisted store data
export function getUserBehaviorProfile(storeSnapshot?: {
  user: { level: number; xp: number; currentStreak: number; longestStreak: number; totalPredictions: number; correctPredictions: number; badges: { id: string }[]; };
  predictions: { matchId: string; predictedWinner: string; isCorrect?: boolean; createdAt: string; predictedScoreDiff?: number; }[];
  challenges: { isCompleted: boolean }[];
  badges: { id: string; unlockedAt?: string }[];
  sessionLogs: { startedAt: string; endedAt?: string; actions: string[] }[];
  predictionTimestamps: string[];
  streakDates: string[];
  chatHistory: { timestamp: string }[];
  appliedRecommendations: string[];
}): UserBehaviorProfile {
  // If no snapshot passed, return baseline (for server-side calls that can't access client store)
  if (!storeSnapshot) {
    return getBaselineProfile();
  }

  const s = storeSnapshot;
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

  // Sessions in last 7 days
  const recentSessions = s.sessionLogs.filter((l) => new Date(l.startedAt) >= sevenDaysAgo);
  const sessionsLast7Days = recentSessions.length;

  // Avg session duration
  const durations = recentSessions
    .filter((l) => l.endedAt)
    .map((l) => (new Date(l.endedAt!).getTime() - new Date(l.startedAt).getTime()) / 60000);
  const avgSessionDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 5;

  // Predictions per day (last 7 days)
  const predsByDay: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().split("T")[0];
    const count = s.predictionTimestamps.filter((t) => t.startsWith(dayStr)).length;
    predsByDay.push(count);
  }

  // Last active
  const lastTs = s.predictionTimestamps.length > 0
    ? s.predictionTimestamps[s.predictionTimestamps.length - 1]
    : s.sessionLogs.length > 0
    ? s.sessionLogs[s.sessionLogs.length - 1].startedAt
    : now.toISOString();
  const daysSinceLastActive = Math.floor((now.getTime() - new Date(lastTs).getTime()) / 86400000);

  // Accuracy
  const scored = s.predictions.filter((p) => p.isCorrect !== undefined);
  const accuracy = scored.length > 0 ? scored.filter((p) => p.isCorrect).length / scored.length : (s.user.correctPredictions / Math.max(s.user.totalPredictions, 1));

  // Favorite teams (most predicted)
  const teamCounts: Record<string, number> = {};
  s.predictions.forEach((p) => {
    teamCounts[p.predictedWinner] = (teamCounts[p.predictedWinner] || 0) + 1;
  });
  const favoriteTeamIds = Object.entries(teamCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([id]) => id);
  const favoriteTeams = favoriteTeamIds.length > 0 ? favoriteTeamIds : ["Patna Pirates", "Jaipur Pink Panthers"];

  // Risk profile
  const scoreDiffPreds = s.predictions.filter((p) => p.predictedScoreDiff);
  const avgDiff = scoreDiffPreds.length > 0 ? scoreDiffPreds.reduce((a, p) => a + (p.predictedScoreDiff || 0), 0) / scoreDiffPreds.length : 5;
  const riskProfile: UserBehaviorProfile["riskProfile"] = avgDiff > 8 ? "aggressive" : avgDiff > 4 ? "moderate" : "conservative";

  // Challenge completion rate
  const completedChallenges = s.challenges.filter((c) => c.isCompleted).length;
  const challengeCompletionRate = s.challenges.length > 0 ? completedChallenges / s.challenges.length : 0;

  // Streak history from streakDates
  const streakHistory = computeStreakHistory(s.streakDates);

  // XP rate (per day, last 7 days)
  const xpRate = Math.round(s.user.xp / Math.max(s.sessionLogs.length, 1));

  // Time of day preference
  const hours = s.predictionTimestamps.map((t) => new Date(t).getHours());
  const timeOfDayPreference = computeTimePreference(hours);

  // Engagement trend (compare this week vs last week)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);
  const lastWeekSessions = s.sessionLogs.filter((l) => {
    const d = new Date(l.startedAt);
    return d >= twoWeeksAgo && d < sevenDaysAgo;
  }).length;
  const engagementTrend: UserBehaviorProfile["engagementTrend"] =
    sessionsLast7Days > lastWeekSessions + 1 ? "increasing" :
    sessionsLast7Days < lastWeekSessions - 1 ? "declining" : "stable";

  // Streak broken detection
  const today = now.toISOString().split("T")[0];
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split("T")[0];
  const streakBroken = s.user.currentStreak === 0 && s.streakDates.length > 0 && !s.streakDates.includes(yesterday);

  return {
    sessionsLast7Days,
    avgSessionDuration: Math.round(avgSessionDuration * 10) / 10,
    predictionsPerDay: predsByDay,
    lastActiveTimestamp: lastTs,
    daysSinceLastActive,
    totalPredictions: s.user.totalPredictions,
    accuracy: Math.round(accuracy * 1000) / 1000,
    favoriteTeams,
    riskProfile,
    avgConfidenceWhenCorrect: 0.72,
    avgConfidenceWhenWrong: 0.58,
    challengeCompletionRate: Math.round(challengeCompletionRate * 100) / 100,
    streakHistory,
    currentStreak: s.user.currentStreak,
    longestStreak: s.user.longestStreak,
    badgesEarned: s.badges.filter((b) => b.unlockedAt).length,
    totalBadges: s.badges.length,
    level: s.user.level,
    xpRate,
    timeOfDayPreference,
    matchDayEngagement: 0.9,
    nonMatchDayEngagement: Math.min(1, (sessionsLast7Days - predsByDay.filter((d) => d > 0).length) / 7 + 0.2),
    socialInteractions: s.appliedRecommendations.length + s.chatHistory.length,
    engagementTrend,
    streakBroken,
    daysSinceStreakBroken: streakBroken ? daysSinceLastActive : 99,
  };
}

function computeStreakHistory(dates: string[]): number[] {
  if (dates.length === 0) return [0];
  const sorted = [...dates].sort();
  const streaks: number[] = [];
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      current++;
    } else {
      streaks.push(current);
      current = 1;
    }
  }
  streaks.push(current);
  return streaks;
}

function computeTimePreference(hours: number[]): UserBehaviorProfile["timeOfDayPreference"] {
  if (hours.length === 0) return "evening";
  const buckets = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  hours.forEach((h) => {
    if (h >= 5 && h < 12) buckets.morning++;
    else if (h >= 12 && h < 17) buckets.afternoon++;
    else if (h >= 17 && h < 22) buckets.evening++;
    else buckets.night++;
  });
  return Object.entries(buckets).sort((a, b) => b[1] - a[1])[0][0] as UserBehaviorProfile["timeOfDayPreference"];
}

function getBaselineProfile(): UserBehaviorProfile {
  return {
    sessionsLast7Days: 5,
    avgSessionDuration: 8.5,
    predictionsPerDay: [2, 3, 1, 0, 2, 3, 2],
    lastActiveTimestamp: new Date().toISOString(),
    daysSinceLastActive: 0,
    totalPredictions: 44,
    accuracy: 0.636,
    favoriteTeams: ["Patna Pirates", "Jaipur Pink Panthers"],
    riskProfile: "moderate",
    avgConfidenceWhenCorrect: 0.72,
    avgConfidenceWhenWrong: 0.58,
    challengeCompletionRate: 0.65,
    streakHistory: [3, 5, 7, 2, 3],
    currentStreak: 3,
    longestStreak: 7,
    badgesEarned: 1,
    totalBadges: 8,
    level: 15,
    xpRate: 180,
    timeOfDayPreference: "evening",
    matchDayEngagement: 0.9,
    nonMatchDayEngagement: 0.4,
    socialInteractions: 4,
    engagementTrend: "stable",
    streakBroken: false,
    daysSinceStreakBroken: 8,
  };
}

// Calculate engagement score from behavior profile
export function calculateEngagementScore(profile: UserBehaviorProfile): EngagementScore {
  const prediction = Math.min(100, (profile.totalPredictions / 50) * 60 + profile.accuracy * 40);
  const social = Math.min(100, profile.socialInteractions * 10);
  const consistency = Math.min(100, (profile.sessionsLast7Days / 7) * 50 + (profile.currentStreak / 7) * 50);
  const progression = Math.min(100, (profile.level / 25) * 60 + profile.challengeCompletionRate * 40);
  const overall = Math.round(prediction * 0.3 + social * 0.1 + consistency * 0.35 + progression * 0.25);

  return { overall, prediction: Math.round(prediction), social: Math.round(social), consistency: Math.round(consistency), progression: Math.round(progression) };
}

// Determine adaptive difficulty based on user behavior
export function calculateAdaptiveDifficulty(profile: UserBehaviorProfile): AdaptiveDifficulty {
  let multiplier = 1.0;
  let reasoning = "";

  // Adjust based on completion rate
  if (profile.challengeCompletionRate > 0.8) {
    multiplier += 0.3;
    reasoning += "High completion rate suggests room for harder challenges. ";
  } else if (profile.challengeCompletionRate < 0.4) {
    multiplier -= 0.3;
    reasoning += "Low completion rate - easing difficulty to maintain motivation. ";
  }

  // Adjust based on engagement trend
  if (profile.engagementTrend === "declining") {
    multiplier -= 0.2;
    reasoning += "Declining engagement detected - reducing pressure. ";
  } else if (profile.engagementTrend === "increasing") {
    multiplier += 0.1;
    reasoning += "Engagement is rising - slightly increasing challenge. ";
  }

  // Adjust based on streak
  if (profile.currentStreak >= 5) {
    multiplier += 0.15;
    reasoning += "Strong streak indicates high motivation. ";
  }

  multiplier = Math.max(0.5, Math.min(2.0, multiplier));

  return {
    challengeMultiplier: Math.round(multiplier * 100) / 100,
    suggestedTargets: {
      daily: Math.round(2 * multiplier),
      weekly: Math.round(5 * multiplier),
    },
    reasoning: reasoning.trim(),
  };
}

// Detect churn risk signals
export function detectChurnRisk(profile: UserBehaviorProfile): {
  risk: "low" | "medium" | "high";
  signals: string[];
  intervention: string;
} {
  const signals: string[] = [];
  let riskScore = 0;

  if (profile.daysSinceLastActive > 2) {
    signals.push("Inactive for multiple days");
    riskScore += 30;
  }
  if (profile.engagementTrend === "declining") {
    signals.push("Declining engagement trend");
    riskScore += 25;
  }
  if (profile.streakBroken && profile.daysSinceStreakBroken < 3) {
    signals.push("Recently broken streak");
    riskScore += 20;
  }
  if (profile.challengeCompletionRate < 0.3) {
    signals.push("Low challenge completion");
    riskScore += 15;
  }
  if (profile.sessionsLast7Days < 2) {
    signals.push("Very few sessions this week");
    riskScore += 20;
  }
  if (profile.nonMatchDayEngagement < 0.2) {
    signals.push("Only engages on match days");
    riskScore += 10;
  }

  const risk = riskScore >= 50 ? "high" : riskScore >= 25 ? "medium" : "low";

  const interventions: Record<string, string> = {
    high: "Send personalized re-engagement offer with bonus XP and streak recovery",
    medium: "Nudge with upcoming exciting match and easy-win challenge",
    low: "Continue with standard engagement flow",
  };

  return { risk, signals, intervention: interventions[risk] };
}

// Generate behavior summary for Gemini context
export function generateBehaviorContext(profile: UserBehaviorProfile): string {
  const engagement = calculateEngagementScore(profile);
  const difficulty = calculateAdaptiveDifficulty(profile);
  const churn = detectChurnRisk(profile);

  return `USER BEHAVIOR PROFILE:
- Level: ${profile.level}, Current Streak: ${profile.currentStreak} days, Longest: ${profile.longestStreak}
- Prediction Accuracy: ${(profile.accuracy * 100).toFixed(1)}%, Total: ${profile.totalPredictions}
- Risk Profile: ${profile.riskProfile}, Favorite Teams: ${profile.favoriteTeams.join(", ")}
- Sessions (7d): ${profile.sessionsLast7Days}, Avg Duration: ${profile.avgSessionDuration}min
- Challenge Completion Rate: ${(profile.challengeCompletionRate * 100).toFixed(0)}%
- Engagement Score: ${engagement.overall}/100 (Prediction: ${engagement.prediction}, Consistency: ${engagement.consistency})
- Engagement Trend: ${profile.engagementTrend}
- Churn Risk: ${churn.risk}
- Adaptive Difficulty Multiplier: ${difficulty.challengeMultiplier}x
- Time Preference: ${profile.timeOfDayPreference}
- Match Day vs Non-Match Day engagement: ${(profile.matchDayEngagement * 100).toFixed(0)}% vs ${(profile.nonMatchDayEngagement * 100).toFixed(0)}%`;
}
