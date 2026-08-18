import { FEATURED_LEAGUE_IDS } from './featuredLeagues'

export const CHAMPIONS_LEAGUE_ID = 2
export const DOMESTIC_LEAGUE_IDS = FEATURED_LEAGUE_IDS.filter(id => id !== CHAMPIONS_LEAGUE_ID)
export const EUROPE_TOP5_SCOPE = 'europe_top5'

export const buildScopeOptions = (competitionsById) => [
  { value: EUROPE_TOP5_SCOPE, label: 'Europe Top 5', leagueIds: DOMESTIC_LEAGUE_IDS },
  ...DOMESTIC_LEAGUE_IDS.map(id => ({ value: String(id), label: competitionsById[id]?.name ?? '', leagueIds: [id] })),
  { value: String(CHAMPIONS_LEAGUE_ID), label: competitionsById[CHAMPIONS_LEAGUE_ID]?.name ?? '', leagueIds: [CHAMPIONS_LEAGUE_ID] },
]

// club_leaderboards/player_leaderboards are precomputed by
// ball-knowledge-poller/build_leaderboards.py, which writes rows under named
// scopes (its SCOPES dict) rather than the raw league id strings the dropdown
// above uses. Keep this in sync with that dict by hand - same caveat as the
// DISPLAY_SEASON/SCOPES config in that script.
const LEAGUE_ID_TO_LEADERBOARD_SCOPE = {
  39: 'premier_league',
  140: 'la_liga',
  135: 'serie_a',
  78: 'bundesliga',
  61: 'ligue_1',
  [CHAMPIONS_LEAGUE_ID]: 'champions_league',
}

export const scopeToLeaderboardScope = (scope) =>
  scope === EUROPE_TOP5_SCOPE ? scope : (LEAGUE_ID_TO_LEADERBOARD_SCOPE[Number(scope)] ?? scope)
