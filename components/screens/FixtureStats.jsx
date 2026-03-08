import { View, Text, Platform, ScrollView } from 'react-native'
import React from 'react'
import MatchStats from '../ui/MatchStats'
import DefenseStats from '../ui/DefenseStats'
import DuelStats from '../ui/DuelStats'
import FixturePlayerStats from '../ui/FixturePlayerStats'

const FixtureStats = ({fixture}) => {
  return (
    <>
   {Platform.OS === 'web' ? <View>
      <MatchStats fixture={fixture}/>
      <View className='flex flex-row p-5 gap-5'>
        <View style={{flex:1}}>
          <DefenseStats fixture={fixture}/>
        </View>
        <View style={{flex:1}}>
          <DuelStats fixture={fixture}/>
        </View>
      </View>
      <View className=' p-5 '>
        <FixturePlayerStats fixture={fixture}/>
      </View>
    </View>

    :
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      style={{flex: 1}}
    >
      <View className='p-3 gap-5'>
      <MatchStats fixture={fixture}/>
      <DefenseStats fixture={fixture}/>
      <DuelStats fixture={fixture}/>
      <FixturePlayerStats fixture={fixture}/>
      </View>
    </ScrollView>
    }
    
    </>
  )
}

export default FixtureStats