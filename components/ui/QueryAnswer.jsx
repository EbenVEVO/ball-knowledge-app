import { View, Text, Image } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';


const QueryAnswer = ({data}) => {
    let colors = ['#655085', '#FFFFFF']
  if (data?.results[0].colors) {
    colors = data?.results[0].colors
  }
  return (
    <View className='rounded-xl relative' style={{backgroundColor: colors[0], flex:1}}>
        <View className='p-5 gap-3 items-center'>
            <Image source={{uri:data?.results[0].photo}} resizeMode='contain' style={{width:150, height:150}} className='rounded-full'/>
            <Text className='text-2xl font-supremeBold' style={{color: colors[1]}}>{data?.answer}</Text>
        </View>

        <View className=' absolute right-3 top-5 flex-row gap-3'>
            <View style={{backgroundColor: colors[1]}} className='rounded-full p-2 px-4 items-center' >
                <Ionicons name="star" size={24} color="black" />
            </View>
            <View style={{backgroundColor: colors[1]}} className='rounded-full p-2 px-4 items-center' >
                <Ionicons name="share-outline" size={24} color={colors[0]} />
            </View>
      </View>
    </View>
  )
}

export default QueryAnswer