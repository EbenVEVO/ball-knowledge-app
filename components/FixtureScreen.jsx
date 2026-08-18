import { StyleSheet, Text, View, Platform, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import {FixtureOverview} from '../components/ui/FixtureOverview'
import {FixtureTimeline} from '../components/ui/FixtureTimeline'
import {MatchStats} from '../components/ui/MatchStats'
import {FixtureLineups} from '../components/ui/FixtureLineups'
import React, { useEffect, useState } from 'react'
import PlayerModal from './ui/PlayerModal'
import { usePlayerModalStore } from '../contexts/modalStore'
import PlayerBottomSheet from './ui/PlayerBottomSheet'
import ReactionSelector from './ui/ReactionSelector'
import FixtureCommentsModal from './ui/FixtureCommentsModal'
import { FixturesTopBar } from './navigation/FixturesTopBar'
import { LinearGradient } from 'expo-linear-gradient'
import GlassIconButton, { GLASS_ROW_HEIGHT, GLASS_ROW_PADDING } from './ui/GlassIconButton'
import CollapsibleHeaderCrossfade from './navigation/CollapsibleHeaderCrossfade'
import { isFixtureNotStarted } from '../lib/matchStatus'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export const FixtureScreen = ({fixture}) => {
  const {playerModalData} = usePlayerModalStore()
  const {session} = useAuth()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [modalVisible, setModalVisible] = useState()
  const PlayerSheet = Platform.OS === 'web' ? PlayerModal : PlayerBottomSheet

  // Rendered here (not inside FixtureOverview/the collapsible header) because
  // the header's content sits inside an animated/clipped subtree - a popover
  // or bottom sheet mounted from within it ends up mispositioned and behind
  // the tab bar, and can't receive gestures reliably. Kept as siblings to
  // glassRow/PlayerSheet instead, same as the rest of this screen's overlays.
  const [reactionPicker, setReactionPicker] = useState(false)
  const [reactionAnchor, setReactionAnchor] = useState(null)
  const [reactions, setReactions] = useState([])
  const [reactionCount, setReactionCount] = useState(0)
  const [topReactions, setTopReactions] = useState([])
  const [commentsVisible, setCommentsVisible] = useState(false)
  const [commentCount, setCommentCount] = useState(0)

  const fetchCommentCount = async () => {
    if (!fixture?.id) return
    const { count } = await supabase.from('social_match_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', fixture.id)
    setCommentCount(count ?? 0)
  }

  useEffect(() => {
    fetchCommentCount()
  }, [fixture?.id])

  useEffect(() => {
    if (!fixture?.id) return

    const fetchReactions = async () => {
      const { data, count } = await supabase.from('social_match_reactions')
        .select('*', { count: 'exact' })
        .eq('fixture_id', fixture.id)
      const safeData = data ?? []
      setReactions(safeData)
      setReactionCount(count ?? 0)

      const reactionsObject = safeData.reduce((acc, val) => {
        const emoji = val.emoji.unified
        if (!acc[emoji]) acc[emoji] = { emoji: val.emoji, count: 0 }
        acc[emoji].count++
        return acc
      }, {})
      const topReacts = Object.entries(reactionsObject)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 3)
        .map(([, val]) => val)
      setTopReactions(topReacts)
    }
    fetchReactions()

    const channel = supabase
      .channel(`match-reactions-${fixture.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'social_match_reactions',
        filter: `fixture_id=eq.${fixture.id}`,
      }, () => {
        fetchReactions()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fixture?.id])

  const hasReacted = reactions.some(r => r.user_id === session?.user?.id)

  useEffect(()=>{
    if(playerModalData?.isVisible){
      setModalVisible(playerModalData?.isVisible)
    }
  },[playerModalData])
  const expandedContent = (
    <LinearGradient colors={["#c08fe5","#e8e0f8"]} style={{borderRadius: Platform.OS === 'web' && 25, padding: Platform.OS === 'web' && 10, paddingTop: Platform.OS !== 'web' ? insets.top + GLASS_ROW_HEIGHT : undefined}}>
      <FixtureOverview
        fixture={fixture}
        reactionCount={reactionCount}
        hasReacted={hasReacted}
        topReactions={topReactions}
        commentCount={commentCount}
        onReactionPress={(anchor) => { setReactionAnchor(anchor); setReactionPicker(true) }}
        onCommentPress={() => setCommentsVisible(true)}
      />
    </LinearGradient>
  )

  const flattenedContent = (
    <View style={styles.flattenedRow}>
      <Image source={{ uri: fixture?.home_team?.logo }} style={styles.flattenedBadge} resizeMode='contain' />
      <Text style={styles.flattenedScore}>
        {isFixtureNotStarted(fixture?.match_status)
          ? new Date(fixture?.date_time_utc).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
          : `${fixture?.home_score} - ${fixture?.away_score}`}
      </Text>
      <Image source={{ uri: fixture?.away_team?.logo }} style={styles.flattenedBadge} resizeMode='contain' />
    </View>
  )

  const headerContent = Platform.OS === 'web'
    ? expandedContent
    : <CollapsibleHeaderCrossfade
        expanded={expandedContent}
        flattened={flattenedContent}
        flattenedBackgroundColor="#c08fe5"
      />

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && headerContent}
      <FixturesTopBar fixture={fixture} renderHeader={() => headerContent}/>

      {Platform.OS !== 'web' && (
        <View pointerEvents='box-none' style={[styles.glassRow, { top: insets.top }]}>
          <GlassIconButton onPress={() => router.back()}>
            <Ionicons name='chevron-back' size={20} color='white' />
          </GlassIconButton>
        </View>
      )}

      {(playerModalData?.player && playerModalData?.stats && fixture?.match_status === 'Match Finished') && <PlayerSheet
          isVisible={modalVisible}
          onClose={()=>setModalVisible(!modalVisible)}
          player={playerModalData.player}
          stats={playerModalData.stats}
          fixture={fixture}
        />}

      <ReactionSelector
        visible={reactionPicker}
        onClose={() => setReactionPicker(false)}
        anchor={reactionAnchor}
        width={Platform.OS === 'web' ? 360 : undefined}
        table='social_match_reactions'
        filters={{ fixture_id: fixture?.id }}
      />
      <FixtureCommentsModal
        isVisible={commentsVisible}
        onClose={() => { setCommentsVisible(false); fetchCommentCount() }}
        fixture={fixture}
      />
    </View>
  )
}

export default FixtureScreen

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
        paddingHorizontal: Platform.OS === 'web' ? 10 : 0,
        paddingBottom: 10,
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
        alignItems: 'center',
        paddingHorizontal: GLASS_ROW_PADDING,
    },

    flattenedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        height: '100%',
    },

    flattenedBadge: {
        width: 26,
        height: 26,
    },

    flattenedScore: {
        fontFamily: 'supremeBold',
        fontSize: 15,
        color: 'white',
    },

})