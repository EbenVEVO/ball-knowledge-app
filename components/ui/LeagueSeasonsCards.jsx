import React, { useEffect, useState } from 'react'
import { FlatList, Text, View, Image } from 'react-native'

import { supabase } from '../../lib/supabase'
import { Link } from 'expo-router'

const LeagueSeasonsCards = ({seasons}) => {
    const [prevWinners, setPrevWinners] = useState([])
    useEffect(() => {
      const fetchPreviousWinners = async () => {
          try {
              const pastSeasons = seasons.filter(season => !season.current)
              const results = await Promise.all(
                  pastSeasons.map(async (season) => {
                      const {data: winner, error: winnerError} = await supabase
                          .from('league_standings')
                          .select(`*, team:club_id(id, club_name, logo)`)
                          .eq('season_id', season.id)
                          .eq('rank', 1)
                          .single()
                      
                      const {data: runnerUp, error: runnerUpError} = await supabase
                          .from('league_standings')
                          .select(`*, team:club_id(id, club_name, logo)`)
                          .eq('season_id', season.id)
                          .eq('rank', 2)
                          .single()
                      
                      if(!winnerError && !runnerUpError){
                          return {
                              season: season,
                              winner: winner.team,
                              runnerUp: runnerUp.team
                          }
                      }
                      return null
                  })
              )
              
              const validResults = results.filter(result => result !== null)
              setPrevWinners(validResults)
          } catch (error) {
              console.error('Error fetching previous winners:', error)
          }
      }
      
      if(seasons && seasons.length > 0) fetchPreviousWinners()
  }, [seasons])

  const renderCard =({item})=>(
    <View className='p-5 bg-white rounded-xl shadow-xs gap-2' style={{borderWidth:1, borderColor: '#DBDBDB', flex:1}} >
      <Text className='font-supremeBold'>{`${item.season.season}/${item.season.season +1}`}</Text>
      <View className='p-2 gap-4'>
        <View className='gap-2'>
        <Text className='font-supreme'>Winner</Text>
        <Link href={{pathname: '/club/[id]',  params:{id: item.winner.id}}}>
          <View className='flex flex-row items-center gap-3'>
            <Image source={{uri:item.winner.logo}} resizeMode='contain' style={{width:40, height:40}}/>
           <Text className='font-supremeBold'>{item.winner.club_name}</Text>
          </View>
        </Link>
        </View>
        <View className='gap-2'>
        <Text className='font-supreme'>Runner-up</Text>
        <Link href={{pathname: '/club/[id]',  params:{id: item.runnerUp.id}}}>
          <View className='flex flex-row items-center gap-3'>
            <Image source={{uri:item.runnerUp.logo}}  resizeMode='contain' style={{width:40, height:40}}/>
           <Text className='font-supremeBold'>{item.runnerUp.club_name}</Text>
         </View>
        </Link>
        </View>
      </View>
    </View>
  )

  if(!seasons)return
  return (
    <View>
      <FlatList
        data={prevWinners}
        contentContainerStyle={{padding: 10, gap:20}}
        columnWrapperStyle={{gap:20}}
        renderItem={renderCard}
        keyExtractor={(item) => item.season.id.toString()}
        numColumns={3}
      />
    
    </View>
  )
}

export default LeagueSeasonsCards