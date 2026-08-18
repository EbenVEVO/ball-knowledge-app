import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { View, Pressable, FlatList, Text, Image, Platform, useWindowDimensions } from 'react-native'
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import { useAuth } from '../../contexts/AuthContext'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { supabase } from '../../lib/supabase'
import EmojiList from './EmojiList'

const TWITTER_EMOJI_BASE = "https://cdn.jsdelivr.net/npm/emoji-datasource-twitter/img/twitter/64/";
const EMOJI_SIZE = 35
const EMOJI_MARGIN = 5

const ITEM_WIDTH = EMOJI_SIZE + EMOJI_MARGIN * 2

// applies each filter as an eq(), or is(<col>, null) when the value is null
const applyFilters = (query, filters) =>
  Object.entries(filters).reduce(
    (q, [key, value]) => (value === null ? q.is(key, null) : q.eq(key, value)),
    query,
  )

const ReactionSelector = ({
  visible,
  onClose,
  anchor,
  height = 400,
  width,
  table = 'social_player_reactions',
  filters = {},
}) => {

    const {preferences, session} = useAuth()
    const requireAuth = useRequireAuth()
    const [selectedEmoji, setSelectedEmoji] = useState()
    const [favoritePicker, setFavoritePicker]= useState(false)
    const [reactions, setReactions] = useState([])
    const [reactionCounts, setReactionCounts] = useState([])
    const [favorites, setFavorites] = useState([])

    const filtersKey = JSON.stringify(filters)

    const addEmojiToFavorites = async (newEmoji) => {
        if (!session) return

        const exists= favorites.some(emoji=> emoji.unified === newEmoji.unified)

        if (exists){
          return
        }
        const newFavorites = [...favorites, newEmoji]
        const {data,error} = await supabase.from('users_preferences').update({favorite_emojis: newFavorites}).eq('user_id', session.user.id )
        if(error){
            console.log(error)
        }
        else{
          console.log('added', newEmoji, ' to favorites')
          setFavorites(newFavorites)
        }
    }

    const removeFavorite = async (newEmoji) =>{
        if (!session) return
        const updatedFavorites = favorites.filter(emoji => emoji.unified !== newEmoji.unified)
        const {data,error} = await supabase.from('users_preferences').update({favorite_emojis: updatedFavorites}).eq('user_id', session.user.id )
        if(error){
            console.log(error)
        }
        else{
          console.log('removed', newEmoji , ' from favorites')
          setFavorites(updatedFavorites)
        }

      }


    useEffect(()=>{
      setFavorites(preferences?.favorite_emojis|| [])
      if (!visible) return

      const fetchReactions = async () =>{
        const {data, error} = await applyFilters(supabase.from(table).select('*'), filters)
        if (!error){
          setReactions(data)
          getReactionCounts(data)
        }

      }
      fetchReactions()
    }, [visible, table, filtersKey])

    const getReactionCounts=(data)=>{
        const counts = data.reduce((acc, val)=>{
          const emoji = val.emoji.unified
          if(!acc[emoji]){
            acc[emoji]= {emoji: val.emoji, count: 0, user_id: val.user_id}
          }
          acc[emoji].count++
          return acc
        },{})
        setReactionCounts(Object.values(counts))
    }

    const sendReaction = async () =>{
      if (!session) return
      const newReaction = {
        ...filters,
        user_id: session.user.id,
        emoji: selectedEmoji,
      }
      const {error} = await supabase.from(table).insert(newReaction)
      if(error){
        console.log(error)
      }
      else{
        console.log('added', newReaction, 'to reactions')
        const data = [...reactions, newReaction ]
        setReactions(data)
        getReactionCounts(data)

      }
    }
  useEffect(()=>{
    if(favoritePicker && selectedEmoji){
      addEmojiToFavorites(selectedEmoji)
      setSelectedEmoji(null)
    }
    else if (!favoritePicker && selectedEmoji){
      sendReaction()
      setSelectedEmoji(null)
      onClose?.()
    }
  },[selectedEmoji])

    const renderFavorites = ({item:emoji}) =>(

      <View className='flex mx-5' key={emoji.unified}>
            <Pressable
              onPress={()=> requireAuth(() => {
                if(favoritePicker){
                  removeFavorite(emoji)
                }
                else{
                  setSelectedEmoji(emoji)
                }
              })}
            >
              <Image source={{ uri: `${TWITTER_EMOJI_BASE}${emoji.image}`}} style={{width:EMOJI_SIZE, height:EMOJI_SIZE}}/>
            </Pressable>
          </View>
    )

  const EditFavoritesHeader = ()=>(
    <View>
          <Pressable onPress={() => setFavoritePicker(!favoritePicker)}>
            <Text>Close</Text>
          </Pressable>
          <Text>Select favorite emojis</Text>
          <Text>Tap existing favorites to remove it</Text>
          <View style={{ borderWidth: 1, borderColor: 'gray', width: '100%', marginVertical: 10 }} />
          <FlatList
            data={favorites}
            renderItem={renderFavorites}
            horizontal
            ListEmptyComponent={<Text>No favorites</Text>} />
        </View>
  )

  const FavoritesHeader = () =>(
    <View>
    <View className='flex flex-row items-center gap-4'>
      <Text>Favorites</Text>
      <Pressable
          onPress={()=> requireAuth(() => setFavoritePicker(!favoritePicker))}
          >
        <Text style={{color: '#A477C7' }} className='font-supreme text-xl'>{(favorites?.length === 0 || !favorites) ? 'ADD' : 'EDIT'}</Text>
      </Pressable>
    </View>
    <FlatList
      data={favorites}
      horizontal
      renderItem={renderFavorites}
      ListEmptyComponent ={ <Text>No favorites</Text>}
    />
    </View>
  )
  const renderReactions = ({item: reaction}) =>(
    <Pressable
    onPress={()=> requireAuth(() => setSelectedEmoji(reaction.emoji))}
    className='rounded-xl flex flex-row p-2 items-center gap-2'  style={{borderWidth: reaction.user_id !== session?.user?.id ? 1 : 0, backgroundColor: reaction.user_id === session?.user?.id ? '#A477C7' : undefined}}>
      <Image source={{ uri: `${TWITTER_EMOJI_BASE}${reaction.emoji.image}`}} style={{width:20, height:20}}/>
      <Text className={`${reaction.user_id === session?.user?.id ? 'font-supreme': 'font-supremeBold'}`} style={{color:reaction.user_id === session?.user?.id ? 'white' : undefined}}>{reaction.count}</Text>
    </Pressable>
  )

  const handleClose = () => {
    setFavoritePicker(false)
    onClose?.()
  }

  const bottomSheetRef = useRef(null)
  const snapPoints = useMemo(() => [height], [height])
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()

  useEffect(() => {
    if (Platform.OS === 'web') return
    if (visible) {
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [visible])

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} onPress={handleClose} />
    ),
    [],
  )

  const content = (
    <>
      {!favoritePicker &&<View style={{height:50}}>
      <FlatList
        horizontal
        contentContainerStyle={{flex:1, gap:10, padding: 5}}
        data={reactionCounts}
        renderItem={renderReactions}
        keyExtractor={(item)=>item.id}
      />
      </View>}
      <EmojiList
        onSelect={(emoji) => requireAuth(() => setSelectedEmoji(emoji))}
        headerComponent={favoritePicker ? <EditFavoritesHeader/> : <FavoritesHeader/>}
        useBottomSheetList={Platform.OS !== 'web'}
      />
    </>
  )

  if (Platform.OS === 'web') {
    if (!visible) return null

    const popupWidth = width || 360
    const margin = 8
    // Sit beside the button rather than below it, so the popup never covers
    // it: prefer the right side, flip to the left if there isn't room.
    const spaceRight = anchor ? screenWidth - (anchor.x + anchor.width) : 0
    const left = anchor
      ? spaceRight >= popupWidth + margin
        ? anchor.x + anchor.width + margin
        : Math.max(anchor.x - popupWidth - margin, margin)
      : margin
    const top = anchor
      ? Math.min(Math.max(anchor.y, margin), screenHeight - height - margin)
      : margin

    return (
      <>
        <Pressable
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
          onPress={handleClose}
        />
        <View
          style={{
            position: 'fixed',
            top,
            left,
            height,
            width: popupWidth,
            zIndex: 1000,
            backgroundColor: 'white',
            borderRadius: 16,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.14,
            shadowRadius: 16,
            elevation: 12,
            borderWidth: 1,
            borderColor: '#ede8ff',
          }}
        >
          {content}
        </View>
      </>
    )
  }

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDismissOnClose
      enableDynamicSizing={false}
      onDismiss={handleClose}
      backgroundStyle={{ borderRadius: 20 }}
      stackBehavior="switch"
      backdropComponent={renderBackdrop}
    >
      {content}
    </BottomSheetModal>
  )
}

export default ReactionSelector
