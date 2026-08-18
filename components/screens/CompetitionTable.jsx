import { View, Text, Platform, ScrollView } from 'react-native'
import React from 'react'
import { Tabs } from 'react-native-collapsible-tab-view'
import LeagueTable from '../ui/LeagueTable'
import SeasonSelect from '../ui/SeasonSelect'

const CompetitionTable = ({competition, season}) => {
  if (Platform.OS === 'web') {
    return (
      <ScrollView style={{ flex: 1 }}>
        <LeagueTable
          season={season}
        />
      </ScrollView>
    )
  }

  return (
    <Tabs.ScrollView>
      <LeagueTable
        season={season}
      />
    </Tabs.ScrollView>
  )
}

export default CompetitionTable