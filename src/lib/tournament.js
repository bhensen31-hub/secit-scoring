// ─── Course ──────────────────────────────────────────────────────────────────
export const COURSE = {
  name: 'SECIT VII',
  rating: 71.5,
  slope: 128,
  par: 72,
  pars: [4, 5, 4, 4, 4, 3, 5, 3, 4, 4, 4, 5, 4, 3, 4, 4, 3, 5],
  strokeIndex: [13, 9, 7, 3, 1, 15, 11, 17, 5, 8, 14, 10, 4, 18, 6, 2, 16, 12],
};

// Used for the Final Singles round only
export const LEGACY_COURSE = {
  name: 'Legacy on Lanier Golf Club',
  rating: 71.0,
  slope: 137,
  par: 72,
  pars: [5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 4, 3, 4, 5, 4],
  strokeIndex: [9, 15, 5, 7, 17, 1, 13, 11, 3, 18, 4, 6, 8, 2, 16, 14, 10, 12],
};

// ─── Players ─────────────────────────────────────────────────────────────────
export const PLAYERS = {
  derek:   { id: 'derek',   name: 'Derek',   handicapIndex: 12.5, team: 1 },
  brandon: { id: 'brandon', name: 'Brandon', handicapIndex: 24.1, team: 1 },
  tyson:   { id: 'tyson',   name: 'Tyson',   handicapIndex: 24.9, team: 1 },
  todd:    { id: 'todd',    name: 'Todd',     handicapIndex: 27.4, team: 1 },
  gary:    { id: 'gary',    name: 'Gary',     handicapIndex: 9.2,  team: 2 },
  slim:    { id: 'slim',    name: 'Slim',     handicapIndex: 21.6, team: 2 },
  mike:    { id: 'mike',    name: 'Mike',     handicapIndex: 28.2, team: 2 },
  ketan:   { id: 'ketan',   name: 'Ketan',   handicapIndex: 32.4, team: 2 },
};

export const TEAM1_PLAYERS = ['derek', 'brandon', 'tyson', 'todd'];
export const TEAM2_PLAYERS = ['gary', 'slim', 'mike', 'ketan'];

