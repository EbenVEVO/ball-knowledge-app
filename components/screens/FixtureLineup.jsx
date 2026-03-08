import { View, Text, Platform, ScrollView } from 'react-native'
import FixtureLineups from '../ui/FixtureLineups'
import React, { useEffect } from 'react'

const FixtureLineup = ({fixture}) => {

 
  return (
    <>
    {Platform.OS === 'web' ? <View>
      <FixtureLineups fixture={fixture}/>
    </View>
    
    :
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      style={{flex: 1}}
    >
      <FixtureLineups fixture={fixture}/>
    </ScrollView>
    }
    
    </>
  )
}

export default FixtureLineup