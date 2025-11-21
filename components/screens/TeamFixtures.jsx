import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native'
import {Fixtures} from '../ui/Fixtures'
import React from 'react'

export const TeamFixtures = ({club}) => {
  

  return (
    <View>
        <Fixtures club={club}/>
    </View>
  )
}

export default TeamFixtures

const styles = StyleSheet.create({})