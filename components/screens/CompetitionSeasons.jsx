import { View, Text } from 'react-native'
import React from 'react'
import LeagueSeasonsCards from '../ui/LeagueSeasonsCards'

const CompetitionSeasons = ({competition, seasons}) => {
  if(!seasons)return
  return (
    <View className='bg-white'>
            <LeagueSeasonsCards seasons={seasons}/>
    </View>
  )
}

export default CompetitionSeasons