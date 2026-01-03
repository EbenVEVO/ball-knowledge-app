import React, { useState ,useEffect } from 'react'
import { View, Pressable, FlatList, Text, Image } from 'react-native'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import EmojiList from './EmojiList'

const TWITTER_EMOJI_BASE = "https://cdn.jsdelivr.net/npm/emoji-datasource-twitter/img/twitter/64/";
const EMOJI_SIZE = 35
const EMOJI_MARGIN = 5

const ITEM_WIDTH = EMOJI_SIZE + EMOJI_MARGIN * 2

const ReactionSelector = ({height, width}) => {

    const [favorites, setFavorites] = useState([])
    const {preferences, session} = useAuth()
    const [selectedEmoji, setSelectedEmoji] = useState()
    const [favoritePicker, setFavoritePicker]= useState(false)

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
      if(preferences){
        console.log(preferences?.favorite_emojis ?  preferences?.favorite_emojis : [])
        setFavorites(preferences?.favorite_emojis ?  preferences?.favorite_emojis : [])
      }
      else{
        console.log('no preferences')
      }
        
  }, [preferences])

  useEffect(()=>{
    console.log('selected', selectedEmoji)
    if(favoritePicker && selectedEmoji){
      addEmojiToFavorites(selectedEmoji)
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
              }}
            >
              <Image source={{ uri: `${TWITTER_EMOJI_BASE}${emoji.image}`}} style={{width:EMOJI_SIZE, height:EMOJI_SIZE}}/>
            </Pressable>
          </View>
    )

  return (
    <View style={{height: height, width: width, zIndex:999, borderWidth:1}}>

      {favoritePicker ? 
      <><View>
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
        <EmojiList 
          onSelect={setSelectedEmoji}
        /></>
      
      :
      <>
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
      <EmojiList/>
      </>
    
    }
        
    </View>
  )
}

export default ReactionSelector