import { View, Platform, ScrollView } from 'react-native'
import React from 'react'
import { Tabs } from 'react-native-collapsible-tab-view'
import LeagueTable from '../ui/LeagueTable'
import LeagueUpcomingFixtures from '../ui/LeagueUpcomingFixtures'

const ScrollContainer = Platform.OS === 'web' ? ScrollView : Tabs.ScrollView

const CompetitionOverview = ({competition, season}) => {
  return (
    <View>
      <ScrollContainer>
        <View className={`flex ${Platform.OS ==='web' ? 'flex-row' : 'flex-col'} gap-5 p-3 w-full`}>
            {competition.type !== 'Cup' &&
            <View  style={{flex: Platform.OS ==='web' && 2}}>
                <LeagueTable season={season}/>
            </View>
            }
            <View style={{flex: Platform.OS ==='web' && 1}}>
                <LeagueUpcomingFixtures season={season}/>
            </View>
        </View>
      </ScrollContainer>
    </View>
  )
}

export default CompetitionOverview