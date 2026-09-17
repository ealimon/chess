# Chess Mastery - Practice & Progress Tracker

An interactive, full-stack chess training web application built with React, TypeScript, Tailwind CSS, Express, and Google Gemini AI.

---

## Features

- **6-Tier Adaptive AI Opponents**:
  - **Oliver (Novice, 600 Elo)**: Friendly beginner bot prone to tactical blunders and learning opportunities.
  - **Maya (Casual, 1000 Elo)**: Solid opening principles with basic tactical threats.
  - **Liam (Intermediate, 1350 Elo)**: Active piece play, center control, and multi-move tactical patterns.
  - **Elena (Advanced, 1650 Elo)**: Aggressive attacking style and sharp combination play.
  - **Viktor (Master, 1950 Elo)**: Positional squeeze and strategic exploitation of pawn structures.
  - **Gary (Grandmaster, 2250 Elo)**: Deep minimax engine with quiescence search, piece-square evaluation tables, and MVV-LVA move ordering.
- **Grandmaster AI Coaching**:
  - In-game tactical hints: **Coach Tips** (conceptual hints), **Threat Alerts** (detecting forks, pins, skewers), and **Strategic Plans** (multi-move plans and candidate move ideas).
  - Post-game review: Accuracy assessment, key turning points across opening/middlegame/endgame phases, strengths, and targeted drill recommendations.
- **Progress & Rating Tracking**:
  - Dynamic Elo rating progression with interactive trend charts.
  - Head-to-head win/loss/draw statistics and win streaks across every difficulty tier.
  - Personalized AI training reports grounded in your recent match performance.
  - Match history log with outcome details, move counts, and PGN export.
- **Rich Board UX**:
  - Interactive move selection, legal move dots, capture indicators, check highlights, and last-move tracking.
  - Captured piece advantage counters and Web Audio sound effects.
  - Board customizer with multiple board themes (Wood, Emerald, Midnight, Velvet) and board orientation flipping.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Chess Engine**: chess.js & custom Minimax Alpha-Beta search with positional heatmaps
- **Backend**: Node.js & Express
- **AI Integration**: Google Gen AI SDK (`@google/genai`) powered by Gemini

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Gemini API key (from [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/chess-mastery.git
   cd chess-mastery
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

---

## License

MIT
