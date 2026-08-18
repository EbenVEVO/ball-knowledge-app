import { View, Text, Platform, ScrollView } from 'react-native'
import React from 'react'
import { Tabs } from 'react-native-collapsible-tab-view'
import LeagueSeasonsCards from '../ui/LeagueSeasonsCards'

const ScrollContainer = Platform.OS === 'web' ? ScrollView : Tabs.ScrollView

const CompetitionSeasons = ({competition, seasons}) => {
  if(!seasons)return
  return (
    <ScrollContainer className='bg-white' style={{ flex: 1 }}>
            <LeagueSeasonsCards seasons={seasons}/>
    </ScrollContainer>
  )
}

export default CompetitionSeasons