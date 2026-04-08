import { Link } from 'react-router-dom';
import { PLAYERS } from '../lib/tournament';
import {
  calculateMatchStatus,
  matchStatusLabel,
  matchPoints,
  calculateCashGameStandings,
  calculateCashGamePairScorecard,
} from '../lib/scoring';

function formatToPar(val) {
  if (val === null || val === undefined) return '–';
  if (val === 0) return 'E';
  return val > 0 ? `+${val}` : `${val}`;
}

function toParColor(val) {
  if (val === null || val === undefined) return 'text-fairway-500';
  if (val < 0) return 'text-red-400';
  if (val === 0) return 'text-white';
  return 'text-fairway-500';
}

const FORMAT_ICONS = {
  cash_game: '💰',
  best_ball: '⛳',
  modified_alternate_shot: '🏌️',
  scramble: '🔄',
  singles: '🥇',
};

export default function RoundCard({ round, allScores }) {
  const isWarmup = round.format === 'cash_game';
  const isSingles = round.id === 'singles';

  return (
    <div className={`rounded-2xl border overflow-hidden
      ${isWarmup ? 'border-fairway-700 bg-fairway-900/50' : 'border-fairway-600 bg-fairway-800/80'}
    `}>
      {/* Round header */}
      <div className={`px-4 py-3 flex items-center justify-between
        ${isWarmup ? 'bg-fairway-800/50' : 'bg-fairway-700/60'}
      `}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{FORMAT_ICONS[round.format]}</span>
            <span className="text-white font-display font-semibold">{round.name}</span>
            {round.countsForCup && (
              <span className="bg-gold-700/30 text-gold-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                Cup
              </span>
            )}
          </div>
          <div className="text-fairway-400 text-xs mt-0.5">{round.subtitle}</div>
        </div>
        {!isWarmup && <RoundScore round={round} allScores={allScores} />}
      </div>

      {/* Body */}
      {isWarmup
        ? <CashGameBody round={round} allScores={allScores} />
        : isSingles
          ? <SinglesBody round={round} allScores={allScores} />
          : <MatchupList round={round} allScores={allScores} />
      }
    </div>
  );
}

