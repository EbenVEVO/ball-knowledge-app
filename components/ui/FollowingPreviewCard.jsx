import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import React, { useMemo } from 'react'
import { Link } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { useFollowingActivity } from '@/hooks/useFollowingActivity'
import FollowingActivityCard from './FollowingActivityCard'
import { COLLAGE_ZONES, COLLAGE_BAND_HEIGHT, shuffle } from './followingCollage'

const MAX_ITEMS = COLLAGE_ZONES.length

const FollowingPreviewCard = () => {
  const { session, profile } = useAuth()
  const { status, pool } = useFollowingActivity(session?.user?.id)

  const selected = useMemo(() => shuffle(pool).slice(0, MAX_ITEMS), [pool])

  if (!session?.user?.id || status === 'empty') return null

  return (
    <View className='rounded-xl bg-white p-4' style={{ borderColor: '#e0e0e0', borderWidth: 1 }}>
      <Text className='text-xl font-supremeBold'>Following</Text>

      {status === 'loading' ? (
        <View style={{ height: 260, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color='#A477C7' />
        </View>
      ) : (
        <>
          <View style={{ position: 'relative', width: '100%', height: COLLAGE_BAND_HEIGHT, marginTop: 12 }}>
            {selected.map((candidate, i) => (
              <FollowingActivityCard key={candidate.key} candidate={candidate} style={COLLAGE_ZONES[i]} />
            ))}
          </View>

          {profile?.username && (
            <Link href={`/following-map/${profile.username}`} asChild>
              <Pressable style={{ alignItems: 'center', marginTop: 20 }}>
                <View style={{ backgroundColor: '#A477C7', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 48 }}>
                  <Text className='font-supremeExtraBold text-lg' style={{ color: 'white', letterSpacing: 1 }}>MORE...</Text>
                </View>
              </Pressable>
            </Link>
          )}
        </>
      )}
    </View>
  )
}

export default FollowingPreviewCard
