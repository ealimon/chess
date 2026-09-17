import { Chess, Square, Move } from "chess.js";
import { BotProfile, DifficultyLevel } from "../types";

export const BOT_PROFILES: Record<DifficultyLevel, BotProfile> = {
  novice: {
    id: "novice",
    name: "Oliver (Novice)",
    title: "Beginner Bot",
    avatar: "🌱",
    elo: 600,
    depth: 1,
    blunderProbability: 0.32,
    randomness: 75,
    description: "Learning the moves. Makes occasional blunders and focuses on fun, open games.",
    style: "Tactically careless, easy to practice basic checkmates and captures against.",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  casual: {
    id: "casual",
    name: "Maya (Casual)",
    title: "Club Novice",
    avatar: "☕",
    elo: 1000,
    depth: 2,
    blunderProbability: 0.16,
    randomness: 45,
    description: "Plays basic opening principles, grabs free material, but misses deeper combinations.",
    style: "Balanced, plays standard moves, punishes obvious unprotected pieces.",
    badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  },
  intermediate: {
    id: "intermediate",
    name: "Liam (Intermediate)",
    title: "Club Player",
    avatar: "⚡",
    elo: 1350,
    depth: 3,
    blunderProbability: 0.08,
    randomness: 25,
    description: "Controls the center, castles reliably, and sets up 2-move tactical tricks.",
    style: "Solid opening setup, seeks piece activity and king pressure.",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  advanced: {
    id: "advanced",
    name: "Elena (Advanced)",
    title: "Tournament Competitor",
    avatar: "🏹",
    elo: 1650,
    depth: 3,
    blunderProbability: 0.03,
    randomness: 12,
    description: "Sharp tactician with positional awareness. Defends tenaciously and capitalizes on mistakes.",
    style: "Dynamic, active piece coordination, solid endgame fundamentals.",
    badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  },
  master: {
    id: "master",
    name: "Viktor (Master)",
    title: "Candidate Master",
    avatar: "🛡️",
    elo: 1950,
    depth: 4,
    blunderProbability: 0.01,
    randomness: 4,
    description: "Relentless calculation with deep tactical vision and positional squeeze.",
    style: "Prophylactic and aggressive; exploits pawn weaknesses and weak colors.",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  grandmaster: {
    id: "grandmaster",
    name: "Gary (Grandmaster)",
    title: "Super GM AI",
    avatar: "👑",
    elo: 2250,
    depth: 4,
    blunderProbability: 0.0,
    randomness: 0,
    description: "Flawless piece coordination, deep quiescence search, and master-level opening strategy.",
    style: "Uncompromising, clinical precision, converts minor advantages into wins.",
    badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  },
};

// Piece base values
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-square tables for positional play (from White's perspective, 8x8)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_TABLE = [
   0,  0,  0,  0,  0,  0,  0,  0,
   5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   0,  0,  0,  5,  5,  0,  0,  0,
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20,
];

const KING_TABLE_MIDDLEGAME = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20,
];

// Helper to get index from algebraic square
function squareToIndex(sq: Square): number {
  const file = sq.charCodeAt(0) - 97; // a=0, h=7
  const rank = 8 - parseInt(sq[1], 10); // 8=0, 1=7
  return rank * 8 + file;
}

// Evaluate board position in centipawns (positive is good for White)
export function evaluateBoard(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === "w" ? -30000 : 30000;
  }
  if (game.isDraw()) {
    return 0;
  }

  let score = 0;
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const val = PIECE_VALUES[piece.type] || 0;
      let posScore = 0;
      const sqIndex = r * 8 + c;
      const flippedIndex = (7 - r) * 8 + c;

      switch (piece.type) {
        case "p":
          posScore = piece.color === "w" ? PAWN_TABLE[sqIndex] : PAWN_TABLE[flippedIndex];
          break;
        case "n":
          posScore = piece.color === "w" ? KNIGHT_TABLE[sqIndex] : KNIGHT_TABLE[flippedIndex];
          break;
        case "b":
          posScore = piece.color === "w" ? BISHOP_TABLE[sqIndex] : BISHOP_TABLE[flippedIndex];
          break;
        case "r":
          posScore = piece.color === "w" ? ROOK_TABLE[sqIndex] : ROOK_TABLE[flippedIndex];
          break;
        case "q":
          posScore = piece.color === "w" ? QUEEN_TABLE[sqIndex] : QUEEN_TABLE[flippedIndex];
          break;
        case "k":
          posScore = piece.color === "w" ? KING_TABLE_MIDDLEGAME[sqIndex] : KING_TABLE_MIDDLEGAME[flippedIndex];
          break;
      }

      const totalVal = val + posScore;
      score += piece.color === "w" ? totalVal : -totalVal;
    }
  }

  return score;
}

