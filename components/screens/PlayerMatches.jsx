import { View, Text, Platform } from 'react-native'
import {PlayerGames} from '../ui/PlayerGames'
import React, { useState } from 'react'
import { PlayerModal } from '../ui/PlayerModal'
import PlayerBottomSheet from '../ui/PlayerBottomSheet'

export const PlayerMatches = ({player}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [playerStats, setPlayerStats] = useState()
  const [playerInfo, setPlayerInfo] = useState()
  const PlayerSheet = Platform.OS === 'web' ? PlayerModal : PlayerBottomSheet

  return (
    <View className='flex flex-col bg-white'>
      <PlayerGames player={player}
        setIsVisible={setIsVisible}
        setPlayerInfo={setPlayerInfo}
        setPlayerStats={setPlayerStats}/>
      {(playerStats&&playerInfo)&&
      <PlayerSheet
        isVisible={isVisible}
        stats={playerStats}
        player={playerInfo}
        fixture={playerStats.fixture}
        onClose={()=>setIsVisible(!isVisible)}
      />}
    </View>
  )
}

export default PlayerMatches