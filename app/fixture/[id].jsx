import {useLocalSearchParams} from 'expo-router'
import { View, Text, Image, ScrollView, StyleSheet, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import {FixtureScreen} from '../../components/FixtureScreen'
import {supabase} from '../../lib/supabase'

export default function FixturePage(){
    const {id} = useLocalSearchParams()
    const [fixture, setFixture] = useState(null)
  useEffect(() => {
    const fetchFixture = async () => {
      const { data, error } = await supabase.from('fixtures')
        .select(
          `*,
          home_team:home_team_id (club_name,logo,id,colors),
          away_team:away_team_id (club_name,logo,id,colors),
          competition:league_id (name,id,logo)`
        )
        .eq('id', id)
        .single()

      if (error) {
        console.error('Fixture error:', error)
        return
      }

      const { data: events, error: eventsError } = await supabase
        .from('fixture_events')
        .select('*')
        .eq('fixture_id', id)
        .order('time_elapsed', { ascending:true})

      if (eventsError) {
        console.error('Events error:', eventsError)
        return
      }

      const { data: lineups, error: lineupsError } = await supabase
        .from('fixture_lineups')
        .select('*')
        .eq('fixture_id', id)

      if (lineupsError) {
        console.error('Lineups error:', lineupsError)
        return
      }

      const { data: playerStats, error: playerStatsError } = await supabase
        .from('player_stats')
        .select(`*, team:team_id(club_name, logo), player:player_id (photo, nationality, DOB, country_code, flag: country_code(flag_url))`)
        .eq('fixture_id', id)

      if (playerStatsError) {
        console.error('PlayerStats error:', playerStatsError)
        return
      }
      
      const { data: teamStats, error: teamStatsError } = await supabase
        .from('team_stats')
        .select('*')
        .eq('fixture_id', id)

      if (teamStatsError) {
        console.error('TeamStats error:', teamStatsError)
        return
      }

      setFixture({ ...data, events, lineups, playerStats, teamStats })
    }

    if (id) fetchFixture()
  }, [id])

    if(!fixture) return <Text>Loading...</Text>

  
    return(
        <View>
            <FixtureScreen fixture={fixture} />
        </View>
    )
}