import { View, Text, StyleSheet, Platform, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {FlashList} from '@shopify/flash-list'
import { Link } from 'expo-router'


const LeagueUpcomingFixtures = ({season}) => {
    const [upcomingFixtures, setUpcomingFixtures]= useState()
    const [gameweek, setGameweek] = useState()
    useEffect(()=>{
        const fetchUpcomingFixtures = async ()=>{
            const {data: nextMatch} = await supabase.from('fixtures').select(`round`)
            .eq('season_id', season.id)
            .neq('match_status', 'Match Finished')
            .order('date_time_utc', {ascending: true})
            .limit(1)
            .single()

            if(nextMatch){
                setGameweek(nextMatch.round)
                const {data,error} = await supabase.from('fixtures').select(`*,
                home_team:home_team_id (club_name,logo, id),
                away_team:away_team_id (club_name,logo, id),
                competition:league_id (name, id, logo)
                `
                )
                .eq('season_id', season.id)
                .eq('round', nextMatch.round)
                .order('date_time_utc', {ascending:true})

                if(!error){
                    console.log(data, 'upcoming games')
                    setUpcomingFixtures(data)
                }
            }
        }

        fetchUpcomingFixtures()
    
    },[season])
    const formatDate = (date) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
      };
       const formatTime = (date) => {
    const options = { hour: 'numeric', minute: '2-digit' , hour12: true};
    return new Date(date).toLocaleTimeString('en-US', options);
   }
   
    const renderFixture = ({item, index}) => {
        return (                
        <>
        <Link href={{pathname: '/fixture/[id]', params:{id: item.id}}}>
        <View  className='flex flex-col  p-5 px-2' >
            <View className='flex flex-row items-center justify-between w-full '>
                <Text className='text-sm font-supreme'>{formatDate(item?.date_time_utc) }</Text>
                <View className='flex flex-row items-center gap-2'>
                <Image source={{ uri: item.competition.logo }} style={{width: 15, height: 15}} resizeMode='contain' />
                <Text className='text-sm font-supreme'>{item.competition.name}</Text>
                </View>
            </View>
            
            <View className='flex flex-row items-center justify-center  w-full   gap-5'>
                <View className='flex flex-row items-center gap-2  p-2' style={{flex:2, justifyContent: 'flex-end'}}>
                    <Text className=' font-supreme text-right '>{item.home_team.club_name}</Text>
                    <Image source={{ uri: item.home_team.logo }} style={styles.clublogo} resizeMode='contain' />
                </View>
                {item.match_status == 'Match Finished' ?
                <View className='p-2 px-5 rounded-full  justify-center' style={{ flex:1}}>
                    <Text className='text-sm text-white font-supremeBold'>{item.score}</Text>
                </View>
                :
                <View className='items-center'style={{flex:0.5}} >
                    <Text className='text-sm text-center text-black font-supremeBold'>{formatTime(item.date_time_utc)}</Text>
                </View>  
              }
                <View className='flex flex-row items-center gap-2  p-2' style={{flex:2, justifyContent: 'flex-start' }}>
                    <Image source={{ uri: item.away_team.logo }} style={styles.clublogo} resizeMode='contain' />
                    <Text className=' font-supreme text-left'>{item.away_team.club_name}</Text>
                </View>
            </View>
        </View>
        </Link>
        {index !== upcomingFixtures?.length -1 && <View className='border-1 px  w-[85%] justify-center border-gray-300' style={{height:1, borderWidth:1, alignSelf:'center'}}></View> }
        </>
          )
      }
  return (
    <View className='rounded-xl bg-white p-2'>
      <View className='flex flex-col w-full' style={{flex: 1}}>
        
        <FlashList
        style={{flex: 1}}
        data={upcomingFixtures}
        contentContainerStyle={{ flexGrow: 1 }}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={<Text className='font-supremeBold text-center text-xl'>{gameweek}</Text>}
        renderItem={renderFixture}/>
        </View>
    </View>
  )
}

export default LeagueUpcomingFixtures
const styles = StyleSheet.create({
    teamNameContainer:{
        width: Platform.select({
            ios: 140,
            android: 140,
            web: 200,
        })

    },
    clublogo: {
        width: Platform.select({
            ios: 30,
            android: 30,
            web: 40,
        }),
        height: Platform.select({
            ios: 30,
            android: 30,
            web: 40,
        }),
    }

})