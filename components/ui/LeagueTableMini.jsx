import { StyleSheet, Text, View, ScrollView, Image, FlatList, TouchableOpacity } from 'react-native'
import {Ionicons} from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import {Link} from 'expo-router';
import { supabase } from '../../lib/supabase';
import React from 'react'
import _, { set } from 'lodash';

export const LeagueTableMini = ({season, highlighted}) => {
  const [displayedTeams, setDisplayedTeams] = useState([])

  useEffect(() => {
    const fetchStandings = async () => {
      const { data, error } = await supabase
        .from('league_standings')
        .select(`*, team:club_id(id, club_name, logo)`)
        .eq('season_id', season?.id)
        .order('rank', { ascending: true })

      if (!error) 
        {
      getDisplayedTeams(data)
    }
    }
    fetchStandings()
    
  }, [season])

  const getDisplayedTeams = (standings) => {
    if (!highlighted) setDisplayedTeams(standings.slice(0, 5))

    const highlightedIndex = standings.findIndex(s => s.team.id === highlighted)
    if (highlightedIndex === -1) setDisplayedTeams(standings.slice(0, 5))

    let start = highlightedIndex - 2
    let end = highlightedIndex + 2

    if (start < 0) {
      end += Math.abs(start)
      start = 0
    }
    if (end >= standings.length) {
      start = Math.max(0, start - (end - standings.length + 1))
      end = standings.length - 1
    }
    console.log(standings.slice(start, end + 1), 'displayed teams from' , highlighted)
    setDisplayedTeams(standings.slice(start, end + 1)); 
  }

  const qualificationColor = (description) => {
    if (!description) return 'transparent'
    if (description.includes("Champions League")) return "#009DFF"
    if (description === "Relegation") return "red"
    if (description === "UEFA Europa League") return "#FF8C00"
    if (description === "Conference League Qualification") return "#00D613"
    return 'transparent'
  }

  return (
    <View style={{ backgroundColor: 'white', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <View className='flex flex-row items-center p-2 px-3' style={{ borderBottomWidth: 1, borderColor: '#e5e7eb' }}>
        <Text className='font-supremeBold' style={{ flex: 0.5 }}>#</Text>
        <Text className='font-supremeBold' style={{ flex: 3 }}>Club</Text>
        <Text className='font-supremeBold text-center' style={{ flex: 0.8 }}>PLD</Text>
        <Text className='font-supremeBold text-center' style={{ flex: 0.8 }}>GD</Text>
        <Text className='font-supremeBold text-center' style={{ flex: 0.8 }}>PTS</Text>
      </View>

      {displayedTeams.map((item, index) => (
        <View key={item.id}>
          <View
            className='flex flex-row items-center'
            style={{ backgroundColor: item.team.id === highlighted ? '#A6DEFF' : 'white' }}
          >
            <View style={{ width: 4, height: '100%', backgroundColor: qualificationColor(item.description) }} />
            <View className='flex flex-row items-center p-2 gap-2' style={{ flex: 1 }}>
              <Text className='font-supremeBold' style={{ flex: 0.5 }}>{item.rank}</Text>
              <View className='flex flex-row items-center gap-2' style={{ flex: 3 }}>
                <Image source={{ uri: item.team.logo }} style={{ width: 20, height: 20 }} resizeMode='contain' />
                <Text className='font-supreme' numberOfLines={1} style={{ flex: 1 }}>
                  <Link href={{ pathname: '/club/[id]', params: { id: item.team.id } }}>
                    {item.team.club_name}
                  </Link>
                </Text>
              </View>
              <Text className='font-supreme text-center' style={{ flex: 0.8 }}>{item.played}</Text>
              <Text className='font-supreme text-center' style={{ flex: 0.8 }}>{item.goals_for - item.goals_against}</Text>
              <Text className='font-supremeBold text-center' style={{ flex: 0.8 }}>{item.points}</Text>
            </View>
          </View>
          {index < displayedTeams.length - 1 && (
            <View style={{ borderBottomWidth: 1, borderColor: '#e5e7eb' }} />
          )}
        </View>
      ))}
    </View>
  )
}

export default LeagueTableMini

const styles = StyleSheet.create({

  tableContainer:{
    borderWidth: 1,
    borderColor: 'gray',
  
  }
})