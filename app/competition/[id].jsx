import {useLocalSearchParams} from 'expo-router'

import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import CompetitionTopBar from '../../components/navigation/CompetitionTopBar'
import {supabase} from '../../lib/supabase'
import SeasonSelect from '../../components/ui/SeasonSelect'
import { useAuth } from '../../contexts/AuthContext'


export default function CompetitionPage() {
    const {session} = useAuth()
    const {id} = useLocalSearchParams()
    const [following, setFollowing]= useState()
    const [competition, setCompetiton] = useState(null)
    const [season, setSeason] = useState(null)
    const [seasons, setSeasons] = useState(null)


    
    useEffect(()=>{
        const fetchSeasons = async ()=>{
            const{data, error} = await supabase.from('seasons').select(`*`).eq('competition_id', id)
            if(!error){
                console.log('seasons', data)
                setSeasons(data.reverse())
            }
            else{
                console.log(error)
            }
        }
        const fetchCompetition = async ()=>{
            const {data, error} = await supabase.from('competitions').select(`*`).eq('id', id).single()
            if(!error){
                setCompetiton(data)
                const {data:seasonData, error: seasonError} = await supabase.from('seasons').select(`*`).eq('competition_id', id).eq('current', true).single()
                if(!seasonError){
                    console.log(seasonData)
                    setSeason(seasonData)
                    fetchSeasons()
                }
            }
        }

        if(id) fetchCompetition()
    },[id])

    useEffect(() => {
        const checkFollow = async () => {
          const {data, error} = await supabase.from('users_followed_competitions').select('*').eq('user_id', session?.user.id).eq('followed_competition', id).single()
          if (data) {
            console.log('true')
            setFollowing(true)
          }
          else {
            console.log(error)
            console.log('false')
            setFollowing(false)
          }
        }
        checkFollow()
      },[session])

     const handleFollow = async ()=>{
        if (following){
         const {error} = await supabase.from('users_followed_competitions').delete().eq('user_id', session?.user.id).eq('followed_competition', id)
         if (error) console.log(error)
              setFollowing(false)
        }
        else {
          const {data, error} = await supabase.from('users_followed_competitions').insert({user_id: session?.user.id, followed_competition: id})
          if (error) console.log(error)
          else{
            console.log(data)
          setFollowing(true)}          
            }
    }
    

    if(!competition || !season || !seasons )return( <Text>loading</Text>)

    
  return (
    <>
    <ScrollView>
    <View className =' rounded-xl w-full bg-white shadow-md relative' >
        <View className='flex flex-row items-center p-5 '>
            <Image source={{uri: competition.logo}} resizeMode='contain' style={{width: 100, height: 100, flex:1}}/>
            <View style={{flex:2}}>
                <Text className='font-supreme text-4xl '>{competition?.name}</Text>
                <Text className='font-supreme text-xl'>{competition?.country}</Text>
            </View>
            <View style={{flex:2}}>

            </View>
      </View>
      <View className='flex flex-row gap-3 absolute  top-1 right-5 ' style={{zIndex:50}}>
      <SeasonSelect
            currentSeason={season}
            setSeason={setSeason}
            seasons={seasons}
        />
        {!following ? 
        <TouchableOpacity onPress={()=>handleFollow()} className='p-1 px-5 rounded-full items-center justify-center' style={{backgroundColor:'black'}}>
            <Text className='text-white font-supreme'>Follow</Text>
        </TouchableOpacity>
        :
        <TouchableOpacity onPress={()=>handleFollow()} className='p-1 px-5 rounded-full items-center justify-center' style={{backgroundColor:'#DBDBDB'}}>
            <Text className='font-supreme'>Following</Text>
        </TouchableOpacity>
        }
        </View>
        <CompetitionTopBar 
        seasons={seasons}
        cup = {competition.type === 'Cup' ? true : false}
        season = {season}
        competition={competition}/>

    </View>      
    </ScrollView>
    </>
  )
}