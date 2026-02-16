import { View, Text } from 'react-native'
import React from 'react'
import LeagueTable from '../ui/LeagueTable'
import LeagueUpcomingFixtures from '../ui/LeagueUpcomingFixtures'

const CompetitionOverview = ({competition, season}) => {
  return (
    <View>

        <View className="flex flex-row gap-5 p-3">
            <View style={{flex:2}}>
                <LeagueTable season={season}/>
            </View>
            <View style={{flex:1}}>
                <LeagueUpcomingFixtures season={season}/>
            </View>
        </View>
      <View className="flex flex-row gap-5 p-3">
        <View style={{flex:1}}>
            <Text>Top Ratings PlaceHolder</Text>
        </View>

        <View style={{flex:1}}>
            <Text>Top Scorers PlaceHolder</Text>
        </View>

        <View style={{flex:1}}>
            <Text>Top Assisters PlaceHolder</Text>
        </View>
        

      </View>

      <View>
        <Text>Top Team Stats</Text>
      </View>
    </View>
  )
}

export default CompetitionOverview