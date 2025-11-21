import { StyleSheet, Text, View, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { supabase } from '../../lib/supabase';

export const NextMatch = ({club}) => {
      let colors = ['#655085', '#FFFFFF']
  if (club?.colors) {
    colors = club.colors
  }
    const [nextMatch, setNextMatch] = useState({})
    const [teams, setTeams] = useState([])
    const [competition, setCompetition] = useState({})
    useEffect(() => {
        const getNextMatch = async () => {
            const {data: nextMatch , error} = await supabase.from('fixtures').select('*')
            .or(`home_team_id.eq.${club.id},away_team_id.eq.${club.id}`)
            .eq('match_status', 'Not Started')
            .order('date_time_utc', { ascending: true })
            .limit(1)
            .single()

            setNextMatch(nextMatch)

            const getCompetitions = async () => {
                const {data: competition, error} = await supabase.from('competitions').select('*').eq('id', nextMatch.league_id).single()
               setCompetition(competition)
            }

            const getTeams = async () => {
                const {data: homeTeam, homeError} = await supabase.from('clubs').select('*').eq('id', nextMatch.home_team_id).single()
                const {data: awayTeam, awayError} = await supabase.from('clubs').select('*').eq('id', nextMatch.away_team_id).single()
       
                setTeams([homeTeam, awayTeam])
            }
            
            if(!error) {
                await getCompetitions()
                await getTeams();
            }
        }

        if(club) getNextMatch()
    },[club]) 

 const formatDate = (date) => {
  const options = { weekday: 'short', day: 'numeric', month: 'short'};
  return new Date(date).toLocaleDateString('en-US', options);
 }
 const formatTime = (date) => {
  const options = { hour: 'numeric', minute: '2-digit' , hour12: true};
  return new Date(date).toLocaleTimeString('en-US', options);
 }
  return (

    <View className='flex flex-col p-5 bg-white  rounded-xl shadow-xl'>
      <Text className="text-2xl font-supremeBold p-5" style={{color: colors[0]}}>Next Match</Text>
      
      <View className="flex flex-col items-center  p-5 gap-2">
            <View className='flex flex-row items-center gap-2'>
                <Text className="text-2xl font-supremeBold">{competition?.name}</Text>
                <Image source={{uri: competition.logo}} style={{width: 30, height: 30}} resizeMode='contain'/>
            </View>
            <View className='flex flex-row items-center gap-2'>
                <MaterialIcons name="stadium" size={20} color="black" />
                <Text className="text-lg font-supreme">Stadium: {nextMatch?.stadium_name || ''}</Text>
            </View>

      </View>
      <View className="flex flex-row items-center justify-center p-5 " style={{gap: 20, }}>
        <View className="flex flex-col  items-center gap-5" style={{width: 100}}>
            <Image source={{uri: teams[0]?.logo}} style={{width: 60, height: 60}}  resizeMode='contain'/>
            <Text className="text-lg font-supremeBold text-center">{teams[0]?.club_name ||''}</Text>
        </View>

        <View className='flex flex-col items-center gap-5'>
            <Text className="text-2xl font-supremeBold">{formatDate(nextMatch?.date_time_utc)}</Text>
            <Text className="text-md font-supremeBold text-gray-600">{formatTime(nextMatch?.date_time_utc)}</Text>
        </View>

        <View className="flex flex-col items-center gap-5" style={{width: 100}}>
            <Image source={{uri: teams[1]?.logo}} style={{width: 60, height: 60}} resizeMode='contain' />
            <Text className="text-lg font-supremeBold text-center">{teams[1]?.club_name ||''}</Text>
        </View>
      </View>
    </View>
  )
}

export default NextMatch

const styles = StyleSheet.create({})