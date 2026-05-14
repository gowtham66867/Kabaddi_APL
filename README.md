# KabaddiArena — AI-Powered Pro Kabaddi Fan Engagement Platform

[![Deployed on Cloud Run](https://img.shields.io/badge/Google%20Cloud%20Run-Live-4285F4?logo=googlecloud&logoColor=white)](https://kabaddi-arena-1027882324647.us-central1.run.app)
[![Powered by Gemini](https://img.shields.io/badge/Gemini%202.0%20Flash-Powered-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Next.js](https://img.shields.io/badge/Next.js%2016-App%20Router-000?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> **Google Cloud Build with AI — Agentic Premier League | 2nd Innings Challenge 2**

A gamification platform where AI isn't just a feature — it's the backbone. Every user action feeds into a behavior engine that drives Gemini-powered personalization, creating a closed-loop adaptive experience for Pro Kabaddi League fans.

**Live:** https://kabaddi-arena-1027882324647.us-central1.run.app

---

## What It Does

Users predict PKL match outcomes (winner, score diff, top raider, top defender) and earn XP, coins, badges, and streaks. The AI layer makes this genuinely adaptive:

- **Predict** → AI tracks your patterns, accuracy, and risk style
- **Watch live** → Real-time match simulation with auto-scoring of predictions
- **Chat** → Gemini-powered assistant that remembers conversations across sessions
- **Grow** → AI adjusts challenge difficulty based on your engagement
- **Stay engaged** → AI detects churn risk and sends personalized nudges

---

## AI Architecture

```text
+------------------------------------------------------------------+
|                        KabaddiArena                               |
|                                                                    |
|  +------------------+    +-------------------+    +--------------+ |
|  |   Dashboard      |    |   Predictions     |    |  AI Insights | |
|  |   - AI Nudges    |    |   - AI Analysis   |    |  - Behavior  | |
|  |   - Live Sim     |    |   - Confidence %  |    |  - Churn     | |
|  |   - Smart Stats  |    |   - Scoring Loop  |    |  - Adaptive  | |
|  +--------+---------+    +--------+----------+    +------+-------+ |
|           |                       |                      |         |
|           v                       v                      v         |
|  +--------------------------------------------------------+       |
|  |         Zustand Persistent Store (Real Data)            |       |
|  |  - Session logs, streak dates, prediction timestamps    |       |
|  |  - Chat memory (multi-session), applied recommendations |       |
|  |  - Live match state, AI-generated challenges            |       |
|  +---------------------------+------------------------------+      |
|                              |                                     |
|                              v                                     |
|  +--------------------------------------------------------+       |
|  |              Next.js API Routes (Server)                |       |
|  |  /api/ai/chat       - Conversational AI (persistent)    |       |
|  |  /api/ai/insights   - Match analysis & predictions      |       |
|  |  /api/ai/challenges - Adaptive challenge generation     |       |
|  |  /api/ai/behavior   - Real-data behavior analysis (POST)|       |
|  |  /api/ai/nudge      - Personalized re-engagement        |       |
|  +---------------------------+------------------------------+      |
|                              |                                     |
|  +----------------------------------------------------------+     |
|  |              Google Gemini 2.0 Flash                      |     |
|  |  - Domain-tuned kabaddi system prompts                    |     |
|  |  - Context-aware with full user behavior profile          |     |
|  +----------------------------------------------------------+     |
|                              |                                     |
|  +----------------------------------------------------------+     |
|  |              Behavior Analysis Engine                     |     |
|  |  - Computes from REAL store data (not mocks)              |     |
|  |  - 5-dimension engagement scoring                         |     |
|  |  - Adaptive difficulty (0.5x-2.0x)                        |     |
|  |  - Churn detection (6+ signals)                           |     |
|  +----------------------------------------------------------+     |
|                              |                                     |
|  +----------------------------------------------------------+     |
|  |              Closed Feedback Loop                          |     |
|  |  User Action -> Store -> Behavior Engine -> Gemini AI     |     |
|  |  -> Recommendations -> User Applies -> Store Updated      |     |
|  |  -> Next AI call = smarter personalization                |     |
|  +----------------------------------------------------------+     |
+------------------------------------------------------------------+
```

---

## 10 Ways AI is Harnessed

### 1. Gemini-Powered Match Analysis

- Generates personalized match previews from team stats and kabaddi domain knowledge
- AI confidence percentages per prediction
- Adapts to user's favorite teams and prediction style

### 2. KabaddiGuru — Conversational AI Assistant

- Floating chat widget powered by Gemini 2.0 Flash
- Context-aware: knows live scores, upcoming matches, team standings
- **Persistent memory** — conversations survive page refresh and browser restart
- Tracks chat interactions as behavioral signals

### 3. Adaptive Challenge Generation

- Gemini generates personalized challenges tuned to your skill level
- Difficulty scales with completion rate, engagement trend, streak history
- Each challenge includes visible AI reasoning

### 4. Real Behavior Analysis Engine

- **Connected to REAL Zustand store data** — computes from actual sessions, predictions, streaks
- 5-dimension engagement scoring (Prediction, Consistency, Progression, Social, Overall)
- Churn risk detection monitoring 6+ signals
- Adaptive difficulty calculator (0.5x-2.0x multiplier)
- Trend detection: compares this week vs last week

### 5. Prediction Scoring with Feedback Loop

- `scorePrediction()` auto-evaluates when matches complete
- Granular scoring: +50 XP winner, +100 XP score diff, +75 XP raider, +75 XP defender
- Updates accuracy, badges, and challenge progress automatically
- Accuracy feeds back into behavior engine for next AI cycle

### 6. Persistent AI Chat Memory

- All messages persisted to Zustand store (localStorage)
- Multi-session continuity — AI remembers what you discussed yesterday
- Clear chat option; interactions count as engagement signals

### 7. Real-time Live Match Simulation

- Score ticks every 3 seconds (1 match minute per tick)
- Kabaddi events: raids, tackles, all-outs, super raids, reviews
- **Auto-triggers prediction scoring** on match completion

### 8. AI Recommendations → Store (Closed Loop)

- AI Insights page shows recommendations with **"Apply" buttons**
- Applying awards +15 XP and records it in `appliedRecommendations`
- Applied recs influence the next behavior analysis cycle
- More interaction = smarter future AI

### 9. Personalized Re-engagement Nudges

- Gemini generates nudges based on streak, favorite teams, churn risk
- Displayed on dashboard as a contextual banner

### 10. Transparent AI Insights Dashboard

- Sends real store snapshot to behavior API (shows "Live Data" badge)
- Full visibility: engagement scores, churn risk, adaptive difficulty reasoning
- On-demand AI challenge generation with reasoning

---

## Gamification Features

| Feature | Description | AI Enhancement |
| --- | --- | --- |
| **Predictions** | Match winner, score diff, top raider/defender | AI confidence scores, analysis |
| **Streaks** | Daily prediction streaks with XP bonuses | AI streak recovery nudges |
| **Badges** | 8 badges (Common to Legendary rarity) | Progress tracking toward unlock |
| **Challenges** | Daily/Weekly/Seasonal goals | AI-generated, adaptive difficulty |
| **XP & Levels** | Level 1-25+ with tier progression | AI adjusts XP opportunities |
| **Coin Economy** | Earn & spend in shop | Rewards tied to AI challenges |
| **Leaderboard** | Global rankings with tiers | AI-powered engagement scoring |
| **Chat Assistant** | In-app AI companion | Gemini-powered kabaddi expert |
| **Live Simulation** | Real-time match scores | Auto-scores predictions |
| **Session Tracking** | Invisible engagement logging | Feeds behavior engine |

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, dark gaming aesthetic |
| **State** | Zustand with persist middleware (localStorage) |
| **AI** | Google Gemini 2.0 Flash via `@google/generative-ai` |
| **Deployment** | Google Cloud Run (Docker, us-central1) |
| **Icons** | Lucide React |
| **API** | Next.js Route Handlers (serverless) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API Key ([get one here](https://aistudio.google.com/app/apikey))

### Local Development

```bash
# Clone the repo
git clone https://github.com/gowtham66867/Kabaddi_APL.git
cd Kabaddi_APL

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Gemini API key to .env.local:
# GEMINI_API_KEY=your_key_here

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deploy to Google Cloud Run

```bash
gcloud run deploy kabaddi-arena \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=your_key_here" \
  --port 8080 \
  --memory 512Mi
```

---

## Project Structure

```text
src/
  app/
    page.tsx                    # Dashboard with AI nudges + live simulation
    predict/page.tsx            # Predictions with AI match analysis
    leaderboard/page.tsx        # Global rankings with tier system
    rewards/page.tsx            # Badges & coin shop
    challenges/page.tsx         # Challenge tracker with progress
    ai-insights/page.tsx        # AI behavior dashboard (live data)
    profile/page.tsx            # User profile & stats
    api/ai/
      chat/route.ts             # Gemini chat (persistent context)
      insights/route.ts         # Match analysis API
      challenges/route.ts       # Adaptive challenge generator
      behavior/route.ts         # Real-data behavior analysis (GET/POST)
      nudge/route.ts            # Personalized nudge API
  lib/
    gemini.ts                   # Gemini SDK + domain system prompts
    behavior-engine.ts          # Behavior engine (real store data)
    store.ts                    # Zustand store (528 lines, full state)
    data.ts                     # PKL data models & teams
    utils.ts                    # Utility functions
  components/
    Navbar.tsx                  # Top navigation bar
    Sidebar.tsx                 # Side navigation (desktop)
    AIChatAssistant.tsx         # Floating AI chat (persistent memory)
    AIMatchInsight.tsx          # Per-match AI analysis card
    LiveMatchSimulator.tsx      # Real-time score simulation
    SessionTracker.tsx          # Invisible session logger
```

---

## The AI Feedback Loop (What Makes This Different)

```text
User makes prediction
    -> Store records timestamp, team, score diff
    -> Streak auto-calculated from dates
    -> Session logger tracks the action

Live match simulation completes
    -> scorePrediction() evaluates all predictions
    -> Awards XP (50/100/75/75), updates accuracy
    -> Unlocks badges if thresholds met

AI Insights page opened
    -> Real store snapshot sent via POST
    -> Behavior engine computes profile from actual data
    -> Gemini analyzes and generates recommendations

User clicks "Apply" on recommendation
    -> Stored in appliedRecommendations
    -> +15 XP awarded
    -> Next AI cycle sees the applied rec
    -> Smarter, more personalized recommendations
```

---

## Cloud Run Deployment Details

| Property | Value |
| --- | --- |
| **Service** | `kabaddi-arena` |
| **URL** | https://kabaddi-arena-1027882324647.us-central1.run.app |
| **Project** | `gen-lang-client-0920710732` |
| **Region** | `us-central1` |
| **CPU** | 1 |
| **Memory** | 512Mi |
| **Scaling** | 0-3 instances |
| **Auth** | Public (unauthenticated) |

---

## Key Differentiators

1. **AI is the backbone, not a feature** — Gemini is woven into every user touchpoint
2. **Real data, not mocks** — Behavior engine computes from actual persisted user data
3. **Closed feedback loop** — User actions → AI analyzes → recommendations → user applies → smarter AI
4. **Prediction scoring engine** — Automated evaluation with granular XP and badge progression
5. **Persistent AI memory** — Chat survives across sessions for true conversational continuity
6. **Live match simulation** — Real-time scores that auto-trigger prediction scoring
7. **Transparent AI** — Users see exactly how AI perceives them
8. **Graceful degradation** — Every endpoint has intelligent fallbacks
9. **Domain expertise** — All prompts tuned for Pro Kabaddi League
10. **Session-aware** — Invisible tracking feeds behavioral signals without friction
