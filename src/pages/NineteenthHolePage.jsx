import { useState } from 'react';
import { PLAYERS, TEAM1_PLAYERS, TEAM2_PLAYERS } from '../lib/tournament';
import { useDrinks } from '../hooks/useDrinks';

const PLAYER_KEY = 'secit_drink_player';
const ALL_PLAYERS = [...TEAM1_PLAYERS, ...TEAM2_PLAYERS];

export default function NineteenthHolePage() {
  const [myPlayer, setMyPlayer] = useState(() => localStorage.getItem(PLAYER_KEY));
  const { drinkCounts, loading, logDrink, isConnected } = useDrinks();

  const handleSelectPlayer = (id) => {
    setMyPlayer(id);
    localStorage.setItem(PLAYER_KEY, id);
  };

  const leaderboard = ALL_PLAYERS
    .map(id => ({ id, count: drinkCounts[id] || 0 }))
    .sort((a, b) => b.count - a.count || PLAYERS[a.id].name.localeCompare(PLAYERS[b.id].name));

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-6">

      {/* Header */}
      <div className="text-center">
        <div className="text-4xl mb-1">🍺</div>
        <div className="text-gold-400 font-display font-bold text-xl">19th Hole</div>
        <div className="text-fairway-400 text-xs mt-1 flex items-center justify-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-fairway-400 animate-pulse' : 'bg-fairway-700'}`} />
          {isConnected ? 'Live' : 'Connecting…'}
        </div>
      </div>

      {/* Who are you? selector */}
      <div className="bg-fairway-800 rounded-2xl p-4 border border-fairway-700">
        <div className="text-fairway-400 text-xs font-semibold uppercase tracking-widest mb-3">
          Who are you?
        </div>
        <div className="grid grid-cols-4 gap-2">
          {ALL_PLAYERS.map(id => (
            <button
              key={id}
              onClick={() => handleSelectPlayer(id)}
              className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all
                ${myPlayer === id
                  ? 'bg-gold-500 text-fairway-900 scale-105 shadow-lg'
                  : 'bg-fairway-700 text-fairway-300 hover:bg-fairway-600'
                }`}
            >
              {PLAYERS[id].name}
            </button>
          ))}
        </div>
        {myPlayer && (
          <div className="text-center text-fairway-400 text-xs mt-3">
            Logging as <span className="text-gold-400 font-semibold">{PLAYERS[myPlayer].name}</span>
            <button
              onClick={() => { setMyPlayer(null); localStorage.removeItem(PLAYER_KEY); }}
              className="ml-2 text-fairway-600 hover:text-fairway-400 underline"
            >
              change
            </button>
          </div>
        )}
        {!myPlayer && (
          <div className="text-center text-fairway-600 text-xs mt-3">
            Select your name to log drinks
          </div>
        )}
      </div>

      {/* Log drink grid */}
      <div>
        <div className="text-fairway-400 text-xs font-semibold uppercase tracking-widest mb-3">
          Log a Drink
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ALL_PLAYERS.map(id => {
            const isMe = myPlayer === id;
            const count = drinkCounts[id] || 0;
            const isTeam1 = PLAYERS[id].team === 1;

            return (
              <button
                key={id}
                onClick={() => isMe && logDrink(id)}
                disabled={!isMe}
                className={`rounded-xl p-4 flex items-center justify-between transition-all
                  ${isMe
                    ? isTeam1
                      ? 'bg-fairway-700 border-2 border-fairway-500 active:scale-95 hover:bg-fairway-600'
                      : 'bg-rough-800 border-2 border-rough-600 active:scale-95 hover:bg-rough-700'
                    : 'bg-fairway-900 border border-fairway-800 cursor-not-allowed'
                  }`}
              >
                <div className="text-left">
                  <div className={`font-semibold text-sm ${isMe ? 'text-white' : 'text-fairway-600'}`}>
                    {PLAYERS[id].name}
                  </div>
                  <div className="text-fairway-500 text-xs mt-0.5">
                    {count > 0 ? `${count} 🍺` : '–'}
                  </div>
                </div>
                <div className={`text-3xl font-bold leading-none transition-colors
                  ${isMe ? 'text-gold-400' : 'text-fairway-800'}`}>
                  +
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <div className="text-fairway-400 text-xs font-semibold uppercase tracking-widest mb-3">
          Drink Leaderboard
        </div>

        {loading ? (
          <div className="text-center text-fairway-500 py-6 animate-pulse">Loading…</div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, rank) => {
              const isTeam1 = PLAYERS[entry.id].team === 1;
              const isLeading = rank === 0 && entry.count > 0;

              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border
                    ${isTeam1
                      ? 'bg-fairway-800/60 border-fairway-700/50'
                      : 'bg-rough-900/60 border-rough-700/50'
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${isLeading ? 'bg-gold-500 text-fairway-900' : 'bg-fairway-700 text-fairway-400'}`}>
                    {rank + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-white font-medium">{PLAYERS[entry.id].name}</span>
                    <span className={`text-xs ml-2 ${isTeam1 ? 'text-fairway-500' : 'text-rough-400'}`}>
                      Team {PLAYERS[entry.id].team}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-lg">🍺</span>
                    <span className={`font-bold text-lg tabular-nums
                      ${isLeading ? 'text-gold-400' : 'text-fairway-300'}`}>
                      {entry.count}
                    </span>
                  </div>
                </div>
              );
            })}

            {leaderboard.every(e => e.count === 0) && (
              <div className="text-center text-fairway-600 py-4 text-sm">
                No drinks logged yet. Tap + to get started!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
