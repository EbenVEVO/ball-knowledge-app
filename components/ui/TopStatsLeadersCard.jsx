import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { EUROPE_TOP5_SCOPE, scopeToLeaderboardScope } from '@/lib/leagueScope'
import { useLeagueScopeOptions } from '@/hooks/useLeagueScopeOptions'
import LeagueScopeDropdown from '@/components/ui/LeagueScopeDropdown'

const MAX_PLAYERS = 3

const CATEGORIES = [
  { key: 'goals', label: 'Goals', format: (v) => v },
  { key: 'assists', label: 'Assists', format: (v) => v },
  { key: 'rating', label: 'Rating', format: (v) => v?.toFixed(2) },
  { key: 'dribbles_successful', label: 'Dribbles', format: (v) => v },
  { key: 'key_passes', label: 'Key Passes', format: (v) => v },
]

const DEFAULT_PILL_COLOR = '#655085'

const isWhiteHex = (hex) => !!hex && ['#fff', '#ffffff'].includes(hex.trim().toLowerCase())

const pillColor = (team) => {
  const [primary, secondary] = team?.colors ?? []
  if (!primary) return DEFAULT_PILL_COLOR
  if (isWhiteHex(primary)) return secondary ?? DEFAULT_PILL_COLOR
  return primary
}

const playerName = (player) => {
  if (player?.transfermarkt_name) return player.transfermarkt_name
  const parts = player?.name?.trim().split(/\s+/) ?? []
  if (parts.length > 2) return `${parts[0]} ${parts[parts.length - 1]}`
  return player?.name
}

const TopStatsLeadersCard = () => {
  const scopeOptions = useLeagueScopeOptions()
  const [scope, setScope] = useState(EUROPE_TOP5_SCOPE)
  const [leaderboards, setLeaderboards] = useState(null)

  useEffect(() => {
    const fetchPlayerLeaderboards = async () => {
      setLeaderboards(null)

      const { data, error } = await supabase.from('player_leaderboards')
        .select('category, rank, value, player:player_id(id, name, transfermarkt_name, photo), team:team_id(id, club_name, logo, colors)')
        .eq('scope', scopeToLeaderboardScope(scope))
        .order('rank', { ascending: true })

      if (error) { console.log(error); setLeaderboards([]); return }
      if (!data?.length) { setLeaderboards([]); return }

      const byCategory = {}
      for (const row of data) {
        if (!row.player) continue
        ;(byCategory[row.category] ??= []).push(row)
      }

      setLeaderboards(CATEGORIES.map(cat => ({
        ...cat,
        players: (byCategory[cat.key] ?? []).slice(0, MAX_PLAYERS).map(row => ({
          player_id: row.player.id,
          player: row.player,
          team: row.team,
          value: row.value != null ? Number(row.value) : null,
        })),
      })))
    }

    fetchPlayerLeaderboards()
  }, [scope])

  return (
    <View className='rounded-xl bg-white' style={{ borderColor: '#e0e0e0', borderWidth: 1 }}>
      <Text className='text-xl p-2 px-4 font-supremeBold'>European Top 5 Stat Leaders</Text>
      <View style={{ width: '100%', height: 1, backgroundColor: '#e0e0e0' }} />

      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <LeagueScopeDropdown options={scopeOptions ?? []} value={scope} onChange={setScope} />
      </View>

      {leaderboards === null ? (
        <ActivityIndicator style={{ marginTop: 16, marginBottom: 16 }} />
      ) : leaderboards.length === 0 ? (
        <Text className='font-supreme' style={{ color: 'gray', marginTop: 16, marginBottom: 16, textAlign: 'center' }}>
          No stats to show
        </Text>
      ) : (
        <View style={{ padding: 16, gap: 20 }}>
          {leaderboards.map(cat => (
            <View key={cat.key}>
              <Text className='font-supremeBold text-sm' style={{ color: 'gray', marginBottom: 8 }}>{cat.label.toUpperCase()}</Text>
              {cat.players.length === 0 ? (
                <Text className='font-supreme' style={{ color: 'gray' }}>No data</Text>
              ) : cat.players.map((p, i) => (
                <Link key={p.player_id} href={{ pathname: '/player/[id]', params: { id: p.player_id } }} asChild>
                  <Pressable className='flex flex-row items-center' style={{ gap: 8, paddingVertical: 6 }}>
                    <Text className='font-supremeBold' style={{ width: 16, color: '#9ca3af' }}>{i + 1}</Text>
                    <Image source={{ uri: p.player?.photo }} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#e5e7eb' }} />
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} className='font-supreme text-sm'>{playerName(p.player)}</Text>
                      <Text numberOfLines={1} className='font-supreme text-xs' style={{ color: '#9ca3af' }}>{p.team?.club_name}</Text>
                    </View>
                    <View className='rounded-xl' style={{ backgroundColor: pillColor(p.team), paddingHorizontal: 10, paddingVertical: 4, minWidth: 34, alignItems: 'center' }}>
                      <Text className='font-supremeBold text-sm' style={{ color: '#fff' }}>{cat.format(p.value)}</Text>
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

export default TopStatsLeadersCard
