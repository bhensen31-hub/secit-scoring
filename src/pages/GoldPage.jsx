import { PLAYERS, TEAM1_PLAYERS, TEAM2_PLAYERS } from '../lib/tournament';
import { calculateIndividualPoints } from '../lib/scoring';
import { useAllScores } from '../hooks/useScores';

const ALL_PLAYERS = [...TEAM1_PLAYERS, ...TEAM2_PLAYERS];

export default function GoldPage() {
  const { allScores, loading } = useAllScores();

  const playerPoints = calculateIndividualPoints(allScores);

  const leaderboard = ALL_PLAYERS
    .map(id => ({ id, points: playerPoints[id] || 0 }))
    .sort((a, b) => b.points - a.points || PLAYERS[a.id].name.localeCompare(PLAYERS[b.id].name));

  const topPoints = leaderboard[0]?.points ?? 0;
  const bottomPoints = leaderboard[leaderboard.length - 1]?.points ?? 0;
  const hasSpread = topPoints > bottomPoints;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-6">

      {/* Header */}
      <div className="text-center">
        <div className="text-4xl mb-1">🥇</div>
        <div className="text-gold-400 font-display font-bold text-xl">Gold Leaderboard</div>
        <div className="text-fairway-400 text-xs mt-1">Individual points across all Cup rounds</div>
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="text-center text-fairway-500 py-6 animate-pulse">Loading…</div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, idx) => {
            const player = PLAYERS[entry.id];
            const isTeam1 = player.team === 1;
            const isFirst = hasSpread && entry.points === topPoints;
            const isLast = hasSpread && entry.points === bottomPoints;

            return (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border
                  ${isFirst
                    ? 'bg-gold-500/10 border-gold-500/40'
                    : isTeam1
                      ? 'bg-fairway-800/60 border-fairway-700/50'
                      : 'bg-rough-900/60 border-rough-700/50'
                  }`}
              >
                {/* Rank */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${isFirst ? 'bg-gold-500 text-fairway-900' : 'bg-fairway-700 text-fairway-400'}`}>
                  {idx + 1}
                </div>

                {/* Name + team */}
                <div className="flex-1 min-w-0">
                  <span className="text-white font-medium">{player.name}</span>
                  <span className={`text-xs ml-2 font-semibold ${isTeam1 ? 'text-blue-400' : 'text-red-400'}`}>
                    Team {player.team}
                  </span>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-1.5">
                  {isFirst && <span className="text-lg leading-none">🥇</span>}
                  {isLast && <span className="text-lg leading-none">💩</span>}
                </div>

                {/* Points */}
                <div className={`font-bold text-lg tabular-nums w-12 text-right
                  ${isFirst ? 'text-gold-400' : 'text-fairway-300'}`}>
                  {entry.points % 1 === 0 ? entry.points : entry.points.toFixed(1)}
                </div>
              </div>
            );
          })}

          {!hasSpread && topPoints === 0 && (
            <div className="text-center text-fairway-600 py-4 text-sm">
              No scores yet. Points will appear as rounds are played.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
