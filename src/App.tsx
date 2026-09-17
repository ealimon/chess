import React, { useState, useEffect, useRef, useCallback } from "react";
import { Chess, Square, PieceSymbol, Color } from "chess.js";
import {
  DifficultyLevel,
  MoveRecord,
  UserProgress,
  GameHistoryItem,
  BoardTheme,
} from "./types";
import { BOT_PROFILES, getBestMove, evaluateBoard, soundManager } from "./lib/engine";
import { BOARD_THEMES } from "./lib/themes";
import { loadUserProgress, recordGameResult } from "./lib/storage";
import { Header } from "./components/Header";
import { ChessBoard } from "./components/ChessBoard";
import { CapturedPieces } from "./components/CapturedPieces";
import { MoveHistoryPanel } from "./components/MoveHistoryPanel";
import { CoachPanel } from "./components/CoachPanel";
import { DifficultySelector } from "./components/DifficultySelector";
import { ProgressTracker } from "./components/ProgressTracker";
import { PostGameReviewModal } from "./components/PostGameReviewModal";
import {
  RotateCcw,
  Swords,
  Play,
  ArrowRight,
  Sparkles,
  Info,
  ChevronDown,
} from "lucide-react";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<"arena" | "progress">("arena");

  // Core Game State
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("casual");
  const [playerColor, setPlayerColor] = useState<Color>("w");
  const [boardOrientation, setBoardOrientation] = useState<Color>("w");
  const [currentTheme, setCurrentTheme] = useState<BoardTheme>(BOARD_THEMES[0]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Moves & Board Highlighting
  const [moves, setMoves] = useState<MoveRecord[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [evaluation, setEvaluation] = useState(0);

  // Captured Pieces
  const [whiteCaptured, setWhiteCaptured] = useState<PieceSymbol[]>([]);
  const [blackCaptured, setBlackCaptured] = useState<PieceSymbol[]>([]);

  // User Progress Persistence
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress);

  // Modals & Panels
  const [completedGameItem, setCompletedGameItem] = useState<GameHistoryItem | null>(null);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);

  // Ref to avoid stale game instance inside timeouts
  const gameRef = useRef(game);
  gameRef.current = game;

  // Sound manager sync
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setSoundEnabled(next);
  };

  // Calculate captured pieces and material advantage
  const updateCapturedAndEval = useCallback((currGame: Chess) => {
    const board = currGame.board();
    const remainingWhite: Record<PieceSymbol, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
    const remainingBlack: Record<PieceSymbol, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          if (piece.color === "w") {
            remainingWhite[piece.type]++;
          } else {
            remainingBlack[piece.type]++;
          }
        }
      }
    }

    const initialCounts: Record<PieceSymbol, number> = { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 };
    const wCaptured: PieceSymbol[] = [];
    const bCaptured: PieceSymbol[] = [];

    (Object.keys(initialCounts) as PieceSymbol[]).forEach((type) => {
      const lostWhite = Math.max(0, initialCounts[type] - remainingWhite[type]);
      const lostBlack = Math.max(0, initialCounts[type] - remainingBlack[type]);
      for (let i = 0; i < lostWhite; i++) wCaptured.push(type);
      for (let i = 0; i < lostBlack; i++) bCaptured.push(type);
    });

    setWhiteCaptured(wCaptured);
    setBlackCaptured(bCaptured);
    setEvaluation(evaluateBoard(currGame));
  }, []);

  // Check Game Over
  const checkGameOver = useCallback(
    (currGame: Chess, pgnString: string) => {
      if (!currGame.isGameOver()) return;

      let result: "win" | "loss" | "draw" = "draw";
      let reason = "Game drawn";

      if (currGame.isCheckmate()) {
        const winner = currGame.turn() === "w" ? "b" : "w";
        const playerWon = winner === playerColor;
        result = playerWon ? "win" : "loss";
        reason = playerWon ? "Checkmate! You won!" : "Checkmate! AI won!";
        soundManager.playGameEnd(playerWon);
      } else if (currGame.isDraw()) {
        if (currGame.isStalemate()) reason = "Draw by Stalemate";
        else if (currGame.isThreefoldRepetition()) reason = "Draw by Threefold Repetition";
        else if (currGame.isInsufficientMaterial()) reason = "Draw by Insufficient Material";
        else reason = "Draw by 50-move rule";
        soundManager.playGameEnd(false);
      }

      const bot = BOT_PROFILES[difficulty];
      const gameRecord: GameHistoryItem = {
        id: `game_${Date.now()}`,
        date: new Date().toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        difficulty,
        playerColor,
        result,
        reason,
        moveCount: Math.ceil(currGame.history().length / 2),
        pgn: pgnString || currGame.pgn(),
      };

      const updatedProgress = recordGameResult(progress, gameRecord, bot.elo);
      setProgress(updatedProgress);
      setCompletedGameItem(gameRecord);
    },
    [difficulty, playerColor, progress]
  );

  // Trigger AI Opponent Move
  const triggerAiMove = useCallback(
    (currGame: Chess) => {
      if (currGame.isGameOver()) return;

      setIsAiThinking(true);
      // Realistic human-like thinking delay based on bot depth
      const delay = Math.floor(Math.random() * 400) + 400;

      setTimeout(() => {
        try {
          const move = getBestMove(currGame, difficulty);
          if (move) {
            const fenBefore = currGame.fen();
            const resultMove = currGame.move(move);

            if (resultMove) {
              if (resultMove.captured) {
                soundManager.playCapture();
              } else if (currGame.inCheck()) {
                soundManager.playCheck();
              } else {
                soundManager.playMove();
              }

              const newMoveRecord: MoveRecord = {
                san: resultMove.san,
                from: resultMove.from,
                to: resultMove.to,
                piece: resultMove.piece,
                color: resultMove.color,
                captured: resultMove.captured,
                promotion: resultMove.promotion,
                fenBefore,
                fenAfter: currGame.fen(),
                moveNumber: moves.length + 1,
              };

              setMoves((prev) => [...prev, newMoveRecord]);
              setLastMove({ from: resultMove.from, to: resultMove.to });
              updateCapturedAndEval(currGame);
              checkGameOver(currGame, currGame.pgn());
            }
          }
        } catch (e) {
          console.error("AI Move error:", e);
        } finally {
          setIsAiThinking(false);
          setGame(new Chess(currGame.fen()));
        }
      }, delay);
    },
    [difficulty, moves.length, updateCapturedAndEval, checkGameOver]
  );

  // Handle User Move
  const handleMove = (from: Square, to: Square, promotion: PieceSymbol = "q"): boolean => {
    if (game.turn() !== playerColor || isAiThinking || game.isGameOver()) {
      return false;
    }

    try {
      const fenBefore = game.fen();
      const move = game.move({ from, to, promotion });

      if (move) {
        if (move.captured) {
          soundManager.playCapture();
        } else if (game.inCheck()) {
          soundManager.playCheck();
        } else {
          soundManager.playMove();
        }

        const newRecord: MoveRecord = {
          san: move.san,
          from: move.from,
          to: move.to,
          piece: move.piece,
          color: move.color,
          captured: move.captured,
          promotion: move.promotion,
          fenBefore,
          fenAfter: game.fen(),
          moveNumber: moves.length + 1,
        };

        const updatedMoves = [...moves, newRecord];
        setMoves(updatedMoves);
        setLastMove({ from, to });
        updateCapturedAndEval(game);
        setGame(new Chess(game.fen()));

        // Check if game ended immediately after player move
        if (game.isGameOver()) {
          checkGameOver(game, game.pgn());
        } else {
          // Trigger AI opponent's response
          triggerAiMove(game);
        }
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  // Undo / Takeback
  const handleUndoMove = () => {
    if (isAiThinking || moves.length === 0 || game.isGameOver()) return;

    // Undo bot move and player move to bring turn back to player
    game.undo();
    if (game.turn() !== playerColor && moves.length > 1) {
      game.undo();
    }

    const remainingMoves = moves.slice(0, game.history().length);
    setMoves(remainingMoves);

    const historyVerbose = game.moves({ verbose: true });
    const last = game.history({ verbose: true }).slice(-1)[0];
    if (last) {
      setLastMove({ from: last.from, to: last.to });
    } else {
      setLastMove(null);
    }

    updateCapturedAndEval(game);
    setGame(new Chess(game.fen()));
  };

  // Resign Current Match
  const handleResign = () => {
    if (game.isGameOver() || moves.length === 0) return;
    const bot = BOT_PROFILES[difficulty];
    soundManager.playGameEnd(false);

    const gameRecord: GameHistoryItem = {
      id: `game_${Date.now()}`,
      date: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      difficulty,
      playerColor,
      result: "loss",
      reason: "Resignation",
      moveCount: Math.ceil(game.history().length / 2),
      pgn: game.pgn(),
    };

    const updated = recordGameResult(progress, gameRecord, bot.elo);
    setProgress(updated);
    setCompletedGameItem(gameRecord);
  };

  // Start a fresh new game
  const startNewGame = (
    newDifficulty: DifficultyLevel = difficulty,
    newColor: Color = playerColor
  ) => {
    const newGame = new Chess();
    setGame(newGame);
    setDifficulty(newDifficulty);
    setPlayerColor(newColor);
    setBoardOrientation(newColor);
    setMoves([]);
    setLastMove(null);
    setCompletedGameItem(null);
    setIsAiThinking(false);
    updateCapturedAndEval(newGame);

    // If player chooses Black, AI (White) moves first
    if (newColor === "b") {
      triggerAiMove(newGame);
    }
  };

  // Calculate material difference
  const materialAdvantage = (() => {
    const valMap: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    const wScore = blackCaptured.reduce((sum, p) => sum + valMap[p], 0);
    const bScore = whiteCaptured.reduce((sum, p) => sum + valMap[p], 0);
    return wScore - bScore;
  })();

  const activeBot = BOT_PROFILES[difficulty];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        difficulty={difficulty}
        playerElo={progress.overallElo}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        onFlipBoard={() =>
          setBoardOrientation((prev) => (prev === "w" ? "b" : "w"))
        }
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === "arena" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Board and Player/Bot status */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center space-y-4">
              {/* Opponent Card (Top of Board) */}
              <div className="w-full max-w-[560px] bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl p-1 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center">
                    {activeBot.avatar}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-200">
                        {activeBot.name}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-amber-400">
                        {activeBot.elo} Elo
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate max-w-[260px]">
                      {activeBot.style}
                    </span>
                  </div>
                </div>

                <button
                  id="change-bot-btn"
                  type="button"
                  onClick={() => setShowDifficultyModal(!showDifficultyModal)}
                  className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
                >
                  <span>Opponent</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Opponent Difficulty Selector Dropdown / Tray */}
              {showDifficultyModal && (
                <div className="w-full max-w-[560px] bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl animate-in fade-in duration-150">
                  <DifficultySelector
                    selectedDifficulty={difficulty}
                    onSelectDifficulty={(lvl) => {
                      setDifficulty(lvl);
                      setShowDifficultyModal(false);
                      startNewGame(lvl, playerColor);
                    }}
                    userProgress={progress}
                    disabled={isAiThinking}
                  />
                </div>
              )}

              {/* Captured Material Bar */}
              <div className="w-full max-w-[560px]">
                <CapturedPieces
                  whiteCaptured={whiteCaptured}
                  blackCaptured={blackCaptured}
                  materialAdvantage={materialAdvantage}
                />
              </div>

              {/* The Chess Board */}
              <ChessBoard
                game={game}
                boardTheme={currentTheme}
                orientation={boardOrientation}
                lastMove={lastMove}
                onMove={handleMove}
                isAiThinking={isAiThinking}
                disabled={game.isGameOver()}
              />

              {/* User Player Card (Bottom of Board) & Side Selector */}
              <div className="w-full max-w-[560px] bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300 text-sm">
                    {playerColor === "w" ? "♔" : "♚"}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-200">You (Student)</span>
                      <span className="text-[11px] font-mono font-bold text-amber-400">
                        {progress.overallElo} Elo
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Playing as {playerColor === "w" ? "White" : "Black"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    id="new-game-btn"
                    type="button"
                    onClick={() => startNewGame(difficulty, playerColor)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>New Game</span>
                  </button>

                  <button
                    id="switch-color-btn"
                    type="button"
                    onClick={() => {
                      const nextColor: Color = playerColor === "w" ? "b" : "w";
                      startNewGame(difficulty, nextColor);
                    }}
                    className="text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    title="Switch sides between White and Black"
                  >
                    Play as {playerColor === "w" ? "Black" : "White"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Move History & Grandmaster Coach Tips */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
              {/* Grandmaster AI Coach Panel */}
              <CoachPanel
                fen={game.fen()}
                moveHistory={game.history()}
                playerColor={playerColor}
                difficulty={difficulty}
                disabled={game.isGameOver()}
              />

              {/* Move Notation & Control History */}
              <MoveHistoryPanel
                moves={moves}
                currentTurn={game.turn()}
                evaluationScore={evaluation}
                onUndoMove={handleUndoMove}
                onResign={handleResign}
                pgn={game.pgn()}
                fen={game.fen()}
                isGameOver={game.isGameOver()}
              />
            </div>
          </div>
        ) : (
          /* Progress & Analytics Tab */
          <ProgressTracker
            progress={progress}
            currentDifficulty={difficulty}
            onSelectDifficulty={(lvl) => {
              setDifficulty(lvl);
              setActiveTab("arena");
              startNewGame(lvl, playerColor);
            }}
          />
        )}
      </main>

      {/* Post-Game Comprehensive AI Review Modal */}
      {completedGameItem && (
        <PostGameReviewModal
          gameRecord={completedGameItem}
          playerEloEstimate={progress.overallElo}
          onRematch={() => startNewGame(difficulty, playerColor)}
          onNextOpponent={() => {
            setShowDifficultyModal(true);
            setCompletedGameItem(null);
          }}
          onClose={() => setCompletedGameItem(null)}
        />
      )}
    </div>
  );
}
