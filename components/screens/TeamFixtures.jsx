import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native'
import {ClubFixtures} from '../ui/ClubFixtures'
import React from 'react'

export const TeamFixtures = ({club}) => {
  
  return (
    <View>
        <ClubFixtures club={club}/>
    </View>
  )
}

export default TeamFixtures

const styles = StyleSheet.create({})