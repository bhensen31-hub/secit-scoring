import { useState, useRef } from 'react';
import { PLAYERS, COURSE, teamScoreKey } from '../lib/tournament';
import {
  courseHandicap,
  strokesOnHole,
  netScore,
  teamNetScore,
  teamHandicap,
  calculateMatchStatus,
  matchStatusLabel,
  COURSE_HANDICAPS,
} from '../lib/scoring';

// ─── Hole Indicator Strip ────────────────────────────────────────────────────
function HoleStrip({ currentHole, onSelectHole, holeResults }) {
  const stripRef = useRef(null);

  const getHoleColor = (hole) => {
    const r = holeResults[hole - 1];
    if (!r || r.holeWinner === null) return 'bg-fairway-700 text-fairway-400';
    if (r.holeWinner === 0) return 'bg-fairway-600 text-fairway-200';
    if (r.holeWinner === 1) return 'bg-fairway-500 text-white';
    return 'bg-rough-700 text-gold-300';
  };

  return (
    <div ref={stripRef} className="flex gap-1.5 overflow-x-auto py-2 px-1 scrollbar-hide">
      {Array.from({ length: 18 }, (_, i) => i + 1).map(hole => (
        <button
          key={hole}
          onClick={() => onSelectHole(hole)}
          className={`
            flex-shrink-0 w-9 h-9 rounded-full text-xs font-bold transition-all
            ${getHoleColor(hole)}
            ${currentHole === hole ? 'ring-2 ring-gold-400 scale-110' : 'hover:scale-105'}
          `}
        >
          {hole}
        </button>
      ))}
    </div>
  );
}

