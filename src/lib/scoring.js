import { COURSE, PLAYERS, teamScoreKey } from './tournament';

// ─── Handicap Calculations ───────────────────────────────────────────────────

export function courseHandicap(playerId) {
  const player = PLAYERS[playerId];
  if (!player) return 0;
  return Math.round(player.handicapIndex * (COURSE.slope / 113) + (COURSE.rating - COURSE.par));
}

export function strokesOnHole(playerCourseHcp, holeStrokeIndex) {
  let strokes = 0;
  let remaining = playerCourseHcp;
  if (remaining >= holeStrokeIndex) strokes++;
  remaining -= 18;
  if (remaining >= holeStrokeIndex) strokes++;
  remaining -= 18;
  if (remaining >= holeStrokeIndex) strokes++;
  return strokes;
}

export function netScore(grossScore, playerId, holeNumber) {
  if (!grossScore || grossScore <= 0) return null;
  const si = COURSE.strokeIndex[holeNumber - 1];
  const hcp = courseHandicap(playerId);
  return grossScore - strokesOnHole(hcp, si);
}

export function scrambleHandicap(playerIds) {
  const hcps = playerIds.map(courseHandicap).sort((a, b) => a - b);
  if (hcps.length === 1) return Math.round(hcps[0] * 0.35);
  return Math.round(hcps[0] * 0.35 + hcps[1] * 0.15);
}

export function altShotHandicap(playerIds) {
  const total = playerIds.reduce((s, id) => s + courseHandicap(id), 0);
  return Math.round(total * 0.5);
}

export function teamHandicap(playerIds, format) {
  if (format === 'scramble') return scrambleHandicap(playerIds);
  if (format === 'modified_alternate_shot') return altShotHandicap(playerIds);
  return courseHandicap(playerIds[0]);
}

export function teamNetScore(grossScore, playerIds, format, holeNumber) {
  if (!grossScore || grossScore <= 0) return null;
  const si = COURSE.strokeIndex[holeNumber - 1];
  const hcp = teamHandicap(playerIds, format);
  return grossScore - strokesOnHole(hcp, si);
}

// ─── Match Scoring ───────────────────────────────────────────────────────────

// holeScores: { "playerId-holeNum": grossStrokes }
// matchup.holeRange = { start, end } — optional, defaults to 1–18
// Returns holeResults, holesUp, holesPlayed, holesRemaining, totalHoles, matchResult
export function calculateMatchStatus(holeScores, matchup, round) {
  const { start = 1, end = 18 } = matchup.holeRange || {};
  const totalHoles = end - start + 1;

  const results = [];
  let holesUp = 0;

  for (let hole = start; hole <= end; hole++) {
    let team1Net = null;
    let team2Net = null;

    if (round.format === 'singles' || round.format === 'best_ball' || round.format === 'cash_game') {
      const t1Nets = matchup.team1Players
        .map(pid => netScore(holeScores[`${pid}-${hole}`], pid, hole))
        .filter(n => n !== null);
      const t2Nets = matchup.team2Players
        .map(pid => netScore(holeScores[`${pid}-${hole}`], pid, hole))
        .filter(n => n !== null);
      if (t1Nets.length > 0) team1Net = Math.min(...t1Nets);
      if (t2Nets.length > 0) team2Net = Math.min(...t2Nets);
    } else {
      // Scramble / Modified Alternate Shot — single score per side
      const key1 = teamScoreKey(matchup.team1Players);
      const key2 = teamScoreKey(matchup.team2Players);
      team1Net = teamNetScore(holeScores[`${key1}-${hole}`], matchup.team1Players, round.format, hole);
      team2Net = teamNetScore(holeScores[`${key2}-${hole}`], matchup.team2Players, round.format, hole);
    }

    let holeWinner = null;
    if (team1Net !== null && team2Net !== null) {
      if (team1Net < team2Net) { holeWinner = 1; holesUp++; }
      else if (team2Net < team1Net) { holeWinner = 2; holesUp--; }
      else holeWinner = 0;
    }

    results.push({
      hole,
      par: COURSE.pars[hole - 1],
      strokeIndex: COURSE.strokeIndex[hole - 1],
      team1Net,
      team2Net,
      holeWinner,
      runningHolesUp: holesUp,
    });
  }

  const holesPlayed = results.filter(r => r.holeWinner !== null).length;
  const holesRemaining = totalHoles - holesPlayed;

  let matchResult = null;
  if (holesPlayed > 0 && (Math.abs(holesUp) > holesRemaining || holesPlayed === totalHoles)) {
    matchResult = {
      winner: holesUp > 0 ? 1 : holesUp < 0 ? 2 : 0,
      margin: Math.abs(holesUp),
      holesRemaining,
    };
  }

  return { holeResults: results, holesUp, holesPlayed, holesRemaining, totalHoles, matchResult };
}

// ─── Match Points (hole-by-hole + bonus) ─────────────────────────────────────

// Returns point breakdown for a match.
// Hole points are accumulated as holes are played (in-progress matches count).
// Match bonus (+1) is only awarded when the match is complete.
export function matchPoints(matchResult, holeResults) {
  let team1Holes = 0;
  let team2Holes = 0;

  for (const r of (holeResults || [])) {
    if (r.holeWinner === 1) team1Holes += 1;
    else if (r.holeWinner === 2) team2Holes += 1;
    else if (r.holeWinner === 0) { team1Holes += 0.5; team2Holes += 0.5; }
  }

  let team1Bonus = 0;
  let team2Bonus = 0;
  if (matchResult) {
    if (matchResult.winner === 1) team1Bonus = 1;
    else if (matchResult.winner === 2) team2Bonus = 1;
    else { team1Bonus = 0.5; team2Bonus = 0.5; }
  }

  return {
    team1: team1Holes + team1Bonus,
    team2: team2Holes + team2Bonus,
    team1Holes,
    team2Holes,
    team1Bonus,
    team2Bonus,
    complete: matchResult !== null,
  };
}

