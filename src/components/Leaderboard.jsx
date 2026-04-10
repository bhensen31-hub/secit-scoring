import { ROUNDS } from '../lib/tournament';
import {
  calculateMatchStatus,
  cupStandings,
} from '../lib/scoring';
import { useAllScores } from '../hooks/useScores';

const WIN_THRESHOLD = 97.5;

// ─── Points Dial ──────────────────────────────────────────────────────────────
function PointsDial({ points, color }) {
  const r = 28;
  const cx = 36;
  const cy = 36;
  const C = 2 * Math.PI * r;
  const trackLen = 0.75 * C;   // 270° arc
  const gapLen   = 0.25 * C;
  const fillLen  = Math.min(points / WIN_THRESHOLD, 1) * trackLen;
  const rotation = `rotate(135, ${cx}, ${cy})`;

  return (
    <svg width="72" height="80" viewBox="0 0 72 80" aria-hidden="true">
      {/* Dimmed track */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeOpacity="0.18"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${trackLen} ${gapLen}`}
        transform={rotation}
      />
      {/* Filled arc */}
      {fillLen > 0.5 && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${fillLen} ${C - fillLen}`}
          transform={rotation}
        />
      )}
      {/* Threshold label */}
      <text x={cx} y="77" textAnchor="middle" fontSize="11" fontWeight="600" fill="#9ca3af">97.5</text>
    </svg>
  );
}

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
            <div className="flex justify-center mt-2">
              <PointsDial points={team1} color="#60a5fa" />
            </div>
            {team1 >= WIN_THRESHOLD && (
              <div className="text-gold-400 text-xs font-bold mt-1 tracking-wide">🏆 CHAMPION</div>
            )}
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
            <div className="flex justify-center mt-2">
              <PointsDial points={team2} color="#f87171" />
            </div>
            {team2 >= WIN_THRESHOLD && (
              <div className="text-gold-400 text-xs font-bold mt-1 tracking-wide">🏆 CHAMPION</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
