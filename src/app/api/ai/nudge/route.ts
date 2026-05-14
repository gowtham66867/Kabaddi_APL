import { NextResponse } from "next/server";
import { getGeminiModel, SYSTEM_PROMPTS } from "@/lib/gemini";
import { getUserBehaviorProfile, generateBehaviorContext } from "@/lib/behavior-engine";
import { matches } from "@/lib/data";

export async function GET() {
  try {
    const profile = getUserBehaviorProfile();
    const behaviorContext = generateBehaviorContext(profile);

    const upcomingMatch = matches.find((m) => m.status === "upcoming");
    const matchInfo = upcomingMatch
      ? `Next match: ${upcomingMatch.homeTeam.name} vs ${upcomingMatch.awayTeam.name} at ${upcomingMatch.time}`
      : "No upcoming match";

    let nudge = "";

    try {
      const model = getGeminiModel();
      const prompt = `${SYSTEM_PROMPTS.personalizedNudge}

${behaviorContext}

Current context: ${matchInfo}
User's streak: ${profile.currentStreak} days
Time preference: ${profile.timeOfDayPreference}

Generate a personalized nudge message:`;

      const result = await model.generateContent(prompt);
      nudge = result.response.text().trim();
    } catch {
      // Personalized fallback based on behavior data
      const nudges = [
        `🔥 ${profile.currentStreak}-day streak! ${upcomingMatch ? `${upcomingMatch.homeTeam.shortName} vs ${upcomingMatch.awayTeam.shortName} is tonight` : "Don't let it break"} - predict now!`,
        `Your accuracy on ${profile.favoriteTeams[0]} matches is above average! New match incoming 🎯`,
        `You're ${Math.round((1 - profile.challengeCompletionRate) * 100)}% away from completing this week's challenges. Quick win available! ⚡`,
        `Level ${profile.level + 1} is within reach! Just ${Math.round(profile.xpRate * 0.5)} more XP needed today 📈`,
      ];
      nudge = nudges[Math.floor(Math.random() * nudges.length)];
    }

    return NextResponse.json({
      nudge,
      context: {
        streak: profile.currentStreak,
        nextMatch: matchInfo,
        engagementTrend: profile.engagementTrend,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
