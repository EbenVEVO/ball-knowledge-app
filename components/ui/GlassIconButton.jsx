import { Pressable, StyleSheet, View } from 'react-native'
import { BlurView } from 'expo-blur'
import React from 'react'

export const GLASS_BUTTON_SIZE = 40
export const GLASS_ROW_PADDING = 16
// Height of a GlassIconButton row (button + vertical padding) - screens that
// place one over a react-native-collapsible-tab-view header pass this as
// minHeaderHeight so the pinned tab bar never rises up underneath it.
export const GLASS_ROW_HEIGHT = GLASS_BUTTON_SIZE + GLASS_ROW_PADDING * 2

const GlassIconButton = ({ onPress, children, size = GLASS_BUTTON_SIZE }) => {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={[styles.button, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.iconWrap}>{children}</View>
    </Pressable>
  )
}

export default GlassIconButton

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
