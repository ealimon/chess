import { BoardTheme } from "../types";

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: "classic-wood",
    name: "Classic Walnut",
    lightSquare: "bg-[#eedaa2]",
    darkSquare: "bg-[#b88b4a]",
    highlightMove: "bg-amber-400/45 ring-2 ring-inset ring-amber-500/70",
    highlightSelected: "bg-emerald-400/50 ring-2 ring-inset ring-emerald-500",
    highlightCheck: "bg-rose-500/70 animate-pulse",
    boardBorder: "border-[#784d1e] shadow-2xl",
  },
  {
    id: "emerald-slate",
    name: "Tournament Emerald",
    lightSquare: "bg-[#ffffdd]",
    darkSquare: "bg-[#86a666]",
    highlightMove: "bg-yellow-300/40 ring-2 ring-inset ring-yellow-400/80",
    highlightSelected: "bg-teal-400/50 ring-2 ring-inset ring-teal-500",
    highlightCheck: "bg-rose-500/70 animate-pulse",
    boardBorder: "border-[#486334] shadow-2xl",
  },
  {
    id: "midnight-cyan",
    name: "Midnight Indigo",
    lightSquare: "bg-[#cbd5e1]",
    darkSquare: "bg-[#475569]",
    highlightMove: "bg-cyan-400/35 ring-2 ring-inset ring-cyan-400",
    highlightSelected: "bg-blue-500/45 ring-2 ring-inset ring-blue-400",
    highlightCheck: "bg-rose-500/70 animate-pulse",
    boardBorder: "border-slate-800 shadow-2xl",
  },
  {
    id: "royal-amethyst",
    name: "Royal Velvet",
    lightSquare: "bg-[#ede9fe]",
    darkSquare: "bg-[#7c3aed]",
    highlightMove: "bg-amber-400/40 ring-2 ring-inset ring-amber-400",
    highlightSelected: "bg-fuchsia-400/45 ring-2 ring-inset ring-fuchsia-400",
    highlightCheck: "bg-rose-500/70 animate-pulse",
    boardBorder: "border-purple-900 shadow-2xl",
  },
];
