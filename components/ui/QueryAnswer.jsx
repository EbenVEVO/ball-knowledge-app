import { View, Text, Image, Platform, TouchableOpacity, Pressable, Animated, Share } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import ShareModal from './ShareModal';
import * as Sharing from 'expo-sharing'
import  ViewShot,{ captureRef } from 'react-native-view-shot';
import GlassIconButton from './GlassIconButton';
const WEB_BASE_URL = 'https://ballknowledge.app' // replace with your deployed domain

const DEFAULT_COLORS = ['#655085', '#FFFFFF']

// colors can arrive as an array (['#FF0000','#FFFFFF']) or, after multi-club STRING_AGG,
// as a comma-joined string ('#FF0000,#FFFFFF'). Normalize to a 2+ element array so
// colors[0]/colors[1] never end up as single characters of a string.
const parseColors = (raw) => {
  if (Array.isArray(raw) && raw.length >= 2) return raw
  if (typeof raw === 'string' && raw.includes(',')) {
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean)
    if (parts.length >= 2) return parts
  }
  return DEFAULT_COLORS
}

const QueryAnswer = ({data, question}) => {
  // Prefer the queried player's row (backend focus_player_id) so the hero card,
  // colors, and export image feature the player asked about — not the #1 leader.
  const focusId = data?.focus_player_id ?? null
  const hero =
    (focusId != null && data?.results?.find(r => r.player_id === focusId)) ||
    data?.results?.[0]
  const heroImage = hero?.photo ?? hero?.club_logo
  const colors = parseColors(hero?.colors)
  const [saved, setSaved] = useState(false)
  const [shareURL , setShareURL] = useState()
  const [shareModalVisible, setShareModalVisible] = useState(false)
  const [queryImage, setQueryImage] = useState()
  const [loading, setLoading] = useState()
  const {session, profile} = useAuth()

  const snapshotRef = useRef()
  const [showShareMenu, setShowShareMenu] = useState(false)
  const menuAnim = useRef(new Animated.Value(0)).current

  const capture = async () => {
    const uri = await snapshotRef.current.capture();
    return uri
  };
  useEffect(() => {
    const path = `/query/${encodeURIComponent(question)}`
    const url = Platform.OS === 'web'
      ? window.location.origin + path
      : WEB_BASE_URL + path
    console.log(url, 'url')
    setShareURL(url)
  }, [question])

  const openShareMenu = () => {
    setShowShareMenu(true)
    Animated.spring(menuAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start()
  }

  const closeShareMenu = () => {
    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setShowShareMenu(false))
  }

  const shareImage = async () => {
    closeShareMenu()
    setLoading(true)
    try {
      const imageUri = await capture()
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(imageUri, { mimeType: 'image/png' })
      }
    } finally {
      setLoading(false)
    }
  }

  const shareLink = async () => {
    closeShareMenu()
    try {
      await Share.share({ url: shareURL, message: shareURL })
    } catch (e) {
      console.log(e)
    }
  }

  const shareQuery = () => {
    if (Platform.OS === 'web') {
      setShareModalVisible(true)
    } else {
      openShareMenu()
    }
  }
  const handleSave = async () =>{
    if (!session?.user?.id) return
    if (saved){
      // Match on (user_id, question) only. Comparing jsonb `results` with .eq is fragile
      // (exact serialization must match), which silently fails and leaves rows undeleted.
      const {error} = await supabase.from('users_saved_queries').delete()
        .eq('user_id', session.user.id)
        .eq('question', question)

      if(!error) setSaved(false)
      else console.log(error.message)
    }
    else
    {
      const query = {
        user_id: session.user.id,
        question: question,
        answer: data?.answer,
        hero: hero,
        colors: colors,
        share_url: shareURL
      }
      // Upsert so a re-save doesn't create duplicate rows for the same (user, question).
      const {error} = await supabase.from('users_saved_queries')
        .upsert(query)
      if (error) console.log(error.message)
      else setSaved(true)
    }
  }

  function ExportCard ({query}) {
    return (
    <View style={{ backgroundColor: colors[0], width: 1080, height: 1920, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', gap: 32, paddingHorizontal: 80 }}>
        {heroImage &&
          <Image source={{ uri: heroImage }} resizeMode='contain' style={{ width: 400, height: 400, borderRadius: 200 }} />}
        <Text className='font-SupremeBold' style={{ fontSize: 72, textAlign: 'center', color: colors[1] }}>{query?.answer}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', borderTopWidth: 1, borderTopColor: colors[1], padding: 40, position: 'absolute', bottom: 0 }}>
        <Text className='font-supreme' style={{ fontSize: 36, color: colors[1] }}>Ball Knowledge</Text>
        <Text className='font-supreme' style={{  fontSize: 36, color: colors[1] }}>@{profile?.username}</Text>
      </View>
    </View>
  )}

  useEffect(()=>{
    const checkSaved = async () =>{
      if (!session?.user?.id) { setSaved(false); return }
      const {data: savedData, error} = await supabase.from('users_saved_queries')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('question', question)
        .maybeSingle()
      // savedData is a row (or null) rather than an array; error is set only on real failures.
      setSaved(!error && !!savedData)
    }
    checkSaved()
  },[question, session?.user?.id])
  return (
    <><View className={`${Platform.OS === 'web' && 'rounded-xl'} relative`} style={{ backgroundColor: colors[0] }}>
      <View className='p-5 mt-10 gap-3 items-center'>
        {heroImage &&
          <Image  source={{ uri: heroImage }} resizeMode='contain' style={{ width: 150, height: 150 }} className='rounded-full' />}
        <Text className='text-2xl font-supremeBold text-center' style={{ color: colors[1] }}>{data?.answer}</Text>
        {data?.title &&
          <Text className='text-sm font-supreme text-center' style={{ color: colors[1], opacity: 0.75 }}>
            {data.title}
          </Text>}
      </View>

      {showShareMenu && (
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}
          onPress={closeShareMenu}
        />
      )}

      <View className=' absolute right-3 top-5 flex-row gap-3' style={{ zIndex: 100 }}>
        {Platform.OS === 'web' ? (
          <>
            {session &&
              <TouchableOpacity activeOpacity={0.7} onPress={handleSave}>
                <View style={{ backgroundColor: colors[1] }} className='rounded-full p-2 px-4 items-center'>
                  {saved ?
                    <FontAwesome name="star" size={30} color={colors[0]} />
                    :
                    <FontAwesome name="star-o" size={30} color="black" />}
                </View>
              </TouchableOpacity>}
            <Pressable onPress={shareQuery}>
              <View style={{ backgroundColor: colors[1] }} className='rounded-full p-2 px-4 items-center'>
                <Ionicons name="share-outline" size={24} color={colors[0]} />
              </View>
            </Pressable>
          </>
        ) : (
          <>
            {session &&
              <GlassIconButton onPress={handleSave}>
                <FontAwesome name={saved ? 'star' : 'star-o'} size={20} color="white" />
              </GlassIconButton>}
            <GlassIconButton onPress={shareQuery}>
              <Ionicons name="share-outline" size={20} color="white" />
            </GlassIconButton>
          </>
        )}
      </View>

      {showShareMenu && (
        <Animated.View style={{
          position: 'absolute',
          right: 12,
          top: 70,
          zIndex: 100,
          backgroundColor: 'white',
          borderRadius: 14,
          paddingVertical: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 12,
          elevation: 10,
          minWidth: 150,
          opacity: menuAnim,
          transform: [
            { scale: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
            { translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) },
          ],
        }}>
          <TouchableOpacity onPress={shareImage} activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 10 }}>
            <Ionicons name="image-outline" size={20} color="#333" />
            <Text style={{ fontSize: 15, color: '#333', fontWeight: '500' }}>Image</Text>
          </TouchableOpacity>
          <View style={{ height: 1, backgroundColor: '#f0f0f0', marginHorizontal: 12 }} />
          <TouchableOpacity onPress={shareLink} activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 10 }}>
            <Ionicons name="link-outline" size={20} color="#333" />
            <Text style={{ fontSize: 15, color: '#333', fontWeight: '500' }}>Link</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
    <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
      <ViewShot ref={snapshotRef}
        options={{ format: 'png', quality: 1, width: 1080, height: 1920 }}
      >
        <ExportCard query={data}/>
      </ViewShot>
    </View>
    <ShareModal isVisible={shareModalVisible} onClose={!shareModalVisible} link={shareURL} capture={capture} title="Share this search"/></>

  )
}

export default QueryAnswer