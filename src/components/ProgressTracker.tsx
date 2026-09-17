import React, { useState, useEffect } from "react";
import { UserProgress, DifficultyLevel } from "../types";
import { BOT_PROFILES } from "../lib/engine";
import {
  Trophy,
  TrendingUp,
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  MinusCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface ProgressTrackerProps {
  progress: UserProgress;
  currentDifficulty: DifficultyLevel;
  onSelectDifficulty?: (level: DifficultyLevel) => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  currentDifficulty,
  onSelectDifficulty,
}) => {
  const [aiReport, setAiReport] = useState<{
    milestoneSummary: string;
    levelRecommendation: string;
    focusAreas: string[];
  } | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const fetchAiReport = async () => {
    setIsLoadingReport(true);
    try {
      const res = await fetch("/api/ai/progress-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stats: progress.statsByDifficulty,
          currentLevel: currentDifficulty,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiReport(data);
      }
    } catch (e) {
      console.error("Failed to load AI progress report", e);
    } finally {
      setIsLoadingReport(false);
    }
  };

  useEffect(() => {
    fetchAiReport();
  }, [progress.totalGames]);

  // Player Tier Badge based on Elo
  const getTier = (elo: number) => {
    if (elo >= 2200) return { title: "Grandmaster Candidate", color: "text-rose-400 border-rose-500/30 bg-rose-500/10" };
    if (elo >= 1900) return { title: "National Master Tier", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" };
    if (elo >= 1600) return { title: "Tournament Player", color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10" };
    if (elo >= 1300) return { title: "Club Competitor", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" };
    if (elo >= 1000) return { title: "Club Novice", color: "text-sky-400 border-sky-500/30 bg-sky-500/10" };
    return { title: "Chess Apprentice", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
  };

  const currentTier = getTier(progress.overallElo);

  // Simple SVG sparkline / line chart for rating history
  const historyPoints = [...progress.ratingHistory].reverse().slice(-15);
  const minElo = Math.min(...historyPoints.map((p) => p.elo), progress.overallElo - 100);
  const maxElo = Math.max(...historyPoints.map((p) => p.elo), progress.overallElo + 100);
  const eloRange = Math.max(1, maxElo - minElo);

  const chartWidth = 500;
  const chartHeight = 120;
  const padding = 20;

  const pointsString = historyPoints
    .map((pt, idx) => {
      const x = padding + (idx / Math.max(1, historyPoints.length - 1)) * (chartWidth - padding * 2);
      const y = chartHeight - padding - ((pt.elo - minElo) / eloRange) * (chartHeight - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const levels: DifficultyLevel[] = [
    "novice",
    "casual",
    "intermediate",
    "advanced",
    "master",
    "grandmaster",
  ];

  const overallWinRate =
    progress.totalGames > 0 ? Math.round((progress.totalWins / progress.totalGames) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Estimated Elo */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Estimated Elo</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-100">
            {progress.overallElo}
          </div>
          <div className="mt-2">
            <span
              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentTier.color}`}
            >
              {currentTier.title}
            </span>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Overall Win Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {overallWinRate}%
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            {progress.totalWins}W / {progress.totalLosses}L / {progress.totalDraws}D
          </span>
        </div>

        {/* Total Games */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Games Played</span>
            <Award className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-100">
            {progress.totalGames}
          </div>
          <span className="text-[11px] text-slate-400 mt-2">Practice sessions</span>
        </div>

        {/* Best Streak */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Best Win Streak</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {Math.max(0, ...Object.values(progress.statsByDifficulty).map((s) => s.bestStreak))}
          </div>
          <span className="text-[11px] text-slate-400 mt-2">Consecutive wins</span>
        </div>
      </div>

      {/* Rating Progress Trend Line */}
      {historyPoints.length > 1 && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Rating Progression
              </h4>
              <p className="text-[11px] text-slate-400">Estimated Elo growth across recent games</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">
              Current: {progress.overallElo}
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-28 overflow-visible"
            >
              {/* Background horizontal guide lines */}
              <line
                x1={padding}
                y1={padding}
                x2={chartWidth - padding}
                y2={padding}
                stroke="#334155"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <line
                x1={padding}
                y1={chartHeight / 2}
                x2={chartWidth - padding}
                y2={chartHeight / 2}
                stroke="#334155"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <line
                x1={padding}
                y1={chartHeight - padding}
                x2={chartWidth - padding}
                y2={chartHeight - padding}
                stroke="#334155"
                strokeDasharray="4 4"
                strokeWidth="1"
              />

              {/* Trend Polyline */}
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />

              {/* Data points */}
              {historyPoints.map((pt, idx) => {
                const x =
                  padding +
                  (idx / Math.max(1, historyPoints.length - 1)) * (chartWidth - padding * 2);
                const y =
                  chartHeight -
                  padding -
                  ((pt.elo - minElo) / eloRange) * (chartHeight - padding * 2);
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="4"
                    className="fill-amber-400 stroke-slate-900 stroke-2 hover:r-6 transition-all"
                  >
                    <title>{`${pt.date}: ${pt.elo} (${pt.reason})`}</title>
                  </circle>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Detailed Stats by Difficulty Level */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
          Performance vs. AI Difficulty Tiers
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {levels.map((lvl) => {
            const bot = BOT_PROFILES[lvl];
            const stats = progress.statsByDifficulty[lvl];
            const played = stats.gamesPlayed;
            const rate = stats.winRate;

            return (
              <div
                key={lvl}
                className="bg-slate-900/60 border border-slate-700/70 rounded-xl p-3.5 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{bot.avatar}</span>
                    <div>
                      <h5 className="font-bold text-xs text-slate-100">{bot.name}</h5>
                      <span className="text-[11px] font-mono text-amber-400">{bot.elo} Elo</span>
                    </div>
                  </div>
                  {onSelectDifficulty && (
                    <button
                      type="button"
                      onClick={() => onSelectDifficulty(lvl)}
                      className="text-[10px] font-semibold text-sky-400 hover:text-sky-300 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-all cursor-pointer"
                    >
                      Practice
                    </button>
                  )}
                </div>

                {/* Win rate progress bar */}
                <div className="space-y-1 mb-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Win Rate</span>
                    <span className="font-bold text-slate-200">{rate}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>

                {/* W / L / D and Streaks */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>
                    Record: <b className="text-emerald-400">{stats.wins}W</b> -{" "}
                    <b className="text-rose-400">{stats.losses}L</b> -{" "}
                    <b className="text-slate-300">{stats.draws}D</b>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>Streak: {stats.currentStreak}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gemini AI Coach Recommendations & Drill Advice */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-amber-500/30 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Personalized AI Training Recommendations
              </h4>
              <p className="text-[11px] text-slate-400">Grounded in your game history &amp; win rates</p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchAiReport}
            disabled={isLoadingReport}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReport ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {isLoadingReport ? (
          <div className="py-6 flex items-center justify-center space-x-2 text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Formulating training plan with Gemini...</span>
          </div>
        ) : aiReport ? (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">
                Milestone Assessment
              </span>
              <p className="text-slate-200 leading-relaxed">{aiReport.milestoneSummary}</p>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-sky-400 block mb-0.5">
                Target Level Recommendation
              </span>
              <p className="text-slate-200 leading-relaxed">{aiReport.levelRecommendation}</p>
            </div>

            {aiReport.focusAreas && (
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                  Key Focus Habits for Your Next 5 Games
                </span>
                <ul className="space-y-1">
                  {aiReport.focusAreas.map((habit, idx) => (
                    <li key={idx} className="flex items-start text-slate-300">
                      <span className="text-emerald-400 font-bold mr-1.5">•</span>
                      <span>{habit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Play a few games to generate tailored training recommendations.
          </p>
        )}
      </div>

      {/* Recent Games Log */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
          Recent Matches
        </h4>

        {progress.recentGames.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">
            No completed matches yet. Start a game to record your first performance!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-[11px]">
                  <th className="pb-2 font-medium">Result</th>
                  <th className="pb-2 font-medium">Opponent</th>
                  <th className="pb-2 font-medium">Side</th>
                  <th className="pb-2 font-medium">Moves</th>
                  <th className="pb-2 font-medium">Outcome Reason</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {progress.recentGames.slice(0, 8).map((game) => (
                  <tr key={game.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center space-x-1 font-bold text-[11px] px-2 py-0.5 rounded-full ${
                          game.result === "win"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : game.result === "loss"
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {game.result === "win" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : game.result === "loss" ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <MinusCircle className="w-3 h-3" />
                        )}
                        <span className="uppercase">{game.result}</span>
                      </span>
                    </td>
                    <td className="py-2.5 font-medium text-slate-200">
                      {BOT_PROFILES[game.difficulty]?.name || game.difficulty}
                    </td>
                    <td className="py-2.5 text-slate-400">
                      {game.playerColor === "w" ? "White" : "Black"}
                    </td>
                    <td className="py-2.5 font-mono text-slate-300">{game.moveCount}</td>
                    <td className="py-2.5 text-slate-400 truncate max-w-[150px]">
                      {game.reason}
                    </td>
                    <td className="py-2.5 text-slate-500 text-[11px]">{game.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
