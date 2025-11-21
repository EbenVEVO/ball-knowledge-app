import { StyleSheet, Text, View } from 'react-native'
import {SquadTable} from '../ui/SquadTable'
import React from 'react'

export const TeamSquad = ({club}) => {
  return (
    <View className=''>
      <SquadTable club={club}/>
    </View>
  )
}

export default TeamSquad

const styles = StyleSheet.create({})