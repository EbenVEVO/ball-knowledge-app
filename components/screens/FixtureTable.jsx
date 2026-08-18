import { View, Text, Platform, ScrollView } from 'react-native'
import React from 'react'
import { Tabs } from 'react-native-collapsible-tab-view'
import LeagueTable from '../ui/LeagueTable'

const FixtureTable = ({fixture}) => {
  if (Platform.OS === 'web') {
    return (
      <ScrollView style={{ flex: 1 }}>
        <LeagueTable
          showLast5={true}
          season={fixture?.season}/>
      </ScrollView>
    )
  }

  return (
    <Tabs.ScrollView>
      <LeagueTable
        showLast5={true}
        season={fixture?.season}/>
    </Tabs.ScrollView>
  )
}

export default FixtureTable