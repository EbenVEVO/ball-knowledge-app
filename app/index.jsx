import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, View, ScrollView, TextInput } from 'react-native';
import { QueryCard } from '../components/ui/QueryCard';
import {StatsCard} from '../components/ui/statsCard'
import {PlayerLeadersCard} from '../components/ui/playerLeadersCard'
import {VideoCard} from '../components/ui/videoCard'

import {AllTimeStats} from '../components/ui/AllTimeStats'
import {TeamRankings} from '../components/ui/TeamRankings'
import {TrophyCard} from '../components/ui/TrophyCard'
import {LeagueTable} from '../components/ui/LeagueTable'
import {LeagueTableMini} from '../components/ui/LeagueTableMini'
import {GameLog} from '../components/ui/GameLog'

 import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
 import {Search} from '../components/ui/Search'

export default function HomeScreen() {
  const diegoForlanData = {
  seasons: [
    {
      rank: 1,
      photo: 'https://img.a.transfermarkt.technology/portrait/header/28003-1671435885.jpg?lm=1',
      name: 'Diego Forlán',
      season: '2001-02',
      club: 'Man United',
      clubLogo: 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png',
      matches: 13,
      minutes: 570,
      starts: 6,
      goals: 0,
      ownGoals: 0,
      goalRatio: '0.00',
      assists: 0,
      goalAssist: 0,
      penalties: 0,
      penaltiesMissed: 0,
      shots: 0,
      shotsOnTarget: 0,
      woodwork: 0
    },
    {
      rank: 2,
      photo: 'https://img.a.transfermarkt.technology/portrait/header/28003-1671435885.jpg?lm=1',
      name: 'Diego Forlán',
      season: '2002-03',
      club: 'Man United',
      clubLogo: 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png',
      matches: 25,
      minutes: 830,
      starts: 7,
      goals: 6,
      ownGoals: 6,
      goalRatio: '0.24',
      assists: 2,
      goalAssist: 8,
      penalties: 0,
      penaltiesMissed: 0,
      shots: 0,
      shotsOnTarget: 0,
      woodwork: 0
    },
    {
      rank: 3,
      photo: 'https://img.a.transfermarkt.technology/portrait/header/28003-1671435885.jpg?lm=1',
      name: 'Diego Forlán',
      season: '2003-04',
      club: 'Man United',
      clubLogo: 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png',
      matches: 24,
      minutes: 1069,
      starts: 10,
      goals: 4,
      ownGoals: 4,
      goalRatio: '0.17',
      assists: 4,
      goalAssist: 8,
      penalties: 0,
      penaltiesMissed: 0,
      shots: 0,
      shotsOnTarget: 0,
      woodwork: 0
    },
    {
      rank: 4,
      photo: 'https://img.a.transfermarkt.technology/portrait/header/28003-1671435885.jpg?lm=1',
      name: 'Diego Forlán',
      season: '2004-05',
      club: 'Man United',
      clubLogo: 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png',
      matches: 1,
      minutes: 17,
      starts: 0,
      goals: 0,
      ownGoals: 0,
      goalRatio: '0.00',
      assists: 0,
      goalAssist: 0,
      penalties: 0,
      penaltiesMissed: 0,
      shots: 0,
      shotsOnTarget: 0,
      woodwork: 0
    }
  ],
  total: {
    matches: 63,
    minutes: 2486,
    starts: 23,
    goals: 10,
    ownGoals: 10,
    goalRatio: '0.16',
    assists: 6,
    goalAssist: 16,
    penalties: 0,
    penaltiesMissed: 0,
    shots: 0,
    shotsOnTarget: 0,
    woodwork: 0
  }
};
  return (
    <SafeAreaProvider>
      <SafeAreaView className='flex flex-1' style={{flex: 1}}>
        
       <Search/>
        
        <ScrollView style={{flex: 1, }} contentContainerStyle={{flexGrow: 1} }>
          <View 
          
          className={` mx-auto flex justify-center items-center ${Platform.OS == 'ios' || 'android' ? 'w-full' : 'w-3/4'}`}>
          <QueryCard
          colors = {['#FFB8EA', '#0']}
          />
        <View className='flex flex-row p-10 gap-10'>
            
        </View>

        <PlayerLeadersCard/>
          <VideoCard/>

          <AllTimeStats/>
          <TeamRankings/>
          <TrophyCard/>
          <LeagueTable/>
          <LeagueTableMini/>
          <GameLog/>

        </View>


        </ScrollView>


      </SafeAreaView>
    </SafeAreaProvider>
  );
}