// ─── Score Input for a single player/hole ────────────────────────────────────
function ScoreInput({ playerId, holeNumber, grossScore, netSc, canEdit, onSave, format, playerLabel }) {
  const [editing, setEditing] = useState(false);
  const [localVal, setLocalVal] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
  const par = COURSE.pars[holeNumber - 1];

  const handleTap = () => {
    if (!canEdit) return;
    setLocalVal(grossScore ? String(grossScore) : '');
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 50);
  };

  const handleSave = async () => {
    const val = parseInt(localVal, 10);
    if (isNaN(val) || val < 1 || val > 20) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await onSave(val);
    setSaving(false);
    setEditing(false);
  };

  const scoreColor = (gross) => {
    if (!gross) return 'text-fairway-500';
    const diff = gross - par;
    if (diff <= -2) return 'text-yellow-300'; // eagle or better
    if (diff === -1) return 'text-fairway-300'; // birdie
    if (diff === 0) return 'text-white'; // par
    if (diff === 1) return 'text-orange-400'; // bogey
    return 'text-red-400'; // double+
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-fairway-700/40 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-full bg-fairway-700 flex items-center justify-center flex-shrink-0">
          <span className="text-fairway-300 text-xs font-semibold">
            {PLAYERS[playerId]?.name?.[0] ?? '?'}
          </span>
        </div>
        <span className="text-fairway-200 text-sm truncate">{playerLabel}</span>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Net score chip */}
        {netSc !== null && (
          <span className="text-fairway-500 text-xs">
            Net <span className="text-fairway-300 font-medium">{netSc}</span>
          </span>
        )}

        {/* Gross score tap target */}
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              min="1"
              max="20"
              value={localVal}
              onChange={e => setLocalVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
              className="w-14 text-center bg-fairway-700 border border-gold-500 text-white text-lg
                rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-gold-400"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gold-600 hover:bg-gold-500 text-fairway-900 font-bold text-sm
                px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? '…' : '✓'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-fairway-500 text-sm px-1"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={handleTap}
            className={`
              w-12 h-10 rounded-xl text-xl font-bold transition-all
              ${canEdit ? 'active:scale-95 hover:bg-fairway-600' : ''}
              ${grossScore
                ? `${scoreColor(grossScore)} bg-fairway-700`
                : canEdit
                  ? 'bg-fairway-700 border-2 border-dashed border-fairway-600 text-fairway-600'
                  : 'bg-fairway-800 text-fairway-700'
              }
            `}
          >
            {grossScore || (canEdit ? '+' : '–')}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Scorecard View ─────────────────────────────────────────────────────
export default function ScorecardView({ matchup, round, scores, upsertScore, myTeam }) {
  const [currentHole, setCurrentHole] = useState(1);

  const matchStatus = calculateMatchStatus(scores, matchup, round);
  const { holeResults, holesPlayed, holesRemaining } = matchStatus;

  const par = COURSE.pars[currentHole - 1];
  const si = COURSE.strokeIndex[currentHole - 1];

  const isTeamFormat = round.format === 'scramble' || round.format === 'modified_alternate_shot';

  const canEnterTeam1 = myTeam === 1;
  const canEnterTeam2 = myTeam === 2;

  // Get current hole result for display
  const currentResult = holeResults[currentHole - 1];

  const team1Name = matchup.team1Players.map(id => PLAYERS[id].name).join(' & ');
  const team2Name = matchup.team2Players.map(id => PLAYERS[id].name).join(' & ');

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Match status bar */}
      <div className="bg-fairway-800 rounded-xl p-3 border border-fairway-700">
        <div className="text-center">
          <div className="text-xs text-fairway-400 mb-1">{round.name} · {round.subtitle}</div>
          <div className="text-white font-semibold text-sm">
            {matchStatusLabel(matchStatus, [team1Name, team2Name])}
          </div>
          {holesPlayed > 0 && holesPlayed < 18 && (
            <div className="text-fairway-500 text-xs mt-1">{holesRemaining} holes remaining</div>
          )}
        </div>
      </div>

      {/* Hole selector */}
      <div className="bg-fairway-800 rounded-xl border border-fairway-700 overflow-hidden">
        <div className="px-3 pt-3 pb-1">
          <HoleStrip
            currentHole={currentHole}
            onSelectHole={setCurrentHole}
            holeResults={holeResults}
          />
        </div>

        {/* Hole info */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-fairway-700/50 bg-fairway-900/30">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-gold-400 font-display font-bold text-2xl leading-none">{currentHole}</div>
              <div className="text-fairway-500 text-xs">Hole</div>
            </div>
            <div className="w-px h-8 bg-fairway-700" />
            <div className="text-center">
              <div className="text-white font-bold text-lg leading-none">{par}</div>
              <div className="text-fairway-500 text-xs">Par</div>
            </div>
            <div className="text-center">
              <div className="text-fairway-300 font-medium text-lg leading-none">{si}</div>
              <div className="text-fairway-500 text-xs">SI</div>
            </div>
          </div>

          {/* Hole result */}
          {currentResult?.holeWinner !== null && currentResult?.holeWinner !== undefined && (
            <div className={`px-3 py-1 rounded-full text-xs font-bold
              ${currentResult.holeWinner === 0 ? 'bg-fairway-700 text-fairway-300'
                : currentResult.holeWinner === 1 ? 'bg-fairway-600 text-white'
                : 'bg-rough-700 text-gold-300'}
            `}>
              {currentResult.holeWinner === 0 ? 'Halved'
                : currentResult.holeWinner === 1 ? `${team1Name.split(' ')[0]} wins`
                : `${team2Name.split(' ')[0]} wins`}
            </div>
          )}
        </div>
      </div>

      {/* Score entry panels */}
      <div className="grid grid-cols-1 gap-3">
        {/* Team 1 */}
        <TeamScorePanel
          title="Team 1"
          players={matchup.team1Players}
          isTeamFormat={isTeamFormat}
          round={round}
          holeNumber={currentHole}
          scores={scores}
          canEdit={canEnterTeam1}
          onSave={upsertScore}
        />

        {/* Team 2 */}
        <TeamScorePanel
          title="Team 2"
          players={matchup.team2Players}
          isTeamFormat={isTeamFormat}
          round={round}
          holeNumber={currentHole}
          scores={scores}
          canEdit={canEnterTeam2}
          onSave={upsertScore}
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrentHole(h => Math.max(1, h - 1))}
          disabled={currentHole === 1}
          className="flex-1 bg-fairway-800 hover:bg-fairway-700 border border-fairway-700
            text-fairway-300 font-semibold py-3 rounded-xl disabled:opacity-30 transition-colors"
        >
          ← Hole {currentHole - 1 || '–'}
        </button>
        <button
          onClick={() => setCurrentHole(h => Math.min(18, h + 1))}
          disabled={currentHole === 18}
          className="flex-1 bg-fairway-700 hover:bg-fairway-600 border border-fairway-600
            text-white font-semibold py-3 rounded-xl disabled:opacity-30 transition-colors"
        >
          Hole {currentHole + 1 > 18 ? '–' : currentHole + 1} →
        </button>
      </div>

      {/* Scorecard summary table */}
      <ScorecardTable holeResults={holeResults} matchup={matchup} round={round} />
    </div>
  );
}

