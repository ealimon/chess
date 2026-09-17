import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { GameAnalysisResult, GameHistoryItem } from "../types";
import { BOT_PROFILES } from "../lib/engine";
import {
  Trophy,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";

interface PostGameReviewModalProps {
  gameRecord: GameHistoryItem;
  playerEloEstimate: number;
  onRematch: () => void;
  onNextOpponent: () => void;
  onClose: () => void;
}

export const PostGameReviewModal: React.FC<PostGameReviewModalProps> = ({
  gameRecord,
  playerEloEstimate,
  onRematch,
  onNextOpponent,
  onClose,
}) => {
  const [analysis, setAnalysis] = useState<GameAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const isWin = gameRecord.result === "win";
  const isDraw = gameRecord.result === "draw";

  useEffect(() => {
    if (isWin) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Ignore canvas confetti error if not available
      }
    }
    // Auto-fetch analysis
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pgn: gameRecord.pgn,
          result: gameRecord.result,
          playerColor: gameRecord.playerColor,
          difficulty: gameRecord.difficulty,
          playerEloEstimate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      }
    } catch (err) {
      console.error("Game analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const bot = BOT_PROFILES[gameRecord.difficulty];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-8">
        {/* Close button */}
        <button
          id="close-postgame-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Outcome Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3 bg-slate-800 border border-slate-700">
            {isWin ? (
              <Trophy className="w-8 h-8 text-amber-400" />
            ) : isDraw ? (
              <Award className="w-8 h-8 text-slate-300" />
            ) : (
              <XCircle className="w-8 h-8 text-rose-400" />
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-100 font-serif tracking-wide">
            {isWin ? "Victory!" : isDraw ? "Drawn Game" : "Defeat"}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {gameRecord.reason} vs {bot.name} ({bot.elo} Elo)
          </p>
        </div>

        {/* AI Grandmaster Review Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                AI Post-Game Performance Breakdown
              </h3>
            </div>
            {analysis?.accuracyScore !== undefined && (
              <div className="flex items-center space-x-1">
                <span className="text-xs text-slate-400">Estimated Accuracy:</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {analysis.accuracyScore}%
                </span>
              </div>
            )}
          </div>

          {isAnalyzing ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <p className="text-xs">Analyzing tactical accuracy and key moments...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-3.5 text-xs">
              {/* Overview */}
              <p className="text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                {analysis.gameOverview}
              </p>

              {/* Key Turning Moments */}
              {analysis.keyMoments && analysis.keyMoments.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Key Game Phases &amp; Lessons
                  </span>
                  <div className="grid gap-2">
                    {analysis.keyMoments.map((m, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-800/40 border border-slate-700/50 p-2.5 rounded-lg space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sky-400 text-[11px]">{m.phase}</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{m.observation}</p>
                        <p className="text-amber-300/90 text-[11px] italic font-medium">
                          Tip: {m.suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Areas to Improve */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2.5">
                  <span className="font-bold text-emerald-400 text-[11px] block mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Strengths Shown
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {analysis.strengths?.map((s, idx) => (
                      <li key={idx}>• {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5">
                  <span className="font-bold text-amber-400 text-[11px] block mb-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Work on Next
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {analysis.weaknessesToImprove?.map((w, idx) => (
                      <li key={idx}>• {w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Custom Drill Recommendation */}
              {analysis.customDrillRecommendation && (
                <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-3 text-sky-200 text-xs">
                  <span className="font-bold text-sky-400 block mb-0.5 text-[11px] uppercase tracking-wider">
                    Recommended Practice Drill
                  </span>
                  <p>{analysis.customDrillRecommendation}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
          <button
            id="modal-rematch-btn"
            type="button"
            onClick={onRematch}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Play Again</span>
          </button>

          <button
            id="modal-next-opponent-btn"
            type="button"
            onClick={onNextOpponent}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold rounded-xl text-xs transition-all border border-slate-700 cursor-pointer"
          >
            <span>Change Bot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            id="modal-close-view-board-btn"
            type="button"
            onClick={onClose}
            className="col-span-2 sm:col-span-1 flex items-center justify-center py-2.5 px-3 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs transition-all cursor-pointer"
          >
            <span>Review Board</span>
          </button>
        </div>
      </div>
    </div>
  );
};
