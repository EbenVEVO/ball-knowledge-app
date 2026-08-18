// Shared between QueryStatTable, QueryLeaderboard, QueryTeamCard, and QueryStatHero
// so the NL query result components agree on how to read a row's stat value.
export const STAT_LABELS = {
  goals: 'Gls',
  assists: 'Ast',
  minutes: 'Min',
  shots: 'SH',
  shots_on_goal: 'OG',
  passes: 'Pas',
  key_passes: 'KP',
  dribbles_successful: 'Drb',
  dribbles_attempted: 'Drb(A)',
  tackles: 'Tkl',
  interceptions: 'Int',
  blocks: 'Blk',
  duels_won: 'Dls',
  duels: 'Dls(T)',
  fouls: 'Fls',
  fouled: 'Fld',
  yellow_cards: 'YC',
  red_cards: 'RC',
  penalties_scored: 'Pen',
  penalties_missed: 'Pen(M)',
  penalties_conceded: 'PC',
  rating: 'Rtg',
  pass_accuracy: 'PA%',
  avg_rating: 'Avg Rtg',
  total_goals: 'Gls',
  total_assists: 'Ast',
  total_ga: 'G/A',
  played: 'Played',
  win: 'W',
  draw: 'D',
  lose: 'L',
  goals_for: 'GF',
  goals_against: 'GA',
  points: 'Pts',
}

export const getStatLabel = (highlightedStat) => STAT_LABELS[highlightedStat] ?? highlightedStat

// The backend's highlighted_stat label doesn't always match its own SQL column
// alias (e.g. it reports "G/A" while the generated column is `total_ga`) —
// normalize known mismatches here so every component reads the same value.
const STAT_KEY_ALIASES = {
  'G/A': 'total_ga',
}

export const getStatValue = (item, highlightedStat) => {
  const key = STAT_KEY_ALIASES[highlightedStat] ?? highlightedStat
  return item?.[key]
}

const RATING_STAT_KEYS = new Set(['rating', 'avg_rating'])

export const isRatingStat = (highlightedStat) => RATING_STAT_KEYS.has(highlightedStat)

// Same red/orange/green/blue rating-badge scale used in PlayerGames/PlayerLastGame/LineupPlayer.
export const getRatingColor = (rating) => {
  const n = parseFloat(rating)
  if (rating == null || Number.isNaN(n)) return '#ccc'
  if (n >= 9) return '#12CCFF'
  if (n >= 7) return '#4CAF50'
  if (n >= 6) return '#FF9800'
  return '#f44336'
}
