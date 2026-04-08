import { Link } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard';
import RoundCard from '../components/RoundCard';
import { ROUNDS } from '../lib/tournament';
import { useAllScores } from '../hooks/useScores';
import { COURSE_HANDICAPS } from '../lib/scoring';
import { PLAYERS, TEAM1_PLAYERS, TEAM2_PLAYERS } from '../lib/tournament';

export default function HomePage() {
  const { allScores, loading } = useAllScores();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      {/* Cup leaderboard */}
      <Leaderboard />

      {/* Rounds */}
      <div>
        <div className="text-fairway-400 text-xs font-semibold uppercase tracking-widest mb-3">
          All Rounds
        </div>
        <div className="space-y-4">
          {ROUNDS.map(round => (
            <RoundCard key={round.id} round={round} allScores={allScores} />
          ))}
        </div>
      </div>

      {/* Handicap reference */}
      <div>
        <div className="text-fairway-400 text-xs font-semibold uppercase tracking-widest mb-3">
          Player Handicaps
        </div>
        <div className="grid grid-cols-2 gap-3">
          <HandicapCard title="Team 1" playerIds={TEAM1_PLAYERS} />
          <HandicapCard title="Team 2" playerIds={TEAM2_PLAYERS} />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-fairway-700 text-xs pb-4">
        SECIT VII · Golf Cup · Real-time scoring powered by Supabase
      </div>
    </div>
  );
}

function HandicapCard({ title, playerIds }) {
  const isTeam1 = title === 'Team 1';
  return (
    <div className={`rounded-xl border p-3
      ${isTeam1 ? 'border-fairway-600 bg-fairway-800/50' : 'border-rough-700 bg-rough-900/50'}
    `}>
      <div className="text-gold-400 text-xs font-semibold mb-2">{title}</div>
      {playerIds.map(id => (
        <div key={id} className="flex items-center justify-between py-0.5">
          <span className="text-fairway-200 text-sm">{PLAYERS[id].name}</span>
          <div className="text-right">
            <span className="text-fairway-400 text-xs">+{PLAYERS[id].handicapIndex}</span>
            <span className="text-fairway-600 text-xs ml-1">({COURSE_HANDICAPS[id]}CH)</span>
          </div>
        </div>
      ))}
    </div>
  );
}
