import { View, Text } from 'react-native'
import React from 'react'
import LeagueTable from '../ui/LeagueTable'
import SeasonSelect from '../ui/SeasonSelect'

const CompetitionTable = ({competition, season}) => {
  return (
    <View>
      <LeagueTable
        season={season}
      />
    </View>
  )
}

export default CompetitionTable