import {useLocalSearchParams} from 'expo-router'
import { View, Text, Image, ScrollView, StyleSheet, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import {supabase} from '../../lib/supabase'
import {PlayerProfile} from '../../components/PlayerProfile'
import {Search} from '../../components/ui/Search'

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
        }
    
        if(id)fetchPlayer()
    }, [id])


    
    if(!player) return( <Text>loading</Text>)
    if (Platform.OS === 'web') {
      return (
        
        <div style={{ 
            height: '100%',
            overflowY: 'auto',
            width: '100%',
            margin: 'auto'
        }}>
            <Search />
            <PlayerProfile player={player} /> 
        </div>
      )
    }
    return (
        <ScrollView style={{flex:1}} contentContainerStyle={{flexGrow:1}}>
            <PlayerProfile player={player} />
            
        </ScrollView>
    )
}
