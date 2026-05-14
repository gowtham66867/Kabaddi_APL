export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
  logo: string;
  wins: number;
  losses: number;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  time: string;
  venue: string;
  status: "upcoming" | "live" | "completed";
  homeScore?: number;
  awayScore?: number;
  winner?: string;
  season: number;
  matchDay: number;
}

export interface Prediction {
  id: string;
  matchId: string;
  userId: string;
  predictedWinner: string;
  predictedScoreDiff?: number;
  predictedRaider?: string;
  predictedDefender?: string;
  isCorrect?: boolean;
  pointsEarned: number;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: string;
  progress?: number;
  requirement: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "seasonal";
  xpReward: number;
  progress: number;
  target: number;
  isCompleted: boolean;
  expiresAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalPredictions: number;
  correctPredictions: number;
  currentStreak: number;
  longestStreak: number;
  coins: number;
  badges: Badge[];
  rank: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
}

export const teams: Team[] = [
  { id: "t1", name: "Patna Pirates", shortName: "PAT", color: "#1e3a5f", logo: "🏴‍☠️", wins: 8, losses: 3 },
  { id: "t2", name: "Bengaluru Bulls", shortName: "BLR", color: "#e53e3e", logo: "🐂", wins: 7, losses: 4 },
  { id: "t3", name: "Dabang Delhi", shortName: "DEL", color: "#ed8936", logo: "🦁", wins: 6, losses: 5 },
  { id: "t4", name: "Jaipur Pink Panthers", shortName: "JAI", color: "#ed64a6", logo: "🐆", wins: 7, losses: 4 },
  { id: "t5", name: "U Mumba", shortName: "MUM", color: "#f6ad55", logo: "🐯", wins: 5, losses: 6 },
  { id: "t6", name: "Telugu Titans", shortName: "TEL", color: "#805ad5", logo: "⚡", wins: 4, losses: 7 },
  { id: "t7", name: "Tamil Thalaivas", shortName: "TAM", color: "#38a169", logo: "🦅", wins: 6, losses: 5 },
  { id: "t8", name: "Haryana Steelers", shortName: "HAR", color: "#2b6cb0", logo: "⚔️", wins: 5, losses: 6 },
  { id: "t9", name: "Gujarat Giants", shortName: "GUJ", color: "#d69e2e", logo: "🦣", wins: 4, losses: 7 },
  { id: "t10", name: "Bengal Warriorz", shortName: "BEN", color: "#c53030", logo: "🗡️", wins: 3, losses: 8 },
  { id: "t11", name: "UP Yoddhas", shortName: "UPY", color: "#2f855a", logo: "🛡️", wins: 6, losses: 5 },
  { id: "t12", name: "Puneri Paltan", shortName: "PUN", color: "#6b46c1", logo: "🏇", wins: 7, losses: 4 },
];

export const matches: Match[] = [
  { id: "m1", homeTeam: teams[0], awayTeam: teams[1], date: "2025-05-14", time: "19:30", venue: "Patliputra Sports Complex", status: "upcoming", season: 11, matchDay: 45 },
  { id: "m2", homeTeam: teams[2], awayTeam: teams[3], date: "2025-05-14", time: "21:30", venue: "Thyagaraj Sports Complex", status: "upcoming", season: 11, matchDay: 45 },
  { id: "m3", homeTeam: teams[4], awayTeam: teams[5], date: "2025-05-15", time: "19:30", venue: "Dome, NSCI SVP Stadium", status: "upcoming", season: 11, matchDay: 46 },
  { id: "m4", homeTeam: teams[6], awayTeam: teams[7], date: "2025-05-15", time: "21:30", venue: "Jawaharlal Nehru Indoor Stadium", status: "upcoming", season: 11, matchDay: 46 },
  { id: "m5", homeTeam: teams[8], awayTeam: teams[9], date: "2025-05-16", time: "19:30", venue: "EKA Arena", status: "upcoming", season: 11, matchDay: 47 },
  { id: "m6", homeTeam: teams[10], awayTeam: teams[11], date: "2025-05-16", time: "21:30", venue: "Shaheed Vijay Singh Pathik Sports Complex", status: "upcoming", season: 11, matchDay: 47 },
  { id: "m7", homeTeam: teams[0], awayTeam: teams[3], date: "2025-05-13", time: "19:30", venue: "Patliputra Sports Complex", status: "live", season: 11, matchDay: 44, homeScore: 28, awayScore: 25 },
  { id: "m8", homeTeam: teams[1], awayTeam: teams[6], date: "2025-05-12", time: "19:30", venue: "Sree Kanteerava Stadium", status: "completed", season: 11, matchDay: 43, homeScore: 35, awayScore: 30, winner: "t2" },
  { id: "m9", homeTeam: teams[5], awayTeam: teams[10], date: "2025-05-12", time: "21:30", venue: "Gachibowli Indoor Stadium", status: "completed", season: 11, matchDay: 43, homeScore: 27, awayScore: 32, winner: "t11" },
  { id: "m10", homeTeam: teams[3], awayTeam: teams[8], date: "2025-05-11", time: "19:30", venue: "Sawai Mansingh Stadium", status: "completed", season: 11, matchDay: 42, homeScore: 40, awayScore: 28, winner: "t4" },
];

