// ─── Course ──────────────────────────────────────────────────────────────────
// Update par and strokeIndex to match your actual course before the tournament.
export const COURSE = {
  name: 'SECIT VII',
  rating: 71.5,
  slope: 128,
  par: 72,
  // Par per hole (index 0 = hole 1)
  pars: [4, 4, 3, 4, 5, 3, 4, 4, 4, 4, 5, 3, 4, 4, 3, 4, 4, 5],
  // Stroke index per hole — 1 = hardest, 18 = easiest
  strokeIndex: [7, 13, 3, 11, 1, 15, 5, 9, 17, 2, 8, 14, 4, 10, 18, 6, 12, 16],
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

// ─── Rounds & Matchups ───────────────────────────────────────────────────────
// Pairings below follow a Ryder Cup style rotation — adjust if needed.
export const ROUNDS = [
  {
    id: 'warmup',
    number: 0,
    name: 'Warm-Up',
    subtitle: 'Best Ball',
    format: 'best_ball',
    countsForCup: false,
    description: 'All 8 players, best ball — practice round, no Cup points',
    matchups: [
      {
        id: 'warmup-1',
        label: 'Team 1 vs Team 2',
        shortLabel: 'All vs All',
        team1Players: ['derek', 'brandon', 'tyson', 'todd'],
        team2Players: ['gary', 'slim', 'mike', 'ketan'],
      },
    ],
  },
  {
    id: 'match1',
    number: 1,
    name: 'Match 1',
    subtitle: 'Modified Alternate Shot',
    format: 'modified_alternate_shot',
    countsForCup: true,
    description: 'Partners alternate shots. Team handicap = 50% of combined course handicaps.',
    matchups: [
      {
        id: 'match1-1',
        label: 'Derek & Brandon vs Gary & Slim',
        shortLabel: 'D+B vs G+S',
        team1Players: ['derek', 'brandon'],
        team2Players: ['gary', 'slim'],
      },
      {
        id: 'match1-2',
        label: 'Tyson & Todd vs Mike & Ketan',
        shortLabel: 'T+T vs M+K',
        team1Players: ['tyson', 'todd'],
        team2Players: ['mike', 'ketan'],
      },
    ],
  },
  {
    id: 'match2',
    number: 2,
    name: 'Match 2',
    subtitle: 'Scramble',
    format: 'scramble',
    countsForCup: true,
    description: 'All hit from tee, team picks best shot. Team handicap = 35% lower + 15% higher.',
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
    id: 'match3',
    number: 3,
    name: 'Match 3',
    subtitle: 'Best Ball',
    format: 'best_ball',
    countsForCup: true,
    description: 'Each player plays own ball. Best net score per team counts.',
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
    id: 'singles',
    number: 4,
    name: 'Final Singles',
    subtitle: 'Individual Match Play',
    format: 'singles',
    countsForCup: true,
    description: 'Individual net match play. Full course handicap applied.',
    matchups: [
      {
        id: 'singles-1',
        label: 'Derek vs Gary',
        shortLabel: 'D vs G',
        team1Players: ['derek'],
        team2Players: ['gary'],
      },
      {
        id: 'singles-2',
        label: 'Brandon vs Slim',
        shortLabel: 'B vs S',
        team1Players: ['brandon'],
        team2Players: ['slim'],
      },
      {
        id: 'singles-3',
        label: 'Tyson vs Mike',
        shortLabel: 'T vs M',
        team1Players: ['tyson'],
        team2Players: ['mike'],
      },
      {
        id: 'singles-4',
        label: 'Todd vs Ketan',
        shortLabel: 'To vs K',
        team1Players: ['todd'],
        team2Players: ['ketan'],
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

// Which player id is used as the "key" when entering a single-score-per-team format
export function teamScoreKey(players) {
  return players[0];
}

// Total Cup points available
export const CUP_POINTS_AVAILABLE = ROUNDS.filter(r => r.countsForCup)
  .reduce((sum, r) => sum + r.matchups.length, 0);
