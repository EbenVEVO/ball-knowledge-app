import { View, Text, FlatList, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link } from 'expo-router'
import { fetchFeaturedGames } from '@/lib/games'
import TopNavBar from '@/components/navigation/TopNavBar'

const PURPLE = "#A477C7";

export default function GamesScreen() {
  const [games, setGames] = useState([])

  useEffect(() => {
    const loadGames = async () => {
      const { data, error } = await fetchFeaturedGames()
      if (!error) setGames(data)
    }
    loadGames()
  }, [])

  const renderGame = ({ item }) => (
    <Link asChild href={`./${item.slug}`}>
      <Pressable style={{ backgroundColor: PURPLE, borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <Text style={{ fontFamily: 'SupremeExtraBold', color: 'white', fontSize: 16 }}>{item.name}</Text>
        {item.tagline && (
          <Text style={{ fontFamily: 'Supreme', color: 'white', fontSize: 13, marginTop: 4 }}>{item.tagline}</Text>
        )}
      </Pressable>
    </Link>
  )

  return (
    <View style={{ flex: 1 }}>
      <TopNavBar title="Games" />
      <View style={{ padding: 16, flex: 1 }}>
      <Text className='font-supremeBold text-2xl' style={{ marginBottom: 12 }}>Games</Text>
      <FlatList
        data={games}
        renderItem={renderGame}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={() => (
          <View><Text className='font-supreme text-gray-400'>No games available</Text></View>
        )}
      />
      </View>
    </View>
  )
}
