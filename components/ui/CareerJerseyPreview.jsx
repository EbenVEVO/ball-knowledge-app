import { View, Text } from 'react-native'
import React from 'react'
import Svg, { Polygon, Rect, Path } from 'react-native-svg'

const PURPLE = '#A477C7'
const PURPLE_DARK = '#8A5CAE'

// Simple vector jersey — replaces the watermarked stock clipart from the Figma mockup with a
// lightweight shape that live-updates as the player types their Name/Number on the setup screen.
export default function CareerJerseyPreview({ name, number, width = 220 }) {
  const height = width * 1.05
  const displayName = (name || '').trim().toUpperCase()
  const displayNumber = (number || '').trim()

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox="0 0 200 210">
        {/* sleeves */}
        <Polygon points="40,30 5,55 20,90 55,65" fill={PURPLE} stroke={PURPLE_DARK} strokeWidth={2} />
        <Polygon points="160,30 195,55 180,90 145,65" fill={PURPLE} stroke={PURPLE_DARK} strokeWidth={2} />
        {/* body */}
        <Path
          d="M55,20 Q100,45 145,20 L145,65 L155,70 L155,205 L45,205 L45,70 L55,65 Z"
          fill={PURPLE}
          stroke={PURPLE_DARK}
          strokeWidth={2}
        />
        {/* collar */}
        <Path d="M78,18 Q100,40 122,18" fill="none" stroke="white" strokeWidth={4} strokeLinecap="round" />
        {/* shoulder trim */}
        <Rect x={55} y={20} width={22} height={5} fill="white" transform="rotate(18 55 20)" />
        <Rect x={123} y={20} width={22} height={5} fill="white" transform="rotate(-18 145 20)" />
      </Svg>

      <View style={{ position: 'absolute', top: height * 0.33, alignItems: 'center', width: '100%' }}>
        {displayName ? (
          <Text style={{ fontFamily: 'SupremeExtraBold', color: 'white', fontSize: 14, letterSpacing: 1 }} numberOfLines={1}>
            {displayName}
          </Text>
        ) : null}
        {displayNumber ? (
          <Text style={{ fontFamily: 'SupremeExtraBold', color: 'white', fontSize: 44, marginTop: 2 }}>
            {displayNumber}
          </Text>
        ) : null}
      </View>
    </View>
  )
}
