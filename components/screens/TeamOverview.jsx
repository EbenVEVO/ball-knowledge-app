import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native'
import React, {useRef} from 'react'
import {TeamForm} from '../ui/TeamForm'
import {NextMatch} from '../ui/NextMatch'
import {LeagueTableMini} from '../ui/LeagueTableMini'
import { useWindowDimensions } from 'react-native';

export const TeamOverview = ({club }) => {
      const {height} = useWindowDimensions();
  
   
  

  return (
    
      <View style={{height: '100%'}}>
        <View className='flex flex-row items-center p-5 px-5 w-full justify-center' style={{flexDirection:Platform.select({ios: 'column', android: 'column' }), gap: 20}}>
          <TeamForm club={club} />
          <NextMatch club={club}/>
        </View>
        <View className='flex flex-row items-center p-5 px-5 w-full justify-center'>
          <LeagueTableMini club={club} />
        </View>
      </View>

  )
}

export default TeamOverview

const styles = StyleSheet.create({})