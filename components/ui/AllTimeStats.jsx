import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';


export const AllTimeStats = () => {

    const playerStats = 
    {   
        apperances: 945,
        goals: 768,
        assists: 367,
        trophies: 46
    }
  return (
    <View className='bg-white border-1 border-gray-100/50 rounded-xl shadow-xl w-full'>
     <View className='flex flex-row justify-between pt-4 px-5 items-center '>
            <Text className='text-xl text-black font-supreme'>{'All Time Stats'}</Text>
            <AntDesign name="right" size={15} color="black" />     
    </View>
    <View className='flex flex-row justify-between p-10 items-center '>
        <View className='flex flex-col items-center justify-center '>
            <Text className='text-2xl text-black font-supreme'>{playerStats.apperances}</Text>
            <Text className='text-lg text-black font-supreme'>{'Apperances'}</Text>
        </View>
        <View className='flex flex-col items-center justify-center '>
            <Text className='text-2xl text-black font-supreme'>{playerStats.goals}</Text>
            <Text className='text-lg text-black font-supreme'>{'Goals'}</Text>
        </View>
        <View className='flex flex-col items-center justify-center '>
            <Text className='text-2xl text-black font-supreme'>{playerStats.assists}</Text>
            <Text className='text-lg text-black font-supreme'>{'Assists'}</Text>
        </View>
        <View className='flex flex-col items-center justify-center '>
            <Text className='text-2xl text-black font-supreme'>{playerStats.trophies}</Text>
            <Text className='text-lg text-black font-supreme'>{'Trophies'}</Text>
        </View>

    </View>
    </View>
  )
}

export default AllTimeStats

const styles = StyleSheet.create({})