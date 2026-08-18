import { View, Text, ScrollView, Image, Pressable, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { FEATURED_LEAGUE_IDS } from '@/lib/featuredLeagues'

const FeaturedLeagues = () => {
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeagues = async () => {
      const { data } = await supabase
        .from('competitions')
        .select('id, name, logo')
        .in('id', FEATURED_LEAGUE_IDS)

      const ordered = FEATURED_LEAGUE_IDS
        .map(id => data?.find(c => c.id === id))
        .filter(Boolean)

      setLeagues(ordered)
      setLoading(false)
    }

    fetchLeagues()
  }, [])

  return (
    <View className='rounded-xl bg-white  ' style={{borderColor:'#e0e0e0', borderWidth:1}}>
      <Text className='text-xl p-2 px-4 font-supremeBold'>Ball Knowledge Featured Leagues</Text>
      <View style={{width:'100%', height:1, backgroundColor:'#e0e0e0'}}/>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 16 }} />
      ) : leagues.length === 0 ? (
        <Text className='font-supreme' style={{ color: 'gray', marginTop: 16, textAlign: 'center' }}>
          No leagues to show
        </Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingTop: 16, justifyContent: 'center', flexGrow: 1 }}>
          {leagues.map(league => (
            <Link key={league.id} href={{ pathname: '/competition/[id]', params: { id: league.id } }} asChild>
              <Pressable className=' items-center' style={{ padding: 12, width: 90 }}>
                <Image source={{ uri: league.logo }} style={{ width: 40, height: 40 }} resizeMode='contain' />
                <Text numberOfLines={2} className='font-supreme text-xs' style={{ textAlign: 'center', marginTop: 6 }}>
                  {league.name}
                </Text>
              </Pressable>
            </Link>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

export default FeaturedLeagues