// Order moves to optimize alpha-beta pruning (MVV-LVA: Most Valuable Victim - Least Valuable Attacker)
function orderMoves(game: Chess, moves: Move[]): Move[] {
  return moves.slice().sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.captured) {
      scoreA += (PIECE_VALUES[a.captured] || 100) * 10 - (PIECE_VALUES[a.piece] || 100);
    }
    if (a.promotion) {
      scoreA += 800;
    }
    if (b.captured) {
      scoreB += (PIECE_VALUES[b.captured] || 100) * 10 - (PIECE_VALUES[b.piece] || 100);
    }
    if (b.promotion) {
      scoreB += 800;
    }

    return scoreB - scoreA;
  });
}

// Quiescence search to avoid the horizon effect on tactical captures
function quiescence(game: Chess, alpha: number, beta: number, isMaximizing: boolean, qDepth: number = 2): number {
  const standPat = evaluateBoard(game);

  if (qDepth === 0) return standPat;

  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;

    const captureMoves = game.moves({ verbose: true }).filter((m) => Boolean(m.captured));
    const sorted = orderMoves(game, captureMoves);

    for (const move of sorted) {
      game.move(move);
      const score = quiescence(game, alpha, beta, false, qDepth - 1);
      game.undo();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;

    const captureMoves = game.moves({ verbose: true }).filter((m) => Boolean(m.captured));
    const sorted = orderMoves(game, captureMoves);

    for (const move of sorted) {
      game.move(move);
      const score = quiescence(game, alpha, beta, true, qDepth - 1);
      game.undo();

      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
    return beta;
  }
}

// Minimax with Alpha-Beta Pruning
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  useQuiescence: boolean = true
): number {
  if (depth === 0) {
    return useQuiescence ? quiescence(game, alpha, beta, isMaximizing) : evaluateBoard(game);
  }

  if (game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = orderMoves(game, game.moves({ verbose: true }));

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, false, useQuiescence);
      game.undo();

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, true, useQuiescence);
      game.undo();

      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

// Find best move for the AI opponent
export function getBestMove(game: Chess, difficulty: DifficultyLevel): Move | null {
  const legalMoves = game.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  const profile = BOT_PROFILES[difficulty] || BOT_PROFILES.casual;
  const isWhite = game.turn() === "w";

  // Check for simulated blunder
  if (Math.random() < profile.blunderProbability) {
    // Pick a random legal move, or a sub-optimal move
    const randomIndex = Math.floor(Math.random() * legalMoves.length);
    return legalMoves[randomIndex];
  }

  // Opening book heuristic: In early moves, prefer central pawn pushes & knight development
  if (game.history().length < 4) {
    const preferredOpeningMoves = isWhite
      ? ["e4", "d4", "Nf3", "c4"]
      : ["e5", "c5", "e6", "Nf6", "d5"];
    const matchedMove = legalMoves.find((m) => preferredOpeningMoves.includes(m.san));
    if (matchedMove && Math.random() < 0.7) {
      return matchedMove;
    }
  }

  const depth = profile.depth;
  const orderedMoves = orderMoves(game, legalMoves);
  let bestMove: Move = orderedMoves[0];
  let bestScore = isWhite ? -Infinity : Infinity;

  for (const move of orderedMoves) {
    game.move(move);
    // Add controlled randomness depending on difficulty
    const noise = profile.randomness > 0 ? (Math.random() * 2 - 1) * profile.randomness : 0;
    const score = minimax(
      game,
      depth - 1,
      -Infinity,
      Infinity,
      !isWhite,
      profile.depth >= 3
    ) + noise;
    game.undo();

    if (isWhite) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

// Audio synthesizer for crisp chess sounds without any external assets
class ChessSoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user click
  }

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  playMove() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  playCapture() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playCheck() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.setValueAtTime(880, now + 0.09); // A5

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playGameEnd(isWin: boolean) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = isWin ? [523.25, 659.25, 783.99, 1046.5] : [440, 370, 311.13, 261.63];

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.12;

      osc.type = isWin ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    });
  }
}

export const soundManager = new ChessSoundManager();
