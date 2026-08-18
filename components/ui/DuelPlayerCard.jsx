import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import React, { useEffect, useRef, useState } from 'react'

const GREEN = '#22c55e'
const RED = '#ef4444'
const PURPLE = '#A477C7'

const COUNT_UP_DURATION = 700

const formatStatValue = (key, value) => (key === 'rating' ? value.toFixed(2) : String(Math.round(value)))

// Renders one side of a Climb the Ladder duel. Used for both the always-revealed top card and
// the (initially hidden, later revealed) bottom card — the screen controls which via `card.stats`
// (null while hidden), `selectable` (rows tappable pre-submit), and `highlight` (green/red row
// tint after a result, applied on both cards for the guessed stat).
export default function DuelPlayerCard({
  card,
  statOrder,
  statLabels,
  selectable = false,
  selectedStat = null,
  onSelectStat,
  highlight = null, // null | 'correct' | 'incorrect'
  pendingStat = null, // stat key currently awaiting a submit response — shows a spinner in its row
}) {
  const [displayStats, setDisplayStats] = useState(card?.stats ?? null)
  const prevStatsRef = useRef(card?.stats ?? null)
  const rafRef = useRef(null)

  useEffect(() => {
    const wasHidden = prevStatsRef.current == null
    prevStatsRef.current = card?.stats ?? null

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    if (card?.stats == null) {
      setDisplayStats(null)
      return
    }
    if (!wasHidden) {
      setDisplayStats(card.stats) // already-known values (Card A) — no animation
      return
    }

    const target = card.stats
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / COUNT_UP_DURATION, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = {}
      for (const key of Object.keys(target)) next[key] = target[key] * eased
      setDisplayStats(next)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = null
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [card?.stats])

  if (!card) return null

  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      {card.photo ? (
        <Image
          source={{ uri: card.photo }}
          style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: 'white' }}
        />
      ) : (
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#DBDBDB', alignItems: 'center', justifyContent: 'center' }}>
          <FontAwesome name='user' size={28} color='white' />
        </View>
      )}

      <Text style={{ fontFamily: 'SupremeExtraBold', fontSize: 16, textAlign: 'center' }}>{card.name}</Text>
      <Text style={{ fontFamily: 'Supreme', fontSize: 12, color: '#666' }}>{`${card.season} - ${parseInt(card.season)+1}`}</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
        {card.team_logo && (
          <Image source={{ uri: card.team_logo }} resizeMode='contain' style={{ width: 18, height: 18 }} />
        )}
        <Text style={{ fontFamily: 'SupremeBold', fontSize: 13 }}>{card.team}</Text>
      </View>

      <View style={{ width: '100%', marginTop: 10, gap: 6 }}>
        {statOrder.map((key) => {
          const isSelected = key === selectedStat
          const isPending = key === pendingStat
          const value = displayStats ? formatStatValue(key, displayStats[key]) : '?????'

          return (
            <Pressable
              key={key}
              disabled={!selectable}
              onPress={() => onSelectStat?.(key)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: isSelected && highlight === 'correct' ? 'rgba(34,197,94,0.15)'
                  : isSelected && highlight === 'incorrect' ? 'rgba(239,68,68,0.15)'
                  : isSelected && selectable ? 'rgba(255,255,255,0.6)'
                  : isSelected ? 'rgba(164,119,199,0.15)' // neutral tint: "this is the stat being compared"
                  : 'transparent',
                borderWidth: isSelected ? 1.5 : 0,
                borderColor: highlight === 'correct' ? GREEN : highlight === 'incorrect' ? RED : isSelected ? PURPLE : 'transparent',
              }}
            >
              <Text style={{ fontFamily: 'Supreme', fontSize: 13 }}>{statLabels[key]}</Text>
              {isPending ? (
                <ActivityIndicator size='small' color={PURPLE} />
              ) : (
                <Text style={{ fontFamily: 'SupremeBold', fontSize: 13 }}>{value}</Text>
              )}
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