// ─── Rounds ───────────────────────────────────────────────────────────────────
// matchup.holeRange = { start, end } — only present for 9-hole singles matches.
// cash_game format: 4 cross-team pairs. Score entry per pair (T1 player + T2 player).
//   Standings ranked hole-by-hole vs all other pairs (not head-to-head T1 vs T2).
export const ROUNDS = [
  {
    id: 'warmup',
    number: 0,
    name: 'Warm-Up',
    subtitle: 'Cash Game Best Ball',
    format: 'cash_game',
    countsForCup: false,
    description:
      '4 cross-team pairs each play best ball. On each hole, 1 pt awarded per pair beaten (max 3 pts/hole). 18-hole total ranks the pairs.',
    matchups: [
      {
        id: 'warmup-1',
        label: 'Gary & Todd',
        shortLabel: 'Gary + Todd',
        team1Players: ['todd'],
        team2Players: ['gary'],
      },
      {
        id: 'warmup-2',
        label: 'Mike & Tyson',
        shortLabel: 'Mike + Tyson',
        team1Players: ['tyson'],
        team2Players: ['mike'],
      },
      {
        id: 'warmup-3',
        label: 'Brandon & Ketan',
        shortLabel: 'Brandon + Ketan',
        team1Players: ['brandon'],
        team2Players: ['ketan'],
      },
      {
        id: 'warmup-4',
        label: 'Derek & Slim',
        shortLabel: 'Derek + Slim',
        team1Players: ['derek'],
        team2Players: ['slim'],
      },
    ],
  },
  {
    id: 'match1',
    number: 1,
    name: 'Match 1',
    subtitle: 'Best Ball',
    format: 'best_ball',
    handicapMode: 'off_the_low',
    countsForCup: true,
    description:
      'Each player plays own ball. Handicaps played off the low — strokes are the difference from the lowest handicap player. Best net score per team counts per hole. 1 pt per hole won + 1 match bonus.',
    matchups: [
      {
        id: 'match1-1',
        label: 'Tyson & Brandon vs Gary & Ketan',
        shortLabel: 'Tyson+Brandon vs Gary+Ketan',
        team1Players: ['tyson', 'brandon'],
        team2Players: ['gary', 'ketan'],
      },
      {
        id: 'match1-2',
        label: 'Derek & Todd vs Slim & Mike',
        shortLabel: 'Derek+Todd vs Slim+Mike',
        team1Players: ['derek', 'todd'],
        team2Players: ['slim', 'mike'],
      },
    ],
  },
  {
    id: 'match3',
    number: 2,
    name: 'Match 2',
    subtitle: 'Best Ball',
    format: 'best_ball',
    countsForCup: true,
    description:
      'Each player plays own ball. Best net score per team counts per hole. 1 pt per hole won + 1 match bonus.',
    matchups: [
      {
        id: 'match3-1',
        label: 'Derek & Todd vs Gary & Ketan',
        shortLabel: 'D+T vs G+K',
        team1Players: ['derek', 'todd'],
        team2Players: ['gary', 'ketan'],
      },
      {
        id: 'match3-2',
        label: 'Brandon & Tyson vs Slim & Mike',
        shortLabel: 'B+T vs S+M',
        team1Players: ['brandon', 'tyson'],
        team2Players: ['slim', 'mike'],
      },
    ],
  },
  {
    id: 'match2',
    number: 3,
    name: 'Match 3',
    subtitle: 'Scramble',
    format: 'scramble',
    countsForCup: true,
    description:
      'All hit from tee, team picks best shot. Team handicap = 35% lower + 15% higher course handicap. 1 pt per hole won + 1 match bonus.',
    matchups: [
      {
        id: 'match2-1',
        label: 'Derek & Tyson vs Gary & Mike',
        shortLabel: 'D+T vs G+M',
        team1Players: ['derek', 'tyson'],
        team2Players: ['gary', 'mike'],
      },
      {
        id: 'match2-2',
        label: 'Brandon & Todd vs Slim & Ketan',
        shortLabel: 'B+T vs S+K',
        team1Players: ['brandon', 'todd'],
        team2Players: ['slim', 'ketan'],
      },
    ],
  },
  {
    id: 'singles',
    number: 4,
    name: 'Final Singles',
    course: LEGACY_COURSE,
    subtitle: 'Two 9-Hole Matches Per Player',
    format: 'singles',
    countsForCup: true,
    description:
      'Each player plays two separate 9-hole matches (Front 9 & Back 9) against different opponents. Each 9-hole match awards 1 pt per hole won + 1 match bonus.',
    matchups: [
      // ── Front 9 (holes 1–9) ──
      {
        id: 'singles-f1',
        label: 'Derek vs Mike — Front 9',
        shortLabel: 'Derek vs Mike',
        team1Players: ['derek'],
        team2Players: ['mike'],
        holeRange: { start: 1, end: 9 },
        nineLabel: 'Front 9',
      },
      {
        id: 'singles-f2',
        label: 'Brandon vs Gary — Front 9',
        shortLabel: 'Brandon vs Gary',
        team1Players: ['brandon'],
        team2Players: ['gary'],
        holeRange: { start: 1, end: 9 },
        nineLabel: 'Front 9',
      },
      {
        id: 'singles-f3',
        label: 'Tyson vs Slim — Front 9',
        shortLabel: 'Tyson vs Slim',
        team1Players: ['tyson'],
        team2Players: ['slim'],
        holeRange: { start: 1, end: 9 },
        nineLabel: 'Front 9',
      },
      {
        id: 'singles-f4',
        label: 'Todd vs Ketan — Front 9',
        shortLabel: 'Todd vs Ketan',
        team1Players: ['todd'],
        team2Players: ['ketan'],
        holeRange: { start: 1, end: 9 },
        nineLabel: 'Front 9',
      },
      // ── Back 9 (holes 10–18) ──
      {
        id: 'singles-b1',
        label: 'Derek vs Ketan — Back 9',
        shortLabel: 'Derek vs Ketan',
        team1Players: ['derek'],
        team2Players: ['ketan'],
        holeRange: { start: 10, end: 18 },
        nineLabel: 'Back 9',
      },
      {
        id: 'singles-b2',
        label: 'Brandon vs Mike — Back 9',
        shortLabel: 'Brandon vs Mike',
        team1Players: ['brandon'],
        team2Players: ['mike'],
        holeRange: { start: 10, end: 18 },
        nineLabel: 'Back 9',
      },
      {
        id: 'singles-b3',
        label: 'Tyson vs Gary — Back 9',
        shortLabel: 'Tyson vs Gary',
        team1Players: ['tyson'],
        team2Players: ['gary'],
        holeRange: { start: 10, end: 18 },
        nineLabel: 'Back 9',
      },
      {
        id: 'singles-b4',
        label: 'Todd vs Slim — Back 9',
        shortLabel: 'Todd vs Slim',
        team1Players: ['todd'],
        team2Players: ['slim'],
        holeRange: { start: 10, end: 18 },
        nineLabel: 'Back 9',
      },
    ],
  },
];

export function getRound(roundId) {
  return ROUNDS.find(r => r.id === roundId);
}

export function getMatchup(matchupId) {
  for (const round of ROUNDS) {
    const matchup = round.matchups.find(m => m.id === matchupId);
    if (matchup) return { matchup, round };
  }
  return null;
}

// Key player used when storing a single-team score (scramble / alt shot)
export function teamScoreKey(players) {
  return players[0];
}
