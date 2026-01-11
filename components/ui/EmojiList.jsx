import { View, Text, SectionList,Image, TouchableOpacity, Pressable, FlatList } from 'react-native'
import React, { useState , useMemo, useRef, useCallback, useEffect} from 'react'
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext'
import emojis from 'emoji-datasource-twitter/emoji.json'

const EMOJI_SIZE = 35
const EMOJI_MARGIN = 5

const ITEM_WIDTH = EMOJI_SIZE + EMOJI_MARGIN * 2

const EmojiList = ({onSelect, headerComponent}) => {
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
    const emojisByCategory = Object.groupBy(emojis, emoji => emoji.category)
    delete emojisByCategory.Component

    const emojiData = useMemo(()=>{
      if(!width) return []
      const emojiPerRow = Math.floor(width/ITEM_WIDTH) || 1
      return CATEGORY_ORDER.map((category) =>
        ({category:category,
          data: chunk(emojisByCategory[category], emojiPerRow)
        }) 
      )

    },[width, emojisByCategory])

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
      <View className='flex flex-row'>
      {row.map(emoji => (
          <View className='flex mx-5' key={emoji.unified}>
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
      <SectionList
        ListHeaderComponent={headerComponent}
        ref = {emojiListRef}
        sections = {emojiData}
        keyExtractor={(item, idx)=> item+idx} 
        renderItem={renderEmojis}
        renderSectionHeader={({section:{category}}) => (<Text>{category}</Text>)}
        onViewableItemsChanged={onViewableItemsChanged}
        viewablityConfig= {viewabilityConfig}
        stickySectionHeadersEnabled={false}
        />
      <View className = 'bg-white sticky bottom-0 p-3 w-full justify-center' >
          <View className='flex flex-row items-center justify-center gap-10'>
              {Object.entries(CATEGORY_ICONS).map(([category, image], index)=>(
                
                  <TouchableOpacity
                  className='rounded-xl p-2 items-center'
                  onPress ={()=>scrollToSection(index)}
                  style={{flex:1, backgroundColor: category === activeCategory && '#A477C7'}}>
                    <Image  source={{ uri: `${TWITTER_EMOJI_BASE}${image}`}} style={{width:20, height:20}}/>
                  </TouchableOpacity>
              ))}
          </View>
      </View>
    </View>
  )
}

export default EmojiList