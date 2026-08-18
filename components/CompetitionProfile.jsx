import { useEffect, useState } from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View, StyleSheet, Platform, Share } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import CompetitionTopBar from '@/components/navigation/CompetitionTopBar'
import SeasonSelect from '@/components/ui/SeasonSelect'
import GlassIconButton, { GLASS_ROW_HEIGHT, GLASS_ROW_PADDING } from '@/components/ui/GlassIconButton'
import CollapsibleHeaderCrossfade from '@/components/navigation/CollapsibleHeaderCrossfade'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

// LeagueFixtures manages its own scrolling, so it never drives the
// collapsible header - default it to the flattened state instead.
const AUTO_FLATTEN_TABS = ['Fixtures']

const CompetitionProfile = ({competition, season, seasons, cup, setSeason}) => {
      const {session} = useAuth();
      const router = useRouter();
      const insets = useSafeAreaInsets();

    const [following, setFollowing]= useState()

    useEffect(() => {
        const checkFollow = async () => {
          if (!session?.user.id) { setFollowing(false); return }
          const {data, error} = await supabase.from('users_followed_competitions').select('*').eq('user_id', session.user.id).eq('followed_competition', competition.id).maybeSingle()
          if (error) console.log(error)
          setFollowing(!!data)
        }
        checkFollow()
    },[session])

    const handleFollow = async ()=>{
        if (following){
          const {error} = await supabase.from('users_followed_competitions').delete().eq('user_id', session?.user.id).eq('followed_competition', competition.id)
          if (error) console.log(error)
          setFollowing(false)
        } else {
          const {data, error} = await supabase.from('users_followed_competitions').insert({user_id: session?.user.id, followed_competition: competition.id})
          if (error) console.log(error)
          else{ console.log(data); setFollowing(true) }
        }
    }

    const handleShare = () => {
        Share.share({ message: `Check out ${competition.name} on Ball Knowledge!` })
    }

  const expandedContent = (
        <View className='flex flex-col p-3' style={Platform.OS !== 'web' ? {backgroundColor: '#655085', paddingTop: insets.top + GLASS_ROW_HEIGHT + 20} : undefined}>
            <View className='flex flex-row gap-3 ' style={{alignContent:'flex-end'}}>
            <SeasonSelect currentSeason={season} setSeason={setSeason} seasons={seasons} />
            {Platform.OS === 'web' && session && (!following ?
                <TouchableOpacity onPress={handleFollow} className='p-1 px-5 rounded-full items-center justify-center' style={{backgroundColor:'black'}}>
                    <Text className='text-white font-supreme'>Follow</Text>
                </TouchableOpacity>
            :
                <TouchableOpacity onPress={handleFollow} className='p-1 px-5 rounded-full items-center justify-center' style={{backgroundColor:'#DBDBDB'}}>
                    <Text className='font-supreme'>Following</Text>
                </TouchableOpacity>
            )}
            </View>
        <View className='flex flex-row p-5 items-center mt-5'>
            <Image source={{uri: competition.logo}} resizeMode='contain' style={{width: 100, height: 100}}/>
                <View >
                    <Text style={styles.compname} className='font-supreme text-4xl'>{competition?.name}</Text>
                    <Text className='font-supreme text-xl'>{competition?.country}</Text>
                </View>
        </View>
        </View>
  )

  const flattenedContent = (
    <View style={styles.flattenedRow}>
      <Image source={{ uri: competition.logo }} style={styles.flattenedLogo} resizeMode='contain' />
      <Text numberOfLines={1} style={styles.flattenedName}>{competition?.name}</Text>
    </View>
  )

  const headerContent = Platform.OS === 'web'
    ? expandedContent
    : <CollapsibleHeaderCrossfade
        expanded={expandedContent}
        flattened={flattenedContent}
        flattenedBackgroundColor="#655085"
        autoFlattenTabs={AUTO_FLATTEN_TABS}
      />

  return (
        <View style={[styles.container, Platform.OS === 'web' && {backgroundColor: '#655085'}]} className={Platform.OS === 'web' ? 'flex flex-col pt-5' : 'flex flex-col'}  >
        {Platform.OS === 'web' && headerContent}

        <CompetitionTopBar seasons={seasons}  season={season} competition={competition} renderHeader={() => headerContent}/>

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

export default CompetitionProfile

const styles = StyleSheet.create({

    teamprofile:{
      width: Platform.select({ios:'100%', android:'100%', web:'100%', default:'100%'}),
      overflow: 'auto'
    },

     container: {
        flex: 1,
        borderRadius: Platform.select({
            ios:0,
            android:0,
            web:12,
            default:0,
        }),
        width: '100%',
        margin: 'auto'



    },

    compname:{
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

    flattenedLogo: {
        width: 28,
        height: 28,
    },

    flattenedName: {
        fontFamily: 'supremeBold',
        fontSize: 15,
        color: 'white',
        flexShrink: 1,
    },
})