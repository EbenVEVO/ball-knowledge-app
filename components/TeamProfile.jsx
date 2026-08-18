import { StyleSheet, Text, TouchableOpacity, View, Platform, Pressable, Image, ScrollView, SafeAreaView, SafeAreaProvider, Share } from 'react-native'
import React, { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {TopBar} from './navigation/TopBar'
import GameLog from './ui/GameLog';
import { useWindowDimensions } from 'react-native';
import { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../contexts/AuthContext';
import { useNotificationPermissionStore } from '../contexts/notificationPermissionStore';
import { supabase } from '../lib/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
import GlassIconButton, { GLASS_ROW_HEIGHT, GLASS_ROW_PADDING } from './ui/GlassIconButton';
import CollapsibleHeaderCrossfade from './navigation/CollapsibleHeaderCrossfade';

// ClubFixtures manages its own scrolling, so it never drives the collapsible
// header - default it to the flattened state instead.
const AUTO_FLATTEN_TABS = ['Fixtures']
const DARKENCOLOR = (hex, percent = .2) => {
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
export const TeamProfile = ({club}) => {
  const {session} = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [following , setFollowing] = useState()


  useEffect(() => {
    const checkFollow = async () => {
      const {data, error} = await supabase.from('users_followed_teams').select('*').eq('user_id', session?.user.id).eq('team_id', club.id).single()
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
     const {error} = await supabase.from('users_followed_teams').delete().eq('user_id', session?.user.id).eq('team_id', club.id)
     if (error) console.log(error)
      setFollowing(false)
    }
    else {
      const {data, error} = await supabase.from('users_followed_teams').insert({user_id: session?.user.id, team_id: club.id})
      if (error) console.log(error)
      else{
        console.log(data)
        setFollowing(true)
        useNotificationPermissionStore.getState().promptIfNeeded()
      }

    }
  }

  const handleShare = () => {
    Share.share({ message: `Check out ${club.club_name} on Ball Knowledge!` })
  }

  const expandedContent = (
      <View style={Platform.OS !== 'web' ? {backgroundColor: DARKENCOLOR(colors[0]), paddingTop: insets.top + GLASS_ROW_HEIGHT} : undefined}>
     
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

            {Platform.OS === 'web' && session &&<View className='absolute top-1 right-5 flex flex-row gap-5' >

            <Pressable
            className=' bg-white rounded-full px-10 py-2'
            onPress={handleFollow}
            >
              {following ? <FontAwesome name="heart" size={40} color="#A477C7" /> : <FontAwesome name="heart-o" size={40} color="black" />}
            </Pressable>

            </View>}

        </View>
      </View>
  )

  const flattenedContent = (
    <View style={styles.flattenedRow}>
      <Image source={{ uri: club.logo }} style={styles.flattenedBadge} resizeMode='contain' />
      <Text numberOfLines={1} style={styles.flattenedName}>{club.club_name}</Text>
    </View>
  )

  const headerContent = Platform.OS === 'web'
    ? expandedContent
    : <CollapsibleHeaderCrossfade
        expanded={expandedContent}
        flattened={flattenedContent}
        flattenedBackgroundColor={DARKENCOLOR(colors[0])}
        autoFlattenTabs={AUTO_FLATTEN_TABS}
      />

  return (


    <View style={[styles.container, Platform.OS === 'web' && {backgroundColor: colors[0]}]}
    className={Platform.OS === 'web' ? 'flex flex-col pt-5' : 'flex flex-col'}
    >
        {Platform.OS === 'web' && headerContent}

        <TopBar
          club={club}
          renderHeader={() => headerContent}
        />

        {Platform.OS !== 'web' && (
          <View pointerEvents='box-none' style={[styles.glassRow, { top: insets.top }]}>
            <GlassIconButton onPress={() => router.back()}>
              <Ionicons name='chevron-back' size={20} color='white' />
            </GlassIconButton>
            <View style={styles.glassCluster}>
              <GlassIconButton onPress={handleShare}>
                <Ionicons name='share-outline' size={18} color='white' />
              </GlassIconButton>
              <GlassIconButton onPress={handleFollow}>
                {following
                  ? <FontAwesome name='heart' size={18} color='#A477C7' />
                  : <FontAwesome name='heart-o' size={18} color='white' />}
              </GlassIconButton>
            </View>
          </View>
        )}

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
    },

    glassRow: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: GLASS_ROW_HEIGHT,
        zIndex: 20,
        elevation: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: GLASS_ROW_PADDING,
    },

    glassCluster: {
        flexDirection: 'row',
        gap: 10,
    },

    flattenedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: GLASS_ROW_PADDING,
        height: '100%',
    },

    flattenedBadge: {
        width: 32,
        height: 32,
    },

    flattenedName: {
        fontFamily: 'supremeBold',
        fontSize: 15,
        color: 'white',
        flexShrink: 1,
    },
})