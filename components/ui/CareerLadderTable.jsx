import { View, Text, Image } from 'react-native'
import React from 'react'

const PURPLE = '#A477C7'
const AGES = [16, 18, 20, 22, 26, 28, 30, 32, 34, 36, 38]

const StatCell = ({ children }) => (
  <Text className='font-supreme' style={{ fontSize: 13, color: '#1a1430', width: 44, textAlign: 'center' }}>{children}</Text>
)

// Age/Club/OVR/APPS/GLS/AST ladder. `clubsById` resolves a season's club_id to {name, logo} —
// season records only carry club_id, so the screen builds this cache from every transfer/academy
// prompt's options as they come in.
export default function CareerLadderTable({ seasons = [], currentAge, clubsById = {} }) {
  const seasonByAge = {}
  seasons.forEach((s) => { seasonByAge[s.age] = s })

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 }}>
        <Text className='font-supreme' style={{ width: 56, fontSize: 13, color: '#666' }}>Age</Text>
        <Text className='font-supreme' style={{ flex: 1, fontSize: 13, color: '#666' }}>Club</Text>
        <StatCell>OVR</StatCell>
        <StatCell>APPS</StatCell>
        <StatCell>GLS</StatCell>
        <StatCell>AST</StatCell>
      </View>

      {AGES.map((age, idx) => {
        const season = seasonByAge[age]
        const reached = currentAge != null && age <= currentAge
        const club = season ? clubsById[season.club_id] : null
        return (
          <View
            key={age}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
              paddingHorizontal: 12,
              backgroundColor: idx % 2 === 0 ? 'white' : '#F5F5F5',
            }}
          >
            <View style={{ width: 56 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: reached ? PURPLE : '#A0A0A0',
                }}
              >
                <Text className='font-supremeBold' style={{ color: 'white', fontSize: 14 }}>{age}</Text>
              </View>
            </View>

            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {season && club?.logo ? (
                <Image source={{ uri: club.logo }} style={{ width: 22, height: 22 }} resizeMode='contain' />
              ) : null}
              {season ? (
                <Text className='font-supreme' style={{ fontSize: 14, color: '#1a1430' }} numberOfLines={1}>
                  {club?.name || 'Unknown club'}
                </Text>
              ) : null}
            </View>

            <StatCell>{season ? season.ovr : ''}</StatCell>
            <StatCell>{season ? season.apps : ''}</StatCell>
            <StatCell>{season ? season.gls : ''}</StatCell>
            <StatCell>{season ? season.ast : ''}</StatCell>
          </View>
        )
      })}
    </View>
  )
}
