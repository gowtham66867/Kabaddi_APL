import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel, SYSTEM_PROMPTS } from "@/lib/gemini";
import { getUserBehaviorProfile, generateBehaviorContext } from "@/lib/behavior-engine";
import { matches, teams } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    const model = getGeminiModel();
    const profile = getUserBehaviorProfile();
    const behaviorContext = generateBehaviorContext(profile);

    const upcomingMatches = matches
      .filter((m) => m.status === "upcoming")
      .map((m) => `${m.homeTeam.name} vs ${m.awayTeam.name} (${m.date} ${m.time})`)
      .join(", ");

    const liveMatches = matches
      .filter((m) => m.status === "live")
      .map((m) => `${m.homeTeam.name} ${m.homeScore} vs ${m.awayScore} ${m.awayTeam.name}`)
      .join(", ");

    const teamStandings = teams
      .sort((a, b) => b.wins - a.wins)
      .map((t, i) => `${i + 1}. ${t.name} (W${t.wins} L${t.losses})`)
      .join(", ");

    const conversationHistory = (history || [])
      .slice(-6)
      .map((h: { role: string; content: string }) => `${h.role}: ${h.content}`)
      .join("\n");

    const prompt = `${SYSTEM_PROMPTS.chatAssistant}

CURRENT MATCH DATA:
- Upcoming: ${upcomingMatches || "None"}
- Live: ${liveMatches || "None"}
- Standings: ${teamStandings}

USER PROFILE (personalize responses):
${behaviorContext}

CONVERSATION HISTORY:
${conversationHistory}

USER MESSAGE: ${message}

Respond as KabaddiGuru:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ response: text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("API key") || message.includes("API_KEY")) {
      return NextResponse.json({
        response: generateFallbackChat(message),
        fallback: true,
      });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function generateFallbackChat(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes("predict") || msg.includes("who will win")) {
    return "Based on current form and head-to-head records, I'd lean towards the home team here. Their raiding unit has been in excellent form with a 65% raid success rate this season. But remember, kabaddi is unpredictable! Want me to break down the key matchups? 🏏";
  }
  if (msg.includes("streak") || msg.includes("how am i doing")) {
    return "You're on a solid 3-day streak! 🔥 Your accuracy is 63.6% which is above the platform average of 55%. Focus on predicting matches involving your favorite teams (Patna Pirates, Jaipur Pink Panthers) - you tend to do better there. Keep it up!";
  }
  if (msg.includes("tip") || msg.includes("advice") || msg.includes("help")) {
    return "Pro tip: Look at home/away records before predicting. Teams with strong home records tend to maintain that advantage in kabaddi. Also, do-or-die raid success rates are a great predictor of match outcomes. Check team form in last 3 matches rather than season-long stats! 💡";
  }
  if (msg.includes("rule") || msg.includes("how does")) {
    return "Great question! In kabaddi, a raider must cross the baulk line and touch defenders to score points. The defense earns points through tackles. An 'all-out' (bonus 2 points) happens when all 7 players are out. Super raids (3+ points) and super tackles (when only 3 defenders remain) are game-changers! Want to know more about any specific rule?";
  }
  return "Hey there! I'm KabaddiGuru, your AI companion for Pro Kabaddi predictions. 🎯 I can help you analyze upcoming matches, understand team form, or give you prediction tips. Your current streak is 3 days - let's keep it going! What would you like to know?";
}
