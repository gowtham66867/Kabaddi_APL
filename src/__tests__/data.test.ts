import { describe, it, expect } from "vitest";
import {
  teams,
  matches,
  badges,
  challenges,
  currentUser,
  leaderboard,
  raidersOfMatch,
  defendersOfMatch,
} from "@/lib/data";

describe("Data Models", () => {
  describe("Teams", () => {
    it("should have 12 teams", () => {
      expect(teams.length).toBe(12);
    });

    it("should have unique team IDs", () => {
      const ids = teams.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should have valid team properties", () => {
      teams.forEach((team) => {
        expect(team.id).toBeTruthy();
        expect(team.name).toBeTruthy();
        expect(team.shortName).toBeTruthy();
        expect(team.color).toBeTruthy();
        expect(team.logo).toBeTruthy();
        expect(team.wins).toBeGreaterThanOrEqual(0);
        expect(team.losses).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("Matches", () => {
    it("should have 10 matches", () => {
      expect(matches.length).toBe(10);
    });

    it("should have unique match IDs", () => {
      const ids = matches.map((m) => m.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should have valid statuses", () => {
      matches.forEach((match) => {
        expect(["upcoming", "live", "completed"]).toContain(match.status);
      });
    });

    it("should have scores for completed matches", () => {
      const completed = matches.filter((m) => m.status === "completed");
      completed.forEach((match) => {
        expect(match.homeScore).toBeDefined();
        expect(match.awayScore).toBeDefined();
        expect(match.winner).toBeDefined();
      });
    });

    it("should have at least one live match", () => {
      const live = matches.filter((m) => m.status === "live");
      expect(live.length).toBeGreaterThanOrEqual(1);
    });

    it("should have at least one upcoming match", () => {
      const upcoming = matches.filter((m) => m.status === "upcoming");
      expect(upcoming.length).toBeGreaterThanOrEqual(1);
    });

    it("should reference valid teams", () => {
      const teamIds = new Set(teams.map((t) => t.id));
      matches.forEach((match) => {
        expect(teamIds.has(match.homeTeam.id)).toBe(true);
        expect(teamIds.has(match.awayTeam.id)).toBe(true);
      });
    });
  });

  describe("Badges", () => {
    it("should have 8 badges", () => {
      expect(badges.length).toBe(8);
    });

    it("should have unique badge IDs", () => {
      const ids = badges.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should have valid rarities", () => {
      badges.forEach((badge) => {
        expect(["common", "rare", "epic", "legendary"]).toContain(badge.rarity);
      });
    });

    it("should have positive requirements", () => {
      badges.forEach((badge) => {
        expect(badge.requirement).toBeGreaterThan(0);
      });
    });
  });

  describe("Challenges", () => {
    it("should have 5 challenges", () => {
      expect(challenges.length).toBe(5);
    });

    it("should have valid types", () => {
      challenges.forEach((challenge) => {
        expect(["daily", "weekly", "seasonal"]).toContain(challenge.type);
      });
    });

    it("should have progress <= target", () => {
      challenges.forEach((challenge) => {
        expect(challenge.progress).toBeLessThanOrEqual(challenge.target);
      });
    });

    it("should have positive XP rewards", () => {
      challenges.forEach((challenge) => {
        expect(challenge.xpReward).toBeGreaterThan(0);
      });
    });
  });

  describe("Current User", () => {
    it("should have a valid profile", () => {
      expect(currentUser.id).toBe("u1");
      expect(currentUser.name).toBeTruthy();
      expect(currentUser.level).toBeGreaterThan(0);
      expect(currentUser.xp).toBeGreaterThan(0);
      expect(currentUser.xpToNextLevel).toBeGreaterThan(currentUser.xp);
    });

    it("should have a valid tier", () => {
      expect(["Bronze", "Silver", "Gold", "Platinum", "Diamond"]).toContain(currentUser.tier);
    });
  });

  describe("Leaderboard", () => {
    it("should have 10 entries", () => {
      expect(leaderboard.length).toBe(10);
    });

    it("should be sorted by rank", () => {
      for (let i = 1; i < leaderboard.length; i++) {
        expect(leaderboard[i].rank).toBeGreaterThan(leaderboard[i - 1].rank);
      }
    });

    it("should contain the current user", () => {
      expect(leaderboard.some((e) => e.name === "You")).toBe(true);
    });
  });

  describe("Players", () => {
    it("should have raiders", () => {
      expect(raidersOfMatch.length).toBeGreaterThan(0);
    });

    it("should have defenders", () => {
      expect(defendersOfMatch.length).toBeGreaterThan(0);
    });

    it("should not overlap raiders and defenders", () => {
      const overlap = raidersOfMatch.filter((r) => defendersOfMatch.includes(r));
      expect(overlap.length).toBe(0);
    });
  });
});
