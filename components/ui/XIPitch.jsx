import { View, Text, Pressable } from 'react-native'
import React, { useMemo } from 'react'
import { MiniField } from './MiniField'

const PURPLE = '#A477C7'

// Vertical half-field percent lookup, verbatim from LineupPlayer.jsx lines 44-75.
const VERTICAL_POSITIONS = {
  'GK':  { x: 50, y: 92 },
  'LB':  { x: 15, y: 82 }, 'LCB': { x: 35, y: 82 }, 'CB': { x: 50, y: 82 }, 'RCB': { x: 65, y: 82 }, 'RB': { x: 85, y: 82 },
  'LM':  { x: 12, y: 71 }, 'LCM': { x: 32, y: 71 }, 'CDM': { x: 50, y: 73 }, 'CM': { x: 50, y: 73 }, 'RCM': { x: 68, y: 71 }, 'RM': { x: 88, y: 71 },
  'LAM': { x: 18, y: 60 }, 'CAM': { x: 50, y: 60 }, 'RAM': { x: 82, y: 60 },
  'LW':  { x: 20, y: 51 }, 'LS': { x: 38, y: 51 }, 'ST': { x: 50, y: 51 }, 'RS': { x: 62, y: 51 }, 'RW': { x: 80, y: 51 },
}

// Adapted from LastLineup.jsx's lineupFormation(): identical row-count -> role-array
// switch-case, but driven by the formation STRING's counts, not real player grid data
// (unguessed players' identities must stay hidden).
const formationToPosMap = (formation) => {
  if (!formation || typeof formation !== 'string') return {}
  const rows = formation.split('-').map((n) => parseInt(n, 10)).filter((n) => !Number.isNaN(n))
  const row = (n) => rows[n - 2] ?? 0
  const rowCount = rows.length // excludes the implicit GK row

  return rowCount < 4 ? {
    1: ['GK'],
    2: row(2) === 3 ? ['LCB', 'CB', 'RCB'] : row(2) === 4 ? ['LB', 'LCB', 'RCB', 'RB'] : row(2) === 5 ? ['LB', 'LCB', 'CB', 'RCB', 'RB'] : [],
    3: row(3) === 2 ? ['LCM', 'RCM'] : row(3) === 3 ? ['LCM', 'CM', 'RCM'] : row(3) === 4 ? ['LM', 'LCM', 'RCM', 'RM'] : row(3) === 5 ? ['LM', 'LCM', 'CM', 'RCM', 'RM'] : [],
    4: row(4) === 1 ? ['ST'] : row(4) === 2 ? ['LS', 'RS'] : row(4) === 3 ? ['LW', 'ST', 'RW'] : [],
  } : {
    1: ['GK'],
    2: row(2) === 3 ? ['LCB', 'CB', 'RCB'] : row(2) === 4 ? ['LB', 'LCB', 'RCB', 'RB'] : row(2) === 5 ? ['LB', 'LCB', 'CB', 'RCB', 'RB'] : [],
    3: row(3) === 2 ? ['LCM', 'RCM'] : row(3) === 3 ? ['LCM', 'CM', 'RCM'] : row(3) === 4 ? ['LM', 'LCM', 'RCM', 'RM'] : row(3) === 5 ? ['LM', 'LCM', 'CM', 'RCM', 'RM'] : [],
    4: row(4) === 1 ? ['CAM'] : row(4) === 2 ? ['LAM', 'RAM'] : row(4) === 3 ? ['LAM', 'CAM', 'RAM'] : [],
    5: row(5) === 1 ? ['ST'] : row(5) === 2 ? ['LS', 'RS'] : row(5) === 3 ? ['LW', 'ST', 'RW'] : [],
  }
}

// Flattens the posMap into 11 { row, col, role } slots, independent of what's filled, plus the
// total row count (GK row included) so rows can be spaced across the full field height.
const buildSlots = (formation) => {
  const posMap = formationToPosMap(formation)
  const rowKeys = Object.keys(posMap)
  const slots = []
  rowKeys.forEach((rowKey) => {
    posMap[rowKey].forEach((role, idx) => slots.push({ row: Number(rowKey), col: idx + 1, role }))
  })
  return { slots, totalRows: rowKeys.length }
}

// Row 1 (GK) sits near the goal line, the last row (strikers) sits near the halfway line —
// spread evenly across the full field height rather than clustering in the lower half.
const ROW_Y_NEAR_GOAL = 90
const ROW_Y_NEAR_HALFWAY = 12
const rowYPercent = (row, totalRows) => {
  if (totalRows <= 1) return (ROW_Y_NEAR_GOAL + ROW_Y_NEAR_HALFWAY) / 2
  const t = (row - 1) / (totalRows - 1)
  return ROW_Y_NEAR_GOAL - t * (ROW_Y_NEAR_GOAL - ROW_Y_NEAR_HALFWAY)
}

const PLACEHOLDER_MARK = '••••••••'

