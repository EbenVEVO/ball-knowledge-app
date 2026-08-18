import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const LeaguePreview = () => {

    const [seasons, setSeasons] = useState([])
    const [expanded, setExpanded] = useState({})
    useEffect(()=>{
        const fetchCompetitions = async ()=>{
            const {data: leagues} = await supabase.from('competitions').select('id').or('type.eq.League,name.eq.World Cup')
            if(leagues) {
                const {data} = await supabase.from('seasons').select('*, league: competition_id(logo)').in('competition_id', leagues.map(l => l.id)).eq('current', true)
                if (data) {
                    setSeasons(data)
                    await getNextFixtureRound(data)
                }
            }
        }

        const getNextFixtureRound = async (seasonList) =>{
            for (const s of seasonList) {
                const {data: round} = await supabase.from('fixtures').select('round').eq('season_id', s.id).neq('match_status', 'Match Finished').limit(1)
                if (round){
                    const {data} = await supabase.from('fixtures').select(`*,  home_team:home_team_id (club_name,logo, id),
                    away_team:away_team_id (club_name,logo, id)`)
                    .eq('season_id', s.id).eq('round', round.map(l => l.round))
                    if (data) {
                        setSeasons(prev => prev.map(prev_s =>
                            prev_s.id === s.id ? {...prev_s,round: round.map(l => l.round), fixtures : data} : prev_s
                        ))
                    }
            }
            }
         }   

        fetchCompetitions()
        console.log(seasons)
    }, [])

    const toggleExpanded = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const formatTime = (date) => {
        const options = { hour: 'numeric', minute: '2-digit' , hour12: true};
        return new Date(date).toLocaleTimeString('en-US', options);
    }
    const renderCard = (item)=>(
        <View className='rounded-xl border-1 shadow-lg items-center p-5'>
   
            <View className='flex flex-row items-center gap-5'>
                <Image source={{uri: item.home_team.logo}} resizeMode='contain' style={{width:30, height:30}}/>
                <Text> {formatTime(item.date_time_utc)}</Text>
                <Image source={{uri: item.away_team.logo}} resizeMode='contain' style={{width:30, height:30}}/>
            </View>
        </View>
    )
  return (
    <View>
      <View>
        {seasons.map((s, index) => {
            const isOpen = !!expanded[s.id]
            return (
                <View key={index}>
                    <TouchableOpacity onPress={() => toggleExpanded(s.id)} className='flex flex-row gap-5 items-center justify-between pr-2'>
                        <View className='flex flex-row gap-5 items-center'>
                            <Text className='text-xl font-supremeBold'>{s.competition_name}</Text>
                            <Image source={{uri: s.league.logo}} style={{width:30, height:30}}/>
                        </View>
                        <Text className='text-base'>{isOpen ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {isOpen && (
                        <>
                            <Text className='font-supreme p-2'>{s.round}</Text>
                            <ScrollView contentContainerStyle={{gap:10, padding:10}} horizontal={true}>
                                {s.fixtures?.map((fixture, i) => renderCard(fixture))}
                            </ScrollView>
                        </>
                    )}
                </View>
            )
        })}
      </View>
    </View>
  )
}

export default LeaguePreview