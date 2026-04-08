import { ROUNDS } from '../lib/tournament';
import {
  calculateMatchStatus,
  cupStandings,
} from '../lib/scoring';
import { useAllScores } from '../hooks/useScores';

// ─── Main Leaderboard ─────────────────────────────────────────────────────────
export default function Leaderboard() {
  const { allScores } = useAllScores();

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

  return (
    <div>
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
    </div>
  );
}
