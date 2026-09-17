import React from "react";
import { PieceSymbol, Color } from "chess.js";

interface ChessPieceProps {
  type: PieceSymbol;
  color: Color;
  className?: string;
  size?: number;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className = "", size = 48 }) => {
  const isWhite = color === "w";
  const fillColor = isWhite ? "#f8fafc" : "#1e293b";
  const strokeColor = isWhite ? "#475569" : "#0f172a";
  const accentColor = isWhite ? "#cbd5e1" : "#334155";

  switch (type) {
    case "p":
      return (
        <svg
          viewBox="0 0 45 45"
          width={size}
          height={size}
          className={`drop-shadow-sm select-none pointer-events-none ${className}`}
        >
          <path
            d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M17 38.5c2.5-.5 8.5-.5 11 0"
            stroke={accentColor}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      );

    case "r":
      return (
        <svg
          viewBox="0 0 45 45"
          width={size}
          height={size}
          className={`drop-shadow-sm select-none pointer-events-none ${className}`}
        >
          <g
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
            <path d="M34 14l-3 3H14l-3-3" />
            <path d="M31 17v12.5H14V17" />
            <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
            <path d="M11 14h23" stroke={accentColor} strokeWidth="1" />
          </g>
        </svg>
      );

    case "n":
      return (
        <svg
          viewBox="0 0 45 45"
          width={size}
          height={size}
          className={`drop-shadow-sm select-none pointer-events-none ${className}`}
        >
          <path
            d="M22 10c-3 0-6 2-7.5 5-2 4-1.5 8-5 10.5-1 1-1.5 2.5-.5 3.5s2.5.5 3.5-.5c1.5-1.5 3-2.5 5.5-2.5 0 2-1 4.5-2 6.5-1 2-2 3-2 4.5 0 1.5 1 2 2.5 2h17c1 0 1.5-1 1.5-2 0-3-1-7 1-10 1.5-2.5 3.5-5 3.5-8.5 0-5.5-4-9-10-9z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="15" r="1.5" fill={strokeColor} />
          <path d="M14 36.5h17" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case "b":
      return (
        <svg
          viewBox="0 0 45 45"
          width={size}
          height={size}
          className={`drop-shadow-sm select-none pointer-events-none ${className}`}
        >
          <g
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z" />
            <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
            <circle cx="22.5" cy="8" r="2" />
            <path d="M22.5 15.5v5M20 18h5" stroke={strokeColor} strokeWidth="1.5" />
          </g>
        </svg>
      );

    case "q":
      return (
        <svg
          viewBox="0 0 45 45"
          width={size}
          height={size}
          className={`drop-shadow-sm select-none pointer-events-none ${className}`}
        >
          <g
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-4-14-4.5 14-4.5-14-4 14-7-11 2 12z" />
            <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4" />
            <circle cx="6" cy="12" r="1.75" />
            <circle cx="14" cy="9" r="1.75" />
            <circle cx="22.5" cy="8" r="1.75" />
            <circle cx="31" cy="9" r="1.75" />
            <circle cx="39" cy="12" r="1.75" />
            <path d="M11.5 30c3.5-1 18.5-1 22 0m-21 3.5c3.5-1 16.5-1 20 0" stroke={accentColor} />
          </g>
        </svg>
      );

    case "k":
      return (
        <svg
          viewBox="0 0 45 45"
          width={size}
          height={size}
          className={`drop-shadow-sm select-none pointer-events-none ${className}`}
        >
          <g
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22.5 11.63V6M20 8h5" />
            <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
            <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-6 2-6 2s-3-2-5-2-4 2-4 2-2-2-4-2-5 2-5 2-2-3-6-2c-3 6 6 10.5 6 10.5v7z" />
            <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke={accentColor} />
          </g>
        </svg>
      );

    default:
      return null;
  }
};
