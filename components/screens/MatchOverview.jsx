import { View, Text, Platform, ScrollView } from 'react-native'
import { Tabs } from 'react-native-collapsible-tab-view'
import FixtureTimeline from '../ui/FixtureTimeline'
import MatchStats from '../ui/MatchStats'
import LeagueTable from '../ui/LeagueTable'
import React from 'react'
import NextMatch from '../ui/NextMatch'
import TeamForm from '../ui/TeamForm'
import FixtureNextMatch from '../ui/FixtureNextMatch'
import FixtureTeamForm from '../ui/FixtureTeamForm'
import FixtureTopPlayers from '../ui/FixtureTopPlayers'

const MatchOverview = ({fixture}) => {
  if(!fixture) return

  console.log(fixture, 'overview')
  return (
    <>
   {Platform.OS === 'web' ? <ScrollView style={{flex: 1, backgroundColor: 'white'}}>
      <View className='flex flex-row gap-5 p-5 '>
        <View style={{flex:2}}>
          <FixtureTimeline fixture={fixture} />
          <FixtureNextMatch home={fixture.home_team} away={fixture.away_team} />
          <FixtureTeamForm home={fixture.home_team} away={fixture.away_team} />
        </View>

        <View style={{flex:1, gap:20}}>
          <MatchStats fixture={fixture} />
          <LeagueTable season={fixture?.season} rounded={true}/>
        </View>
      </View>



    </ScrollView>

  :
    <View className='pb-5'>
      <Tabs.ScrollView className='p-3'>
        <View className='gap-5'>
          <FixtureTimeline fixture={fixture} />
          <FixtureTopPlayers fixture={fixture} />
          <FixtureNextMatch home={fixture.home_team} away={fixture.away_team} />
          <FixtureTeamForm home={fixture.home_team} away={fixture.away_team} />
        </View>
      </Tabs.ScrollView>
    </View>
  }
  </>
  )
}

export default MatchOverview