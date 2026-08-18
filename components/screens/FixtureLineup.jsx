import { View, Text, Platform, ScrollView } from 'react-native'
import { Tabs } from 'react-native-collapsible-tab-view'
import FixtureLineups from '../ui/FixtureLineups'
import React, { useEffect } from 'react'

const FixtureLineup = ({fixture}) => {


  return (
    <>
    {Platform.OS === 'web' ? <ScrollView style={{flex: 1}}>
      <FixtureLineups fixture={fixture}/>
    </ScrollView>

    :
    <Tabs.ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      style={{flex: 1}}
    >
      <FixtureLineups fixture={fixture}/>
    </Tabs.ScrollView>
    }

    </>
  )
}

export default FixtureLineup