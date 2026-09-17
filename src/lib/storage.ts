import { DifficultyLevel, GameHistoryItem, UserProgress } from "../types";

const STORAGE_KEY = "chess_mastery_user_progress_v1";

const INITIAL_PROGRESS: UserProgress = {
  overallElo: 1200,
  ratingHistory: [
    {
      date: new Date().toISOString().split("T")[0],
      elo: 1200,
      reason: "Initial Placement",
    },
  ],
  statsByDifficulty: {
    novice: { gamesPlayed: 0, wins: 0, losses: 0, draws: 0, winRate: 0, bestStreak: 0, currentStreak: 0 },
    casual: { gamesPlayed: 0, wins: 0, losses: 0, draws: 0, winRate: 0, bestStreak: 0, currentStreak: 0 },
    intermediate: { gamesPlayed: 0, wins: 0, losses: 0, draws: 0, winRate: 0, bestStreak: 0, currentStreak: 0 },
    advanced: { gamesPlayed: 0, wins: 0, losses: 0, draws: 0, winRate: 0, bestStreak: 0, currentStreak: 0 },
    master: { gamesPlayed: 0, wins: 0, losses: 0, draws: 0, winRate: 0, bestStreak: 0, currentStreak: 0 },
    grandmaster: { gamesPlayed: 0, wins: 0, losses: 0, draws: 0, winRate: 0, bestStreak: 0, currentStreak: 0 },
  },
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  totalDraws: 0,
  recentGames: [],
};

export function loadUserProgress(): UserProgress {
  if (typeof window === "undefined") return INITIAL_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_PROGRESS,
      ...parsed,
      statsByDifficulty: {
        ...INITIAL_PROGRESS.statsByDifficulty,
        ...(parsed.statsByDifficulty || {}),
      },
    };
  } catch (err) {
    console.error("Failed to load user progress:", err);
    return INITIAL_PROGRESS;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error("Failed to save user progress:", err);
  }
}

export function recordGameResult(
  current: UserProgress,
  game: GameHistoryItem,
  difficultyElo: number
): UserProgress {
  const diff = game.difficulty;
  const oldStats = current.statsByDifficulty[diff] || {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0,
    bestStreak: 0,
    currentStreak: 0,
  };

  const gamesPlayed = oldStats.gamesPlayed + 1;
  const wins = oldStats.wins + (game.result === "win" ? 1 : 0);
  const losses = oldStats.losses + (game.result === "loss" ? 1 : 0);
  const draws = oldStats.draws + (game.result === "draw" ? 1 : 0);
  const winRate = Math.round((wins / gamesPlayed) * 100);

  let currentStreak = oldStats.currentStreak;
  if (game.result === "win") {
    currentStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
  } else if (game.result === "loss") {
    currentStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
  } else {
    currentStreak = 0;
  }
  const bestStreak = Math.max(oldStats.bestStreak, currentStreak);

  // Elo rating adjustment (standard Glicko/Elo approximation formula with K=32)
  const K = 32;
  const expectedScore = 1 / (1 + Math.pow(10, (difficultyElo - current.overallElo) / 400));
  const actualScore = game.result === "win" ? 1 : game.result === "draw" ? 0.5 : 0;
  const eloDelta = Math.round(K * (actualScore - expectedScore));
  const newElo = Math.max(400, current.overallElo + eloDelta);

  const newStats = {
    gamesPlayed,
    wins,
    losses,
    draws,
    winRate,
    bestStreak,
    currentStreak,
  };

  const updatedHistory = [
    {
      date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      elo: newElo,
      reason: `${game.result.toUpperCase()} vs ${diff.toUpperCase()} (${eloDelta >= 0 ? "+" : ""}${eloDelta})`,
    },
    ...current.ratingHistory.slice(0, 49),
  ];

  const updatedRecentGames = [game, ...current.recentGames.slice(0, 29)];

  const updated: UserProgress = {
    ...current,
    overallElo: newElo,
    ratingHistory: updatedHistory,
    statsByDifficulty: {
      ...current.statsByDifficulty,
      [diff]: newStats,
    },
    totalGames: current.totalGames + 1,
    totalWins: current.totalWins + (game.result === "win" ? 1 : 0),
    totalLosses: current.totalLosses + (game.result === "loss" ? 1 : 0),
    totalDraws: current.totalDraws + (game.result === "draw" ? 1 : 0),
    recentGames: updatedRecentGames,
  };

  saveUserProgress(updated);
  return updated;
}
