import React, { useEffect, useRef } from "react";
import { MoveRecord } from "../types";
import { Copy, Check, RotateCcw, Flag } from "lucide-react";

interface MoveHistoryPanelProps {
  moves: MoveRecord[];
  currentTurn: "w" | "b";
  evaluationScore: number; // centipawns
  onUndoMove?: () => void;
  onResign?: () => void;
  pgn: string;
  fen: string;
  isGameOver: boolean;
}

export const MoveHistoryPanel: React.FC<MoveHistoryPanelProps> = ({
  moves,
  currentTurn,
  evaluationScore,
  onUndoMove,
  onResign,
  pgn,
  fen,
  isGameOver,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedPgn, setCopiedPgn] = React.useState(false);
  const [copiedFen, setCopiedFen] = React.useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves]);

  const handleCopyPgn = () => {
    if (!pgn) return;
    navigator.clipboard.writeText(pgn);
    setCopiedPgn(true);
    setTimeout(() => setCopiedPgn(false), 2000);
  };

  const handleCopyFen = () => {
    if (!fen) return;
    navigator.clipboard.writeText(fen);
    setCopiedFen(true);
    setTimeout(() => setCopiedFen(false), 2000);
  };

  // Group moves into pairs (White & Black)
  const pairedMoves: { number: number; white?: MoveRecord; black?: MoveRecord }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairedMoves.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  // Format evaluation (e.g. +1.4 or -0.8)
  const formattedEval = (evaluationScore / 100).toFixed(1);
  const evalDisplay = evaluationScore > 0 ? `+${formattedEval}` : formattedEval;

  return (
    <div className="flex flex-col h-full bg-slate-800/80 rounded-xl border border-slate-700/80 overflow-hidden shadow-lg">
      {/* Header bar: Turn & Live Evaluation */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full border border-slate-500 shadow-xs ${
              currentTurn === "w" ? "bg-white" : "bg-slate-900"
            }`}
          />
          <span className="text-xs font-semibold text-slate-200">
            {isGameOver
              ? "Game Concluded"
              : currentTurn === "w"
              ? "White to move"
              : "Black to move"}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-slate-400">Eval:</span>
          <span
            className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
              evaluationScore > 50
                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                : evaluationScore < -50
                ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                : "text-slate-300 bg-slate-700/50"
            }`}
          >
            {evalDisplay}
          </span>
        </div>
      </div>

      {/* Move list table */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2.5 space-y-1 font-mono text-xs max-h-[220px] lg:max-h-[280px] scrollbar-thin scrollbar-thumb-slate-700"
      >
        {pairedMoves.length === 0 ? (
          <div className="h-28 flex items-center justify-center text-slate-500 italic text-center text-xs">
            Moves will appear here as the game progresses.
          </div>
        ) : (
          pairedMoves.map((turn) => (
            <div
              key={turn.number}
              className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-700/40 transition-colors"
            >
              <span className="text-slate-500 w-8 font-medium">{turn.number}.</span>
              <span className="text-slate-200 flex-1 font-semibold pl-1">
                {turn.white?.san}
              </span>
              <span className="text-slate-300 flex-1 font-semibold pl-1">
                {turn.black ? turn.black.san : "..."}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Action Footer: Takeback, Resign, Copy PGN / FEN */}
      <div className="p-3 bg-slate-800/90 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          {onUndoMove && !isGameOver && moves.length > 0 && (
            <button
              id="undo-move-btn"
              type="button"
              onClick={onUndoMove}
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs bg-slate-700/70 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-lg transition-all border border-slate-600/50 cursor-pointer"
              title="Takeback last move"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Takeback</span>
            </button>
          )}

          {onResign && !isGameOver && moves.length > 0 && (
            <button
              id="resign-game-btn"
              type="button"
              onClick={onResign}
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg transition-all border border-rose-500/20 cursor-pointer"
              title="Resign current game"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Resign</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            id="copy-pgn-btn"
            type="button"
            onClick={handleCopyPgn}
            className="flex items-center space-x-1 px-2 py-1 text-[11px] bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded transition-all cursor-pointer"
            title="Copy standard PGN notation"
          >
            {copiedPgn ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>PGN</span>
          </button>
          <button
            id="copy-fen-btn"
            type="button"
            onClick={handleCopyFen}
            className="flex items-center space-x-1 px-2 py-1 text-[11px] bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded transition-all cursor-pointer"
            title="Copy FEN board position"
          >
            {copiedFen ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>FEN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
