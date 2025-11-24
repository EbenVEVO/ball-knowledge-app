import { Platform, StyleSheet, Text, View, Image, Pressable } from 'react-native'
import Feather from '@expo/vector-icons/Feather';
import {PlayerTopBar} from '../navigation/PlayerTopBar';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';
import React from 'react'
import { useAuth } from '../../contexts/AuthContext';

export const PlayerHeader = ({player, club}) => {
  const {session} = useAuth();
  const [following , setFollowing] = useState()
  let colors = ['#655085', '#FFFFFF']
  if (club?.colors) {
    colors = club?.colors
  }
  
    function lightenColor(hex, percent) {
  // strip the leading #
  hex = hex.replace(/^#/, '');
  
  // parse r,g,b
  let r = parseInt(hex.substring(0,2), 16);
  let g = parseInt(hex.substring(2,4), 16);
  let b = parseInt(hex.substring(4,6), 16);

  // increase each channel
  r = Math.min(255, Math.floor(r + (255 - r) * percent));
  g = Math.min(255, Math.floor(g + (255 - g) * percent));
  b = Math.min(255, Math.floor(b + (255 - b) * percent));

  // convert back to hex
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }
  useEffect(() => {
    async function checkFollowing(){
      const {data, error} = await supabase.from('users_followed_players').select('*').eq('user_id', session.user.id).eq('player_id', player.id).single()
      if (data){
       setFollowing(true)
       console.log(data)
      }
      else{
        console.log(error)
        setFollowing(false)
      }
    }
    checkFollowing()
  })
  const handleFollow = async ()=>{
    if (following){
      console.log('unfollow')
     const {error} = await supabase.from('users_followed_players').delete().eq('user_id', session.user.id).eq('player_id', player.id)
     if (error) console.log(error)
      setFollowing(false)
    }
    else {
      console.log('follow')
      const {data, error} = await supabase.from('users_followed_players').insert({user_id: session.user.id, player_id: player.id})
      if (error) console.log(error)
      else{
        console.log(data)
          setFollowing(true)}
      
    }
  }


  return (
    <><View
      className='flex flex-col p-5 '>
      <View
        className='gap-5 flex flex-col items-center justify-center '
      >
        <Text
          className='text-4xl text-white font-supremeBold'
          style={{ color: lightenColor(colors.length === 3 ? colors[1] == '#FFFFFF' ? colors[1] : colors[2] : colors[1], 0.2) }}
        >{player?.transfermarkt_name} #{player?.squad_number}</Text>
        <Text className='text-xl bg-white px-5 rounded-full text-center bg font-supreme' style={{ color: lightenColor(colors.length === 3 ? colors[1] == '#FFFFFF' ? colors[0] : colors[1] : colors[1] === '#FFFFFF' ? colors[0] : colors[1], 0.2) }}> {club?.club_name}</Text>
        <Image
          source={{ uri: player?.photo }}
          style={{ width: 200, height: 200 }}
          className='rounded-full ' />

      </View>
       {session &&<View className='absolute top-1 right-5 flex flex-row gap-5' > 
        
            <Pressable 
            className=' bg-white rounded-full px-10 py-2'
            onPress={handleFollow}
            >
              {following ? <FontAwesome name="heart" size={40} color="#A477C7" /> : <FontAwesome name="heart-o" size={40} color="black" />}
            </Pressable>
           
        </View>}

    </View></>
  )
}

export default PlayerHeader

const styles = StyleSheet.create({
    container: {
        borderRadius: Platform.select({
            ios:0,
            android:0,
            web:12,
            default:0,
        }),
        
    }})