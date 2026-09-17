import React, { useState } from "react";
import { Sparkles, ShieldAlert, Lightbulb, Compass, Loader2 } from "lucide-react";
import { CoachHint, DifficultyLevel } from "../types";

interface CoachPanelProps {
  fen: string;
  moveHistory: string[];
  playerColor: "w" | "b";
  difficulty: DifficultyLevel;
  disabled?: boolean;
}

export const CoachPanel: React.FC<CoachPanelProps> = ({
  fen,
  moveHistory,
  playerColor,
  difficulty,
  disabled,
}) => {
  const [activeHint, setActiveHint] = useState<CoachHint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestType, setRequestType] = useState<"hint" | "threat" | "plan">("hint");

  const requestCoachAdvice = async (type: "hint" | "threat" | "plan") => {
    if (disabled || isLoading) return;
    setIsLoading(true);
    setRequestType(type);

    try {
      const response = await fetch("/api/ai/coach-hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fen,
          moveHistory,
          playerColor,
          difficulty,
          requestType: type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to contact coach service");
      }

      const data = await response.json();
      setActiveHint(data);
    } catch (err) {
      console.error("Coach API error:", err);
      // Fallback advice
      setActiveHint({
        tip: "Look for undefended pieces and calculate forced moves first (checks, captures, threats).",
        recommendedPlan: "Control the center, connect your rooks, and ensure your King has escape squares.",
        threatToWatch: "Watch out for forks on your king/queen and sneaky back-rank tactics.",
        suggestedMoves: ["Develop minor pieces towards the center", "Ensure King is castled"],
        evaluationSummary: "Balanced position. Focus on piece harmony.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/80 rounded-xl border border-slate-700/80 p-4 shadow-lg flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              AI Grandmaster Coach
            </h3>
            <p className="text-[11px] text-slate-400">Tactical guidance &amp; recommendations</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          id="coach-hint-btn"
          type="button"
          onClick={() => requestCoachAdvice("hint")}
          disabled={disabled || isLoading}
          className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            requestType === "hint" && activeHint
              ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
              : "bg-slate-700/60 hover:bg-slate-700 border-slate-600/60 text-slate-300 hover:text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Lightbulb className="w-4 h-4 mb-1 text-amber-400" />
          <span>Get Tip</span>
        </button>

        <button
          id="coach-threat-btn"
          type="button"
          onClick={() => requestCoachAdvice("threat")}
          disabled={disabled || isLoading}
          className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            requestType === "threat" && activeHint
              ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
              : "bg-slate-700/60 hover:bg-slate-700 border-slate-600/60 text-slate-300 hover:text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <ShieldAlert className="w-4 h-4 mb-1 text-rose-400" />
          <span>Threat Alert</span>
        </button>

        <button
          id="coach-plan-btn"
          type="button"
          onClick={() => requestCoachAdvice("plan")}
          disabled={disabled || isLoading}
          className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            requestType === "plan" && activeHint
              ? "bg-sky-500/15 border-sky-500/40 text-sky-300"
              : "bg-slate-700/60 hover:bg-slate-700 border-slate-600/60 text-slate-300 hover:text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Compass className="w-4 h-4 mb-1 text-sky-400" />
          <span>Strategic Plan</span>
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-6 flex flex-col items-center justify-center space-y-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
          <span className="text-xs">Analyzing board dynamics with Gemini...</span>
        </div>
      )}

      {/* Active Hint Content */}
      {!isLoading && activeHint && (
        <div className="bg-slate-900/70 border border-slate-700/80 rounded-lg p-3 space-y-2.5 text-xs animate-in fade-in duration-150">
          {/* Main Tip / Observation */}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block mb-0.5">
              Coach's Tip
            </span>
            <p className="text-slate-200 leading-relaxed">{activeHint.tip}</p>
          </div>

          {/* Strategic Plan */}
          {activeHint.recommendedPlan && (
            <div className="pt-1 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 block mb-0.5">
                Recommended Plan
              </span>
              <p className="text-slate-300 leading-relaxed">{activeHint.recommendedPlan}</p>
            </div>
          )}

          {/* Opponent Threat */}
          {activeHint.threatToWatch && (
            <div className="pt-1 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 block mb-0.5">
                Threat to Watch
              </span>
              <p className="text-slate-300 leading-relaxed">{activeHint.threatToWatch}</p>
            </div>
          )}

          {/* Suggested Move Ideas */}
          {activeHint.suggestedMoves && activeHint.suggestedMoves.length > 0 && (
            <div className="pt-1 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-1">
                Candidate Ideas
              </span>
              <ul className="space-y-1">
                {activeHint.suggestedMoves.map((m, idx) => (
                  <li key={idx} className="flex items-start text-slate-300">
                    <span className="text-emerald-400 font-bold mr-1.5">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!isLoading && !activeHint && (
        <p className="text-xs text-slate-400 text-center py-2 bg-slate-900/40 rounded-lg border border-slate-800">
          Tap any button above when you're unsure of your next move or need strategic direction.
        </p>
      )}
    </div>
  );
};
