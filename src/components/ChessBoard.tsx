import React, { useState } from "react";
import { Chess, Square, Move, PieceSymbol, Color } from "chess.js";
import { ChessPiece } from "./ChessPiece";
import { BoardTheme } from "../types";

interface ChessBoardProps {
  game: Chess;
  boardTheme: BoardTheme;
  orientation: Color;
  lastMove: { from: Square; to: Square } | null;
  onMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
  isAiThinking: boolean;
  disabled?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  game,
  boardTheme,
  orientation,
  lastMove,
  onMove,
  isAiThinking,
  disabled = false,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  const isFlipped = orientation === "b";
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const displayRanks = isFlipped ? [...ranks].reverse() : ranks;
  const displayFiles = isFlipped ? [...files].reverse() : files;

  // Compute legal moves from the selected square
  const legalMovesForSelected: Move[] = selectedSquare
    ? game.moves({ square: selectedSquare, verbose: true })
    : [];

  const validTargetSquares = new Set(legalMovesForSelected.map((m) => m.to));

  // Determine if the current player's King is in check
  let checkSquare: Square | null = null;
  if (game.inCheck()) {
    const turn = game.turn();
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === "k" && piece.color === turn) {
          checkSquare = `${files[c]}${8 - r}` as Square;
          break;
        }
      }
    }
  }

  const handleSquareClick = (square: Square) => {
    if (disabled || isAiThinking) return;

    // If currently waiting for pawn promotion selection, ignore clicks on board
    if (pendingPromotion) return;

    const pieceOnSquare = game.get(square);

    // If a piece is already selected
    if (selectedSquare) {
      if (selectedSquare === square) {
        // Deselect
        setSelectedSquare(null);
        return;
      }

      // Check if target is a valid move
      const targetMove = legalMovesForSelected.find((m) => m.to === square);
      if (targetMove) {
        // Check if move is a pawn promotion
        const movingPiece = game.get(selectedSquare);
        const isPromotion =
          movingPiece?.type === "p" &&
          ((movingPiece.color === "w" && square.endsWith("8")) ||
            (movingPiece.color === "b" && square.endsWith("1")));

        if (isPromotion) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        const success = onMove(selectedSquare, square);
        if (success) {
          setSelectedSquare(null);
          return;
        }
      }

      // If clicked another piece of the same color, switch selection
      if (pieceOnSquare && pieceOnSquare.color === game.turn()) {
        setSelectedSquare(square);
        return;
      }

      setSelectedSquare(null);
    } else {
      // Select new piece if it's the current player's turn
      if (pieceOnSquare && pieceOnSquare.color === game.turn()) {
        setSelectedSquare(square);
      }
    }
  };

  const handlePromotionSelect = (piece: PieceSymbol) => {
    if (!pendingPromotion) return;
    onMove(pendingPromotion.from, pendingPromotion.to, piece);
    setPendingPromotion(null);
    setSelectedSquare(null);
  };

  return (
    <div className="relative w-full max-w-[560px] aspect-square select-none mx-auto">
      {/* Board Outer Shell with elegant border */}
      <div
        id="chess-board-grid"
        className={`w-full h-full grid grid-cols-8 grid-rows-8 rounded-xl overflow-hidden border-4 ${boardTheme.boardBorder} shadow-2xl relative`}
      >
        {displayRanks.map((rank, rankIdx) =>
          displayFiles.map((file, fileIdx) => {
            const square = `${file}${rank}` as Square;
            const piece = game.get(square);

            const fileNum = file.charCodeAt(0) - 97;
            const rankNum = parseInt(rank, 10);
            const isLight = (fileNum + rankNum) % 2 !== 0;

            const isSelected = selectedSquare === square;
            const isLastMoveFrom = lastMove?.from === square;
            const isLastMoveTo = lastMove?.to === square;
            const isCheck = checkSquare === square;
            const isValidTarget = validTargetSquares.has(square);
            const isTargetCapture = isValidTarget && piece !== null;

            let squareBgClass = isLight ? boardTheme.lightSquare : boardTheme.darkSquare;
            if (isSelected) {
              squareBgClass = boardTheme.highlightSelected;
            } else if (isCheck) {
              squareBgClass = boardTheme.highlightCheck;
            } else if (isLastMoveFrom || isLastMoveTo) {
              squareBgClass = `${squareBgClass} ${boardTheme.highlightMove}`;
            }

            // Labels on edge squares
            const showFileLabel = rankIdx === 7;
            const showRankLabel = fileIdx === 0;

            return (
              <button
                key={square}
                id={`square-${square}`}
                type="button"
                onClick={() => handleSquareClick(square)}
                className={`relative w-full h-full flex items-center justify-center p-0 transition-colors duration-150 cursor-pointer focus:outline-none ${squareBgClass}`}
                disabled={disabled || isAiThinking}
              >
                {/* Board Notation Coordinate Labels */}
                {showRankLabel && (
                  <span
                    className={`absolute top-0.5 left-1 text-[10px] sm:text-xs font-bold pointer-events-none select-none ${
                      isLight ? "text-slate-600/70" : "text-white/70"
                    }`}
                  >
                    {rank}
                  </span>
                )}
                {showFileLabel && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-bold pointer-events-none select-none ${
                      isLight ? "text-slate-600/70" : "text-white/70"
                    }`}
                  >
                    {file}
                  </span>
                )}

                {/* Piece icon */}
                {piece && (
                  <div className="w-4/5 h-4/5 flex items-center justify-center pointer-events-none">
                    <ChessPiece type={piece.type} color={piece.color} size={48} />
                  </div>
                )}

                {/* Move Hint Dot / Capture Ring */}
                {isValidTarget && !isTargetCapture && (
                  <span className="absolute w-3.5 h-3.5 rounded-full bg-slate-900/40 pointer-events-none shadow-sm backdrop-blur-[1px]" />
                )}
                {isTargetCapture && (
                  <span className="absolute inset-1 rounded-full border-4 border-rose-500/60 pointer-events-none animate-pulse" />
                )}
              </button>
            );
          })
        )}

        {/* Promotion Modal Overlay */}
        {pendingPromotion && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-30 p-4 animate-in fade-in duration-200">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-2xl text-center max-w-xs w-full">
              <h4 className="text-sm font-semibold text-slate-200 mb-3">Promote Pawn To</h4>
              <div className="grid grid-cols-4 gap-2">
                {(["q", "r", "b", "n"] as PieceSymbol[]).map((pType) => (
                  <button
                    key={pType}
                    type="button"
                    onClick={() => handlePromotionSelect(pType)}
                    className="p-3 bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all rounded-lg flex flex-col items-center justify-center border border-slate-600 shadow-md cursor-pointer"
                  >
                    <ChessPiece type={pType} color={game.turn()} size={40} />
                    <span className="text-[10px] uppercase font-bold text-slate-300 mt-1">
                      {pType === "q" ? "Queen" : pType === "r" ? "Rook" : pType === "b" ? "Bishop" : "Knight"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Thinking Indicator Banner */}
        {isAiThinking && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/85 text-amber-400 border border-amber-500/30 text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-2 backdrop-blur-md pointer-events-none z-20">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-medium">AI is thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
};
