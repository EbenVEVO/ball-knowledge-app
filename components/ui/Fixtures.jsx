import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, FlatList, ScrollView } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import React, { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase';
import {Link} from 'expo-router'

export const Fixtures = ({club}) => {

    const FIXTURES_PER_PAGE = 10
    const [ fixtures, setFixtures] = useState([])
    const [anchorDate, setAnchorDate] = useState(null)
    const [page, setPage] = useState(0)
  

    useEffect(() => {
      if (Platform.OS === 'web') {
        loadFixtures()
      }
      else{
        loadInitialFixuresMobile()
      }  
    
    },[page, club])

    const loadInitialFixuresMobile = async () => {
      const {data: upcomingfixtures , error} = await supabase.from('fixtures').select(`*,
        home_team:home_team_id (club_name,logo, id),
        away_team:away_team_id (club_name,logo, id),
        competition:league_id (name, id, logo)
        `
      )
      .or(`home_team_id.eq.${club.id},away_team_id.eq.${club.id}`)
      .eq('match_status', 'Not Started')
      .order('date_time_utc', { ascending: true })

      const {data: donefixtures , error2} = await supabase.from('fixtures').select(`*,
        home_team:home_team_id (club_name,logo, id),
        away_team:away_team_id (club_name,logo, id),
        competition:league_id (name, id, logo)
        `
      )
      .or(`home_team_id.eq.${club.id},away_team_id.eq.${club.id}`)
      .eq('match_status', 'Match Finished')
      .order('date_time_utc', { ascending: false })
      .limit(2)
      
      setFixtures([...donefixtures.reverse(),...upcomingfixtures])
      
      const proccesedUpcoming = upcomingfixtures.map(fixture =>( {
        ...fixture,
        result: '-',
        score: '-',
      }))

      const proccesedDone = donefixtures.map(fixture =>( {
        ...fixture,
        result: getResult(fixture),
        score: fixture.home_score + ' - ' + fixture.away_score,
      }))
      
      setFixtures([...proccesedDone.reverse(),...proccesedUpcoming])
    }
    const loadInitialFixuresWeb = async () => {
      const {data: anchorFixtures , error} = await supabase.from('fixtures').select(`*,
        home_team:home_team_id (club_name,logo, id),
        away_team:away_team_id (club_name,logo, id),
        competition:league_id (name, id, logo)
        `
      )
      .or(`home_team_id.eq.${club.id},away_team_id.eq.${club.id}`)
      .eq('match_status', 'Match Finished')
      .order('date_time_utc', { ascending: false })
      .limit(4)
      const anchor = anchorFixtures.at(-1).date_time_utc
      setAnchorDate(anchor)
      
      const {data: firstFixtures , error2} = await supabase.from('fixtures').select(`*,
          home_team:home_team_id (club_name,logo, id),
          away_team:away_team_id (club_name,logo, id),
          competition:league_id (name, id, logo)
          `
        )
        .or(`home_team_id.eq.${club.id},away_team_id.eq.${club.id}`)
        .gt('date_time_utc', anchor)
        .order('date_time_utc', { ascending: true })
        .range(page * FIXTURES_PER_PAGE, (page + 1) * FIXTURES_PER_PAGE - 1)
  
      

      const processedFixtures = firstFixtures?.map(fixture =>( {
        ...fixture,
        result: getResult(fixture),
        score: fixture.home_score + ' - ' + fixture.away_score,
      }))
      setFixtures(processedFixtures)
      
      
    }
    const loadFixtures = async () => {
      console.log(page) 
      let query = supabase.from('fixtures').select(`*,
          home_team:home_team_id (club_name,logo, id),
          away_team:away_team_id (club_name,logo, id),
          competition:league_id (name, id, logo)
          `
        )
      if (page === 0){
       loadInitialFixuresWeb()
       return
      }
      else if (page < 0){
        query
        .or(`home_team_id.eq.${club.id},away_team_id.eq.${club.id}`)
        .lt('date_time_utc', anchorDate)
        .order('date_time_utc', { ascending: false })
        .range((-page-1) * FIXTURES_PER_PAGE, (-(page) + 1) * FIXTURES_PER_PAGE - 1)
      }
      else if (page > 0){
        query = query
        .or(`home_team_id.eq.${club.id},away_team_id.eq.${club.id}`)
        .gt('date_time_utc', anchorDate)
        .order('date_time_utc', { ascending: true })
        .range(page  * FIXTURES_PER_PAGE, (page + 1) * FIXTURES_PER_PAGE - 1)
      }

      const {data: data , error} = await query

      if (!data) return
      const processedFixtures = data.map(fixture =>( {
        ...fixture,
        result: getResult(fixture),
        score: fixture.home_score + ' - ' + fixture.away_score,
      }))


      setFixtures(processedFixtures.reverse())
      
    }



    const getResult = (fixture) => {
        if (fixture.match_status !== 'Match Finished') {
            return '-';
        }
        
        const isHome = fixture.home_team_id === club.id;
        
        if (isHome) {
            return fixture.home_score > fixture.away_score ? 'W' 
                 : fixture.home_score < fixture.away_score ? 'L' 
                 : 'D';
        } else {
            return fixture.home_score < fixture.away_score ? 'W' 
                 : fixture.home_score > fixture.away_score ? 'L' 
                 : 'D';
        }
    }
     const formatDate = (date) => {
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      return new Date(date).toLocaleDateString('en-US', options);
    };
     const formatTime = (date) => {
  const options = { hour: 'numeric', minute: '2-digit' , hour12: true};
  return new Date(date).toLocaleTimeString('en-US', options);
 }
 const getResultColor = (result) => {
    if (result === 'W') {
        return 'green'
    } else if (result === 'L') {
        return 'red'
    } else {
        return 'gray'
    }
}
  const renderFixture = ({item, index}) => {
    return (
      
            
    <>
    <Link href={{pathname: '/fixture/[id]', params:{id: item.id}}}>
    <View  className='flex flex-col  p-5 px-5' >
        <View className='flex flex-row items-center justify-between w-full '>
            <Text className='text-sm font-supreme'>{formatDate(item?.date_time_utc) }</Text>
            <View className='flex flex-row items-center gap-2'>
            <Image source={{ uri: item.competition.logo }} style={{width: 15, height: 15}} resizeMode='contain' />
            <Text className='text-sm font-supreme'>{item.competition.name}</Text>
            </View>
        </View>
        
        <View className='flex flex-row items-center justify-center     gap-5'>
            <View className='flex flex-row items-center gap-2  p-2' style={[ styles.teamNameContainer, {justifyContent: 'flex-end'}]}>
                <Text className=' font-supreme text-right text-xl'>{item.home_team.club_name}</Text>
                <Image source={{ uri: item.home_team.logo }} style={styles.clublogo} resizeMode='contain' />
            </View>
            {item.match_status == 'Match Finished' ?
            <View className='p-2 px-5 rounded-full  justify-center' style={{backgroundColor: getResultColor(item.result)}}>
                <Text className='text-lg text-white font-supremeBold'>{item.score}</Text>
            </View>
            :
            <View className='p-2 px-5  justify-center' >
                <Text className='text-lg text-black font-supremeBold'>{formatTime(item.date_time_utc)}</Text>
            </View>  
          }
            <View className='flex flex-row items-center gap-2  p-2' style={[styles.teamNameContainer,{ justifyContent: 'flex-start' }]}>
                <Image source={{ uri: item.away_team.logo }} style={styles.clublogo} resizeMode='contain' />
                <Text className=' font-supreme text-left text-xl'>{item.away_team.club_name}</Text>
            </View>
        </View>
    </View>
    </Link>
    </>
      )
  }

  
  return (
    <View className='flex flex-col items-center justify-center rounded-xl  bg-white' style={{height: '100%'}} >
      <View className='flex flex-row items-center justify-between w-full p-5 px-10'>
        {Platform.OS == 'web' &&
        <TouchableOpacity onPress={() => setPage(page - 1)}>
            <View className='w-10 h-10 rounded-full justify-center items-center' style={{backgroundColor: '#D1D1D1', width: 30, height: 30}}>
                <AntDesign name="left" size={15} color="black" />
            </View>
        </TouchableOpacity>}
        <Text className='text-2xl  font-supreme'>Fixtures</Text>
        {Platform.OS == 'web' && 
        <TouchableOpacity onPress={() => setPage(page + 1)}>
            <View className='w-10 h-10 rounded-full justify-center items-center' style={{backgroundColor: '#D1D1D1', width: 30, height: 30}}>
                <AntDesign name="right" size={15} color="black" />
            </View>
        </TouchableOpacity>}
      </View>
      
    <View className='flex flex-col w-full ' style={{flex: 1}}>
        <FlatList
        style={{flex: 1}}
        data={fixtures}
        contentContainerStyle={{ flexGrow: 1 }}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderFixture}/>
    </View>
    </View>
  )
}
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
export default Fixtures