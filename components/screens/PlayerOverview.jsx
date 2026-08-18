import { View, Text, Platform, Image, ScrollView } from 'react-native'
import React from 'react'
import { useCollapsibleStyle } from 'react-native-collapsible-tab-view'

import { Tabs } from 'react-native-collapsible-tab-view'
import PlayerInfo from '../ui/PlayerInfo'
import ClubCard from '../ui/ClubCard'
import PlayerHistory from '../ui/PlayerHistory'
import PlayerLastGames from '../ui/PlayerLastGames'
import PlayerLastGame from '../ui/PlayerLastGame'
import PlayerCurrentSeason from '../ui/PlayerCurrentSeason'

export const PlayerOverview = ({ player, club }) => {
  
  const HeaderSpacer = () => {
    const { progressViewOffset } = useCollapsibleStyle()
    return <View style={{ height: progressViewOffset }} />
  }
  
    return (
    <>
      {Platform.OS === 'web' ?
      <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 12, gap: 20}}>
            <PlayerInfo player={player} club={club} />
            <PlayerCurrentSeason player={player} />

        <View className='flex flex-row gap-5'>
            <View className='flex  items-center justify-center w-full gap-5  p-5 ' style={{flex:2}}>
                <PlayerLastGame player={player} />
            </View>
            <View style={{flex:1}}>
                <PlayerHistory player={player}/>
            </View>
            </View>
      </ScrollView>
    :
    <Tabs.ScrollView contentContainerStyle={{padding: 8, marginTop:10, gap: 20}}>
        
        <PlayerInfo player={player} club={club} />
        <PlayerCurrentSeason player={player} />
        <PlayerLastGame player={player}/>
        <PlayerHistory player={player}/>
    </Tabs.ScrollView>

    }
    </>
  )
}

export default PlayerOverview