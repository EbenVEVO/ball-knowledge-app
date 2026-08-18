import { Text, View } from 'react-native'
import React from 'react'
import { getStatLabel, getStatValue } from '@/constants/statLabels'

export const QueryStatHero = ({ results, highlightedStat }) => {
  const item = results?.[0]
  if (!item) return null
  const value = getStatValue(item, highlightedStat)

  return (
    <View className='rounded-2xl bg-white shadow-sm p-8 items-center'>
      <Text className='font-supreme text-center uppercase text-gray-400' style={{ letterSpacing: 1 }}>
        {getStatLabel(highlightedStat)}
      </Text>
      <Text className='font-supremeExtraBold text-center' style={{ fontSize: 56 }}>
        {value ?? '-'}
      </Text>
    </View>
  )
}

export default QueryStatHero
