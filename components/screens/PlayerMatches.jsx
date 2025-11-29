import { View, Text } from 'react-native'
import {PlayerGames} from '../ui/PlayerGames'
import React, { useState } from 'react'
import PlayerModal from '../ui/PlayerModal'

export const PlayerMatches = ({player}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [playerStats, setPlayerStats] = useState()
  const [playerInfo, setPlayerInfo] = useState()
  return (
    <View className='flex flex-col p-5 bg-white'>
      <Text>Match Stats</Text>
      <PlayerGames player={player} 
        setIsVisible={setIsVisible}
        setPlayerInfo={setPlayerInfo}
        setPlayerStats={setPlayerStats}/>
      {(playerStats&&playerInfo)&&
      <PlayerModal
        isVisible={isVisible}
        stats={playerStats}
        player={playerInfo}
        onClose={()=>setIsVisible(!isVisible)}
      />}
    </View>
  )
}

export default PlayerMatches