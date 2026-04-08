import { COURSE, PLAYERS, ROUNDS, teamScoreKey } from './tournament';

// ─── Handicap Calculations ───────────────────────────────────────────────────

export function courseHandicap(playerId) {
  const player = PLAYERS[playerId];
  if (!player) return 0;
  return Math.round(player.handicapIndex * (COURSE.slope / 113) + (COURSE.rating - COURSE.par));
}

// Strokes a player receives on a specific hole
export function strokesOnHole(playerCourseHcp, holeStrokeIndex) {
  let strokes = 0;
  let remaining = playerCourseHcp;
  // First sweep: stroke index 1–18
  if (remaining >= holeStrokeIndex) strokes++;
  remaining -= 18;
  // Second sweep (handicap 19–36)
  if (remaining >= holeStrokeIndex) strokes++;
  remaining -= 18;
  // Third sweep (handicap 37–54, rare but possible)
  if (remaining >= holeStrokeIndex) strokes++;
  return strokes;
}

// Net score for a player on a hole
export function netScore(grossScore, playerId, holeNumber) {
  if (!grossScore || grossScore <= 0) return null;
  const si = COURSE.strokeIndex[holeNumber - 1];
  const hcp = courseHandicap(playerId);
  return grossScore - strokesOnHole(hcp, si);
}

// Team handicap for scramble (2-player: 35% lower + 15% higher)
export function scrambleHandicap(playerIds) {
  const hcps = playerIds.map(courseHandicap).sort((a, b) => a - b);
  if (hcps.length === 1) return Math.round(hcps[0] * 0.35);
  return Math.round(hcps[0] * 0.35 + hcps[1] * 0.15);
}

// Team handicap for modified alternate shot (50% of combined)
export function altShotHandicap(playerIds) {
  const total = playerIds.reduce((s, id) => s + courseHandicap(id), 0);
  return Math.round(total * 0.5);
}

export function teamHandicap(playerIds, format) {
  if (format === 'scramble') return scrambleHandicap(playerIds);
  if (format === 'modified_alternate_shot') return altShotHandicap(playerIds);
  return courseHandicap(playerIds[0]); // singles / per-player
}

// Net score for a team entry (single score covers the whole team)
export function teamNetScore(grossScore, playerIds, format, holeNumber) {
  if (!grossScore || grossScore <= 0) return null;
  const si = COURSE.strokeIndex[holeNumber - 1];
  const hcp = teamHandicap(playerIds, format);
  return grossScore - strokesOnHole(hcp, si);
}

// ─── Match Scoring ───────────────────────────────────────────────────────────

// Returns per-hole analysis and overall match status for a matchup.
// holeScores: Map<`${playerId}-${holeNumber}`, grossStrokes>
export function calculateMatchStatus(holeScores, matchup, round) {
  const results = [];
  let holesUp = 0; // positive = team1 leading

  for (let hole = 1; hole <= 18; hole++) {
    let team1Net = null;
    let team2Net = null;

    if (round.format === 'singles' || round.format === 'best_ball') {
      // Each player has their own score
      const team1Nets = matchup.team1Players
        .map(pid => {
          const gross = holeScores[`${pid}-${hole}`];
          return netScore(gross, pid, hole);
        })
        .filter(n => n !== null);

      const team2Nets = matchup.team2Players
        .map(pid => {
          const gross = holeScores[`${pid}-${hole}`];
          return netScore(gross, pid, hole);
        })
        .filter(n => n !== null);

      if (team1Nets.length > 0) team1Net = Math.min(...team1Nets);
      if (team2Nets.length > 0) team2Net = Math.min(...team2Nets);
    } else {
      // Scramble / Alt Shot — one gross score stored under teamScoreKey
      const key1 = teamScoreKey(matchup.team1Players);
      const key2 = teamScoreKey(matchup.team2Players);
      const gross1 = holeScores[`${key1}-${hole}`];
      const gross2 = holeScores[`${key2}-${hole}`];
      team1Net = teamNetScore(gross1, matchup.team1Players, round.format, hole);
      team2Net = teamNetScore(gross2, matchup.team2Players, round.format, hole);
    }

    let holeWinner = null; // null=not played, 0=halved, 1=team1, 2=team2
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
      runningHolesUp: holesUp, // snapshot after this hole
    });
  }

  const holesPlayed = results.filter(r => r.holeWinner !== null).length;
  const holesRemaining = 18 - holesPlayed;

  // Match over when margin > remaining (dormie), or 18 holes played
  let matchResult = null;
  if (holesPlayed > 0 && (Math.abs(holesUp) > holesRemaining || holesPlayed === 18)) {
    matchResult = {
      winner: holesUp > 0 ? 1 : holesUp < 0 ? 2 : 0,
      margin: Math.abs(holesUp),
      holesRemaining,
    };
  }

  return { holeResults: results, holesUp, holesPlayed, holesRemaining, matchResult };
}

// Human-readable match status string, e.g. "Team 1 leads 3UP (15)", "AS", "Team 2 wins 4&3"
export function matchStatusLabel(matchStatus, teamNames = ['Team 1', 'Team 2']) {
  const { holesUp, holesPlayed, holesRemaining, matchResult } = matchStatus;

  if (holesPlayed === 0) return 'Not started';

  if (matchResult) {
    if (matchResult.winner === 0) return 'Tied — All Square';
    const winner = matchResult.winner === 1 ? teamNames[0] : teamNames[1];
    if (holesRemaining === 0) {
      return `${winner} wins ${matchResult.margin} UP`;
    }
    return `${winner} wins ${matchResult.margin}&${holesRemaining}`;
  }

  if (holesUp === 0) return `All Square (thru ${holesPlayed})`;
  const leading = holesUp > 0 ? teamNames[0] : teamNames[1];
  return `${leading} ${Math.abs(holesUp)} UP (thru ${holesPlayed})`;
}

// Points awarded for a completed match: 1 for win, 0.5 each for tie, 0 for loss
export function matchPoints(matchResult) {
  if (!matchResult) return null; // incomplete
  if (matchResult.winner === 1) return { team1: 1, team2: 0 };
  if (matchResult.winner === 2) return { team1: 0, team2: 1 };
  return { team1: 0.5, team2: 0.5 };
}

// ─── Cup Standings ───────────────────────────────────────────────────────────

// Computes overall Cup standings from all match statuses
export function cupStandings(allMatchStatuses) {
  let team1 = 0;
  let team2 = 0;

  for (const { matchResult } of allMatchStatuses) {
    if (matchResult) {
      const pts = matchPoints(matchResult);
      team1 += pts.team1;
      team2 += pts.team2;
    }
  }

  return { team1, team2 };
}

// Pre-computed course handicaps for display
export const COURSE_HANDICAPS = Object.fromEntries(
  Object.keys(PLAYERS).map(id => [id, courseHandicap(id)])
);