export const XIPitch = ({ formation, filledSlots = [], slotHints = [], selectedSlot, onSelectSlot, difficulty, width = 340, height = 510, children }) => {
  const { slots, totalRows } = useMemo(() => buildSlots(formation), [formation])
  const filledByGrid = useMemo(() => {
    const map = {}
    filledSlots.forEach((p) => { if (p?.grid) map[p.grid] = p })
    return map
  }, [filledSlots])
  const hintsByGrid = useMemo(() => {
    const map = {}
    slotHints.forEach((h) => { if (h?.grid) map[h.grid] = h })
    return map
  }, [slotHints])
  // Caps each slot's name label to the pixel gap to its nearest same-row neighbor, so tightly
  // packed rows (e.g. a back five) truncate long names instead of overlapping them.
  const nameMaxWidthByGrid = useMemo(() => {
    const byRow = {}
    slots.forEach((slot) => {
      const x = VERTICAL_POSITIONS[slot.role]?.x ?? 50
      byRow[slot.row] = byRow[slot.row] || []
      byRow[slot.row].push({ gridKey: `${slot.row}:${slot.col}`, x })
    })
    const map = {}
    Object.values(byRow).forEach((rowSlots) => {
      const sorted = [...rowSlots].sort((a, b) => a.x - b.x)
      sorted.forEach((s, i) => {
        const leftGapPct = i > 0 ? s.x - sorted[i - 1].x : Infinity
        const rightGapPct = i < sorted.length - 1 ? sorted[i + 1].x - s.x : Infinity
        const gapPct = Math.min(leftGapPct, rightGapPct)
        const gapPx = Number.isFinite(gapPct) ? (gapPct / 100) * width : width
        map[s.gridKey] = Math.max(40, Math.min(60, gapPx - 8))
      })
    })
    return map
  }, [slots, width])

  const getPlaceholder = (gridKey) => {
    const hintLength = hintsByGrid[gridKey]?.last_name_length
    return Number.isInteger(hintLength) && hintLength > 0 ? '•'.repeat(hintLength) : PLACEHOLDER_MARK
  }

  return (
    <View style={{ width }}>
      <MiniField width={width} height={height}>
        {slots.map((slot) => {
          const gridKey = `${slot.row}:${slot.col}`
          const filled = filledByGrid[gridKey]
          const placeholder = getPlaceholder(gridKey)
          const x = VERTICAL_POSITIONS[slot.role]?.x ?? 50
          const y = rowYPercent(slot.row, totalRows)
          const pixelX = (x / 100) * width
          const pixelY = (y / 100) * height
          const isSelected = selectedSlot === gridKey

          return (
            <View key={gridKey} style={{ position: 'absolute', width: 60, left: pixelX - 30, top: pixelY - 30, alignItems: 'center' }}>
              {filled ? (
                <View style={{ alignItems: 'center' }}>
                  <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: 'SupremeBold', color: 'white', fontSize: 14 }}>{filled.shirt_number}</Text>
                  </View>
                  <View className='mt-2 p-1 rounded-lg bg-white' style={{ maxWidth: nameMaxWidthByGrid[gridKey] ?? 60 }}>
                    <Text style={{ fontFamily: 'SupremeBold', color: 'black', fontSize: 13, opacity: 0.8 }} numberOfLines={1} ellipsizeMode='tail'>{filled.lineup_name || filled.name}</Text>
                  </View>
                </View>
              ) : (
                <Pressable onPress={() => onSelectSlot?.(gridKey)} style={{ alignItems: 'center' }}>
                  <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: PURPLE, borderWidth: isSelected ? 3 : 0, borderColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
                    {difficulty === 'easy' && hintsByGrid[gridKey]?.shirt_number != null && (
                      <Text style={{ fontFamily: 'SupremeBold', color: 'white', fontSize: 14 }}>{hintsByGrid[gridKey].shirt_number}</Text>
                    )}
                  </View>
                  <View className='mt-2 p-1 rounded-lg bg-white' style={{ maxWidth: nameMaxWidthByGrid[gridKey] ?? 60 }}>
                    <Text style={{ fontFamily: 'Supreme', color: 'black', fontSize: 13, opacity: 0.8 }} numberOfLines={1} ellipsizeMode='tail'>{placeholder}</Text>
                  </View>
                </Pressable>
              )}
            </View>
          )
        })}
      </MiniField>

      {children}

      <View style={{ marginTop: 16, gap: 10 }}>
        {slots.map((slot) => {
          const gridKey = `${slot.row}:${slot.col}`
          const filled = filledByGrid[gridKey]
          const unfilledNumber = difficulty === 'easy' ? hintsByGrid[gridKey]?.shirt_number : null
          return (
            <View key={gridKey} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'SupremeBold', color: 'white', fontSize: 11 }}>{filled ? filled.shirt_number : (unfilledNumber ?? '?')}</Text>
              </View>
              <Text style={{ fontFamily: filled ? 'SupremeBold' : 'Supreme', color: filled ? 'black' : '#999', fontSize: 14, opacity: filled ? 0.9 : 0.6 }}>
                {filled ? (filled.lineup_name || filled.name) : getPlaceholder(gridKey)}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

export default XIPitch
