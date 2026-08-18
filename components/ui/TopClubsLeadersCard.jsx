import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { EUROPE_TOP5_SCOPE, scopeToLeaderboardScope } from '@/lib/leagueScope'
import { useLeagueScopeOptions } from '@/hooks/useLeagueScopeOptions'
import LeagueScopeDropdown from '@/components/ui/LeagueScopeDropdown'

const MAX_CLUBS = 3

const CLUB_CATEGORIES = [
  { key: 'goals', label: 'Goals', format: (v) => v },
  { key: 'goals_conceded', label: 'Goals Conceded', format: (v) => v },
  { key: 'goal_diff', label: 'Goal Difference', format: (v) => (v > 0 ? `+${v}` : v) },
  { key: 'possession', label: 'Possession Average', format: (v) => (v != null ? `${v.toFixed(1)}%` : '-') },
  { key: 'clean_sheets', label: 'Clean Sheets', format: (v) => v },
]

const DEFAULT_PILL_COLOR = '#655085'

const isWhiteHex = (hex) => !!hex && ['#fff', '#ffffff'].includes(hex.trim().toLowerCase())

const pillColor = (team) => {
  const [primary, secondary] = team?.colors ?? []
  if (!primary) return DEFAULT_PILL_COLOR
  if (isWhiteHex(primary)) return secondary ?? DEFAULT_PILL_COLOR
  return primary
}

const TopClubsLeadersCard = () => {
  const scopeOptions = useLeagueScopeOptions()
  const [scope, setScope] = useState(EUROPE_TOP5_SCOPE)
  const [leaderboards, setLeaderboards] = useState(null)

  useEffect(() => {
    const fetchClubLeaderboards = async () => {
      setLeaderboards(null)

      const { data, error } = await supabase.from('club_leaderboards')
        .select('category, rank, value, club:club_id(id, club_name, logo, colors)')
        .eq('scope', scopeToLeaderboardScope(scope))
        .order('rank', { ascending: true })

      if (error) { console.log(error); setLeaderboards([]); return }
      if (!data?.length) { setLeaderboards([]); return }

      const byCategory = {}
      for (const row of data) {
        if (!row.club) continue
        ;(byCategory[row.category] ??= []).push(row)
      }

      setLeaderboards(CLUB_CATEGORIES.map(cat => ({
        ...cat,
        clubs: (byCategory[cat.key] ?? []).slice(0, MAX_CLUBS).map(row => ({
          club_id: row.club.id,
          team: row.club,
          value: row.value != null ? Number(row.value) : null,
        })),
      })))
    }

    fetchClubLeaderboards()
  }, [scope])

  return (
    <View className='rounded-xl bg-white' style={{ borderColor: '#e0e0e0', borderWidth: 1 }}>
      <Text className='text-xl p-2 px-4 font-supremeBold'>European Top 5 Club Leaders</Text>
      <View style={{ width: '100%', height: 1, backgroundColor: '#e0e0e0' }} />

      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <LeagueScopeDropdown options={scopeOptions ?? []} value={scope} onChange={setScope} />
      </View>

      {leaderboards === null ? (
        <ActivityIndicator style={{ marginTop: 16, marginBottom: 16 }} />
      ) : leaderboards.length === 0 ? (
        <Text className='font-supreme' style={{ color: 'gray', marginTop: 16, marginBottom: 16, textAlign: 'center' }}>
          No club stats to show
        </Text>
      ) : (
        <View style={{ padding: 16, gap: 20 }}>
          {leaderboards.map(cat => (
            <View key={cat.key}>
              <Text className='font-supremeBold text-sm' style={{ color: 'gray', marginBottom: 8 }}>{cat.label.toUpperCase()}</Text>
              {cat.clubs.length === 0 ? (
                <Text className='font-supreme' style={{ color: 'gray' }}>No data</Text>
              ) : cat.clubs.map((c, i) => (
                <Link key={c.club_id} href={{ pathname: '/club/[id]', params: { id: c.club_id } }} asChild>
                  <Pressable className='flex flex-row items-center' style={{ gap: 8, paddingVertical: 6 }}>
                    <Text className='font-supremeBold' style={{ width: 16, color: '#9ca3af' }}>{i + 1}</Text>
                    <Image source={{ uri: c.team?.logo }} style={{ width: 24, height: 24 }} resizeMode='contain' />
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} className='font-supreme text-sm'>{c.team?.club_name}</Text>
                    </View>
                    <View className='rounded-xl' style={{ backgroundColor: pillColor(c.team), paddingHorizontal: 10, paddingVertical: 4, minWidth: 34, alignItems: 'center' }}>
                      <Text className='font-supremeBold text-sm' style={{ color: '#fff' }}>{cat.format(c.value)}</Text>
                    </View>
                  </Pressable>
                </Link>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

export default TopClubsLeadersCard
