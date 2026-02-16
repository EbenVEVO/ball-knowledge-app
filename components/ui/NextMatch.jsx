import { StyleSheet, Text, View, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { supabase } from '../../lib/supabase';
import { Link } from 'expo-router';

export const NextMatch = ({club}) => {
    if(!club) return
      let colors = ['#655085', '#FFFFFF']
  if (club?.colors) {
    colors = club.colors
  }
    const [nextMatch, setNextMatch] = useState(null)
    const [competition, setCompetition] = useState({})
    useEffect(() => {
        const getNextMatch = async () => {
            console.log(club.id, 'id')
            const {data: nextMatch , error} = await supabase.from('fixtures').select(`*, 
            home_team:home_team_id(club_name,logo, id),
            away_team:away_team_id(club_name,logo, id),
            competition:league_id(name, id, logo)`)
            .or(`home_team_id.eq.${club?.id},away_team_id.eq.${club?.id}`)
            .eq('match_status', 'Not Started')
            .order('date_time_utc', { ascending: true })
            .limit(1)
            .single()

            if(!error){
              setNextMatch(nextMatch)
              setCompetition(nextMatch.competition)
            }
            
          }

        if(!club) return
        getNextMatch()
    },[club]) 

 const formatDate = (date) => {
  const options = { weekday: 'short', day: 'numeric', month: 'short'};
  return new Date(date).toLocaleDateString('en-US', options);
 }
 const formatTime = (date) => {
  const options = { hour: 'numeric', minute: '2-digit' , hour12: true};
  return new Date(date).toLocaleTimeString('en-US', options);
 }

  if(!nextMatch)return

  return (

    <View className='flex flex-col p-5 bg-white  rounded-xl' style={{flex:1}}>
      <Text className="text-2xl font-supremeBold p-2" style={{color: colors[0] === '#FFFFFF'? colors[1] : colors[0]}}>Next Match</Text>
      
      <View className="flex flex-col items-center  p-5 gap-2">
            <View className='flex flex-row items-center gap-2'>
                <Link href={{pathname: '/competition/[id]', params:{id:competition.id}}}>
                  <View className='flex flex-row items-center gap-2'>
                <Text className="text-2xl font-supremeBold">{competition?.name}</Text>
                <Image source={{uri: competition.logo}} style={{width: 30, height: 30}} resizeMode='contain'/>
                </View>
                </Link>
            </View>
            <View className='flex flex-row items-center gap-2'>
                <MaterialIcons name="stadium" size={20} color="black" />
                <Text className="text-lg font-supreme">Stadium: {nextMatch?.stadium_name || ''}</Text>
            </View>

      </View>
      <View className="flex flex-row items-center justify-center p-5 " style={{gap: 20, }}>
        <View className="flex flex-col  items-center gap-5" style={{flex:1}}>
            <Link className='flex flex-col items-center gap-2' href={{pathname:'/club/[id]', params:{id:nextMatch.home_team_id}}}>
            <Image source={{uri: nextMatch.home_team.logo}} style={{width: 60, height: 60}}  resizeMode='contain'/>
            <Text className="text-lg font-supremeBold text-center">{nextMatch.home_team.club_name ||''}</Text>
            </Link>
        </View>

        <View className='flex flex-col items-center gap-5'>
            <Text className="text-2xl font-supremeBold">{formatDate(nextMatch?.date_time_utc)}</Text>
            <Text className="text-md font-supremeBold text-gray-600">{formatTime(nextMatch?.date_time_utc)}</Text>
        </View>

        <View className="flex flex-col items-center gap-5" style={{flex:1}}>
        <Link className='flex flex-col items-center gap-2' href={{pathname:'/club/[id]', params:{id:nextMatch.away_team.id}}}>
            <Image source={{uri: nextMatch.away_team.logo}} style={{width: 60, height: 60}} resizeMode='contain' />
            <Text className="text-lg font-supremeBold text-center">{nextMatch.away_team.club_name ||''}</Text>
          </Link>
        </View>
      </View>
    </View>
  )
}

export default NextMatch

const styles = StyleSheet.create({})