export const badges: Badge[] = [
  { id: "b1", name: "First Blood", description: "Make your first prediction", icon: "🎯", rarity: "common", requirement: 1, progress: 1, unlockedAt: "2025-05-01" },
  { id: "b2", name: "Streak Master", description: "Get a 5-day prediction streak", icon: "🔥", rarity: "rare", requirement: 5, progress: 3 },
  { id: "b3", name: "Kabaddi Guru", description: "Correctly predict 25 matches", icon: "🧠", rarity: "epic", requirement: 25, progress: 12 },
  { id: "b4", name: "Oracle", description: "Correctly predict 50 matches", icon: "🔮", rarity: "legendary", requirement: 50, progress: 12 },
  { id: "b5", name: "All-Rounder", description: "Predict raider and defender of match correctly", icon: "⭐", rarity: "rare", requirement: 1, progress: 0 },
  { id: "b6", name: "Season Veteran", description: "Participate in all match days of the season", icon: "🏆", rarity: "epic", requirement: 66, progress: 44 },
  { id: "b7", name: "Social Butterfly", description: "Share 10 predictions on social media", icon: "🦋", rarity: "common", requirement: 10, progress: 4 },
  { id: "b8", name: "Underdog Whisperer", description: "Correctly predict 5 underdog wins", icon: "🐺", rarity: "epic", requirement: 5, progress: 2 },
];

export const challenges: Challenge[] = [
  { id: "c1", title: "Daily Predictor", description: "Make predictions for today's matches", type: "daily", xpReward: 50, progress: 1, target: 2, isCompleted: false, expiresAt: "2025-05-14T23:59:59" },
  { id: "c2", title: "Streak Builder", description: "Maintain your prediction streak for 3 more days", type: "weekly", xpReward: 200, progress: 2, target: 5, isCompleted: false, expiresAt: "2025-05-18T23:59:59" },
  { id: "c3", title: "Raider Spotter", description: "Correctly predict the top raider in 3 matches this week", type: "weekly", xpReward: 150, progress: 1, target: 3, isCompleted: false, expiresAt: "2025-05-18T23:59:59" },
  { id: "c4", title: "Perfect Week", description: "Get all predictions correct this week", type: "weekly", xpReward: 500, progress: 4, target: 6, isCompleted: false, expiresAt: "2025-05-18T23:59:59" },
  { id: "c5", title: "Season Completionist", description: "Predict in 90% of matches this season", type: "seasonal", xpReward: 1000, progress: 40, target: 60, isCompleted: false, expiresAt: "2025-06-30T23:59:59" },
];

export const leaderboard = [
  { rank: 1, name: "KabaddiKing99", avatar: "👑", level: 24, xp: 12500, correctPredictions: 42, streak: 8, tier: "Diamond" as const },
  { rank: 2, name: "RaiderPro", avatar: "⚡", level: 22, xp: 11200, correctPredictions: 39, streak: 5, tier: "Diamond" as const },
  { rank: 3, name: "DefenderX", avatar: "🛡️", level: 21, xp: 10800, correctPredictions: 37, streak: 6, tier: "Platinum" as const },
  { rank: 4, name: "You", avatar: "🎮", level: 15, xp: 7350, correctPredictions: 28, streak: 3, tier: "Gold" as const },
  { rank: 5, name: "PredictorElite", avatar: "🎯", level: 14, xp: 7100, correctPredictions: 26, streak: 4, tier: "Gold" as const },
  { rank: 6, name: "MatMaster", avatar: "🤼", level: 13, xp: 6500, correctPredictions: 24, streak: 2, tier: "Gold" as const },
  { rank: 7, name: "StreakHunter", avatar: "🔥", level: 12, xp: 6000, correctPredictions: 22, streak: 7, tier: "Silver" as const },
  { rank: 8, name: "PKLFanatic", avatar: "🏆", level: 11, xp: 5500, correctPredictions: 20, streak: 1, tier: "Silver" as const },
  { rank: 9, name: "DoOrDieKing", avatar: "💀", level: 10, xp: 5000, correctPredictions: 18, streak: 3, tier: "Silver" as const },
  { rank: 10, name: "AllOutPro", avatar: "💥", level: 9, xp: 4500, correctPredictions: 16, streak: 2, tier: "Bronze" as const },
];

export const currentUser: UserProfile = {
  id: "u1",
  name: "You",
  avatar: "🎮",
  level: 15,
  xp: 7350,
  xpToNextLevel: 8000,
  totalPredictions: 44,
  correctPredictions: 28,
  currentStreak: 3,
  longestStreak: 7,
  coins: 1250,
  badges: badges.filter((b) => b.unlockedAt),
  rank: 4,
  tier: "Gold",
};

export const raidersOfMatch = [
  "Pardeep Narwal", "Pawan Sehrawat", "Naveen Kumar", "Arjun Deshwal",
  "Maninder Singh", "Sachin Tanwar", "Rahul Chaudhari", "Vikash Kandola",
];

export const defendersOfMatch = [
  "Fazel Atrachali", "Surjeet Singh", "Nitesh Kumar", "Ravinder Pahal",
  "Surender Nada", "Sandeep Narwal", "Vishal Bhardwaj", "Girish Ernak",
];
