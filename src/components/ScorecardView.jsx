import { useState, useRef, useEffect } from 'react';
import { PLAYERS, COURSE, teamScoreKey } from '../lib/tournament';
import {
  courseHandicap,
  strokesOnHole,
  netScore,
  teamNetScore,
  teamHandicap,
  calculateMatchStatus,
  matchStatusLabel,
  matchPoints,
  calculateCashGamePairScorecard,
  COURSE_HANDICAPS,
} from '../lib/scoring';

// Format a score-to-par integer as -1, E, +2 etc.
function formatToPar(val) {
  if (val === null || val === undefined) return '–';
  if (val === 0) return 'E';
  return val > 0 ? `+${val}` : `${val}`;
}

// Tailwind text color for score-to-par: red under, white even, grey over
function toParColor(val) {
  if (val === null || val === undefined) return 'text-fairway-500';
  if (val < 0) return 'text-red-400';
  if (val === 0) return 'text-white';
  return 'text-fairway-500';
}

// ─── Hole Indicator Strip ─────────────────────────────────────────────────────
function HoleStrip({ currentHole, onSelectHole, holes, holeResultMap, cashHoleMap }) {
  const getHoleColor = (hole) => {
    if (cashHoleMap) {
      const r = cashHoleMap[hole];
      if (!r || r.scoreToPar === null) return 'bg-fairway-700 text-fairway-400';
      if (r.scoreToPar < 0) return 'bg-red-900/70 text-red-400';
      if (r.scoreToPar === 0) return 'bg-fairway-600 text-white';
      return 'bg-fairway-800 text-fairway-500';
    }
    const r = holeResultMap[hole];
    if (!r || r.holeWinner === null) return 'bg-fairway-700 text-fairway-400';
    if (r.holeWinner === 0) return 'bg-fairway-600 text-fairway-200';
    if (r.holeWinner === 1) return 'bg-fairway-500 text-white';
    return 'bg-rough-700 text-gold-300';
  };

  return (
    <div className="flex gap-1.5 overflow-x-auto py-2 px-1 scrollbar-hide">
      {holes.map(hole => (
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

// ─── Score Input ──────────────────────────────────────────────────────────────
function ScoreInput({ playerId, holeNumber, grossScore, netSc, onSave, playerLabel, par }) {
  const [editing, setEditing] = useState(false);
  const [localVal, setLocalVal] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const handleTap = () => {
    setLocalVal(grossScore ? String(grossScore) : '');
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 50);
  };

  const doSave = async (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1 || num > 20) { setEditing(false); return; }
    setSaving(true);
    await onSave(num);
    setSaving(false);
    setEditing(false);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalVal(val);
    clearTimeout(debounceRef.current);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1 && num <= 20) {
      debounceRef.current = setTimeout(() => doSave(val), 500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { clearTimeout(debounceRef.current); doSave(localVal); }
    if (e.key === 'Escape') { clearTimeout(debounceRef.current); setEditing(false); }
  };

  const scoreColor = (gross) => {
    if (!gross) return 'text-fairway-500';
    const diff = gross - par;
    if (diff <= -2) return 'text-yellow-300';
    if (diff === -1) return 'text-fairway-300';
    if (diff === 0) return 'text-white';
    if (diff === 1) return 'text-orange-400';
    return 'text-red-400';
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
        {netSc !== null && (
          <span className="text-fairway-500 text-xs">
            Net <span className="text-fairway-300 font-medium">{netSc}</span>
          </span>
        )}
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              min="1"
              max="20"
              value={localVal}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-14 text-center bg-fairway-700 border border-gold-500 text-white text-lg
                rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-gold-400"
              autoFocus
            />
            {saving && <span className="text-fairway-500 text-sm">…</span>}
            <button onClick={() => { clearTimeout(debounceRef.current); setEditing(false); }}
              className="text-fairway-500 text-sm px-1">✕</button>
          </div>
        ) : (
          <button
            onClick={handleTap}
            className={`
              w-12 h-10 rounded-xl text-xl font-bold transition-all active:scale-95 hover:bg-fairway-600
              ${grossScore
                ? `${scoreColor(grossScore)} bg-fairway-700`
                : 'bg-fairway-700 border-2 border-dashed border-fairway-600 text-fairway-600'
              }
            `}
          >
            {grossScore || '+'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Scorecard View ──────────────────────────────────────────────────────
export default function ScorecardView({ matchup, round, scores, upsertScore }) {
  const { start = 1, end = 18 } = matchup.holeRange || {};
  const holes = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const [currentHole, setCurrentHole] = useState(start);

  const isCashGame = round.format === 'cash_game';
  const isTeamFormat = round.format === 'scramble' || round.format === 'modified_alternate_shot';

  const matchStatus = calculateMatchStatus(scores, matchup, round);
  const { holeResults, holesPlayed, holesRemaining, totalHoles, matchResult } = matchStatus;
  const pts = matchPoints(matchResult, holeResults);

  // Map hole number → result for O(1) lookup (supports non-1-indexed back 9)
  const holeResultMap = Object.fromEntries(holeResults.map(r => [r.hole, r]));
  const currentResult = holeResultMap[currentHole];

  // Cash game: per-hole best ball data (pair net, score to par, running total)
  const cashPairData = isCashGame ? calculateCashGamePairScorecard(scores, matchup) : null;
  const cashHoleMap = cashPairData
    ? Object.fromEntries(cashPairData.holeResults.map(r => [r.hole, r]))
    : null;
  const currentCashHole = cashHoleMap ? cashHoleMap[currentHole] : null;

  const course = round.course || COURSE;
  const hcpOffset = round.handicapMode === 'off_the_low'
    ? Math.min(...[...matchup.team1Players, ...matchup.team2Players].map(courseHandicap))
    : 0;
  const par = course.pars[currentHole - 1];
  const si = course.strokeIndex[currentHole - 1];

  const canEnterTeam1 = true;
  const canEnterTeam2 = true;

  const t1Label = isCashGame
    ? matchup.team1Players.map(id => PLAYERS[id].name).join(' & ')
    : 'Team 1';
  const t2Label = isCashGame
    ? matchup.team2Players.map(id => PLAYERS[id].name).join(' & ')
    : 'Team 2';

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Match status / points bar */}
      <div className="bg-fairway-800 rounded-xl p-3 border border-fairway-700">
        {isCashGame ? (
          <div className="text-center">
            <div className="text-xs text-fairway-400 mb-1">{round.name} · Pair Scorecard</div>
            <div className="text-white font-semibold text-sm">{matchup.label}</div>
            {cashPairData && cashPairData.holesScored > 0 ? (
              <div className="mt-2 flex items-center justify-center gap-4">
                <div>
                  <div className={`text-2xl font-bold font-display ${toParColor(cashPairData.runningTotal)}`}>
                    {formatToPar(cashPairData.runningTotal)}
                  </div>
                  <div className="text-fairway-500 text-xs">thru {cashPairData.holesScored}</div>
                </div>
                {cashPairData.holesScored < 18 && (
                  <div className="text-fairway-600 text-xs">{18 - cashPairData.holesScored} holes left</div>
                )}
              </div>
            ) : (
              <div className="text-fairway-500 text-xs mt-1">No scores yet</div>
            )}
          </div>
        ) : (
          <div>
            <div className="text-center text-xs text-fairway-400 mb-2">
              {round.name} · {matchup.nineLabel ?? round.subtitle}
              {round.course && (
                <span className="block text-fairway-600 text-xs mt-0.5">{round.course.name}</span>
              )}
            </div>
            <div className="text-center text-white font-semibold text-sm mb-2">
              {matchStatusLabel(matchStatus, [t1Label, t2Label])}
            </div>
            {/* Hole points live tally */}
            {holesPlayed > 0 && (
              <div className="flex items-center justify-between text-xs mt-1 pt-2 border-t border-fairway-700/50">
                <span className={`font-semibold ${pts.team1 > pts.team2 ? 'text-fairway-200' : 'text-fairway-400'}`}>
                  T1 {pts.team1 % 1 === 0 ? pts.team1 : pts.team1.toFixed(1)} pts
                  {pts.team1Bonus > 0 && <span className="text-gold-500 ml-1">(+{pts.team1Bonus} bonus)</span>}
                </span>
                <span className="text-fairway-700">·</span>
                <span className={`font-semibold ${pts.team2 > pts.team1 ? 'text-gold-300' : 'text-fairway-400'}`}>
                  {pts.team2 % 1 === 0 ? pts.team2 : pts.team2.toFixed(1)} pts T2
                  {pts.team2Bonus > 0 && <span className="text-gold-500 ml-1">(+{pts.team2Bonus} bonus)</span>}
                </span>
              </div>
            )}
            {holesPlayed > 0 && holesPlayed < totalHoles && (
              <div className="text-center text-fairway-600 text-xs mt-1">{holesRemaining} holes remaining</div>
            )}
          </div>
        )}
      </div>

      {/* Hole selector */}
      <div className="bg-fairway-800 rounded-xl border border-fairway-700 overflow-hidden">
        <div className="px-3 pt-3 pb-1">
          <HoleStrip
            currentHole={currentHole}
            onSelectHole={setCurrentHole}
            holes={holes}
            holeResultMap={holeResultMap}
            cashHoleMap={cashHoleMap}
          />
        </div>

        {/* Hole info row */}
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

          {isCashGame ? (
            currentCashHole?.scoreToPar !== null && currentCashHole?.scoreToPar !== undefined ? (
              <div className="flex flex-col items-end gap-0.5">
                <div className={`text-lg font-bold font-display ${toParColor(currentCashHole.scoreToPar)}`}>
                  {formatToPar(currentCashHole.scoreToPar)}
                </div>
                {currentCashHole.runningTotal !== null && (
                  <div className={`text-xs ${toParColor(currentCashHole.runningTotal)}`}>
                    {formatToPar(currentCashHole.runningTotal)} total
                  </div>
                )}
              </div>
            ) : null
          ) : (
            currentResult?.holeWinner !== null && currentResult?.holeWinner !== undefined && (
              <div className={`px-3 py-1 rounded-full text-xs font-bold
                ${currentResult.holeWinner === 0 ? 'bg-fairway-700 text-fairway-300'
                  : currentResult.holeWinner === 1 ? 'bg-fairway-600 text-white'
                  : 'bg-rough-700 text-gold-300'}
              `}>
                {currentResult.holeWinner === 0 ? 'Halved'
                  : currentResult.holeWinner === 1 ? 'Team 1 Wins'
                  : 'Team 2 Wins'}
              </div>
            )
          )}
        </div>
      </div>

      {/* Score entry panels */}
      <div className="grid grid-cols-1 gap-3">
        <TeamScorePanel
          title={t1Label}
          isLeft={true}
          players={matchup.team1Players}
          isTeamFormat={isTeamFormat}
          round={round}
          holeNumber={currentHole}
          scores={scores}
          canEdit={canEnterTeam1}
          onSave={upsertScore}
          course={course}
          hcpOffset={hcpOffset}
        />
        <TeamScorePanel
          title={t2Label}
          isLeft={false}
          players={matchup.team2Players}
          isTeamFormat={isTeamFormat}
          round={round}
          holeNumber={currentHole}
          scores={scores}
          canEdit={canEnterTeam2}
          onSave={upsertScore}
          hcpOffset={hcpOffset}
          course={course}
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrentHole(h => Math.max(start, h - 1))}
          disabled={currentHole === start}
          className="flex-1 bg-fairway-800 hover:bg-fairway-700 border border-fairway-700
            text-fairway-300 font-semibold py-3 rounded-xl disabled:opacity-30 transition-colors"
        >
          ← {currentHole > start ? `Hole ${currentHole - 1}` : '–'}
        </button>
        <button
          onClick={() => setCurrentHole(h => Math.min(end, h + 1))}
          disabled={currentHole === end}
          className="flex-1 bg-fairway-700 hover:bg-fairway-600 border border-fairway-600
            text-white font-semibold py-3 rounded-xl disabled:opacity-30 transition-colors"
        >
          {currentHole < end ? `Hole ${currentHole + 1}` : '–'} →
        </button>
      </div>

      {/* Full scorecard table */}
      <ScorecardTable
        holeResults={holeResults}
        t1Label={t1Label}
        t2Label={t2Label}
        isCashGame={isCashGame}
        cashHoleResults={cashPairData?.holeResults}
      />
    </div>
  );
}

// ─── Team Score Panel ─────────────────────────────────────────────────────────
function TeamScorePanel({ title, isLeft, players, isTeamFormat, round, holeNumber, scores, canEdit, onSave, course, hcpOffset = 0 }) {
  if (isTeamFormat) {
    const keyPlayer = teamScoreKey(players);
    const gross = scores[`${keyPlayer}-${holeNumber}`] || null;
    const thcp = teamHandicap(players, round.format);
    const si = course.strokeIndex[holeNumber - 1];
    const strokes = strokesOnHole(thcp, si);
    const net = gross ? gross - strokes : null;
    const playerLabel = players.map(id => PLAYERS[id].name).join(' & ');
    const hcpLabel = round.format === 'scramble' ? `Scramble HCP ${thcp}` : `Alt Shot HCP ${thcp}`;

    return (
      <div className={`rounded-xl border overflow-hidden
        ${isLeft ? 'border-fairway-600' : 'border-rough-700'}`}>
        <div className={`px-3 py-2 flex items-center justify-between
          ${isLeft ? 'bg-fairway-700/60' : 'bg-rough-800/60'}`}>
          <span className="text-gold-400 text-xs font-semibold">{title}</span>
          <span className="text-fairway-500 text-xs">{hcpLabel} · {strokes > 0 ? `−${strokes}` : 'no stroke'}</span>
        </div>
        <div className={`px-3 py-2 ${isLeft ? 'bg-fairway-800/40' : 'bg-rough-900/40'}`}>
          <ScoreInput
            playerId={keyPlayer}
            holeNumber={holeNumber}
            grossScore={gross}
            netSc={net}
            par={course.pars[holeNumber - 1]}
            onSave={val => onSave(keyPlayer, holeNumber, val)}
            playerLabel={playerLabel}
          />
        </div>
      </div>
    );
  }

  // Individual scores (best_ball, singles, cash_game)
  return (
    <div className={`rounded-xl border overflow-hidden
      ${isLeft ? 'border-fairway-600' : 'border-rough-700'}`}>
      <div className={`px-3 py-2
        ${isLeft ? 'bg-fairway-700/60' : 'bg-rough-800/60'}`}>
        <span className="text-gold-400 text-xs font-semibold">{title}</span>
      </div>
      <div className={`px-3 py-1 ${isLeft ? 'bg-fairway-800/40' : 'bg-rough-900/40'}`}>
        {players.map(pid => {
          const gross = scores[`${pid}-${holeNumber}`] || null;
          const net = netScore(gross, pid, holeNumber, course, hcpOffset);
          const adjustedHcp = COURSE_HANDICAPS[pid] - hcpOffset;
          const si = course.strokeIndex[holeNumber - 1];
          const strokes = strokesOnHole(adjustedHcp, si);
          const label = `${PLAYERS[pid].name} (CH ${adjustedHcp}${strokes > 0 ? `, −${strokes}` : ''})`;
          return (
            <ScoreInput
              key={pid}
              playerId={pid}
              holeNumber={holeNumber}
              grossScore={gross}
              netSc={net}
              par={course.pars[holeNumber - 1]}
              onSave={val => onSave(pid, holeNumber, val)}
              playerLabel={label}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Scorecard Summary Table ──────────────────────────────────────────────────
function ScorecardTable({ holeResults, t1Label, t2Label, isCashGame, cashHoleResults }) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <button
        onClick={() => setShow(s => !s)}
        className="w-full text-fairway-400 text-sm py-2 flex items-center justify-center gap-2"
      >
        {show ? '▲ Hide' : '▼ Show'} full scorecard
      </button>

      {show && isCashGame && cashHoleResults ? (
        <CashGameTable cashHoleResults={cashHoleResults} />
      ) : show ? (
        <MatchTable holeResults={holeResults} t1Label={t1Label} t2Label={t2Label} />
      ) : null}
    </div>
  );
}

function CashGameTable({ cashHoleResults }) {
  const scored = cashHoleResults.filter(r => r.scoreToPar !== null);
  const totalNet = scored.reduce((s, r) => s + r.pairNet, 0);
  const totalToPar = scored.reduce((s, r) => s + r.scoreToPar, 0);

  return (
    <div className="overflow-x-auto rounded-xl border border-fairway-700 bg-fairway-900/60 animate-fade-in">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-fairway-700">
            <th className="text-fairway-400 font-medium px-2 py-2 text-left sticky left-0 bg-fairway-900/90 w-8">H</th>
            <th className="text-fairway-400 font-medium px-2 py-2">Par</th>
            <th className="text-fairway-400 font-medium px-2 py-2">SI</th>
            <th className="text-fairway-300 font-medium px-2 py-2">Net</th>
            <th className="text-fairway-300 font-medium px-2 py-2">+/-</th>
            <th className="text-fairway-400 font-medium px-2 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {cashHoleResults.map((r, i) => (
            <tr
              key={r.hole}
              className={`border-b border-fairway-800 ${i === 8 ? 'border-b-2 border-fairway-600' : ''}`}
            >
              <td className="px-2 py-1.5 font-semibold text-gold-400 sticky left-0 bg-inherit">{r.hole}</td>
              <td className="px-2 py-1.5 text-center text-fairway-400">{r.par}</td>
              <td className="px-2 py-1.5 text-center text-fairway-600">{r.strokeIndex}</td>
              <td className="px-2 py-1.5 text-center text-fairway-300">
                {r.pairNet ?? '–'}
              </td>
              <td className={`px-2 py-1.5 text-center font-semibold ${toParColor(r.scoreToPar)}`}>
                {formatToPar(r.scoreToPar)}
              </td>
              <td className={`px-2 py-1.5 text-center ${toParColor(r.runningTotal)}`}>
                {r.runningTotal !== null ? formatToPar(r.runningTotal) : '–'}
              </td>
            </tr>
          ))}
          <tr className="bg-fairway-800/80 font-semibold">
            <td className="px-2 py-2 text-fairway-300 sticky left-0 bg-fairway-800" colSpan={3}>Total</td>
            <td className="px-2 py-2 text-center text-fairway-200">
              {scored.length > 0 ? totalNet : '–'}
            </td>
            <td className={`px-2 py-2 text-center font-bold ${toParColor(scored.length > 0 ? totalToPar : null)}`}>
              {scored.length > 0 ? formatToPar(totalToPar) : '–'}
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function MatchTable({ holeResults, t1Label, t2Label }) {
  const isFullRound = holeResults.length === 18;
  return (
    <div className="overflow-x-auto rounded-xl border border-fairway-700 bg-fairway-900/60 animate-fade-in">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-fairway-700">
            <th className="text-fairway-400 font-medium px-2 py-2 text-left sticky left-0 bg-fairway-900/90 w-8">H</th>
            <th className="text-fairway-400 font-medium px-2 py-2">Par</th>
            <th className="text-fairway-400 font-medium px-2 py-2">SI</th>
            <th className="text-fairway-300 font-medium px-2 py-2 truncate max-w-[60px]">
              {t1Label.split(' ')[0]}
            </th>
            <th className="text-fairway-300 font-medium px-2 py-2 truncate max-w-[60px]">
              {t2Label.split(' ')[0]}
            </th>
            <th className="text-fairway-400 font-medium px-2 py-2">Pts</th>
            <th className="text-fairway-400 font-medium px-2 py-2">+/-</th>
          </tr>
        </thead>
        <tbody>
          {holeResults.map((r, i) => (
            <tr
              key={r.hole}
              className={`border-b border-fairway-800
                ${isFullRound && i === 8 ? 'border-b-2 border-fairway-600' : ''}
                ${r.holeWinner === 1 ? 'bg-fairway-800/60' : r.holeWinner === 2 ? 'bg-rough-900/60' : ''}
              `}
            >
              <td className="px-2 py-1.5 font-semibold text-gold-400 sticky left-0 bg-inherit">{r.hole}</td>
              <td className="px-2 py-1.5 text-center text-fairway-400">{r.par}</td>
              <td className="px-2 py-1.5 text-center text-fairway-600">{r.strokeIndex}</td>
              <td className={`px-2 py-1.5 text-center font-medium
                ${r.holeWinner === 1 ? 'text-fairway-200' : 'text-fairway-400'}`}>
                {r.team1Net ?? '–'}
              </td>
              <td className={`px-2 py-1.5 text-center font-medium
                ${r.holeWinner === 2 ? 'text-gold-300' : 'text-fairway-400'}`}>
                {r.team2Net ?? '–'}
              </td>
              <td className="px-2 py-1.5 text-center">
                {r.holeWinner === null ? '–'
                  : r.holeWinner === 0 ? <span className="text-fairway-400">½</span>
                  : r.holeWinner === 1 ? <span className="text-fairway-200">T1</span>
                  : <span className="text-gold-400">T2</span>}
              </td>
              <td className="px-2 py-1.5 text-center">
                {r.holeWinner !== null ? (
                  <span className={
                    r.runningHolesUp > 0 ? 'text-fairway-300'
                    : r.runningHolesUp < 0 ? 'text-gold-400'
                    : 'text-fairway-500'}>
                    {r.runningHolesUp === 0 ? 'AS'
                      : r.runningHolesUp > 0 ? `T1 +${r.runningHolesUp}`
                      : `T2 +${Math.abs(r.runningHolesUp)}`}
                  </span>
                ) : '–'}
              </td>
            </tr>
          ))}
          <tr className="bg-fairway-800/80 font-semibold">
            <td className="px-2 py-2 text-fairway-300 sticky left-0 bg-fairway-800" colSpan={3}>Total</td>
            <td className="px-2 py-2 text-center text-fairway-200">
              {holeResults.filter(r => r.team1Net !== null).reduce((s, r) => s + r.team1Net, 0) || '–'}
            </td>
            <td className="px-2 py-2 text-center text-fairway-200">
              {holeResults.filter(r => r.team2Net !== null).reduce((s, r) => s + r.team2Net, 0) || '–'}
            </td>
            <td colSpan={2} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
