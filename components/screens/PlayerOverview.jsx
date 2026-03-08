import { View, Text, Platform, Image,  } from 'react-native'
import React from 'react'
import PlayerInfo from '../ui/PlayerInfo'
import ClubCard from '../ui/ClubCard'
import PlayerHistory from '../ui/PlayerHistory'
import PlayerLastGames from '../ui/PlayerLastGames'
import PlayerLastGame from '../ui/PlayerLastGame'

export const PlayerOverview = ({ player, club }) => {
  return (
    <>
      {Platform.OS === 'web' ? 
      <>
      <View className='flex flex-row items-center p-5   w-full justify-center ' style={{ flexDirection: Platform.select({ ios: 'column', android: 'column', }), gap: 20, paddingHorizontal: Platform.select({ ios: 10, android: 10, web: 20 }) }}>
            <View style={{ flex: 2 }}>
                <PlayerInfo player={player} club={club} />
            </View>
            <ClubCard club={club} />
            </View><View className='flex flex-row items-center justify-center w-full  p-5 ' style={{ flexDirection: Platform.select({ ios: 'column', android: 'column' }), gap: 20, }}>
                <PlayerLastGame player={player} />
                <PlayerLastGames player={player} />
            </View>
        </>
    :
    <View className='flex flex-col p-2 gap-5' style={{flex:1}}>
            <PlayerInfo player={player} club={club} />
            <PlayerLastGame player={player}/>
            <PlayerLastGames player={player} />
          
        </View>
    
    }
    </>
  )
}

export default PlayerOverview