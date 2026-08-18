import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'

export const TopNavBar = ({ variant = 'title', title }) => {
  if (Platform.OS === 'web') return null

  return (
    <View style={styles.container}>
      {variant === 'logo' ? (
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode='contain'
        />
      ) : (
        <Text style={styles.title}>{title?.toUpperCase()}</Text>
      )}

      <Pressable onPress={() => {}} hitSlop={8}>
        <Ionicons name='menu' size={26} color='black' />
      </Pressable>
    </View>
  )
}

export default TopNavBar

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logo: {
    height: 28,
    width: 108,
  },
  title: {
    fontFamily: 'supremeBold',
    fontSize: 18,
  },
})
