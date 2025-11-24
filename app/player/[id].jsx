import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Platform, ScrollView, Text, View } from 'react-native'
import { PlayerProfile } from '../../components/PlayerProfile'
import { supabase } from '../../lib/supabase'

export default function PlayerPage() {
    const {id} = useLocalSearchParams()
    const [player, setPlayer] = useState(null)
    useEffect(()=>{
        const fetchPlayer = async () =>{
            const {data: player , error} = await supabase.from('players').select(`*,
                country:country_code(flag_url)
                `).eq('id', id ).single()
            if (!error){
              setPlayer(player)
            }
            else{
              console.log(error)
            }
        }
    
        if(id)fetchPlayer()
    }, [id])


    
    if(!player) return( <Text>loading</Text>)
    if (Platform.OS === 'web') {
      return (
        
        <View className='px-5'>
            <PlayerProfile player={player} /> 
        </View>
      )
    }
    return (
        <ScrollView style={{flex:1}} contentContainerStyle={{flexGrow:1}}>
            <PlayerProfile player={player} />
            
        </ScrollView>
    )
}
