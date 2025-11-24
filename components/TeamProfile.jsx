import { StyleSheet, Text, TouchableOpacity, View, Platform, Pressable, Image, ScrollView, SafeAreaView, SafeAreaProvider } from 'react-native'
import React, { useEffect } from 'react'
import {TopBar} from './navigation/TopBar'
import GameLog from './ui/GameLog';
import { useWindowDimensions } from 'react-native';
import { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';

export const TeamProfile = ({club}) => {
  const {session} = useAuth();
  const [following , setFollowing] = useState()


  useEffect(() => {
    const checkFollow = async () => {
      const {data, error} = await supabase.from('users_followed_teams').select('*').eq('user_id', session.user.id).eq('team_id', club.id).single()
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

  let colors = ['#655085', '#FFFFFF']
  if (club.colors) {
    colors = club.colors
  }

  const handleFollow = async ()=>{
    if (following){
      console.log('unfollow')
     const {error} = await supabase.from('users_followed_teams').delete().eq('user_id', session.user.id).eq('team_id', club.id)
     if (error) console.log(error)
      setFollowing(false)
    }
    else {
      console.log('follow')
      const {data, error} = await supabase.from('users_followed_teams').insert({user_id: session.user.id, team_id: club.id})
      if (error) console.log(error)
      else{
        console.log(data)
          setFollowing(true)}
      
    }
  }

  return ( 


    <View style={[styles.container, {backgroundColor: colors[0]}]} 
    className='flex flex-col pt-5  '   
    >
      <View style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0,0,0,0.2)' // 30% black
              }} />
      <View
        className='gap-5 flex flex-col p-10 '
        >   
          
            <View className='flex flex-row items-center gap-5'>
           
            <Image 
            source={{ uri: club.logo }}
            style={{ width: 120, height: 120}}
            resizeMode='contain'
            /> 
            <View className='flex flex-col gap-2 '>
              <View className='flex flex-row items-center gap-2'>
            <Text 
            style = {[styles.clubname, {color: colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1]}]}
            className=' font-supremeBold'
            >{club.club_name}</Text>
            {following &&
            <Text>Following</Text>
              }
            </View>
            <View className='flex flex-row items-center justify-center gap-2'>
            <Text 
            style = {{color: colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1]}}
            className='text-xl text-center font-supremeBold'
            >{club.country}</Text>
            <Image resizeMode='contain' source={{uri: 'https://flagcdn.com/48x36/gb-eng.png'}}
            style={{ width: 20, height: 20}}    
            />
            </View>
            
           </View> 
                
            </View>
            
            {session &&<View className='absolute top-1 right-5 flex flex-row gap-5' > 
        
            <Pressable 
            className=' bg-white rounded-full px-10 py-2'
            onPress={handleFollow}
            >
              {following ? <FontAwesome name="heart" size={40} color="#A477C7" /> : <FontAwesome name="heart-o" size={40} color="black" />}
            </Pressable>
           
            </View>}
           
        </View> 
              
        <TopBar
          club={club}
        />   

    </View>
  )
}

export default TeamProfile

const styles = StyleSheet.create({

    teamprofile:{
      width: Platform.select({ios:'100%', android:'100%', web:'100%', default:'100%'}),
      overflow: 'auto'
    },

     container: {
        borderRadius: Platform.select({
            ios:0,
            android:0,
            web:12,
            default:0,
        }),
        width: Platform.select({
            ios:'100%',
            android:'100%',
            web:'100%',
            default:'100%',
        }),
        minHeight: Platform.select({
            ios:'100%',
            android:'100%',
            web:'auto',
            default:'100%',
        }),
        margin: 'auto'

        

    },

    clubname:{
     fontSize: Platform.select({
         ios: 24,
         android: 24,
         web: 36,
     })
    }
})