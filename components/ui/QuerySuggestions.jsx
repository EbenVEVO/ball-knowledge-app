import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

const PURPLE = '#A477C7'

export const QuerySuggestions = ({ suggestions }) => {
  if (!suggestions?.length) return null
  return (
    <View style={{ gap: 10 }}>
      <Text className='font-supremeBold text-gray-400' style={{ fontSize: 13 }}>
        Suggested questions
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {suggestions.map((s, i) => (
          <Pressable
            key={i}
            onPress={() => router.push(`/query/${encodeURIComponent(s)}`)}
            style={({ pressed }) => ({
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: PURPLE,
              backgroundColor: pressed ? PURPLE : '#F3ECFA',
            })}
          >
            {({ pressed }) => (
              <Text className='font-supreme' style={{ color: pressed ? 'white' : PURPLE, fontSize: 13 }}>
                {s}
              </Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  )
}

export default QuerySuggestions
