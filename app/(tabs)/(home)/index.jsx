import { View, Text, Pressable, Image, ScrollView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { logout } from '../../../auth/authfunctions';
import { useAuth } from '../../../contexts/AuthContext';
import UpcomingGames from '@/components/ui/UpcomingGames';
import FeaturedLeagues from '@/components/ui/FeaturedLeagues';
import FollowingPreviewCard from '@/components/ui/FollowingPreviewCard';
import TheXICtaCard from '@/components/ui/TheXICtaCard';
import ExampleQueriesCard from '@/components/ui/ExampleQueriesCard';
import HomeLeagueTableCard from '@/components/ui/HomeLeagueTableCard';
import TopStatsLeadersCard from '@/components/ui/TopStatsLeadersCard';
import TopClubsLeadersCard from '@/components/ui/TopClubsLeadersCard';
import React, { useEffect, useState } from "react";
import CollectionCreationModal from '../../../components/ui/CollectionCreationModal';
import TopNavBar from '@/components/navigation/TopNavBar';

export default function HomeScreen() {
  const {session} = useAuth()
  const [modalVisible, setModalVisible] = useState(false)
  return (
    <>
    <TopNavBar variant="logo" />
    <ScrollView contentContainerStyle={{ padding: 12, gap: 16, paddingBottom: 24 }}>
      <UpcomingGames />
      <FeaturedLeagues />
      <View className={`flex ${Platform.OS === 'web' ? 'flex-row' : 'flex-col'} gap-4`}>
        <View style={{ flex: Platform.OS === 'web' && 2 }}>
          {session ? <FollowingPreviewCard /> : null}
        </View>

        <View style={{ flex: Platform.OS === 'web' && 1, gap: 16 }}>
            <Link href='/team-builder' asChild>
            <Pressable className='rounded-xl p-4 gap-2 w-full' style={{borderColor:'#e0e0e0',borderWidth:1, backgroundColor:'white', alignSelf:'flex-start'}}>
              <View className=' flex flex-row items-center gap-1' style={{paddingVertical:10}}>
                <Image
                              source={require('../../../assets/images/logo.png')}
                              style={{ height: 60, width: 232.5 }}
                              resizeMode='contain'
                            />
                <Text className='font-supremeExtraBold text-2xl' style={{color:'#A477C7'}}> Team Builder</Text>
              </View>
              <View className='border-b border-gray-300 '></View>
              <View>
              <Text className='font-supremeBold text-xl'>Build your own XI</Text>
              <Text className='font-supreme text-lg' style={{color:'gray'}}>
                Create, Save and Share!
              </Text>
              </View>
            </Pressable>
            </Link>

          <TheXICtaCard />
          <ExampleQueriesCard />
        </View>
      </View>

      <View className={`flex ${Platform.OS === 'web' ? 'flex-row' : 'flex-col'} gap-4`}>
        <View style={{ flex: Platform.OS === 'web' && 3, gap: 16 }}>
          <HomeLeagueTableCard />
          <TopClubsLeadersCard />
        </View>

        <View style={{ flex: Platform.OS === 'web' && 2 }}>
          <TopStatsLeadersCard />
        </View>
      </View>

      <Pressable onPress={logout}>
        <Text>sign out</Text>
        <Text style={{color: session ? 'green': 'red'}}>{session ? 'session' : 'no session'}</Text>
      </Pressable>

      <CollectionCreationModal isVisible={modalVisible} onClose={()=> setModalVisible(!modalVisible)}/>
    </ScrollView>
    </>
  );
}
