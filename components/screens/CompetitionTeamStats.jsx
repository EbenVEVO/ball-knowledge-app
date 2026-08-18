import { View, Platform, ScrollView } from 'react-native'
import React from 'react'
import { Tabs } from 'react-native-collapsible-tab-view'
import CompetitionTeamLeaders from '../ui/CompetitionTeamLeaders'

const CompetitionTeamStats = ({ competition, season }) => {
  if (Platform.OS === 'web') {
    return (
      <ScrollView style={{ flex: 1 }}>
        <CompetitionTeamLeaders competition={competition} season={season} />
      </ScrollView>
    )
  }

  return (
    <Tabs.ScrollView>
      <CompetitionTeamLeaders competition={competition} season={season} />
    </Tabs.ScrollView>
  )
}

export default CompetitionTeamStats
