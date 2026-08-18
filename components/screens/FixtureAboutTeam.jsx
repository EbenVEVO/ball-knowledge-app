import { View, Text, Platform, ScrollView } from 'react-native'
import React from 'react'
import { Tabs } from 'react-native-collapsible-tab-view'
import TeamLeaders from '../ui/TeamLeaders'
import TeamPlayerStats from '../ui/TeamPlayerStats'

const FixtureAboutTeam = ({club, fixture}) => {
  const body = (
    <>
      <TeamLeaders club={club} fixture={fixture}/>
      <TeamPlayerStats club={club} fixture={fixture}/>
    </>
  )

  if (Platform.OS === 'web') {
    return <ScrollView style={{ flex: 1 , padding:10}}>{body}</ScrollView>
  }

  return <Tabs.ScrollView>{body}</Tabs.ScrollView>
}

export default FixtureAboutTeam