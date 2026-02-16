import { View, Text } from 'react-native'
import FixtureTimeline from '../ui/FixtureTimeline'
import MatchStats from '../ui/MatchStats'
import LeagueTable from '../ui/LeagueTable'
import React from 'react'
import NextMatch from '../ui/NextMatch'
import TeamForm from '../ui/TeamForm'

const MatchOverview = ({fixture}) => {
  if(!fixture) return

  console.log(fixture, 'overview')
  return (
    <View style={{backgroundColor: 'white'}}>
      <View className='flex flex-row gap-5 p-5 '>
        <View style={{flex:2}}>
          <FixtureTimeline fixture={fixture} />
          <View className='flex flex-row gap-3 p-2 '>
            <View style={{flex:1}}>
              <NextMatch club={fixture?.home_team}/>
              <TeamForm club={fixture?.home_team}/>
            </View>
            <View style={{flex:1}}>
              <NextMatch club={fixture?.away_team}/>
              <TeamForm club={fixture?.away_team}/>
            </View>
          </View>
          
        </View>

        <View style={{flex:1}}>
          <MatchStats fixture={fixture} />
          <LeagueTable season={fixture?.season}/>
        </View>
      </View>

      
      
    </View>
  )
}

export default MatchOverview