// ─── Team Score Panel ────────────────────────────────────────────────────────
function TeamScorePanel({ title, players, isTeamFormat, round, holeNumber, scores, canEdit, onSave }) {
  const isTeam1 = title === 'Team 1';

  if (isTeamFormat) {
    // Single entry per team
    const keyPlayer = teamScoreKey(players);
    const gross = scores[`${keyPlayer}-${holeNumber}`] || null;
    const thcp = teamHandicap(players, round.format);
    const si = COURSE.strokeIndex[holeNumber - 1];
    const strokes = strokesOnHole(thcp, si);
    const net = gross ? gross - strokes : null;
    const playerLabel = players.map(id => PLAYERS[id].name).join(' & ');
    const hcpLabel = round.format === 'scramble'
      ? `Scramble HCP ${thcp}`
      : `Alt Shot HCP ${thcp}`;

    return (
      <div className={`rounded-xl border overflow-hidden
        ${isTeam1 ? 'border-fairway-600' : 'border-rough-700'}
        ${!canEdit ? 'opacity-80' : ''}
      `}>
        <div className={`px-3 py-2 flex items-center justify-between
          ${isTeam1 ? 'bg-fairway-700/60' : 'bg-rough-800/60'}
        `}>
          <span className="text-gold-400 text-xs font-semibold">{title}</span>
          <span className="text-fairway-500 text-xs">{hcpLabel} · {strokes > 0 ? `−${strokes}` : 'no stroke'}</span>
        </div>
        <div className={`px-3 py-2 ${isTeam1 ? 'bg-fairway-800/40' : 'bg-rough-900/40'}`}>
          <ScoreInput
            playerId={keyPlayer}
            holeNumber={holeNumber}
            grossScore={gross}
            netSc={net}
            canEdit={canEdit}
            onSave={(val) => onSave(keyPlayer, holeNumber, val)}
            format={round.format}
            playerLabel={playerLabel}
          />
        </div>
      </div>
    );
  }

  // Individual scores per player (best ball / singles)
  return (
    <div className={`rounded-xl border overflow-hidden
      ${isTeam1 ? 'border-fairway-600' : 'border-rough-700'}
      ${!canEdit ? 'opacity-80' : ''}
    `}>
      <div className={`px-3 py-2 flex items-center justify-between
        ${isTeam1 ? 'bg-fairway-700/60' : 'bg-rough-800/60'}
      `}>
        <span className="text-gold-400 text-xs font-semibold">{title}</span>
        {!canEdit && <span className="text-fairway-600 text-xs">View only</span>}
      </div>
      <div className={`px-3 py-1 ${isTeam1 ? 'bg-fairway-800/40' : 'bg-rough-900/40'}`}>
        {players.map(pid => {
          const gross = scores[`${pid}-${holeNumber}`] || null;
          const net = netScore(gross, pid, holeNumber);
          const hcp = COURSE_HANDICAPS[pid];
          const si = COURSE.strokeIndex[holeNumber - 1];
          const strokes = strokesOnHole(hcp, si);
          const label = `${PLAYERS[pid].name} (CH ${hcp}${strokes > 0 ? `, −${strokes}` : ''})`;
          return (
            <ScoreInput
              key={pid}
              playerId={pid}
              holeNumber={holeNumber}
              grossScore={gross}
              netSc={net}
              canEdit={canEdit}
              onSave={(val) => onSave(pid, holeNumber, val)}
              format={round.format}
              playerLabel={label}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Summary Table ───────────────────────────────────────────────────────────
function ScorecardTable({ holeResults, matchup, round }) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <button
        onClick={() => setShow(s => !s)}
        className="w-full text-fairway-400 text-sm py-2 flex items-center justify-center gap-2"
      >
        <span>{show ? '▲ Hide' : '▼ Show'} full scorecard</span>
      </button>

      {show && (
        <div className="overflow-x-auto rounded-xl border border-fairway-700 bg-fairway-900/60 animate-fade-in">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-fairway-700">
                <th className="text-fairway-400 font-medium px-2 py-2 text-left sticky left-0 bg-fairway-900/90 w-8">H</th>
                <th className="text-fairway-400 font-medium px-2 py-2">Par</th>
                <th className="text-fairway-400 font-medium px-2 py-2">SI</th>
                <th className="text-fairway-300 font-medium px-2 py-2">T1 Net</th>
                <th className="text-fairway-300 font-medium px-2 py-2">T2 Net</th>
                <th className="text-fairway-400 font-medium px-2 py-2">Result</th>
                <th className="text-fairway-400 font-medium px-2 py-2">+/-</th>
              </tr>
            </thead>
            <tbody>
              {holeResults.map((r, i) => {
                const isFront = i < 9;
                return (
                  <tr key={r.hole}
                    className={`border-b border-fairway-800
                      ${i === 8 ? 'border-b-2 border-fairway-600' : ''}
                      ${r.holeWinner === 1 ? 'bg-fairway-800/60' : r.holeWinner === 2 ? 'bg-rough-900/60' : ''}
                    `}
                  >
                    <td className="px-2 py-1.5 font-semibold text-gold-400 sticky left-0 bg-inherit">{r.hole}</td>
                    <td className="px-2 py-1.5 text-center text-fairway-400">{r.par}</td>
                    <td className="px-2 py-1.5 text-center text-fairway-600">{r.strokeIndex}</td>
                    <td className={`px-2 py-1.5 text-center font-medium
                      ${r.holeWinner === 1 ? 'text-fairway-200' : 'text-fairway-400'}
                    `}>
                      {r.team1Net ?? '–'}
                    </td>
                    <td className={`px-2 py-1.5 text-center font-medium
                      ${r.holeWinner === 2 ? 'text-gold-300' : 'text-fairway-400'}
                    `}>
                      {r.team2Net ?? '–'}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {r.holeWinner === null ? '–'
                        : r.holeWinner === 0 ? <span className="text-fairway-400">½</span>
                        : r.holeWinner === 1 ? <span className="text-fairway-200">T1</span>
                        : <span className="text-gold-400">T2</span>
                      }
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {r.holeWinner !== null ? (
                        <span className={r.runningHolesUp > 0 ? 'text-fairway-300'
                          : r.runningHolesUp < 0 ? 'text-gold-400' : 'text-fairway-500'}>
                          {r.runningHolesUp === 0 ? 'AS'
                            : r.runningHolesUp > 0 ? `T1 +${r.runningHolesUp}`
                            : `T2 +${Math.abs(r.runningHolesUp)}`}
                        </span>
                      ) : '–'}
                    </td>
                  </tr>
                );
              })}
              {/* Totals row */}
              <tr className="bg-fairway-800/80 font-semibold">
                <td className="px-2 py-2 text-fairway-300 sticky left-0 bg-fairway-800" colSpan={3}>Total</td>
                <td className="px-2 py-2 text-center text-fairway-200">
                  {holeResults.filter(r => r.team1Net !== null).reduce((s, r) => s + (r.team1Net || 0), 0) || '–'}
                </td>
                <td className="px-2 py-2 text-center text-fairway-200">
                  {holeResults.filter(r => r.team2Net !== null).reduce((s, r) => s + (r.team2Net || 0), 0) || '–'}
                </td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
