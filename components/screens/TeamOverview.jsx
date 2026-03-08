import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native'
import React, {useEffect, useRef, useState} from 'react'
import {TeamForm} from '../ui/TeamForm'
import {NextMatch} from '../ui/NextMatch'
import {LeagueTable} from '../ui/LeagueTable'
import { useWindowDimensions } from 'react-native';
import {LastLineup} from '../ui/LastLineup'
import { supabase } from '../../lib/supabase'
import LeagueTableMini from '../ui/LeagueTableMini'
import ClubFixtures from '../ui/ClubFixtures'

export const TeamOverview = ({club }) => {

  const [activeSeason, setActiveSeason]= useState()
  
  useEffect(()=>{
      const fetchCurrentSeason = async () => {
        const { data, error } = await supabase
          .from('seasons')
          .select(`
            id,
            season,
            competition_name,
            league_standings!inner(club_id)
          `)
          .eq('league_standings.club_id', club.id)
          .order('season', { ascending: false })
          .limit(1)
          .single();
  
        if (data) setActiveSeason(data);
      };
  
      if (club?.id) fetchCurrentSeason();
  },[club])
   
  

  return (
    <>
  {Platform.OS === 'web' ?    <View style={{height: '100%'}}>
        <View className='flex flex-row gap-5 p-3 '>
        <View style={{flex:2}}>
          <View className='flex flex-row items-center p-5 px-5 w-full justify-center' style={{flexDirection:Platform.select({ios: 'column', android: 'column' }), gap: 20}}>
            <TeamForm club={club} />
            <NextMatch club={club}/>
          </View>
          <LeagueTable
            highlighted = {club?.id}
            showLast5={true}
            season = {activeSeason}/>
        </View>
          <View style={{flex:1,}}>
            <LastLineup club={club}/>
            <ClubFixtures club={club} perPage={5}/>
          </View>
          </View>
        </View>:
        <ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom: 50, paddingTop: 20}} >
          <View className='flex flex-col p-2 gap-5' style={{flex:1}}>
            <NextMatch club={club}/>
            <TeamForm club={club} />
            <LastLineup club={club} />
            <LeagueTableMini highlighted={club?.id} season = {activeSeason}/> 
            </View>
          </ScrollView> 
        }
  </>
  )
}

export default TeamOverview

const styles = StyleSheet.create({})