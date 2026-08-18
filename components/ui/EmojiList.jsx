import { View, Text, SectionList,Image, TouchableOpacity, Pressable, FlatList, ScrollView, TextInput } from 'react-native'
import React, { useState , useMemo, useRef, useCallback, useEffect} from 'react'
import { BottomSheetSectionList } from '@gorhom/bottom-sheet'
import Ionicons from '@expo/vector-icons/Ionicons'
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext'
import emojis from 'emoji-datasource-twitter/emoji.json'

const EMOJI_SIZE = 35
const EMOJI_MARGIN = 5

const ITEM_WIDTH = EMOJI_SIZE + EMOJI_MARGIN * 2

const EmojiList = ({onSelect, headerComponent, useBottomSheetList = false}) => {
  const ListComponent = useBottomSheetList ? BottomSheetSectionList : SectionList
  const {preferences, session, profile} = useAuth()


  
   const CATEGORY_ICONS = {
     "Smileys & Emotion": "1f600.png",
    "People & Body": "1f9cd.png",
    "Animals & Nature": "1f436.png",
    "Food & Drink": "1f354.png",
    "Travel & Places": "2708-fe0f.png",
    "Activities": "26bd.png",
    "Objects": "1f4a1.png",
    "Symbols": "1f523.png",
    "Flags": "1f3f3-fe0f.png",
    }
    const CATEGORY_ORDER=[ 
    "Smileys & Emotion",
    "People & Body",
    "Animals & Nature",
    "Food & Drink",
    "Travel & Places",
    "Activities",
    "Objects",
    "Symbols",
    "Flags"]
    const [width, setWidth]= useState(0)
    const [activeCategory, setActiveCategory] = useState()
    const [query, setQuery] = useState('')

    const chunk = (array, size)=>{
        const result =[]
        for(let i=0; i < array.length; i += size){
            result.push(array.slice(i, i + size))
        }
        return result
    }

    const handleSelect = (emoji)=>{
        onSelect(emoji)
    }
    const emojisByCategory = emojis.reduce((acc, emoji) => {
      if (!acc[emoji.category]) acc[emoji.category] = []
      acc[emoji.category].push(emoji)
      return acc
    }, {})
    delete emojisByCategory.Component

    const trimmedQuery = query.trim().toLowerCase()

    const emojiData = useMemo(()=>{
      if(!width) return []
      const emojiPerRow = Math.floor(width/ITEM_WIDTH) || 1

      if(trimmedQuery){
        const results = emojis.filter(emoji =>
          emoji.name?.toLowerCase().includes(trimmedQuery) ||
          emoji.short_names?.some(name => name.toLowerCase().includes(trimmedQuery))
        )
        return [{ category: '', data: chunk(results, emojiPerRow) }]
      }

      return CATEGORY_ORDER.map((category) =>
        ({category:category,
          data: chunk(emojisByCategory[category], emojiPerRow)
        })
      )

    },[width, emojisByCategory, trimmedQuery])

    const viewabilityConfig = useRef({
      viewAreaCoveragePercentThreshold: 10,
    }).current

    const onViewableItemsChanged = useCallback(({viewableItems})=>{
      const firstVisibleItem = viewableItems.find(item => item.section && item.index === 0)

      if(firstVisibleItem){
        setActiveCategory(firstVisibleItem.section.category)
      }
    },[])

    const TWITTER_EMOJI_BASE = "https://cdn.jsdelivr.net/npm/emoji-datasource-twitter/img/twitter/64/";

    const renderEmojis =({item: row}) =>{
      return( 
      <View className='flex flex-row justify-center'>
      {row.map(emoji => (
          <View style={{ marginHorizontal: EMOJI_MARGIN }} key={emoji.unified}>
            <Pressable
              onPress={()=>handleSelect(emoji)}
            >
              <Image source={{ uri: `${TWITTER_EMOJI_BASE}${emoji.image}`}} style={{width:EMOJI_SIZE, height:EMOJI_SIZE}}/>
            </Pressable>
          </View>
          )
        )}

        </View>)
    }



    const emojiListRef = useRef(null)


    const scrollToSection = (index)=>{
      emojiListRef.current?.scrollToLocation({
        sectionIndex:index,
        itemIndex:0,
        animated:true,
      })
    }
  return (
    <View style={{flex:1}} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
      {headerComponent}
      <View className='flex flex-row items-center bg-white mx-3 mb-2 px-3' style={{ borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', height: 40 }}>
        <Ionicons name='search' size={16} color='gray' />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder='Search emojis'
          placeholderTextColor='gray'
          className='font-supreme flex-1'
          style={{ marginLeft: 8, fontSize: 15, outlineStyle: 'none' }}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name='close-circle' size={16} color='gray' />
          </Pressable>
        )}
      </View>
      <ListComponent
        style={{flex:1}}
        ref = {emojiListRef}
        sections = {emojiData}
        keyExtractor={(item, idx)=> item+idx}
        renderItem={renderEmojis}
        renderSectionHeader={({section:{category}}) => (category ? <Text>{category}</Text> : null)}
        ListEmptyComponent={trimmedQuery ? (
          <Text className='font-supreme text-center' style={{ color: 'gray', marginTop: 20 }}>No emojis found</Text>
        ) : null}
        onViewableItemsChanged={onViewableItemsChanged}
        viewablityConfig= {viewabilityConfig}
        stickySectionHeadersEnabled={false}
        />
      {!trimmedQuery && <View className='bg-white p-3 w-full'>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          {Object.entries(CATEGORY_ICONS).map(([category, image], index)=>(
              <TouchableOpacity
              key={category}
              onPress ={()=>scrollToSection(index)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: category === activeCategory ? '#A477C7' : 'transparent',
              }}>
                <Image  source={{ uri: `${TWITTER_EMOJI_BASE}${image}`}} style={{width:22, height:22}}/>
              </TouchableOpacity>
          ))}
        </ScrollView>
      </View>}
    </View>
  )
}

export default EmojiList