// ─── Human-readable status ───────────────────────────────────────────────────

export function matchStatusLabel(matchStatus, teamNames = ['Team 1', 'Team 2']) {
  const { holesUp, holesPlayed, holesRemaining, matchResult } = matchStatus;

  if (holesPlayed === 0) return 'Not started';

  if (matchResult) {
    if (matchResult.winner === 0) return 'All Square — Tied';
    const winner = matchResult.winner === 1 ? teamNames[0] : teamNames[1];
    if (holesRemaining === 0) return `${winner} wins ${matchResult.margin} UP`;
    return `${winner} wins ${matchResult.margin}&${holesRemaining}`;
  }

  if (holesUp === 0) return `All Square (thru ${holesPlayed})`;
  const leading = holesUp > 0 ? teamNames[0] : teamNames[1];
  return `${leading} ${Math.abs(holesUp)} UP (thru ${holesPlayed})`;
}

// ─── SECIT Cup standings ──────────────────────────────────────────────────────

// allMatchStatuses: array of { matchResult, holeResults } from calculateMatchStatus
// Only pass statuses for rounds where countsForCup === true
export function cupStandings(allMatchStatuses) {
  let team1 = 0;
  let team2 = 0;

  for (const { matchResult, holeResults } of allMatchStatuses) {
    const pts = matchPoints(matchResult, holeResults);
    team1 += pts.team1;
    team2 += pts.team2;
  }

  return { team1, team2 };
}

// ─── Cash Game Pair Scorecard ────────────────────────────────────────────────

// Computes per-hole best ball data for a single cash_game pair.
// Returns { holeResults, runningTotal, holesScored }
// Each holeResult: { hole, par, strokeIndex, pairNet, scoreToPar, runningTotal }
// pairNet = best (lowest) net score between the two partners; null if neither scored.
// runningTotal per hole = cumulative scoreToPar through that hole (null if not played).
export function calculateCashGamePairScorecard(scores, matchup) {
  const allPlayers = [...matchup.team1Players, ...matchup.team2Players];
  const results = [];
  let cumTotal = 0;
  let holesScored = 0;

  for (let hole = 1; hole <= 18; hole++) {
    const par = COURSE.pars[hole - 1];
    const si = COURSE.strokeIndex[hole - 1];
    const nets = allPlayers
      .map(pid => netScore(scores[`${pid}-${hole}`], pid, hole))
      .filter(n => n !== null);

    const pairNet = nets.length > 0 ? Math.min(...nets) : null;
    const scoreToPar = pairNet !== null ? pairNet - par : null;

    let holeRunningTotal = null;
    if (scoreToPar !== null) {
      cumTotal += scoreToPar;
      holesScored++;
      holeRunningTotal = cumTotal;
    }

    results.push({ hole, par, strokeIndex: si, pairNet, scoreToPar, runningTotal: holeRunningTotal });
  }

  return { holeResults: results, runningTotal: cumTotal, holesScored };
}

// ─── Cash Game Standings ─────────────────────────────────────────────────────

// allMatchupScores: { [matchupId]: { "playerId-holeNum": gross } }
// round: the warmup round with format === 'cash_game'
//
// Scoring: each hole is a 4-way round robin.
//   Each pair earns 1 pt per pair they beat (lower net = better).
//   Ties split: 0.5 pts each. Max 3 pts per hole (beat all 3 others).
//
// Returns array sorted by total points (highest first):
//   [{ matchupId, label, players, points, holesPlayed, holeDetails }]
export function calculateCashGameStandings(allMatchupScores, round) {
  const pairs = round.matchups.map(m => ({
    matchupId: m.id,
    label: m.label,
    players: [...m.team1Players, ...m.team2Players],
  }));

  const pairPoints = Object.fromEntries(pairs.map(p => [p.matchupId, 0]));
  const holeDetails = Object.fromEntries(pairs.map(p => [p.matchupId, []]));
  let holesPlayed = 0;

  for (let hole = 1; hole <= 18; hole++) {
    // Best ball net for each pair on this hole
    const pairNets = pairs.map(pair => {
      const scores = allMatchupScores[pair.matchupId] || {};
      const nets = pair.players
        .map(pid => netScore(scores[`${pid}-${hole}`], pid, hole))
        .filter(n => n !== null);
      return { matchupId: pair.matchupId, net: nets.length > 0 ? Math.min(...nets) : null };
    });

    const anyScored = pairNets.some(p => p.net !== null);
    if (anyScored) holesPlayed = hole;

    // Round-robin: compare each pair against every other pair
    for (const entry of pairNets) {
      if (entry.net === null) {
        holeDetails[entry.matchupId].push({ hole, net: null, pts: null });
        continue;
      }
      let pts = 0;
      for (const other of pairNets) {
        if (other.matchupId === entry.matchupId || other.net === null) continue;
        if (entry.net < other.net) pts += 1;
        else if (entry.net === other.net) pts += 0.5;
      }
      pairPoints[entry.matchupId] += pts;
      holeDetails[entry.matchupId].push({ hole, net: entry.net, pts });
    }
  }

  return pairs
    .map(p => ({
      matchupId: p.matchupId,
      label: p.label,
      players: p.players,
      points: pairPoints[p.matchupId],
      holeDetails: holeDetails[p.matchupId],
    }))
    .sort((a, b) => b.points - a.points);
}

// Pre-computed course handicaps for display
export const COURSE_HANDICAPS = Object.fromEntries(
  Object.keys(PLAYERS).map(id => [id, courseHandicap(id)])
);
