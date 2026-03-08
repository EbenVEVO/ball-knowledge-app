import { View, Text, Platform, ScrollView } from 'react-native'
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
   {Platform.OS === 'web' ? <View style={{backgroundColor: 'white'}}>
      <View className='flex flex-row gap-5 p-5 '>
        <View style={{flex:2}}>
          <FixtureTimeline fixture={fixture} />
          <View className='flex flex-row gap-3 p-2 '>
            <FixtureNextMatch home={fixture.home_team} away={fixture.away_team} />
          </View>
          
        </View>

        <View style={{flex:1}}>
          <MatchStats fixture={fixture} />
          <LeagueTable season={fixture?.season}/>
        </View>
      </View>

      
      
    </View>
  
  :
    <View className='pb-5'>
      <ScrollView className='p-3'>
        <View className='gap-5'>
          <FixtureTimeline fixture={fixture} />
          <FixtureTopPlayers fixture={fixture} />
          <FixtureNextMatch home={fixture.home_team} away={fixture.away_team} />
          <FixtureTeamForm home={fixture.home_team} away={fixture.away_team} />
        </View>
      </ScrollView>
    </View>
  }
  </>
  )
}

export default MatchOverview