import { Platform, StyleSheet, View, Share, Image, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotificationPermissionStore } from '../contexts/notificationPermissionStore';
import {PlayerHeader} from './ui/PlayerHeader'
import {PlayerTopBar} from './navigation/PlayerTopBar'
import {PlayerInfo} from './ui/PlayerInfo'
import {ClubCard} from './ui/ClubCard'
import {PlayerHistory} from './ui/PlayerHistory'
import {PlayerLastGames} from './ui/PlayerLastGames'
import GlassIconButton, { GLASS_ROW_HEIGHT, GLASS_ROW_PADDING } from './ui/GlassIconButton'
import CollapsibleHeaderCrossfade from './navigation/CollapsibleHeaderCrossfade'

// PlayerGames (the Matches tab) manages its own scrolling, so it never drives
// the collapsible header - default it to the flattened state instead.
const AUTO_FLATTEN_TABS = ['Matches']

export const PlayerProfile = ({player}) => {
  const [club, setClub] = useState(null)
  const {session} = useAuth()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [following, setFollowing] = useState()

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

  useEffect(() => {
    if (!player?.id) return
    const checkFollowing = async () => {
      const {data, error} = await supabase.from('users_followed_players').select('*').eq('user_id', session?.user.id).eq('player_id', player.id).single()
      if (data) setFollowing(true)
      else {
        if (error) console.log(error)
        setFollowing(false)
      }
    }
    checkFollowing()
  }, [session, player?.id])

  const handleFollow = async () => {
    if (following){
      const {error} = await supabase.from('users_followed_players').delete().eq('user_id', session?.user.id).eq('player_id', player.id)
      if (error) console.log(error)
      setFollowing(false)
    } else {
      const {data, error} = await supabase.from('users_followed_players').insert({user_id: session?.user.id, player_id: player.id})
      if (error) console.log(error)
      else {
        console.log(data)
        setFollowing(true)
        useNotificationPermissionStore.getState().promptIfNeeded()
      }
    }
  }

  const handleShare = () => {
    Share.share({ message: `Check out ${player?.transfermarkt_name} on Ball Knowledge!` })
  }

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


  const expandedContent = (
    <View style={Platform.OS !== 'web' ? {backgroundColor: darkenColor(colors[0]), paddingTop: insets.top + GLASS_ROW_HEIGHT} : undefined}>
      <PlayerHeader player={player} club={club} following={following} onFollow={handleFollow} />
    </View>
  )

  const flattenedContent = (
    <View style={styles.flattenedRow}>
      <Image source={{ uri: player?.photo }} style={styles.flattenedPhoto} />
      <Text numberOfLines={1} style={styles.flattenedName}>{player?.transfermarkt_name}</Text>
    </View>
  )

  const headerContent = Platform.OS === 'web'
    ? expandedContent
    : <CollapsibleHeaderCrossfade
        expanded={expandedContent}
        flattened={flattenedContent}
        flattenedBackgroundColor={darkenColor(colors[0])}
        autoFlattenTabs={AUTO_FLATTEN_TABS}
      />

  return (
    <View style={[styles.container, Platform.OS === 'web' && {backgroundColor: darkenColor(colors[0])}]}>
      {Platform.OS === 'web' && headerContent}
      <PlayerTopBar player={player} club={club} renderHeader={() => headerContent} />

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

export default PlayerProfile

const styles = StyleSheet.create({

   container: {
        flex: 1,
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
        margin: 'auto',
        paddingTop: Platform.OS === 'web' ? 10 : 0,



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

    flattenedPhoto: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },

    flattenedName: {
        fontFamily: 'supremeBold',
        fontSize: 15,
        color: 'white',
        flexShrink: 1,
    },

})