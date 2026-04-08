import { useParams, Link } from 'react-router-dom';
import { getMatchup, PLAYERS } from '../lib/tournament';
import { useScores } from '../hooks/useScores';
import ScorecardView from '../components/ScorecardView';

export default function MatchupPage({ myTeam }) {
  const { matchupId } = useParams();
  const result = getMatchup(matchupId);
  const { scores, loading, error, upsertScore, isConnected } = useScores(matchupId);

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-fairway-400 text-lg mb-4">Matchup not found</div>
        <Link to="/" className="text-gold-400 underline">← Back to home</Link>
      </div>
    );
  }

  const { matchup, round } = result;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <Link to="/" className="text-fairway-400 hover:text-fairway-200">Home</Link>
        <span className="text-fairway-700">›</span>
        <span className="text-fairway-300">{round.name}</span>
        <span className="text-fairway-700">›</span>
        <span className="text-white truncate">{matchup.shortLabel}</span>
      </div>

      {/* Connection indicator */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-white font-display font-bold text-lg leading-tight">
            {matchup.label}
          </h1>
          <div className="text-fairway-400 text-xs mt-0.5">{round.subtitle}</div>
        </div>
        <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full
          ${isConnected ? 'bg-fairway-700/50 text-fairway-300' : 'bg-rough-800/50 text-fairway-500'}
        `}>
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-fairway-400 animate-pulse' : 'bg-fairway-700'}`} />
          {isConnected ? 'Live' : 'Connecting…'}
        </div>
      </div>

      {/* Format info */}
      <FormatInfo round={round} matchup={matchup} myTeam={myTeam} />

      {/* Scorecard */}
      {loading ? (
        <div className="text-center text-fairway-500 py-12 animate-pulse">Loading scores…</div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-400 text-sm">
          Error: {error}
        </div>
      ) : (
        <ScorecardView
          matchup={matchup}
          round={round}
          scores={scores}
          upsertScore={upsertScore}
          myTeam={myTeam}
        />
      )}
    </div>
  );
}

function FormatInfo({ round, matchup, myTeam }) {
  const canEnter = myTeam !== null;
  const myPlayers = myTeam === 1 ? matchup.team1Players : matchup.team2Players;

  return (
    <div className="bg-fairway-900 border border-fairway-700/50 rounded-xl p-3 mb-4 text-xs text-fairway-400 leading-relaxed">
      <span className="text-fairway-300 font-medium">{round.description}</span>
      {canEnter && (
        <span className="ml-2 text-gold-500">
          · You're entering scores for {myPlayers.map(id => PLAYERS[id].name).join(' & ')}.
        </span>
      )}
      {!canEnter && <span className="ml-2 text-fairway-600">· View-only mode.</span>}
    </div>
  );
}
