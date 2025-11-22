import { StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'

export default function ProfileScreen() {
  const {id} = useLocalSearchParams()
  return (
    <View>
      <Text>Profile</Text>
    </View>
  )
}


