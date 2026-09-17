import React from "react";
import { BOT_PROFILES } from "../lib/engine";
import { BotProfile, DifficultyLevel, UserProgress } from "../types";
import { Trophy, Flame, ChevronRight } from "lucide-react";

interface DifficultySelectorProps {
  selectedDifficulty: DifficultyLevel;
  onSelectDifficulty: (level: DifficultyLevel) => void;
  userProgress: UserProgress;
  disabled?: boolean;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  onSelectDifficulty,
  userProgress,
  disabled,
}) => {
  const levels: DifficultyLevel[] = [
    "novice",
    "casual",
    "intermediate",
    "advanced",
    "master",
    "grandmaster",
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider text-xs">
          Select AI Opponent
        </h3>
        <span className="text-xs text-slate-400">
          Rated from 600 to 2250+
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {levels.map((lvl) => {
          const bot: BotProfile = BOT_PROFILES[lvl];
          const stats = userProgress.statsByDifficulty[lvl] || {
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            winRate: 0,
          };
          const isSelected = selectedDifficulty === lvl;

          return (
            <button
              key={lvl}
              id={`bot-select-${lvl}`}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDifficulty(lvl)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-800 border-amber-500/80 shadow-md ring-1 ring-amber-500/50"
                  : "bg-slate-800/60 hover:bg-slate-800 border-slate-700/70 hover:border-slate-600"
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {/* Active Selection Indicator Ribbon */}
              {isSelected && (
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-bl-lg">
                  Active
                </div>
              )}

              {/* Top Row: Avatar, Name, Elo */}
              <div className="flex items-start space-x-3 mb-2">
                <div className="text-2xl p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 flex items-center justify-center">
                  {bot.avatar}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-sm text-slate-100">{bot.name}</h4>
                  </div>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {bot.elo} Elo
                    </span>
                    <span className="text-[11px] text-slate-400">• {bot.title}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 mb-2.5 line-clamp-2 leading-relaxed">
                {bot.description}
              </p>

              {/* Stats Footer Against this Bot */}
              <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-1 text-slate-300">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>
                    {stats.wins}W - {stats.losses}L - {stats.draws}D
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {stats.gamesPlayed > 0 ? (
                    <span
                      className={`font-semibold ${
                        stats.winRate >= 50 ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {stats.winRate}% Win
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">Unplayed</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
