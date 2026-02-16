import { View, Text, Pressable } from 'react-native'
import React, { useState } from 'react'
import Entypo from '@expo/vector-icons/Entypo';


const SeasonSelect = ({seasons, currentSeason, setSeason}) => {
    if (!seasons || seasons.length === 0 ) {
        return null 
    }
    const [expanded, setExpanded] = useState()


  return (
    <View className='relative'>
    <View className={`bg-white  ${expanded ? 'rounded-t-xl':'rounded-xl'} p-2 px-5`} style={{borderWidth:1, borderColor: '#DBDBDB', }}>
        <Pressable className='flex flex-row items-center' onPress={()=>setExpanded(!expanded)}>
        <Text>{`${currentSeason.season}/${currentSeason.season+1}`}</Text>
      
      {!expanded ? <Entypo name="chevron-small-down" size={24} color="black" /> : <Entypo name="chevron-small-up" size={24} color="black" />  }
        </Pressable>
        {expanded &&
            <View className='absolute top-full bg-white left-0 right-0 rounded-b-xl p-2 ' style={{ borderWidth:1, borderColor: '#DBDBDB', zIndex:1000,borderTopWidth: 0 }}>
                {seasons.map(season=>(
                    <Pressable className='p-2'onPress={()=>{
                        setSeason(season)
                        setExpanded(!expanded)
                        }}>
                    <Text className='font-supreme'>
                        {`${season.season} / ${season.season + 1} `}
                    </Text>
                    </Pressable>
                ))}
            </View>
        }    
    
    </View>
    </View>
  )
}

export default SeasonSelect