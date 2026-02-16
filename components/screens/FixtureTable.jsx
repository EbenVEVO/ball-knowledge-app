import { View, Text } from 'react-native'
import React from 'react'
import LeagueTable from '../ui/LeagueTable'

const FixtureTable = ({fixture}) => {
  return (
    <View>
      <LeagueTable 
        showLast5={true}
        season={fixture?.season}/>
    </View>
  )
}

export default FixtureTable