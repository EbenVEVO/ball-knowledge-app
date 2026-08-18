import { ScrollView, Platform } from 'react-native'
import React from 'react'
import { Tabs } from 'react-native-collapsible-tab-view'
import PlayerSeasons from '../ui/PlayerSeasons'

const PlayerCareerStats = ({ player }) => {
  if (Platform.OS === 'web') {
    return (
      <ScrollView style={{ flex: 1, padding:10 }}>
        <PlayerSeasons player={player} />
      </ScrollView>
    )
  }

  return (
    <Tabs.ScrollView style={{ flex: 1, padding:10 }}>
      <PlayerSeasons player={player} />
    </Tabs.ScrollView>
  )
}

export default PlayerCareerStats
