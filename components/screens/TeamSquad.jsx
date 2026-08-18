import { StyleSheet, Text, View, Platform, ScrollView } from 'react-native'
import { Tabs } from 'react-native-collapsible-tab-view'
import {SquadTable} from '../ui/SquadTable'
import React from 'react'

export const TeamSquad = ({club}) => {
  if (Platform.OS === 'web') {
    return (
      <ScrollView style={{ flex: 1 }}>
        <SquadTable club={club}/>
      </ScrollView>
    )
  }

  return (
    <Tabs.ScrollView>
      <SquadTable club={club}/>
    </Tabs.ScrollView>
  )
}

export default TeamSquad

const styles = StyleSheet.create({})