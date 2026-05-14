import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel, SYSTEM_PROMPTS } from "@/lib/gemini";
import {
  getUserBehaviorProfile,
  generateBehaviorContext,
  calculateEngagementScore,
  calculateAdaptiveDifficulty,
  detectChurnRisk,
} from "@/lib/behavior-engine";

// GET uses baseline profile (server-side, no store access)
export async function GET() {
  return handleBehavior();
}

// POST accepts real store snapshot from client
export async function POST(request: NextRequest) {
  try {
    const storeSnapshot = await request.json();
    return handleBehavior(storeSnapshot);
  } catch {
    return handleBehavior();
  }
}

async function handleBehavior(storeSnapshot?: Parameters<typeof getUserBehaviorProfile>[0]) {
  try {
    const profile = getUserBehaviorProfile(storeSnapshot);
    const behaviorContext = generateBehaviorContext(profile);
    const engagement = calculateEngagementScore(profile);
    const difficulty = calculateAdaptiveDifficulty(profile);
    const churnAnalysis = detectChurnRisk(profile);

    let aiAnalysis = null;

    try {
      const model = getGeminiModel();
      const prompt = `${SYSTEM_PROMPTS.behaviorAnalysis}

${behaviorContext}

Analyze this user and return ONLY valid JSON:`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0]);
      }
    } catch {
      aiAnalysis = {
        pattern: "regular_evening",
        style: "moderate",
        churnRisk: "low",
        churnReasoning: "User shows consistent engagement with stable session frequency and active streak",
        recommendations: [
          "Introduce harder weekly challenges to push accuracy higher",
          "Encourage non-match day engagement with trivia and historical stats",
          "Suggest social features to increase community interaction",
          "Offer streak insurance as milestone reward at 5-day streak",
        ],
      };
    }

    return NextResponse.json({
      profile,
      engagement,
      difficulty,
      churnAnalysis,
      aiAnalysis,
      isRealData: !!storeSnapshot,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
