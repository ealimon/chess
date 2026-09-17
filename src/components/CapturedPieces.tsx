import React from "react";
import { Color, PieceSymbol } from "chess.js";
import { ChessPiece } from "./ChessPiece";

interface CapturedPiecesProps {
  whiteCaptured: PieceSymbol[];
  blackCaptured: PieceSymbol[];
  materialAdvantage: number; // positive = White advantage, negative = Black advantage
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

const PIECE_ORDER: PieceSymbol[] = ["q", "r", "b", "n", "p"];

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({
  whiteCaptured,
  blackCaptured,
  materialAdvantage,
}) => {
  // Sort pieces by value
  const sortPieces = (pieces: PieceSymbol[]) => {
    return [...pieces].sort((a, b) => PIECE_ORDER.indexOf(a) - PIECE_ORDER.indexOf(b));
  };

  const sortedWhite = sortPieces(whiteCaptured);
  const sortedBlack = sortPieces(blackCaptured);

  return (
    <div className="flex flex-col gap-2 py-1">
      {/* Black's captured pieces (taken by White) */}
      <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60 min-h-[36px]">
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 mr-1.5">Captured:</span>
          {sortedBlack.map((type, idx) => (
            <div key={idx} className="-mr-1.5 hover:scale-110 transition-transform">
              <ChessPiece type={type} color="b" size={20} />
            </div>
          ))}
          {sortedBlack.length === 0 && <span className="text-[11px] text-slate-500 italic">None</span>}
        </div>
        {materialAdvantage > 0 && (
          <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[11px]">
            +{materialAdvantage}
          </span>
        )}
      </div>

      {/* White's captured pieces (taken by Black) */}
      <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60 min-h-[36px]">
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 mr-1.5">Captured:</span>
          {sortedWhite.map((type, idx) => (
            <div key={idx} className="-mr-1.5 hover:scale-110 transition-transform">
              <ChessPiece type={type} color="w" size={20} />
            </div>
          ))}
          {sortedWhite.length === 0 && <span className="text-[11px] text-slate-500 italic">None</span>}
        </div>
        {materialAdvantage < 0 && (
          <span className="font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded text-[11px]">
            +{Math.abs(materialAdvantage)}
          </span>
        )}
      </div>
    </div>
  );
};
