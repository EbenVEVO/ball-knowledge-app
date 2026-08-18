import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { Extrapolation, interpolate, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useHeaderMeasurements, useCurrentTabScrollY, useFocusedTab } from 'react-native-collapsible-tab-view'
import React, { useEffect } from 'react'
import { GLASS_ROW_HEIGHT } from '../ui/GlassIconButton'

// Compact single-row replacement header (badge/photo + name) shown once the
// big hero has collapsed - height of that row, not counting the glass row or
// the status bar inset above it.
export const FLATTENED_HEADER_HEIGHT = 56

// Tab names in `autoFlattenTabs` never register their own scroll with the
// collapsible header (they manage their own scrolling internally - e.g. an
// infinite-scroll fixtures list), so the header would otherwise just stay
// wherever it was left on the previous tab instead of collapsing on its own.
export const CollapsibleHeaderCrossfade = ({ expanded, flattened, flattenedBackgroundColor = 'white', autoFlattenTabs = [] }) => {
  const insets = useSafeAreaInsets()
  const { top, height } = useHeaderMeasurements()
  const scrollYCurrent = useCurrentTabScrollY()
  const focusedTab = useFocusedTab()
  const minHeaderHeight = insets.top + GLASS_ROW_HEIGHT + FLATTENED_HEADER_HEIGHT
  const collapseRange = Math.max(0, height - minHeaderHeight)

  useEffect(() => {
    if (collapseRange > 0 && autoFlattenTabs.includes(focusedTab)) {
      scrollYCurrent.value = withTiming(collapseRange, { duration: 250 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedTab, collapseRange])

  const expandedStyle = useAnimatedStyle(() => {
    if (collapseRange <= 0) return { opacity: 1 }
    return { opacity: interpolate(top.value, [-collapseRange, 0], [0, 1], Extrapolation.CLAMP) }
  }, [collapseRange])

  const flattenedStyle = useAnimatedStyle(() => {
    if (collapseRange <= 0) return { opacity: 0 }
    return { opacity: interpolate(top.value, [-collapseRange, 0], [1, 0], Extrapolation.CLAMP) }
  }, [collapseRange])

  return (
    <View>
      <Animated.View pointerEvents="box-none" style={expandedStyle}>
        {expanded}
      </Animated.View>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.flattened, { backgroundColor: flattenedBackgroundColor }, flattenedStyle]}>
        <View style={{ height: FLATTENED_HEADER_HEIGHT, justifyContent: 'center' }}>
          {flattened}
        </View>
      </Animated.View>
    </View>
  )
}

export default CollapsibleHeaderCrossfade

const styles = StyleSheet.create({
  flattened: {
    justifyContent: 'flex-end',
  },
})
