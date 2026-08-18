import { View, Text, Platform, ScrollView } from 'react-native'
import React from 'react'
import { Tabs } from 'react-native-collapsible-tab-view'
import FixturePlayerStats from '../ui/FixturePlayerStats'
import TeamPlayerStats from '../ui/TeamPlayerStats'

const TeamStats = ({club}) => {
  if (Platform.OS === 'web') {
    return (
      <ScrollView style={{ flex: 1 }}>
        <TeamPlayerStats club={club}/>
      </ScrollView>
    )
  }

  return (
    <Tabs.ScrollView>
      <TeamPlayerStats club={club}/>
    </Tabs.ScrollView>
  )
}

export default TeamStats