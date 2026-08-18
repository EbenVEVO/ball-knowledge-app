import { useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Text, View } from 'react-native'
import { FixtureScreen } from '@/components/FixtureScreen'
import { supabase } from '@/lib/supabase'
import { isFixtureFinished } from '@/lib/matchStatus'

const eventKey = (e) => `${e.team_id}-${e.player_id}-${e.time_elapsed}-${e.event_type}-${e.event_details}`

export default function FixturePage(){
    const {id} = useLocalSearchParams()
    const [fixture, setFixture] = useState(null)
    const refetchTimer = useRef(null)

    const fetchFixture = useCallback(async () => {
      const { data, error } = await supabase
    .from('fixtures')
    .select(`
      *,
      home_team:clubs!home_team_id (id, club_name, logo, colors),
      away_team:clubs!away_team_id (id, club_name, logo, colors),
      competition:competitions!league_id (id, name, logo),
      season:seasons!season_id (id, season, competition_name),
      events:fixture_events (*),
      lineups:fixture_lineups (*),
      teamStats:team_stats (*),
      playerStats:player_stats (
        *,
        team:clubs!team_id(club_name, logo, colors),
        player:players!player_id (
          photo,
          nationality,
          DOB,
          country_code,
          flag:countries!country_code (flag_url)
        ),
        fixture: fixture_id
          (date_time_utc,
          home_team: home_team_id (club_name, logo, id),
          away_team: away_team_id (club_name, logo, id), league: league_id (name, logo), home_score, away_score)
      )
    `)
    .eq('id', id)
    .single()
      if (error) {
        console.log(error, 'fetch fixture error')
        return
      }
      setFixture(data)
    }, [id])

    // Debounced full refetch — used when tables that only change once a match
    // finishes (team_stats, player_stats, fixture_lineups reinsert) settle,
    // since those land as several rapid writes rather than a single one.
    const scheduleRefetch = useCallback(() => {
      if (refetchTimer.current) clearTimeout(refetchTimer.current)
      refetchTimer.current = setTimeout(fetchFixture, 1000)
    }, [fetchFixture])

    useEffect(() => {
      if (!id) return
      fetchFixture()

      const channel = supabase
        .channel(`fixture-detail-${id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'fixtures',
          filter: `id=eq.${id}`,
        }, (payload) => {
          setFixture(prev => prev ? { ...prev, ...payload.new } : prev)
          if (!isFixtureFinished(payload.old?.match_status) && isFixtureFinished(payload.new?.match_status)) {
            scheduleRefetch()
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'fixture_events',
          filter: `fixture_id=eq.${id}`,
        }, (payload) => {
          if (payload.eventType === 'DELETE') {
            scheduleRefetch()
            return
          }
          setFixture(prev => {
            if (!prev) return prev
            const key = eventKey(payload.new)
            const exists = prev.events.some(e => eventKey(e) === key)
            const events = exists
              ? prev.events.map(e => (eventKey(e) === key ? payload.new : e))
              : [...prev.events, payload.new]
            return { ...prev, events }
          })
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'fixture_lineups',
          filter: `fixture_id=eq.${id}`,
        }, scheduleRefetch)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'team_stats',
          filter: `fixture_id=eq.${id}`,
        }, scheduleRefetch)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'player_stats',
          filter: `fixture_id=eq.${id}`,
        }, scheduleRefetch)
        .subscribe()

      return () => {
        if (refetchTimer.current) clearTimeout(refetchTimer.current)
        supabase.removeChannel(channel)
      }
    }, [id, fetchFixture, scheduleRefetch])

    if(!fixture) return <Text>Loading...</Text>

    return(
        <View>
            <FixtureScreen fixture={fixture} />
        </View>
    )
}
