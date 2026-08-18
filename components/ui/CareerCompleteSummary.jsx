import { View, Text, Pressable } from 'react-native'
import React from 'react'

const PURPLE = '#A477C7'
const BLUE = '#2563eb'
const GOLD = '#d97706'

const pad = (n) => String(n).padStart(3, '0')

const countTrophy = (seasons, name) =>
  seasons.reduce((total, s) => total + (s.trophies || []).filter((t) => t === name).length, 0)

const SummaryRow = ({ icon, label, value, tint, valueColor }) => (
  <View style={{ flexDirection: 'row', marginBottom: 2 }}>
    <View style={{ flex: 1.6, backgroundColor: tint, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 14 }}>
      <Text style={{ fontSize: 16 }}>{icon}</Text>
      <Text className='font-supremeBold' style={{ color: 'white', fontSize: 13 }}>{label}</Text>
    </View>
    <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 14 }}>
      <Text className='font-supremeBold' style={{ color: valueColor, fontSize: 20 }}>{pad(value)}</Text>
    </View>
  </View>
)

// Final career recap. Apps/Goals/Assists/trophy counts are computed from state.seasons — Yellow
// Cards, Red Cards and World Cups have no backing data in any of the career RPCs yet, so they're
// shown as 000 until a real source exists.
export default function CareerCompleteSummary({ seasons = [], onShare }) {
  const apps = seasons.reduce((t, s) => t + (s.apps || 0), 0)
  const goals = seasons.reduce((t, s) => t + (s.gls || 0), 0)
  const assists = seasons.reduce((t, s) => t + (s.ast || 0), 0)
  const leagueTitles = countTrophy(seasons, 'League Title')
  const championsLeague = countTrophy(seasons, 'Champions League')
  const ballonDor = countTrophy(seasons, "Ballon d'Or")

  return (
    <View>
      <Text className='font-supremeBold' style={{ fontSize: 20, marginBottom: 10, marginTop: 20 }}>
        CAREER COMPLETE
      </Text>

      <View style={{ borderTopWidth: 1, borderColor: '#E5E5E5', marginBottom: 4 }} />

      <SummaryRow icon='👕' label='APPS' value={apps} tint={BLUE} valueColor={BLUE} />
      <SummaryRow icon='⚽' label='GOALS' value={goals} tint={BLUE} valueColor={BLUE} />
      <SummaryRow icon='🅰️' label='ASSISTS' value={assists} tint={BLUE} valueColor={BLUE} />
      <SummaryRow icon='🟨' label='YELLOW CARDS' value={0} tint={BLUE} valueColor={BLUE} />
      <SummaryRow icon='🟥' label='RED CARDS' value={0} tint={BLUE} valueColor={BLUE} />
      <SummaryRow icon='🏆' label='LEAGUE TITLES' value={leagueTitles} tint={GOLD} valueColor='#1a1430' />
      <SummaryRow icon='⭐' label='CHAMPIONS LEAGUE' value={championsLeague} tint={GOLD} valueColor='#1a1430' />
      <SummaryRow icon='🌍' label='WORLD CUPS' value={0} tint={GOLD} valueColor='#1a1430' />
      <SummaryRow icon='🥇' label="BALLON D'OR" value={ballonDor} tint={GOLD} valueColor='#1a1430' />

      <Pressable
        onPress={onShare}
        style={{ backgroundColor: PURPLE, borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 20 }}
      >
        <Text className='font-supremeBold' style={{ color: 'white', fontSize: 16 }}>Share Career</Text>
      </Pressable>
    </View>
  )
}
