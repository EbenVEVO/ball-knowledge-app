import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const fixtureFromRow = (row) => ({
  id: row.fixture_id,
  date_time_utc: row.date_time_utc ?? row.match_date,
  home_score: row.home_score,
  away_score: row.away_score,
  home_team: { id: row.home_team_id, club_name: row.home_club_name, logo: row.home_logo },
  away_team: { id: row.away_team_id, club_name: row.away_club_name, logo: row.away_logo },
})

// Builds the full pool of "next match" / "last match" / "player last match"
// candidates for everything the given user follows. Takes an explicit userId
// (rather than reading the session itself) so it works both for the logged-in
// user's own preview collage and for viewing another user's following map.
export const useFollowingActivity = (userId) => {
  const [status, setStatus] = useState('loading')
  const [pool, setPool] = useState([])

  useEffect(() => {
    if (!userId) {
      setStatus('empty')
      return
    }

    let cancelled = false
    setStatus('loading')
    setPool([])

    const fetchFollowing = async () => {
      const [{ data: followedTeams }, { data: followedPlayers }] = await Promise.all([
        supabase.from('users_followed_teams').select('team_id, team:team_id(id, club_name, logo)').eq('user_id', userId),
        supabase.from('users_followed_players').select('player_id, player:player_id(id, transfermarkt_name, photo)').eq('user_id', userId),
      ])

      const teams = followedTeams?.map(t => t.team).filter(Boolean) ?? []
      const players = followedPlayers?.map(p => p.player).filter(Boolean) ?? []

      if (teams.length === 0 && players.length === 0) {
        if (!cancelled) setStatus('empty')
        return
      }

      const teamIds = teams.map(t => t.id)
      const playerIds = players.map(p => p.id)
      const teamById = new Map(teams.map(t => [t.id, t]))
      const playerById = new Map(players.map(p => [p.id, p]))

      const [{ data: nextFixtures }, { data: lastFixtures }, { data: playerLast }] = await Promise.all([
        teamIds.length ? supabase.rpc('get_next_fixtures_for_teams', { team_ids: teamIds }) : Promise.resolve({ data: [] }),
        teamIds.length ? supabase.rpc('get_last_fixtures_for_teams', { team_ids: teamIds }) : Promise.resolve({ data: [] }),
        playerIds.length ? supabase.rpc('get_last_stats_for_players', { player_ids: playerIds }) : Promise.resolve({ data: [] }),
      ])

      if (cancelled) return

      const candidates = []

      for (const row of nextFixtures ?? []) {
        const team = teamById.get(row.team_id)
        if (!team) continue
        const fixture = fixtureFromRow(row)
        const opponent = fixture.home_team.id === row.team_id ? fixture.away_team : fixture.home_team
        candidates.push({ key: `next-${row.team_id}`, type: 'nextMatch', team, opponent, fixture })
      }

      for (const row of lastFixtures ?? []) {
        const team = teamById.get(row.team_id)
        if (!team) continue
        const fixture = fixtureFromRow(row)
        const opponent = fixture.home_team.id === row.team_id ? fixture.away_team : fixture.home_team
        candidates.push({ key: `last-${row.team_id}`, type: 'lastMatch', team, opponent, fixture })
      }

      for (const row of playerLast ?? []) {
        const player = playerById.get(row.player_id)
        if (!player) continue
        const fixture = fixtureFromRow(row)
        const opponent = fixture.home_team.id !== row.team_id ? fixture.home_team : fixture.away_team
        candidates.push({ key: `player-${row.player_id}`, type: 'playerLastMatch', player, opponent, rating: row.rating, fixture })
      }

      if (candidates.length === 0) {
        setStatus('empty')
        return
      }

      setPool(candidates)
      setStatus('ready')
    }

    fetchFollowing().catch((error) => {
      console.log(error)
      if (!cancelled) setStatus('empty')
    })

    return () => { cancelled = true }
  }, [userId])

  return { status, pool }
}
