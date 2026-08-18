import { Text, View, Image } from 'react-native'
import React from 'react'
import { getStatLabel, getStatValue } from '@/constants/statLabels'

const TEAM_STAT_FIELDS = [
  { key: 'played', label: 'Played' },
  { key: 'win', label: 'W' },
  { key: 'draw', label: 'D' },
  { key: 'lose', label: 'L' },
  { key: 'goals_for', label: 'GF' },
  { key: 'goals_against', label: 'GA' },
  { key: 'points', label: 'Pts' },
]

export const QueryTeamCard = ({ results, highlightedStat }) => {
  return (
    <View className='gap-3'>
      {results.map((item, index) => {
        const colors = item.colors ?? ['#655085', '#FFFFFF']
        const availableStats = TEAM_STAT_FIELDS.filter(({ key }) => item[key] != null && key !== highlightedStat)
        return (
          <View key={item.club_id ?? index} className='rounded-2xl shadow-sm p-4 gap-3' style={{ backgroundColor: colors[0] }}>
            <View className='flex flex-row items-center gap-3'>
              <Image source={{ uri: item.club_logo }} resizeMode='contain' style={{ width: 40, height: 40 }} />
              <Text className='font-supremeBold text-lg flex-1' style={{ color: colors[1] }} numberOfLines={1}>
                {item.club_name}
              </Text>
              <View className='items-end'>
                <Text className='font-supreme text-xs uppercase' style={{ color: colors[1], opacity: 0.8 }}>
                  {getStatLabel(highlightedStat)}
                </Text>
                <Text className='font-supremeExtraBold text-2xl' style={{ color: colors[1] }}>
                  {getStatValue(item, highlightedStat) ?? '-'}
                </Text>
              </View>
            </View>
            {availableStats.length > 0 &&
              <View className='flex flex-row justify-between' style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.25)', paddingTop: 8 }}>
                {availableStats.map(({ key, label }) => (
                  <View key={key} className='items-center'>
                    <Text className='font-supreme text-xs uppercase' style={{ color: colors[1], opacity: 0.7 }}>{label}</Text>
                    <Text className='font-supremeBold' style={{ color: colors[1] }}>{item[key]}</Text>
                  </View>
                ))}
              </View>}
          </View>
        )
      })}
    </View>
  )
}

export default QueryTeamCard
