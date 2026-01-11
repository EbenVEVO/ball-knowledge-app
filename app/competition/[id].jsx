import {useLocalSearchParams} from 'expo-router'

import { View, Text, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import CompetitionTopBar from '../../components/navigation/CompetitionTopBar'
import {supabase} from '../../lib/supabase'


export default function CompetitionPage() {
    const {id} = useLocalSearchParams()
    const [competition, setCompetiton] = useState(null)

    useEffect(()=>{
        const fetchCompetition = async ()=>{
            const {data, error} = await supabase.from('competitions').select(`*`).eq('id', id).single()
            if(!error){
                setCompetiton(data)
            }
        }
        if(id) fetchCompetition()
    },[id])

    if(!competition)return( <Text>loading</Text>)

  return (
    <View className =' rounded-xl w-full bg-white shadow-md' style={{borderWidth:1}}>
        <View className='flex flex-row items-center p-5 '>
            <Image source={{uri: competition.logo}} resizeMode='contain' style={{width: 100, height: 100, flex:1}}/>
            <View style={{flex:2}}>
                <Text className='font-supreme text-4xl '>{competition?.name}</Text>
                <Text className='font-supreme text-xl'>{competition?.country}</Text>
            </View>
            <View style={{flex:2}}>

            </View>
      </View>
      <CompetitionTopBar competition={competition}/>
    </View>
  )
}