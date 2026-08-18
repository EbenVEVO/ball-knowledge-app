import { View, Text, ScrollView, Image, Pressable, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { isFixtureLive, isFixtureFinished } from '@/lib/matchStatus'
import { FEATURED_LEAGUE_IDS } from '@/lib/featuredLeagues'

const LOOKAHEAD_DAYS = 21

const startOfLocalDayISO = (offsetDays) => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString()
}

const localDateKey = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

const nextMatchdayFixtures = (fixtures) => {
  const byLeague = {}
  for (const f of fixtures) {
    (byLeague[f.league_id] ??= []).push(f)
  }

  return FEATURED_LEAGUE_IDS.flatMap(leagueId => {
    const list = byLeague[leagueId]
    if (!list?.length) return []
    const targetDay = localDateKey(list[0].date_time_utc)
    return list.filter(f => localDateKey(f.date_time_utc) === targetDay)
  })
}

// Object.groupBy is ES2024 and not reliably available in Hermes on native -
// group manually instead of relying on it.
const groupByLeague = (fixtures) => {
  const groups = {}
  for (const f of fixtures) {
    (groups[f.league_id] ??= []).push(f)
  }
  return groups
}

const formatTime = (date) => {
  const options = { hour: 'numeric', minute: '2-digit', hour12: true }
  return new Date(date).toLocaleTimeString('en-US', options)
}

const formatMatchdayDate = (date) => {
  const d = new Date(date)
  return {
    day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    year: d.getFullYear(),
  }
}

const MatchPill = ({ fixture }) => {
  const live = isFixtureLive(fixture.match_status)
  const finished = isFixtureFinished(fixture.match_status)

  return (
    <Link href={{ pathname: '/fixture/[id]', params: { id: fixture.id } }} asChild>
      <Pressable className='rounded-xl' style={{ alignItems: 'center', gap: 6, borderWidth:1, padding:15, borderColor:'#e0e0e0' }}>
        <View className='flex flex-row items-center' style={{ gap: 8 }}>
          <Image source={{ uri: fixture.home_team.logo }} style={{ width: 32, height: 32 }} resizeMode='contain' />

          {live ? (
            <View style={{ alignItems: 'center' }}>
              <Text className='font-supremeBold text-sm'>{`${fixture.home_score} - ${fixture.away_score}`}</Text>
              <View className='flex flex-row items-center gap-1'>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444' }} />
                <Text className='font-supremeBold text-xs' style={{ color: '#ef4444' }}>
                  {fixture.match_status === 'Halftime' ? 'HT' : `${fixture.minute ?? ''}'`}
                </Text>
              </View>
            </View>
          ) : finished ? (
            <Text className='font-supremeBold text-sm'>{`${fixture.home_score} - ${fixture.away_score}`}</Text>
          ) : (
            <Text className='font-supremeBold text-sm'>{formatTime(fixture.date_time_utc)}</Text>
          )}

          <Image source={{ uri: fixture.away_team.logo }} style={{ width: 32, height: 32 }} resizeMode='contain' />
        </View>
      </Pressable>
    </Link>
  )
}

const LeagueGroup = ({ fixturesList }) => {
  const { day, year } = formatMatchdayDate(fixturesList[0].date_time_utc)

  return (
    <View
      className='flex flex-row items-center rounded-xl shadow-sm '
      style={{ backgroundColor: '#ffffff', padding: 10, gap: 12, borderColor:'#e0e0e0', borderWidth:1 }}
    >
      <Image
        source={{ uri: fixturesList[0].competition.logo }}
        style={{ width: 28, height: 28 }}
        resizeMode='contain'
      />

      <View style={{ width: 1, height: 32, backgroundColor: '#e0e0e0' }} />

      <View className='flex flex-row items-center' style={{ gap: 16 }}>
        {fixturesList.map((item) => (
          <MatchPill key={item.id} fixture={item} />
        ))}
      </View>

      <View style={{ width: 1, height: 32, backgroundColor: '#e0e0e0' }} />

      <View style={{ alignItems: 'center' }}>
        <Text className='font-supremeBold text-xs' style={{ color: 'gray' }}>{day}</Text>
        <Text className='font-supremeBold text-xs' style={{ color: 'gray' }}>{year}</Text>
      </View>
    </View>
  )
}

const UpcomingGames = () => {
  const [fixtures, setFixtures] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUpcomingGames = async () => {
      try {
        const { data: seasons, error: seasonsError } = await supabase
          .from('seasons')
          .select('id, competition_id')
          .in('competition_id', FEATURED_LEAGUE_IDS)
          .eq('current', true)

        if (seasonsError) console.log(seasonsError)

        if (!seasons?.length) {
          setFixtures({})
          return
        }

        const { data, error } = await supabase
          .from('fixtures')
          .select(`id, date_time_utc, match_status, minute, home_score, away_score, season_id, league_id,
            home_team:home_team_id(id, club_name, logo),
            away_team:away_team_id(id, club_name, logo),
            competition:league_id(id, name, logo)`)
          .in('season_id', seasons.map(s => s.id))
          .not('match_status', 'like', 'Match Finished%')
          .gte('date_time_utc', startOfLocalDayISO(0))
          .lte('date_time_utc', startOfLocalDayISO(LOOKAHEAD_DAYS))
          .order('date_time_utc', { ascending: true })

        if (error) console.log(error)

        setFixtures(data ? groupByLeague(nextMatchdayFixtures(data)) : {})
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingGames()
  }, [])

  return (
    <View className=' w-full'>
      <Text className='text-xl font-supremeBold'>Upcoming Games</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 16 }} />
      ) : Object.keys(fixtures).length === 0 ? (
        <Text className='font-supreme' style={{ color: 'gray', marginTop: 16, textAlign: 'center' }}>
          No upcoming matches right now
        </Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ gap: 48, paddingVertical: 16, padding:10 }}>
          {Object.entries(fixtures).map(([leagueId, fixturesList]) => (
            <LeagueGroup key={leagueId} fixturesList={fixturesList} />
          ))}
        </ScrollView>
      )}
    </View>
  )
}

export default UpcomingGames
