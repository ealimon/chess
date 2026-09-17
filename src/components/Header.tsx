import React from "react";
import { Volume2, VolumeX, BarChart3, Swords, Palette, RotateCw } from "lucide-react";
import { BoardTheme, DifficultyLevel } from "../types";
import { BOARD_THEMES } from "../lib/themes";
import { BOT_PROFILES } from "../lib/engine";

interface HeaderProps {
  activeTab: "arena" | "progress";
  setActiveTab: (tab: "arena" | "progress") => void;
  difficulty: DifficultyLevel;
  playerElo: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentTheme: BoardTheme;
  onSelectTheme: (theme: BoardTheme) => void;
  onFlipBoard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  difficulty,
  playerElo,
  soundEnabled,
  onToggleSound,
  currentTheme,
  onSelectTheme,
  onFlipBoard,
}) => {
  const [showThemePicker, setShowThemePicker] = React.useState(false);
  const bot = BOT_PROFILES[difficulty];

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl select-none">
            ♞
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-100 font-serif tracking-wide leading-tight">
              Chess Mastery
            </h1>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <span>Practice vs AI</span>
              <span>•</span>
              <span className="text-amber-400 font-mono font-semibold">Elo {playerElo}</span>
            </div>
          </div>
        </div>

        {/* Center Tabs: Practice vs Progress */}
        <div className="flex items-center p-1 bg-slate-800/90 rounded-xl border border-slate-700/80">
          <button
            id="tab-arena-btn"
            type="button"
            onClick={() => setActiveTab("arena")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "arena"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Practice Arena</span>
            <span className="sm:hidden">Play</span>
          </button>

          <button
            id="tab-progress-btn"
            type="button"
            onClick={() => setActiveTab("progress")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "progress"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Progress &amp; Analytics</span>
            <span className="sm:hidden">Progress</span>
          </button>
        </div>

        {/* Right Tools: Flip, Theme, Sound */}
        <div className="flex items-center space-x-2">
          {/* Flip Board button */}
          <button
            id="flip-board-btn"
            type="button"
            onClick={onFlipBoard}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700 transition-colors cursor-pointer"
            title="Flip board orientation"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Theme Selector dropdown toggle */}
          <div className="relative">
            <button
              id="theme-picker-btn"
              type="button"
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700 transition-colors cursor-pointer"
              title="Change board theme"
            >
              <Palette className="w-4 h-4" />
            </button>

            {showThemePicker && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 block">
                  Board Theme
                </span>
                <div className="space-y-1">
                  {BOARD_THEMES.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => {
                        onSelectTheme(th);
                        setShowThemePicker(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        currentTheme.id === th.id
                          ? "bg-amber-500/20 text-amber-300 font-semibold"
                          : "text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <span>{th.name}</span>
                      <div className="flex space-x-0.5">
                        <div className={`w-3 h-3 rounded-xs ${th.lightSquare}`} />
                        <div className={`w-3 h-3 rounded-xs ${th.darkSquare}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            type="button"
            onClick={onToggleSound}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700 transition-colors cursor-pointer"
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
