import { StyleSheet, Text, View } from 'react-native'
import Svg, { Rect, Line, Circle, Path } from 'react-native-svg'
import React from 'react'

export const VerticalField = ({ children, width = 600, height = 1000 }) => {

  // Swapped the height/width multipliers for a vertical layout
  const penaltyAreaHeight = height * 0.14; // Depth into the field
  const penaltyAreaWidth = width * 0.54;   // Width across the field
  const goalAreaHeight = height * 0.04; 
  const goalAreaWidth = width * 0.2; 
  const centerCircleRadius = Math.min(width, height) * 0.1;

  return (
    <View 
      className="relative overflow-hidden"
      style={{ width: `${width}px`, height: `${height}px`, backgroundColor: '#B4FF80' }}
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

        {/* Center line (Now Horizontal) */}
        <Line
          x1="2"
          y1={height / 2}
          x2={width - 2}
          y2={height / 2}
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

        {/* Top penalty area */}
        <Rect
          x={(width - penaltyAreaWidth) / 2}
          y="2"
          width={penaltyAreaWidth}
          height={penaltyAreaHeight}
          fill="none"
          stroke="gray"
          strokeWidth="1"
        />

        {/* Top goal area */}
        <Rect
          x={(width - goalAreaWidth) / 2}
          y="2"
          width={goalAreaWidth}
          height={goalAreaHeight}
          fill="none"
          stroke="gray"
          strokeWidth="1"
        />

        {/* Top penalty spot */}
        <Circle
          cx={width / 2}
          cy={penaltyAreaHeight * 0.65}
          r="4"
          fill="gray"
        />

        {/* Top penalty arc */}
        <Path
          d={`M ${width / 2 - centerCircleRadius * 1.2} ${penaltyAreaHeight + 2} 
              A ${centerCircleRadius * 1.2} ${centerCircleRadius * 1.2} 0 0 0 
              ${width / 2 + centerCircleRadius * 1.2} ${penaltyAreaHeight + 2}`}
          fill="none"
          stroke="gray"
          strokeWidth="1"
        />


        {/* Bottom penalty area */}
        <Rect
          x={(width - penaltyAreaWidth) / 2}
          y={height - penaltyAreaHeight - 2}
          width={penaltyAreaWidth}
          height={penaltyAreaHeight}
          fill="none"
          stroke="gray"
          strokeWidth="1"
        />

        {/* Bottom goal area */}
        <Rect
          x={(width - goalAreaWidth) / 2}
          y={height - goalAreaHeight - 2}
          width={goalAreaWidth}
          height={goalAreaHeight}
          fill="none"
          stroke="gray"
          strokeWidth="1"
        />

        {/* Bottom penalty spot */}
        <Circle
          cx={width / 2}
          cy={height - penaltyAreaHeight * 0.65}
          r="4"
          fill="gray"
        />

        {/* Bottom penalty arc */}
        <Path
          d={`M ${width / 2 - centerCircleRadius * 1.2} ${height - penaltyAreaHeight - 2} 
              A ${centerCircleRadius * 1.2} ${centerCircleRadius * 1.2} 0 0 1 
              ${width / 2 + centerCircleRadius * 1.2} ${height - penaltyAreaHeight - 2}`}
          fill="none"
          stroke="gray"
          strokeWidth="1"
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

export default VerticalField;
const styles = StyleSheet.create({});