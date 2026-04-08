import { Link } from 'react-router-dom';
import { ROUNDS, PLAYERS } from '../lib/tournament';
import {
  calculateMatchStatus,
  matchStatusLabel,
  matchPoints,
  cupStandings,
  calculateCashGameStandings,
} from '../lib/scoring';
import { useAllScores } from '../hooks/useScores';

// ─── Cup Round Row ────────────────────────────────────────────────────────────
function CupRoundRow({ round, matchStatuses }) {
  const isSingles = round.id === 'singles';

  // For singles, group matchups by nineLabel
  const groups = isSingles
    ? [
        { label: 'Front 9', matchups: round.matchups.filter(m => m.nineLabel === 'Front 9') },
        { label: 'Back 9',  matchups: round.matchups.filter(m => m.nineLabel === 'Back 9') },
      ]
    : [{ label: null, matchups: round.matchups }];

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-gold-700/30 text-gold-400 text-xs font-semibold px-2 py-0.5 rounded-full">
          Match {round.number}
        </span>
        <span className="text-fairway-300 text-sm font-medium">{round.subtitle}</span>
      </div>

      {groups.map(group => (
        <div key={group.label ?? 'all'} className="space-y-2 mb-2">
          {group.label && (
            <div className="text-fairway-500 text-xs font-semibold uppercase tracking-wide pl-1">
              {group.label}
            </div>
          )}
          {group.matchups.map(matchup => {
            const ms = matchStatuses[matchup.id];
            if (!ms) return null;
            const pts = matchPoints(ms.matchResult, ms.holeResults);
            const { holesPlayed, matchResult } = ms;

            const t1Name = matchup.team1Players.map(id => PLAYERS[id].name).join('/');
            const t2Name = matchup.team2Players.map(id => PLAYERS[id].name).join('/');
            const statusStr = matchStatusLabel(ms, [t1Name, t2Name]);

            return (
              <Link
                key={matchup.id}
                to={`/matchup/${matchup.id}`}
                className="block bg-fairway-800/60 rounded-xl p-3 border border-fairway-700/50
                  hover:border-fairway-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm font-medium truncate">{matchup.shortLabel}</div>
                    <div className="text-fairway-500 text-xs mt-0.5 truncate">{statusStr}</div>
                  </div>
                  <PointsBadge pts={pts} holesPlayed={holesPlayed} matchResult={matchResult} />
                </div>

                {/* Hole pts progress */}
                {holesPlayed > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className={`font-semibold ${pts.team1 > pts.team2 ? 'text-fairway-200' : 'text-fairway-400'}`}>
                      T1 {pts.team1} pts
                    </span>
                    <span className="text-fairway-700 flex-1 text-center">·</span>
                    <span className={`font-semibold ${pts.team2 > pts.team1 ? 'text-gold-300' : 'text-fairway-400'}`}>
                      {pts.team2} pts T2
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function PointsBadge({ pts, holesPlayed, matchResult }) {
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
        T{matchResult.winner} wins
      </span>
    );
  }
  return null;
}

// ─── Cash Game Standings Row ──────────────────────────────────────────────────
function CashGameRow({ round, allScores }) {
  const standings = calculateCashGameStandings(allScores, round);
  const maxPts = Math.max(...standings.map(s => s.points), 1);
  const holesPlayed = standings[0]?.holeDetails?.filter(h => h.pts !== null).length ?? 0;

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-fairway-800 text-fairway-400 text-xs font-semibold px-2 py-0.5 rounded-full">
          Warm-Up
        </span>
        <span className="text-fairway-300 text-sm font-medium">Cash Game Standings</span>
        {holesPlayed > 0 && (
          <span className="text-fairway-600 text-xs">thru {holesPlayed}</span>
        )}
      </div>
      <div className="space-y-2">
        {standings.map((pair, rank) => (
          <Link
            key={pair.matchupId}
            to={`/matchup/${pair.matchupId}`}
            className="block bg-fairway-800/60 rounded-xl p-3 border border-fairway-700/50
              hover:border-fairway-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                ${rank === 0 ? 'bg-gold-500 text-fairway-900' : 'bg-fairway-700 text-fairway-400'}`}>
                {rank + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white text-sm font-medium truncate">{pair.label}</span>
                  <span className={`font-bold text-sm flex-shrink-0
                    ${rank === 0 ? 'text-gold-400' : 'text-fairway-300'}`}>
                    {pair.points % 1 === 0 ? pair.points : pair.points.toFixed(1)} pts
                  </span>
                </div>
                {pair.points > 0 && (
                  <div className="mt-1 h-1 bg-fairway-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-fairway-500 to-gold-500 rounded-full transition-all duration-500"
                      style={{ width: `${(pair.points / (maxPts || 1)) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
        {standings.every(s => s.points === 0) && (
          <div className="text-fairway-600 text-sm text-center py-2">No scores entered yet</div>
        )}
      </div>
    </div>
  );
}

// ─── Main Leaderboard ─────────────────────────────────────────────────────────
export default function Leaderboard() {
  const { allScores, loading } = useAllScores();

  // Compute match statuses for all Cup matchups
  const matchStatuses = {};
  for (const round of ROUNDS) {
    if (!round.countsForCup) continue;
    for (const matchup of round.matchups) {
      const scores = allScores[matchup.id] || {};
      matchStatuses[matchup.id] = calculateMatchStatus(scores, matchup, round);
    }
  }

  // Cup standings: sum hole points + match bonuses
  const cupRounds = ROUNDS.filter(r => r.countsForCup);
  const cupMatchStatuses = cupRounds.flatMap(r =>
    r.matchups.map(m => matchStatuses[m.id] ?? { matchResult: null, holeResults: [] })
  );
  const { team1, team2 } = cupStandings(cupMatchStatuses);
  const totalPlayed = team1 + team2;

  const warmupRound = ROUNDS.find(r => r.id === 'warmup');

  return (
    <div className="space-y-6">
      {/* ── Cup Banner ── */}
      <div className="bg-gradient-to-br from-fairway-800 to-fairway-900 rounded-2xl p-5 border border-gold-600/30 shadow-xl">
        <div className="text-center text-gold-400 font-display text-xs font-semibold uppercase tracking-widest mb-4">
          SECIT Cup — Live Standings
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <div className="text-fairway-300 text-xs mb-1">Team 1</div>
            <div className={`font-display font-bold text-4xl tabular-nums
              ${team1 > team2 ? 'text-gold-400' : 'text-white'}`}>
              {team1 % 1 === 0 ? team1 : team1.toFixed(1)}
            </div>
            <div className="text-fairway-500 text-xs mt-1">Derek · Brandon · Tyson · Todd</div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="text-fairway-600 text-xl font-light">vs</div>
            <div className="text-fairway-700 text-xs">
              {totalPlayed > 0 ? `${totalPlayed % 1 === 0 ? totalPlayed : totalPlayed.toFixed(1)} pts played` : 'no scores yet'}
            </div>
          </div>

          <div className="flex-1 text-center">
            <div className="text-fairway-300 text-xs mb-1">Team 2</div>
            <div className={`font-display font-bold text-4xl tabular-nums
              ${team2 > team1 ? 'text-gold-400' : 'text-white'}`}>
              {team2 % 1 === 0 ? team2 : team2.toFixed(1)}
            </div>
            <div className="text-fairway-500 text-xs mt-1">Gary · Slim · Mike · Ketan</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-fairway-700 rounded-full overflow-hidden">
          {totalPlayed > 0 && (
            <div
              className="h-full bg-gradient-to-r from-fairway-400 to-gold-500 transition-all duration-700 rounded-full"
              style={{ width: `${(team1 / totalPlayed) * 100}%` }}
            />
          )}
        </div>
        <div className="flex justify-between text-fairway-600 text-xs mt-1">
          <span>Team 1</span>
          <span className="text-fairway-700 text-xs">1 pt/hole won · +1 match bonus</span>
          <span>Team 2</span>
        </div>
      </div>

      {/* ── Match breakdown ── */}
      {loading ? (
        <div className="text-center text-fairway-500 py-8 animate-pulse">Loading scores…</div>
      ) : (
        <div>
          <div className="text-fairway-400 text-xs font-semibold uppercase tracking-widest mb-3">
            Round Results
          </div>

          {/* Warm-Up Cash Game */}
          {warmupRound && (
            <CashGameRow round={warmupRound} allScores={allScores} />
          )}

          {/* Cup Rounds */}
          {cupRounds.map(round => (
            <CupRoundRow
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
