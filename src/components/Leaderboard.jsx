import { ROUNDS, PLAYERS } from '../lib/tournament';
import { calculateMatchStatus, matchStatusLabel, cupStandings, COURSE_HANDICAPS } from '../lib/scoring';
import { useAllScores } from '../hooks/useScores';

function RoundRow({ round, matchStatuses }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
          ${round.countsForCup ? 'bg-gold-700/30 text-gold-400' : 'bg-fairway-800 text-fairway-400'}
        `}>
          {round.countsForCup ? `Match ${round.number}` : 'Warm-Up'}
        </span>
        <span className="text-fairway-300 text-sm font-medium">{round.subtitle}</span>
      </div>
      <div className="space-y-2">
        {round.matchups.map((matchup, i) => {
          const ms = matchStatuses[matchup.id];
          if (!ms) return null;
          const { holesPlayed, matchResult, holesUp } = ms;

          const teamNames = [
            matchup.team1Players.map(id => PLAYERS[id].name).join('/'),
            matchup.team2Players.map(id => PLAYERS[id].name).join('/'),
          ];
          const statusStr = matchStatusLabel(ms, teamNames);

          return (
            <div key={matchup.id}
              className="bg-fairway-800/60 rounded-xl p-3 border border-fairway-700/50"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-white text-sm font-medium truncate">{matchup.shortLabel}</div>
                  <div className="text-fairway-400 text-xs mt-0.5 truncate">{statusStr}</div>
                </div>
                <MatchBadge matchResult={matchResult} holesUp={holesUp} holesPlayed={holesPlayed} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MatchBadge({ matchResult, holesUp, holesPlayed }) {
  if (holesPlayed === 0) {
    return <span className="text-fairway-600 text-xs flex-shrink-0">Not started</span>;
  }
  if (matchResult) {
    if (matchResult.winner === 0) {
      return <span className="bg-fairway-700 text-fairway-300 text-xs px-2 py-1 rounded-full flex-shrink-0">Tied</span>;
    }
    const color = matchResult.winner === 1 ? 'bg-fairway-600 text-fairway-100' : 'bg-rough-700 text-gold-300';
    return (
      <span className={`${color} text-xs px-2 py-1 rounded-full flex-shrink-0 font-semibold`}>
        T{matchResult.winner} ✓
      </span>
    );
  }
  if (holesUp === 0) {
    return <span className="text-fairway-400 text-xs flex-shrink-0 font-medium">AS</span>;
  }
  const color = holesUp > 0 ? 'text-fairway-300' : 'text-gold-400';
  return (
    <span className={`${color} text-sm font-bold flex-shrink-0`}>
      T{holesUp > 0 ? 1 : 2} +{Math.abs(holesUp)}
    </span>
  );
}

export default function Leaderboard() {
  const { allScores, loading } = useAllScores();

  // Compute match statuses for all matchups
  const matchStatuses = {};
  for (const round of ROUNDS) {
    for (const matchup of round.matchups) {
      const scores = allScores[matchup.id] || {};
      matchStatuses[matchup.id] = calculateMatchStatus(scores, matchup, round);
    }
  }

  // Cup-qualifying rounds only
  const cupRounds = ROUNDS.filter(r => r.countsForCup);
  const cupMatchStatuses = cupRounds.flatMap(r =>
    r.matchups.map(m => matchStatuses[m.id])
  );
  const { team1, team2 } = cupStandings(cupMatchStatuses);
  const totalPoints = ROUNDS.filter(r => r.countsForCup)
    .reduce((s, r) => s + r.matchups.length, 0);

  return (
    <div className="space-y-6">
      {/* Cup Score Banner */}
      <div className="bg-gradient-to-br from-fairway-800 to-fairway-900 rounded-2xl p-5 border border-gold-600/30 shadow-xl">
        <div className="text-center text-gold-400 font-display text-xs font-semibold uppercase tracking-widest mb-4">
          SECIT Cup Standings
        </div>
        <div className="flex items-center justify-between gap-4">
          {/* Team 1 */}
          <div className="flex-1 text-center">
            <div className="text-fairway-300 text-xs mb-1">Team 1</div>
            <div className={`font-display font-bold text-4xl ${team1 > team2 ? 'text-gold-400' : 'text-white'}`}>
              {team1}
            </div>
            <div className="text-fairway-500 text-xs mt-1">Derek · Brandon · Tyson · Todd</div>
          </div>

          {/* Divider */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-fairway-600 text-xl font-light">vs</div>
            <div className="text-fairway-600 text-xs">{totalPoints} pts</div>
          </div>

          {/* Team 2 */}
          <div className="flex-1 text-center">
            <div className="text-fairway-300 text-xs mb-1">Team 2</div>
            <div className={`font-display font-bold text-4xl ${team2 > team1 ? 'text-gold-400' : 'text-white'}`}>
              {team2}
            </div>
            <div className="text-fairway-500 text-xs mt-1">Gary · Slim · Mike · Ketan</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-fairway-700 rounded-full overflow-hidden">
          {totalPoints > 0 && (
            <div
              className="h-full bg-gradient-to-r from-fairway-400 to-gold-500 transition-all duration-700 rounded-full"
              style={{ width: `${(team1 / totalPoints) * 100}%` }}
            />
          )}
        </div>
        <div className="flex justify-between text-fairway-500 text-xs mt-1">
          <span>Team 1</span>
          <span>Team 2</span>
        </div>
      </div>

      {/* Per-round breakdown */}
      {loading ? (
        <div className="text-center text-fairway-500 py-8 animate-pulse">Loading scores…</div>
      ) : (
        <div>
          <div className="text-fairway-400 text-xs font-semibold uppercase tracking-widest mb-3">
            Match Results
          </div>
          {ROUNDS.map(round => (
            <RoundRow
              key={round.id}
              round={round}
              matchStatuses={matchStatuses}
            />
          ))}
        </div>
      )}
    </div>
  );
}
