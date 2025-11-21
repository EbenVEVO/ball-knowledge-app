import { StyleSheet, Text, View } from 'react-native'
import Svg, { Rect, Line, Circle, Path } from 'react-native-svg'

import React from 'react'

export const Field = ({ children, width = 800, height = 600 })=> {

const penaltyAreaWidth = width * 0.14; // 18-yard box
  const penaltyAreaHeight = height * 0.54; // Height of penalty area
  const goalAreaWidth = width * 0.04; // 6-yard box
  const goalAreaHeight = height * 0.2; // Height of goal area
  const goalWidth = height * 0.16; // Goal width
  const centerCircleRadius = Math.min(width, height) * 0.1; // Center circle

  return (
     <View 
      className="relative overflow-hidden"
      style={{ width: `${width}px`, height: `${height}px`,backgroundColor: '#B4FF80' }}
    >


      <Svg
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ zIndex: 1 }}
      >
        {/* Field outline */}
        <Rect
          x="2"
          y="2"
          width={width - 4}
          height={height - 4}
          fill="none"
          stroke="gray"
          strokeWidth="1"
        />

        {/* Center line */}
        <Line
          x1={width / 2}
          y1="2"
          x2={width / 2}
          y2={height - 2}
          stroke="gray"
          strokeWidth="1"
        />

        {/* Center circle */}
        <Circle
          cx={width / 2}
          cy={height / 2}
          r={centerCircleRadius}
          fill="none"
          stroke="gray"
          strokeWidth="1"
        />

        {/* Center spot */}
        <Circle
          cx={width / 2}
          cy={height / 2}
          r="4"
          fill="gray"
        />

        {/* Left penalty area */}
        <Rect
          x="2"
          y={(height - penaltyAreaHeight) / 2}
          width={penaltyAreaWidth}
          height={penaltyAreaHeight}
          fill="none"
          stroke="gray"
          strokeWidth="1"
        />

        {/* Left goal area */}
        <Rect
          x="2"
          y={(height - goalAreaHeight) / 2}
          width={goalAreaWidth}
          height={goalAreaHeight}
          fill="none"
          stroke="gray"
          strokeWidth="1"
        />

        {/* Left penalty spot */}
        <Circle
          cx={penaltyAreaWidth * 0.65}
          cy={height / 2}
          r="4"
          fill="gray"
        />

        {/* Left penalty arc */}
        <Path
          d={`M ${penaltyAreaWidth + 2} ${height / 2 - centerCircleRadius * 1.2} 
              A ${centerCircleRadius *1.2} ${centerCircleRadius * 1.2} 0 0 1 
              ${penaltyAreaWidth + 2} ${height / 2 + centerCircleRadius * 0.9}`}
          fill="none"
          stroke="gray"
          strokeWidth="1"
        />


        {/* Right penalty area */}
        <Rect
          x={width - penaltyAreaWidth - 2}
          y={(height - penaltyAreaHeight) / 2}
          width={penaltyAreaWidth}
          height={penaltyAreaHeight}
          fill="none"
          stroke="gray"
          strokeWidth="1"
        />

        {/* Right goal area */}
        <Rect
          x={width - goalAreaWidth - 2}
          y={(height - goalAreaHeight) / 2}
          width={goalAreaWidth}
          height={goalAreaHeight}
          fill="none"
          stroke="gray"
          strokeWidth="1"
        />

        {/* Right penalty spot */}
        <Circle
          cx={width - penaltyAreaWidth * 0.65}
          cy={height / 2}
          r="4"
          fill="gray"
        />

        {/* Right penalty arc */}
<Path
  d={`M ${width - penaltyAreaWidth - 2} ${height / 2 - centerCircleRadius * 1.2} 
      A ${centerCircleRadius * 1.2} ${centerCircleRadius *1.2} 0 0 0 
      ${width - penaltyAreaWidth - 2} ${height / 2 + centerCircleRadius * 0.9}`}
          fill="none"
          stroke="gray"
          strokeWidth="1"
        />

      </Svg>

      {/* Content overlay for placing lineups */}
      <View style={{ 
        position:'absolute',
        top: 0,
        left:0,
        right:0,
        bottom:0,
        zIndex: 2 }}>
        {children}
      </View>
    </View>
  )
};

export default Field
const styles = StyleSheet.create({})