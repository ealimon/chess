import type { Square, PieceSymbol, Color } from "chess.js";

export type DifficultyLevel = "novice" | "casual" | "intermediate" | "advanced" | "master" | "grandmaster";

export interface BotProfile {
  id: DifficultyLevel;
  name: string;
  title: string;
  avatar: string;
  elo: number;
  depth: number;
  blunderProbability: number; // 0 to 1
  randomness: number; // evaluation fuzzing
  description: string;
  style: string;
  badgeColor: string;
}

export interface MoveRecord {
  san: string;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  color: Color;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  fenBefore: string;
  fenAfter: string;
  moveNumber: number;
  timeTakenMs?: number;
}

export interface DifficultyStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  bestStreak: number;
  currentStreak: number;
}

export interface GameHistoryItem {
  id: string;
  date: string;
  difficulty: DifficultyLevel;
  playerColor: Color;
  result: "win" | "loss" | "draw";
  reason: string;
  moveCount: number;
  accuracyEstimate?: number;
  pgn: string;
}

export interface UserProgress {
  overallElo: number;
  ratingHistory: { date: string; elo: number; reason: string }[];
  statsByDifficulty: Record<DifficultyLevel, DifficultyStats>;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  recentGames: GameHistoryItem[];
  savedGameReview?: GameAnalysisResult | null;
}

export interface CoachHint {
  tip: string;
  recommendedPlan: string;
  threatToWatch: string;
  suggestedMoves: string[];
  evaluationSummary: string;
}

export interface GameAnalysisResult {
  accuracyScore: number;
  gameOverview: string;
  keyMoments: {
    phase: string;
    observation: string;
    suggestion: string;
  }[];
  strengths: string[];
  weaknessesToImprove: string[];
  customDrillRecommendation: string;
}

export interface BoardTheme {
  id: string;
  name: string;
  lightSquare: string;
  darkSquare: string;
  highlightMove: string;
  highlightSelected: string;
  highlightCheck: string;
  boardBorder: string;
}
