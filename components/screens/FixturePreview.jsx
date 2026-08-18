import { View, Text, Platform, ScrollView } from 'react-native'
import React from 'react'
import { Tabs } from 'react-native-collapsible-tab-view'
import LeagueTable from '../ui/LeagueTable'
import FixtureTeamForm from '../ui/FixtureTeamForm'
import FixtureSeasonLeaders from '../ui/FixtureSeasonLeaders'

const FixturePreview = ({fixture}) => {
  const body = (
    <>
        <FixtureTeamForm home={fixture?.home_team} away={fixture?.away_team}/>
      <View className='flex flex-row gap-5 '>
        <View style={{flex:1}}>
          <FixtureSeasonLeaders fixture={fixture} home={fixture?.home_team} away={fixture?.away_team}/>
        </View>
        <View style={{flex:1}}>

            <LeagueTable season={fixture?.season} />
        </View>
        <View>
        </View>
      </View>
    </>
  )

  if (Platform.OS === 'web') {
    return <ScrollView style={{ flex: 1 , padding:10}}>{body}</ScrollView>
  }

  return <Tabs.ScrollView>{body}</Tabs.ScrollView>
}

export default FixturePreview