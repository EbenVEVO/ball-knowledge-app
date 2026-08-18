import { Text, View, Image } from 'react-native'
import React from 'react'
import { getStatLabel, getStatValue, isRatingStat, getRatingColor } from '@/constants/statLabels'

export const QueryLeaderboard = ({ results, highlightedStat, focusPlayerId }) => {
  const highlightedIsRating = isRatingStat(highlightedStat)
  return (
    <View className='rounded-2xl bg-white shadow-sm p-5'>
      <View className='flex flex-row items-center p-3 gap-2'>
        <Text className='font-supreme' style={{ width: 30 }}>#</Text>
        <Text className='font-supreme flex-1'>Name</Text>
        <Text className='font-supreme text-center uppercase font-bold text-purple-500' style={{ width: 70 }}>
          {getStatLabel(highlightedStat)}
        </Text>
      </View>
      <View className='border-b border-gray-300 w-full' />
      {results.map((item, index) => {
        // Prefer the backend RANK() column (correct even when a focus player is spliced
        // in from outside the top 10); fall back to array position.
        const rank = item.rank ?? index + 1
        const isFocus = focusPlayerId != null && item.player_id === focusPlayerId
        return (
          <View key={item.player_id ?? item.club_id ?? index}>
            <View
              className='flex flex-row items-center p-3 gap-2'
              style={isFocus ? { backgroundColor: '#F3ECFA', borderRadius: 12 } : undefined}
            >
              <Text className='font-supremeBold' style={{ width: 30, color: isFocus ? '#A477C7' : undefined }}>
                {rank}
              </Text>
              <View className='flex flex-row items-center gap-2 flex-1'>
                <Image source={{ uri: item.photo ?? item.club_logo }} style={{ width: 32, height: 32 }} className='rounded-full' />
                <View className='flex-1'>
                  <Text className='font-supreme' numberOfLines={1}>{item.transfermarkt_name ?? item.club_name}</Text>
                  {item.transfermarkt_name && item.club_name &&
                    <View className='flex flex-row items-center gap-1'>
                      <Image source={{ uri: item.club_logo }} resizeMode='contain' style={{ width: 16, height: 16 }} />
                      <Text className='font-supreme text-xs text-gray-500' numberOfLines={1}>{item.club_name}</Text>
                    </View>}
                </View>
              </View>
              <View style={{ width: 70, alignItems: 'center' }}>
                {highlightedIsRating ?
                  <View style={{ backgroundColor: getRatingColor(getStatValue(item, highlightedStat)), borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, minWidth: 46, alignItems: 'center' }}>
                    <Text className='font-supremeBold text-white'>{getStatValue(item, highlightedStat) ?? '-'}</Text>
                  </View>
                  :
                  <Text className='font-supremeBold text-center'>{getStatValue(item, highlightedStat) ?? '-'}</Text>}
              </View>
            </View>
            {index !== results.length - 1 && <View className='border-b border-gray-300 w-full' />}
          </View>
        )
      })}
    </View>
  )
}

export default QueryLeaderboard