import { StyleSheet, Text, View } from 'react-native'
import Svg, { Rect, Line, Circle, Path } from 'react-native-svg'

import React from 'react'

export const MiniField = ({ children, width = 400, height = 600 }) => {
  // This is a vertical half field showing the bottom/attacking half
  
  const penaltyAreaWidth = width * 0.78; // 18-yard box (wider for vertical)
  const penaltyAreaHeight = height * 0.30; // Height of penalty area from bottom
  const goalAreaWidth = width * 0.48; // 6-yard box
  const goalAreaHeight = height * 0.13; // Height of goal area
  const centerCircleRadius = Math.min(width, height) * 0.1; // Center circle

  return (
    <View 
      className="relative overflow-hidden"
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        backgroundColor: '#B4FF80' 
      }}
    >
      <Svg
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ zIndex: 1 }}
      >
        {/* Field outline - left, right, and bottom edges */}
        <Line x1="2" y1="2" x2="2" y2={height - 2} stroke="white" strokeWidth="2" />
        <Line x1={width - 2} y1="2" x2={width - 2} y2={height - 2} stroke="white" strokeWidth="2" />
        <Line x1="2" y1={height - 2} x2={width - 2} y2={height - 2} stroke="white" strokeWidth="2" />

        {/* Halfway line at top */}
        <Line
          x1="2"
          y1="2"
          x2={width - 2}
          y2="2"
          stroke="white"
          strokeWidth="2"
        />

        {/* Center circle (half circle at top) */}
        <Circle
          cx={width / 2}
          cy="2"
          r={centerCircleRadius}
          fill="none"
          stroke="white"
          strokeWidth="2"
        />

        {/* Center spot */}
        <Circle
          cx={width / 2}
          cy="2"
          r="3"
          fill="white"
        />

        {/* Penalty area */}
        <Rect
          x={(width - penaltyAreaWidth) / 2}
          y={height - penaltyAreaHeight - 2}
          width={penaltyAreaWidth}
          height={penaltyAreaHeight}
          fill="none"
          stroke="white"
          strokeWidth="2"
        />

        {/* Goal area */}
        <Rect
          x={(width - goalAreaWidth) / 2}
          y={height - goalAreaHeight - 2}
          width={goalAreaWidth}
          height={goalAreaHeight}
          fill="none"
          stroke="white"
          strokeWidth="2"
        />

        {/* Penalty spot */}
        <Circle
          cx={width / 2}
          cy={height - penaltyAreaHeight * 0.65}
          r="3"
          fill="white"
        />

        {/* Penalty arc */}
        <Path
          d={`M ${width / 2 - centerCircleRadius * 0.9} ${height - penaltyAreaHeight - 2}
              A ${centerCircleRadius * 0.9} ${centerCircleRadius * 0.9} 0 0 1 
              ${width / 2 + centerCircleRadius * 0.9} ${height - penaltyAreaHeight - 2}`}
          fill="none"
          stroke="white"
          strokeWidth="2"
        />

        {/* Goal line indicators at corners */}
        <Path
          d={`M 2 ${height - 2}
              A 5 5 0 0 0 12 ${height - 2}`}
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
        <Path
          d={`M ${width - 12} ${height - 2}
              A 5 5 0 0 0 ${width - 2} ${height - 2}`}
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
      </Svg>

      {/* Content overlay for placing lineups */}
      <View style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2 
      }}>
        {children}
      </View>
    </View>
  )
};

export default MiniField

const styles = StyleSheet.create({})