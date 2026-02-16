import { View, Text } from 'react-native'
import FixtureLineups from '../ui/FixtureLineups'
import React, { useEffect } from 'react'

const FixtureLineup = ({fixture}) => {

  useEffect (()=>{

  },[fixture])
  return (
    <View>
      <FixtureLineups fixture={fixture}/>
    </View>
  )
}

export default FixtureLineup