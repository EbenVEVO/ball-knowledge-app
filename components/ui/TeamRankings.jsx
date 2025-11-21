import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';


export const TeamRankings = () => {

    const teamRank= {
        goalsForward:{
            value: 102,
            rank: '1st'
        },
        goalsAgainst:{
            value:39,
            rank:'4th'
        },
        goalDifference:{
            value: 63,
            rank: '1st'
        },
       position:'1st',
       form: 'WLWWW'
    }
    
  return (
    <View className='bg-blue-600 rounded-xl shadow-xl w-full'>
     <View className='flex flex-row justify-between pt-4 px-5 items-center '>
            <Text className='text-xl text-white font-supreme'>{'Team Rankings'}</Text>
            <AntDesign name="right" size={15} color="white" />     
    </View>
    <View className='flex flex-col items-center justify-center gap-3 p-5 '>
        <Text className='text-2xl text-white font-supremeBold'>{teamRank.position}</Text>
        <Text className='text-xl text-white font-supreme'>{'League Position'}</Text>
    </View>

    <View className='flex flex-row justify-between p-10 items-center '>
        <View className='flex flex-col items-center justify-center gap-3 '>
            <Text className='text-lg text-white font-supreme'>{'GF'}</Text>
            <Text className='text-2xl text-white font-supremeBold'>{teamRank.goalsForward.value}</Text>
            <Text className='text-lg text-white font-supreme'>{teamRank.goalsForward.rank}</Text>
        </View>
        <View className='flex flex-col items-center justify-center gap-3'>
            <Text className='text-lg text-white font-supreme'>{'GA'}</Text>
            <Text className='text-2xl text-white font-supremeBold'>{teamRank.goalsAgainst.value}</Text>
            <Text className='text-lg text-white font-supreme'>{teamRank.goalsAgainst.rank}</Text>
        </View>
        <View className='flex flex-col items-center justify-center gap-3'>
            <Text className='text-lg text-white font-supreme'>{'GD'}</Text>
            <Text className='text-2xl text-white font-supremeBold'>{teamRank.goalDifference.value}</Text>
            <Text className='text-lg text-white font-supreme'>{teamRank.goalDifference.rank}</Text>
        </View>
        <View className='flex flex-col items-center justify-center gap-3'>
            <Text className='text-lg text-white font-supreme'>{'FORM'}</Text>
            <Text className='text-2xl text-white font-supremeBold'>{teamRank.form}</Text>
            <Text className='text-lg text-white font-supreme'>{'LAST 5'}</Text>
        </View>

    </View>
    </View>
  )
}

export default TeamRankings

const styles = StyleSheet.create({})