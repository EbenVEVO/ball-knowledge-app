import React, { useState ,useEffect } from 'react'
import { View, Pressable, FlatList, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import EmojiList from './EmojiList'

const TWITTER_EMOJI_BASE = "https://cdn.jsdelivr.net/npm/emoji-datasource-twitter/img/twitter/64/";
const EMOJI_SIZE = 35
const EMOJI_MARGIN = 5

const ITEM_WIDTH = EMOJI_SIZE + EMOJI_MARGIN * 2

const ReactionSelector = ({height, width, post_id}) => {

    const {preferences, session} = useAuth()
    const [selectedEmoji, setSelectedEmoji] = useState()
    const [favoritePicker, setFavoritePicker]= useState(false)
    const [reactions, setReactions] = useState([])
    const [reactionCounts, setReactionCounts] = useState([])
    const [favorites, setFavorites] = useState([])

    
    const addEmojiToFavorites = async (newEmoji) => { 

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
      const fetchReactions = async () =>{
        const {data, error} = await supabase.from('social_player_reactions').select(`*`).eq('post_id', post_id)
        if (!error){
          console.log(data, 'initial reactions')
          setReactions(data)
          getReactionCounts(data)
        }

      }
      fetchReactions()
    }, [post_id])

    const getReactionCounts=(data)=>{
        const counts = data.reduce((acc, val)=>{
          const emoji = val.emoji.unified
          if(!acc[emoji]){
            acc[emoji]= {emoji: val.emoji, count: 0, user_id: val.user_id}
          }
          acc[emoji].count++
          return acc
        },{})
        console.log(counts)
        console.log(Object.values(counts))
        setReactionCounts(Object.values(counts))
    }

    const sendReaction = async () =>{
      const newReaction = {
        user_id: session.user.id,
        post_id: post_id,
        emoji: selectedEmoji
      }
      const {error} = await supabase.from('social_player_reactions').insert(newReaction)
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
    console.log('selected', selectedEmoji)
    if(favoritePicker && selectedEmoji){
      addEmojiToFavorites(selectedEmoji)
      setSelectedEmoji(null)
    }
    else if (!favoritePicker && selectedEmoji){
      sendReaction()
      setSelectedEmoji(null)
    }
  },[selectedEmoji])

    const renderFavorites = ({item:emoji}) =>(
      
      <View className='flex mx-5' key={emoji.unified}>
            <Pressable
              onPress={()=>{
                if(favoritePicker){
                  removeFavorite(emoji)
                }
                else{
                  setSelectedEmoji(emoji)
                }
              }}
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
          onPress={()=>setFavoritePicker(!favoritePicker)}
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
    onPress={()=>setSelectedEmoji(reaction.emoji)}
    className='rounded-xl flex flex-row p-2 items-center gap-2'  style={{borderWidth: reaction.user_id !== session.user.id && 1, backgroundColor: reaction.user_id === session.user.id && '#A477C7'}}>
      <Image source={{ uri: `${TWITTER_EMOJI_BASE}${reaction.emoji.image}`}} style={{width:20, height:20}}/>
      <Text className={`${reaction.user_id === session.user.id ? 'font-supreme': 'font-supremeBold'}`} style={{color:reaction.user_id === session.user.id && 'white'}}>{reaction.count}</Text>
    </Pressable>
  )
  return (
    <View style={{height: height, width: width, backgroundColor:'white'}}>
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
          onSelect={setSelectedEmoji}
          headerComponent={favoritePicker ? <EditFavoritesHeader/> : <FavoritesHeader/>}
         />
    </View>
  )
}

export default ReactionSelector