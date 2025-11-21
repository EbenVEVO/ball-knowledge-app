import { View, Text } from 'react-native'
import {PlayerGames} from '../ui/PlayerGames'
import React from 'react'

export const PlayerMatches = ({player}) => {
  return (
    <View className='flex flex-col p-5 bg-white'>
      <Text>Match Stats</Text>
      <PlayerGames player={player}/>
    </View>
  )
}

export default PlayerMatches