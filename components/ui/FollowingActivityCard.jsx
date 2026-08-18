import { View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import { getRatingColor } from '@/constants/statLabels'

const formatShortDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

// Renders a single "following" activity candidate (next match / last match /
// player last match) as a pressable card. `style` positions the card -
// absolute + zone offsets for the home collage, relative + margin for the
// following map grid.
const FollowingActivityCard = ({ candidate, style }) => {
  const { type } = candidate

  const href = type === 'playerLastMatch'
    ? { pathname: '/player/[id]', params: { id: candidate.player.id } }
    : { pathname: '/fixture/[id]', params: { id: candidate.fixture.id } }

  const tagLabel = type === 'nextMatch' ? 'Next Match' : 'Last Match'

  return (
    <Link href={href} asChild>
      <Pressable
        style={{
          width: 150,
          minHeight: 100,
          backgroundColor: 'white',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#e5e7eb',
          padding: 12,
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
          ...style,
        }}
      >
        {type === 'nextMatch' && (
          <>
            <View className='flex flex-row items-center justify-center' style={{ gap: 8 }}>
              <Image source={{ uri: candidate.team.logo }} style={{ width: 28, height: 28 }} resizeMode='contain' />
              <Text className='font-supremeBold text-xs' style={{ color: 'gray' }}>vs</Text>
              <Image source={{ uri: candidate.opponent.logo }} style={{ width: 28, height: 28 }} resizeMode='contain' />
            </View>
            <Text className='font-supremeBold text-xs' style={{ textAlign: 'center', marginTop: 6 }}>
              {formatShortDate(candidate.fixture.date_time_utc)}
            </Text>
            <Text className='font-supreme text-xs' style={{ textAlign: 'center', color: 'gray' }}>
              {formatTime(candidate.fixture.date_time_utc)}
            </Text>
          </>
        )}

        {type === 'lastMatch' && (
          <View className='flex flex-row items-center justify-center' style={{ gap: 8 }}>
            <Image source={{ uri: candidate.fixture.home_team.logo }} style={{ width: 28, height: 28 }} resizeMode='contain' />
            <Text className='font-supremeBold text-sm'>{`${candidate.fixture.home_score} - ${candidate.fixture.away_score}`}</Text>
            <Image source={{ uri: candidate.fixture.away_team.logo }} style={{ width: 28, height: 28 }} resizeMode='contain' />
          </View>
        )}

        {type === 'playerLastMatch' && (
          <View style={{ alignItems: 'center', gap: 6 }}>
            <View className='flex flex-row items-center' style={{ gap: 6 }}>
              {candidate.player.photo ? (
                <Image source={{ uri: candidate.player.photo }} style={{ width: 28, height: 28, borderRadius: 14 }} />
              ) : (
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#e5e7eb' }} />
              )}
              <Text className='font-supremeBold text-xs' style={{ color: 'gray' }}>vs</Text>
              <Image source={{ uri: candidate.opponent.logo }} style={{ width: 24, height: 24 }} resizeMode='contain' />
            </View>
            <View style={{ backgroundColor: getRatingColor(candidate.rating), borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text className='font-supremeBold text-xs' style={{ color: 'white' }}>
                {candidate.rating != null ? parseFloat(candidate.rating).toFixed(1) : '-'}
              </Text>
            </View>
          </View>
        )}

        <View style={{ position: 'absolute', bottom: -15, left: 0, right: 0, alignItems: 'center' }}>
          <View style={{ backgroundColor: '#f2f2f2', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <Text className='font-supremeBold' style={{ color: '#A477C7', fontSize: 10 }}>{tagLabel}</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  )
}

export default FollowingActivityCard
