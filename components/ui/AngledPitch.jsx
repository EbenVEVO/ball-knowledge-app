import { View } from 'react-native'
import Svg, { Polygon, Line, Circle } from 'react-native-svg'
import React from 'react'
import { projectPitchPoint } from '@/constants/pitchPositions'

// Same pitch markings as VerticalField, but drawn as a trapezoid (narrower at the top/far
// end) for a 3D "looking up the pitch" export look, matching typical lineup-graphic style.
// Rectangles become quadrilaterals and the center circle becomes a projected polygon -
// everything is 2D math (no CSS/native 3D transforms), so it captures identically via
// react-native-view-shot on every platform.
const projectRect = (xPct, yPct, wPct, hPct, width, height) =>
  [
    [xPct, yPct],
    [xPct + wPct, yPct],
    [xPct + wPct, yPct + hPct],
    [xPct, yPct + hPct],
  ].map(([x, y]) => projectPitchPoint(x, y, width, height))

const projectCircle = (cxPct, cyPct, rPct, width, height, steps = 32) => {
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2
    pts.push(projectPitchPoint(cxPct + rPct * Math.cos(a), cyPct + rPct * Math.sin(a), width, height))
  }
  return pts
}

const toPoints = (pts) => pts.map((p) => `${p.x},${p.y}`).join(' ')

export const AngledPitch = ({ children, width = 600, height = 1000, bgColor = '#B4FF80', lineColor = 'gray' }) => {
  const penaltyAreaW = 54
  const penaltyAreaH = 14
  const goalAreaW = 20
  const goalAreaH = 4

  const outline = projectRect(0, 0, 100, 100, width, height)
  const topPenalty = projectRect((100 - penaltyAreaW) / 2, 0, penaltyAreaW, penaltyAreaH, width, height)
  const topGoal = projectRect((100 - goalAreaW) / 2, 0, goalAreaW, goalAreaH, width, height)
  const botPenalty = projectRect((100 - penaltyAreaW) / 2, 100 - penaltyAreaH, penaltyAreaW, penaltyAreaH, width, height)
  const botGoal = projectRect((100 - goalAreaW) / 2, 100 - goalAreaH, goalAreaW, goalAreaH, width, height)
  const centerLineStart = projectPitchPoint(0, 50, width, height)
  const centerLineEnd = projectPitchPoint(100, 50, width, height)
  const centerCircle = projectCircle(50, 50, 10, width, height)
  const centerSpot = projectPitchPoint(50, 50, width, height)
  const topSpot = projectPitchPoint(50, 9.1, width, height)
  const botSpot = projectPitchPoint(50, 90.9, width, height)

  return (
    <View className="relative" style={{ width, height }}>
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        <Polygon points={toPoints(outline)} fill={bgColor} stroke={lineColor} strokeWidth="1" />
        <Line x1={centerLineStart.x} y1={centerLineStart.y} x2={centerLineEnd.x} y2={centerLineEnd.y} stroke={lineColor} strokeWidth="1" />
        <Polygon points={toPoints(centerCircle)} fill="none" stroke={lineColor} strokeWidth="1" />
        <Circle cx={centerSpot.x} cy={centerSpot.y} r="4" fill={lineColor} />
        <Polygon points={toPoints(topPenalty)} fill="none" stroke={lineColor} strokeWidth="1" />
        <Polygon points={toPoints(topGoal)} fill="none" stroke={lineColor} strokeWidth="1" />
        <Circle cx={topSpot.x} cy={topSpot.y} r="4" fill={lineColor} />
        <Polygon points={toPoints(botPenalty)} fill="none" stroke={lineColor} strokeWidth="1" />
        <Polygon points={toPoints(botGoal)} fill="none" stroke={lineColor} strokeWidth="1" />
        <Circle cx={botSpot.x} cy={botSpot.y} r="4" fill={lineColor} />
      </Svg>

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        {children}
      </View>
    </View>
  )
}

export default AngledPitch
