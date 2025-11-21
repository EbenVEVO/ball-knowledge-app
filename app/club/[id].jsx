import {useLocalSearchParams} from 'expo-router'
import { View, Text, Image, ScrollView, StyleSheet, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import {TeamProfile} from '../../components/TeamProfile'
import {supabase} from '../../lib/supabase'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function TeamPage() {

    const {id} = useLocalSearchParams()
    const [club, setClub] = useState(null)
    useEffect(()=>{
        const fetchClub = async () =>{
            const {data: club , error} = await supabase.from('clubs').select('*'). eq('id', id ).single()
            if (!error){
              setClub(club)
            }
        }

        if(id)fetchClub()
    }, [id])
    
    if(!club) return( <Text>loading</Text>)

    if (Platform.OS === 'web') {
      return (
        
        <div style={{ 
            height: '100%',
            overflowY: 'auto',
            width: '100%',
            margin: 'auto'
        }}>

            <TeamProfile club={club}/>
        </div>
      )
    }
  return (
    <SafeAreaProvider>
      <SafeAreaView >
        <ScrollView className='mx-auto ' style={styles.container} contentContainerStyle={{flexGrow:1}} nestedScrollEnabled>
          <TeamProfile club={club}/>
        </ScrollView>
    </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container:{
    width:Platform.select({
      ios:'100%',
      android:'100%',
      default:'100%',
    }),
    height:Platform.select({
      ios:'100%',
      android:'100%',
      web:'100%',
      default:'100%',
    }),
  }

})

