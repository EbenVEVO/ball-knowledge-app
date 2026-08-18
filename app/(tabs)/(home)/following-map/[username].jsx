import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { supabase } from '@/lib/supabase'
import { useFollowingActivity } from '@/hooks/useFollowingActivity'
import FollowingActivityCard from '@/components/ui/FollowingActivityCard'
import { COLLAGE_ZONES, COLLAGE_BAND_HEIGHT, shuffle, chunkForCollage } from '@/components/ui/followingCollage'

export default function FollowingMapScreen() {
  const router = useRouter()
  const { username } = useLocalSearchParams()
  const [profile, setProfile] = useState(null)
  const [profileStatus, setProfileStatus] = useState('loading')

  useEffect(() => {
    if (!username) return
    let cancelled = false
    setProfileStatus('loading')

    supabase.from('users_profiles').select('user_id, username').eq('username', username).single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          setProfileStatus('not_found')
          return
        }
        setProfile(data)
        setProfileStatus('ready')
      })

    return () => { cancelled = true }
  }, [username])

  const { status, pool } = useFollowingActivity(profile?.user_id)

  // Shuffle once per pool, then tile it in COLLAGE_ZONES-sized bands so the
  // full list still reads as a collage rather than a plain grid.
  const bands = useMemo(() => chunkForCollage(shuffle(pool)), [pool])

  const isLoading = profileStatus === 'loading' || (profileStatus === 'ready' && status === 'loading')

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name='chevron-back' size={26} color='black' />
        </Pressable>
        <Text className='font-supremeBold text-xl'>
          {profile ? `@${profile.username}'s Following` : 'Following Map'}
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color='#A477C7' />
        </View>
      ) : profileStatus === 'not_found' ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text className='font-supreme text-gray-400 text-center'>User not found.</Text>
        </View>
      ) : status === 'empty' || pool.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text className='font-supreme text-gray-400 text-center'>
            {profile?.username} isn&apos;t following anyone yet.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {bands.map((band, bandIndex) => (
            <View
              key={bandIndex}
              style={{ position: 'relative', width: '100%', height: COLLAGE_BAND_HEIGHT, marginBottom: 24 }}
            >
              {band.map((candidate, i) => (
                <FollowingActivityCard key={candidate.key} candidate={candidate} style={COLLAGE_ZONES[i]} />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  )
}
