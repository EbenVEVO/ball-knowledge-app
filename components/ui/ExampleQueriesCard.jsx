import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

const PURPLE = '#A477C7'

const EXAMPLE_QUERIES = [
  'Most hattricks scored this season',
  'Most dribbles completed in the premier league past 2 seasons',
  'Did Arsenal win?',
  'Most duels won in a La Liga match',
]

const ExampleQueriesCard = () => {
  return (
    <View className='rounded-xl bg-white p-4' style={{ borderColor: '#e0e0e0', borderWidth: 1, gap: 12 }}>
      <Text className='text-xl font-supremeBold'>Example Queries</Text>

      <View style={{ gap: 10 }}>
        {EXAMPLE_QUERIES.map((query, i) => (
          <Pressable
            key={i}
            // Explicit group path so this always opens the Search tab's query screen -
            // a bare `/query/...` push resolves within whichever tab's stack this card
            // is rendered in (Home), landing on the Home tab's own query route instead.
            onPress={() => router.push(`/(tabs)/(search)/query/${encodeURIComponent(query)}`)}
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
                {query}
              </Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  )
}

export default ExampleQueriesCard
