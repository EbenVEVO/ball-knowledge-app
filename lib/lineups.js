import { supabase } from './supabase'

// Normalizes a fixture_lineups.starting_lineup entry into a flat player shape,
// handling both the nested {player:{...}} API shape and an already-flat shape.
export const normalizeLineupPlayers = (lineup) => {
  if (!lineup || !Array.isArray(lineup)) return []
  return lineup.map((player) =>
    player?.player
      ? {
          player_id: player.player.id,
          player_name: player.player.name,
          number: player.player.number,
          grid: player.player.grid,
          position: player.player.pos,
        }
      : player
  )
}

// Groups normalized players by grid row, then maps each row's player count to a
// disambiguated (L/C/R-qualified) role array. Based on FixtureLineups.jsx's
// lineupFormation() rather than LastLineup.jsx's copy, since the latter is missing
// the lone-row-3-player -> CDM case.
export const lineupFormationMap = (lineup) => {
  const normalized = normalizeLineupPlayers(lineup)
  const playersByRow = {}
  normalized
    .filter((p) => p?.grid)
    .forEach((player) => {
      const [row] = player.grid.split(':').map(Number)
      if (!playersByRow[row]) playersByRow[row] = []
      playersByRow[row].push(player)
    })

  if (Object.keys(playersByRow).length === 0) return {}
  const row = (n) => playersByRow[n] ?? []

  const backFour = () =>
    row(2).length === 3 ? ['LCB', 'CB', 'RCB']
    : row(2).length === 4 ? ['LB', 'LCB', 'RCB', 'RB']
    : row(2).length === 5 ? ['LB', 'LCB', 'CB', 'RCB', 'RB']
    : []

  const midThree = () =>
    row(3).length === 1 ? ['CDM']
    : row(3).length === 2 ? ['LCM', 'RCM']
    : row(3).length === 3 ? ['LCM', 'CM', 'RCM']
    : row(3).length === 4 ? ['LM', 'LCM', 'RCM', 'RM']
    : row(3).length === 5 ? ['LM', 'LCM', 'CM', 'RCM', 'RM']
    : []

  if (Object.keys(playersByRow).length < 5) {
    return {
      1: ['GK'],
      2: backFour(),
      3: midThree(),
      4: row(4).length === 1 ? ['ST'] : row(4).length === 2 ? ['LS', 'RS'] : row(4).length === 3 ? ['LW', 'ST', 'RW'] : [],
    }
  }

  return {
    1: ['GK'],
    2: backFour(),
    3: midThree(),
    4: row(4).length === 1 ? ['CAM'] : row(4).length === 2 ? ['LAM', 'RAM'] : row(4).length === 3 ? ['LAM', 'CAM', 'RAM'] : [],
    5: row(5).length === 1 ? ['ST'] : row(5).length === 2 ? ['LS', 'RS'] : row(5).length === 3 ? ['LW', 'ST', 'RW'] : [],
  }
}

// A club's most recent finished-match lineup, mirroring LastLineup.jsx's query chain.
export const fetchClubLastLineup = async (clubId) => {
  const { data: fixtures, error: fixturesError } = await supabase
    .from('fixtures')
    .select('*')
    .or(`home_team_id.eq.${clubId},away_team_id.eq.${clubId}`)
    .eq('match_status', 'Match Finished')
    .order('date_time_utc', { ascending: false })
    .limit(1)
  if (fixturesError || !fixtures?.length) {
    return { data: null, error: fixturesError ?? new Error('No finished fixtures for this club') }
  }

  const fixtureId = fixtures[0].id
  const { data: playerStats, error: playerStatsError } = await supabase
    .from('player_stats')
    .select('*, team:team_id(club_name, logo), player:player_id(photo, nationality, DOB, country_code, flag: country_code(flag_url))')
    .eq('fixture_id', fixtureId)
  if (playerStatsError) return { data: null, error: playerStatsError }

  const { data: lineups, error: lineupsError } = await supabase
    .from('fixture_lineups')
    .select('*')
    .eq('fixture_id', fixtureId)
  if (lineupsError) return { data: null, error: lineupsError }

  const teamLineup = lineups?.find((l) => l.team_id === clubId)
  if (!teamLineup?.starting_lineup?.length) {
    return { data: null, error: new Error('No lineup data for this club') }
  }

  return { data: { startingLineup: teamLineup.starting_lineup, playerStats: playerStats ?? [] }, error: null }
}