// ─── Cash Game Body ───────────────────────────────────────────────────────────
function CashGameBody({ round, allScores }) {
  const standings = calculateCashGameStandings(allScores || {}, round);

  return (
    <div className="divide-y divide-fairway-700/40">
      {standings.map((pair, rank) => {
        const matchup = round.matchups.find(m => m.id === pair.matchupId);
        const pairScores = (allScores || {})[pair.matchupId] || {};
        const pairData = matchup ? calculateCashGamePairScorecard(pairScores, matchup) : null;
        const { holesScored = 0, runningTotal = 0, holeResults = [] } = pairData || {};
        const scoredHoles = holeResults.filter(r => r.scoreToPar !== null);

        return (
          <Link
            key={pair.matchupId}
            to={`/matchup/${pair.matchupId}`}
            className="block px-4 py-3 hover:bg-fairway-700/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${rank === 0 && pair.points > 0 ? 'bg-gold-500 text-fairway-900' : 'bg-fairway-700 text-fairway-400'}`}>
                {rank + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white text-sm font-medium">{pair.label}</span>
                  {holesScored > 0 && (
                    <span className={`font-bold text-base font-display flex-shrink-0 ${toParColor(runningTotal)}`}>
                      {formatToPar(runningTotal)}
                    </span>
                  )}
                </div>
                <div className="text-fairway-500 text-xs mt-0.5">
                  {holesScored > 0
                    ? `${pair.points % 1 === 0 ? pair.points : pair.points.toFixed(1)} pts · thru ${holesScored}`
                    : 'Not started'}
                </div>
                {/* Per-hole score-to-par strip */}
                {scoredHoles.length > 0 && (
                  <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 mt-1.5">
                    {scoredHoles.map(r => (
                      <span key={r.hole} className="text-xs tabular-nums">
                        <span className="text-fairway-600">{r.hole}:</span>
                        <span className={`font-semibold ml-0.5 ${toParColor(r.scoreToPar)}`}>
                          {formatToPar(r.scoreToPar)}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-fairway-500 text-sm flex-shrink-0">›</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Singles Body (grouped by nine) ──────────────────────────────────────────
function SinglesBody({ round, allScores }) {
  const frontNine = round.matchups.filter(m => m.holeRange?.end === 9);
  const backNine  = round.matchups.filter(m => m.holeRange?.start === 10);

  return (
    <div>
      <NineGroup label="Front 9 (Holes 1–9)" matchups={frontNine} round={round} allScores={allScores} />
      <div className="border-t-2 border-fairway-700" />
      <NineGroup label="Back 9 (Holes 10–18)" matchups={backNine} round={round} allScores={allScores} />
    </div>
  );
}

function NineGroup({ label, matchups, round, allScores }) {
  return (
    <div>
      <div className="px-4 py-1.5 bg-fairway-900/40">
        <span className="text-fairway-500 text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <div className="divide-y divide-fairway-700/40">
        {matchups.map(matchup => (
          <MatchupRow key={matchup.id} matchup={matchup} round={round} allScores={allScores} />
        ))}
      </div>
    </div>
  );
}

// ─── Standard matchup list ────────────────────────────────────────────────────
function MatchupList({ round, allScores }) {
  return (
    <div className="divide-y divide-fairway-700/40">
      {round.matchups.map(matchup => (
        <MatchupRow key={matchup.id} matchup={matchup} round={round} allScores={allScores} />
      ))}
    </div>
  );
}

function MatchupRow({ matchup, round, allScores }) {
  const scores = (allScores && allScores[matchup.id]) || {};
  const ms = calculateMatchStatus(scores, matchup, round);
  const pts = matchPoints(ms.matchResult, ms.holeResults);
  const { holesPlayed } = ms;

  const t1Name = matchup.team1Players.map(id => PLAYERS[id].name).join(' & ');
  const t2Name = matchup.team2Players.map(id => PLAYERS[id].name).join(' & ');
  const statusStr = matchStatusLabel(ms, [t1Name, t2Name]);

  return (
    <Link
      to={`/matchup/${matchup.id}`}
      className="block px-4 py-3 hover:bg-fairway-700/30 active:bg-fairway-700/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-white text-sm font-medium leading-snug">{matchup.shortLabel}</div>
          <div className="text-fairway-400 text-xs mt-0.5">{statusStr}</div>
          {holesPlayed > 0 && (
            <div className="text-fairway-600 text-xs mt-0.5">
              T1 {pts.team1 % 1 === 0 ? pts.team1 : pts.team1.toFixed(1)} — T2 {pts.team2 % 1 === 0 ? pts.team2 : pts.team2.toFixed(1)} pts
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
          <HoleProgress holesPlayed={holesPlayed} totalHoles={ms.totalHoles} />
          <span className="text-fairway-500 text-sm">›</span>
        </div>
      </div>
    </Link>
  );
}

function HoleProgress({ holesPlayed, totalHoles }) {
  if (holesPlayed === 0) return null;
  if (holesPlayed === totalHoles) {
    return <span className="text-gold-500 text-xs font-semibold">Final</span>;
  }
  return <span className="text-fairway-500 text-xs">{holesPlayed}/{totalHoles}</span>;
}

function RoundScore({ round, allScores }) {
  let team1 = 0, team2 = 0;
  for (const matchup of round.matchups) {
    const scores = (allScores && allScores[matchup.id]) || {};
    const ms = calculateMatchStatus(scores, matchup, round);
    const pts = matchPoints(ms.matchResult, ms.holeResults);
    team1 += pts.team1;
    team2 += pts.team2;
  }
  if (team1 === 0 && team2 === 0) return null;

  const fmt = n => n % 1 === 0 ? n : n.toFixed(1);
  return (
    <div className="flex items-center gap-1 text-sm font-bold">
      <span className={team1 > team2 ? 'text-gold-400' : 'text-fairway-300'}>{fmt(team1)}</span>
      <span className="text-fairway-600">–</span>
      <span className={team2 > team1 ? 'text-gold-400' : 'text-fairway-300'}>{fmt(team2)}</span>
    </div>
  );
}
