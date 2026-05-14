import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel, SYSTEM_PROMPTS } from "@/lib/gemini";
import {
  getUserBehaviorProfile,
  generateBehaviorContext,
  calculateAdaptiveDifficulty,
} from "@/lib/behavior-engine";

export async function POST(request: NextRequest) {
  try {
    const { currentChallenges } = await request.json();

    const model = getGeminiModel();
    const profile = getUserBehaviorProfile();
    const behaviorContext = generateBehaviorContext(profile);
    const difficulty = calculateAdaptiveDifficulty(profile);

    const prompt = `${SYSTEM_PROMPTS.adaptiveChallenges}

${behaviorContext}

ADAPTIVE DIFFICULTY: ${difficulty.challengeMultiplier}x multiplier
Reasoning: ${difficulty.reasoning}

CURRENT ACTIVE CHALLENGES (avoid duplicates):
${JSON.stringify(currentChallenges || [], null, 2)}

Generate 3 NEW personalized challenges that adapt to this user's behavior. Adjust targets based on the difficulty multiplier. Return ONLY valid JSON array.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const challenges = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ challenges, difficulty });
    }

    return NextResponse.json({ challenges: generateFallbackChallenges(difficulty.challengeMultiplier), difficulty });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("API key") || message.includes("API_KEY")) {
      const profile = getUserBehaviorProfile();
      const difficulty = calculateAdaptiveDifficulty(profile);
      return NextResponse.json({
        challenges: generateFallbackChallenges(difficulty.challengeMultiplier),
        difficulty,
        fallback: true,
      });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function generateFallbackChallenges(multiplier: number) {
  const baseTargets = [2, 3, 5];
  return [
    {
      title: "Raider's Instinct",
      description: "Correctly predict the top raider in upcoming matches",
      type: "daily",
      target: Math.round(baseTargets[0] * multiplier),
      xpReward: Math.round(75 * multiplier),
      reasoning: "User has moderate accuracy - raider prediction challenges test pattern recognition",
    },
    {
      title: "Streak Warrior",
      description: "Maintain your prediction streak by predicting every match day",
      type: "weekly",
      target: Math.round(baseTargets[1] * multiplier),
      xpReward: Math.round(200 * multiplier),
      reasoning: "User's streak history shows potential for longer streaks with encouragement",
    },
    {
      title: "Underdog Hunter",
      description: "Successfully predict underdog victories this week",
      type: "weekly",
      target: Math.round(baseTargets[2] * multiplier),
      xpReward: Math.round(300 * multiplier),
      reasoning: "User tends toward favorites - this challenges them to explore riskier predictions",
    },
  ];
}
