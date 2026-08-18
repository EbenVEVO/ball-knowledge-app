import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { DOMESTIC_LEAGUE_IDS, CHAMPIONS_LEAGUE_ID } from '@/lib/leagueScope'
import { DISPLAY_SEASON } from '@/lib/season'
import LeagueTable from '@/components/ui/LeagueTable'

const PAGER_ORDER = [...DOMESTIC_LEAGUE_IDS, CHAMPIONS_LEAGUE_ID]

const HomeLeagueTableCard = () => {
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const fetchLeagues = async () => {
      const { data: competitions } = await supabase
        .from('competitions')
        .select('id, name, logo, country')
        .in('id', PAGER_ORDER)

      const { data: seasons } = await supabase
        .from('seasons')
        .select('id, competition_id')
        .in('competition_id', PAGER_ORDER)
        .eq('season', DISPLAY_SEASON)

      const seasonByCompetitionId = Object.fromEntries((seasons ?? []).map(s => [s.competition_id, s]))

      const ordered = PAGER_ORDER
        .map(id => competitions?.find(c => c.id === id))
        .filter(Boolean)
        .map(c => ({ ...c, season: seasonByCompetitionId[c.id] }))
        .filter(l => l.season)

      setLeagues(ordered)
      const defaultIndex = ordered.findIndex(l => l.id === 39)
      setActiveIndex(defaultIndex >= 0 ? defaultIndex : 0)
      setLoading(false)
    }

    fetchLeagues()
  }, [])

  const goPrev = () => setActiveIndex(i => (i - 1 + leagues.length) % leagues.length)
  const goNext = () => setActiveIndex(i => (i + 1) % leagues.length)

  const activeLeague = leagues[activeIndex]

  return (
    <View className='rounded-xl bg-white' style={{ borderColor: '#e0e0e0', borderWidth: 1, overflow: 'hidden' }}>
      <Text className='text-xl p-2 px-4 font-supremeBold'>League Table</Text>
      <View style={{ width: '100%', height: 1, backgroundColor: '#e0e0e0' }} />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 16 }} />
      ) : !leagues.length ? (
        <Text className='font-supreme' style={{ color: 'gray', marginTop: 16, marginBottom: 16, textAlign: 'center' }}>
          No leagues to show
        </Text>
      ) : (
        <>
          <View className='flex flex-row items-center justify-between' style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
            <View className='flex flex-row items-center gap-2'>
              <Image source={{ uri: activeLeague.logo }} style={{ width: 32, height: 32 }} resizeMode='contain' />
              <View>
                <Text className='font-supremeBold text-base'>{activeLeague.name}</Text>
                {activeLeague.country ? (
                  <Text className='font-supreme text-xs' style={{ color: 'gray' }}>{activeLeague.country}</Text>
                ) : null}
              </View>
            </View>

            <View className='flex flex-row items-center gap-3'>
              <Pressable onPress={goPrev} hitSlop={8}>
                <Ionicons name='chevron-back' size={18} color='#655085' />
              </Pressable>
              <View className='flex flex-row items-center gap-1'>
                {leagues.map((l, i) => (
                  <View
                    key={l.id}
                    style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: i === activeIndex ? '#A477C7' : '#DBDBDB' }}
                  />
                ))}
              </View>
              <Pressable onPress={goNext} hitSlop={8}>
                <Ionicons name='chevron-forward' size={18} color='#655085' />
              </Pressable>
            </View>
          </View>

          <LeagueTable season={activeLeague.season} />
        </>
      )}
    </View>
  )
}

export default HomeLeagueTableCard
