import { Link } from 'react-router-dom';
import { PLAYERS } from '../lib/tournament';
import { calculateMatchStatus, matchStatusLabel } from '../lib/scoring';

const FORMAT_ICONS = {
  best_ball: '⛳',
  modified_alternate_shot: '🏌️',
  scramble: '🔄',
  singles: '🥇',
};

export default function RoundCard({ round, allScores }) {
  const isWarmup = !round.countsForCup;

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
                +{round.matchups.length} pt{round.matchups.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="text-fairway-400 text-xs mt-0.5">{round.subtitle}</div>
        </div>
        {!isWarmup && <RoundScore round={round} allScores={allScores} />}
      </div>

      {/* Matchups */}
      <div className="divide-y divide-fairway-700/40">
        {round.matchups.map(matchup => {
          const scores = (allScores && allScores[matchup.id]) || {};
          const ms = calculateMatchStatus(scores, matchup, round);
          const teamNames = [
            matchup.team1Players.map(id => PLAYERS[id].name).join(' & '),
            matchup.team2Players.map(id => PLAYERS[id].name).join(' & '),
          ];
          const statusStr = matchStatusLabel(ms, teamNames);

          return (
            <Link
              key={matchup.id}
              to={`/matchup/${matchup.id}`}
              className="block px-4 py-3 hover:bg-fairway-700/30 active:bg-fairway-700/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-white text-sm font-medium leading-snug">{matchup.label}</div>
                  <div className="text-fairway-400 text-xs mt-0.5">{statusStr}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <HoleProgress holesPlayed={ms.holesPlayed} />
                  <span className="text-fairway-500 text-sm">›</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function HoleProgress({ holesPlayed }) {
  if (holesPlayed === 0) return null;
  if (holesPlayed === 18) {
    return <span className="text-gold-500 text-xs font-semibold">Final</span>;
  }
  return (
    <span className="text-fairway-500 text-xs">
      {holesPlayed}/18
    </span>
  );
}

function RoundScore({ round, allScores }) {
  let team1 = 0, team2 = 0;
  for (const matchup of round.matchups) {
    const scores = (allScores && allScores[matchup.id]) || {};
    const { matchResult } = calculateMatchStatus(scores, matchup, round);
    if (matchResult) {
      if (matchResult.winner === 1) team1++;
      else if (matchResult.winner === 2) team2++;
      else { team1 += 0.5; team2 += 0.5; }
    }
  }

  if (team1 === 0 && team2 === 0) return null;

  return (
    <div className="flex items-center gap-1 text-sm font-bold">
      <span className={team1 > team2 ? 'text-gold-400' : 'text-fairway-300'}>{team1}</span>
      <span className="text-fairway-600">–</span>
      <span className={team2 > team1 ? 'text-gold-400' : 'text-fairway-300'}>{team2}</span>
    </div>
  );
}
