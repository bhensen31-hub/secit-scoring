import { PLAYERS, TEAM1_PLAYERS, TEAM2_PLAYERS } from '../lib/tournament';
import { COURSE_HANDICAPS } from '../lib/scoring';

export default function TeamSelector({ onSelect }) {
  return (
    <div className="fixed inset-0 z-50 bg-fairway-950/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-gold-400 font-display text-3xl font-bold mb-1">SECIT VII</div>
          <div className="text-fairway-300 text-sm">Select your team to begin scoring</div>
        </div>

        <div className="space-y-4">
          {/* Team 1 */}
          <button
            onClick={() => onSelect(1)}
            className="w-full bg-fairway-800 hover:bg-fairway-700 border border-fairway-600 hover:border-gold-500
              rounded-2xl p-5 text-left transition-all duration-200 active:scale-98"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-gold-400 font-display font-bold text-lg">Team 1</span>
              <span className="bg-fairway-700 text-fairway-300 text-xs px-2 py-1 rounded-full">Enter Team 1 scores</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TEAM1_PLAYERS.map(id => (
                <div key={id} className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">{PLAYERS[id].name}</span>
                  <span className="text-fairway-400 text-xs">+{PLAYERS[id].handicapIndex} ({COURSE_HANDICAPS[id]})</span>
                </div>
              ))}
            </div>
          </button>

          {/* Team 2 */}
          <button
            onClick={() => onSelect(2)}
            className="w-full bg-rough-800 hover:bg-rough-700 border border-rough-700 hover:border-gold-500
              rounded-2xl p-5 text-left transition-all duration-200 active:scale-98"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-gold-400 font-display font-bold text-lg">Team 2</span>
              <span className="bg-rough-700 text-fairway-300 text-xs px-2 py-1 rounded-full">Enter Team 2 scores</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TEAM2_PLAYERS.map(id => (
                <div key={id} className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">{PLAYERS[id].name}</span>
                  <span className="text-fairway-400 text-xs">+{PLAYERS[id].handicapIndex} ({COURSE_HANDICAPS[id]})</span>
                </div>
              ))}
            </div>
          </button>

          {/* Spectator */}
          <button
            onClick={() => onSelect(null)}
            className="w-full bg-transparent hover:bg-fairway-800 border border-fairway-700 rounded-2xl
              p-3 text-center text-fairway-400 text-sm transition-all"
          >
            View-only (no score entry)
          </button>
        </div>

        <p className="text-center text-fairway-600 text-xs mt-6">
          You can change this anytime via the header
        </p>
      </div>
    </div>
  );
}
