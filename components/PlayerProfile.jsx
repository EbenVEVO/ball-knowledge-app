import { Platform, StyleSheet, Text, View, Image, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase';
import {PlayerHeader} from './ui/PlayerHeader'
import {PlayerTopBar} from './navigation/PlayerTopBar'
import {PlayerInfo} from './ui/PlayerInfo'
import {ClubCard} from './ui/clubCard'
import {PlayerHistory} from './ui/PlayerHistory'
import {PlayerLastGames} from './ui/PlayerLastGames'

export const PlayerProfile = ({player}) => {
  const [club, setClub] = useState(null)

  useEffect(() => {
    const fetchClub =  async ()=>{
      const {data: club , error} = await supabase.from('clubs').select('*'). eq('id', player?.current_club ).single()
      if (!error){
        setClub(club)
        console.log(club)
      }
    }
    if(player){
      fetchClub()
    }
  }, [player])
  let colors = ['#655085', '#FFFFFF']
  if (club?.colors) {
    colors = club?.colors
  }
  const darkenColor = (hex, percent = .2) => {
    if (!hex) return "#000000"; 
    hex = hex.replace("#", "");
  
    let r = parseInt(hex.substring(0,2), 16);
    let g = parseInt(hex.substring(2,4), 16);
    let b = parseInt(hex.substring(4,6), 16);
  
    r = Math.max(0, r - (r * percent ));
    g = Math.max(0, g - (g * percent ));
    b = Math.max(0, b - (b * percent ));
  
    return `rgb(${r}, ${g}, ${b})`;
  };


  return (
    <View style={[styles.container, {backgroundColor: darkenColor(colors[0])}]}>
      <PlayerHeader player={player} club={club} />
      <PlayerTopBar player={player} club={club} />
    </View>
  )
}

export default PlayerProfile

const styles = StyleSheet.create({

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
        margin: 'auto',
        paddingTop: 10,

        

    },

})