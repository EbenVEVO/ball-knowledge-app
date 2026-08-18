import { View, Platform, ScrollView } from 'react-native'
import React from 'react'
import { Tabs } from 'react-native-collapsible-tab-view'
import CompetitionTopStats from '../ui/CompetitionTopStats'

const CompetitionStats = ({ competition, season }) => {
  if (Platform.OS === 'web') {
    return (
      <ScrollView style={{ flex: 1 }}>
        <CompetitionTopStats competition={competition} season={season} />
      </ScrollView>
    )
  }

  return (
    <Tabs.ScrollView>
      <CompetitionTopStats competition={competition} season={season} />
    </Tabs.ScrollView>
  )
}

export default CompetitionStats
