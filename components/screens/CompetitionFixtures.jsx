import { View, Text } from 'react-native'
import React from 'react'
import LeagueFixtures from '../ui/LeagueFixtures'

const CompetitionFixtures = ({competition, season}) => {
  return (
    <View>
      <LeagueFixtures season={season}/>
    </View>
  )
}

export default CompetitionFixtures