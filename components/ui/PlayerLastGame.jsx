import { StyleSheet, Text, View, Image } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import React from 'react'

export const PlayerLastGame = () => {

    const lastGame = {
        date: "12/12/2022",
        competition: "Premier League",
        home_team: {
            name: "Chelsea",
            logo: "https://media.api-sports.io/football/teams/49.png",
            position: '1st'
        },
        away_team: {
            name: "Wolves",
            logo: "https://media.api-sports.io/football/teams/39.png",
            position: '13th'
        },
        score: {
            home: 2,
            away: 0
        }
        
    }
  return (
    <View className='rounded-xl shadow-xl flex flex-col bg-white'>
        <View className='flex flex-row justify-between pt-5 px-3 items-center '>
            <Text className='text-2xl font-supremeBold '>Last Game</Text>
            <AntDesign name="right" size={15} color="black" />     
        </View>
      <View className="flex flex-row items-center p-5 gap-5">
            <View className='flex flex-col items-center justify-center gap-2 p-5 '>
                <Image source={{uri: lastGame.home_team.logo}} style={{ width: 70, height: 70 }} resizeMode='contain'/>
                <Text className='font-supreme text-xl '>{lastGame.home_team.name}</Text>
                <Text className='font-supreme text-xl '>{lastGame.home_team.position}</Text>
            </View>
            <View className='flex flex-col items-center justify-center gap-2 p-5 '>
                <Text className='font-supremeBold text-4xl '>{lastGame.score.home}-{lastGame.score.away}</Text>
                <Text className='font-supreme text-xl '>{lastGame.date}</Text>
                <Text className='font-supreme text-md '>{lastGame.competition}</Text>
            </View>
            <View className='flex flex-col items-center justify-center gap-2 p-5 '>
                <Image source={{uri: lastGame.away_team.logo}} style={{ width: 70, height: 70 }} resizeMode='contain'/>
                <Text className='font-supreme text-xl '>{lastGame.away_team.name}</Text>
                <Text className='font-supreme text-xl '>{lastGame.away_team.position}</Text>
            </View>
      </View>
    </View>
  )
}

export default PlayerLastGame

const styles = StyleSheet.create({})