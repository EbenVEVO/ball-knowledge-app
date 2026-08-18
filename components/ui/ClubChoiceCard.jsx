import { View, Text, Pressable, Image } from 'react-native'
import React from 'react'

const PURPLE = '#A477C7'

// A single selectable club option inside an academy/transfer choice card. `next_prompt.options`
// only carries { club_id, name, logo, is_stay } — no league/tier — so that's all this renders.
export default function ClubChoiceCard({ option, selected, onPress }) {
  const initial = option?.name?.trim()?.[0]?.toUpperCase() || '?'

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: selected ? PURPLE : '#E0E0E0',
        padding: 10,
        alignItems: 'center',
        gap: 6,
      }}
    >
      {option?.is_stay ? (
        <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: PURPLE, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
          <Text style={{ fontFamily: 'SupremeBold', color: 'white', fontSize: 9 }}>CURRENT</Text>
        </View>
      ) : null}

      {option?.logo ? (
        <Image source={{ uri: option.logo }} style={{ width: 56, height: 56, marginTop: 8 }} resizeMode='contain' />
      ) : (
        <View style={{ width: 56, height: 56, marginTop: 8, borderRadius: 28, backgroundColor: '#EDE4F5', alignItems: 'center', justifyContent: 'center' }}>
          <Text className='font-supremeBold' style={{ color: PURPLE, fontSize: 22 }}>{initial}</Text>
        </View>
      )}

      <Text className='font-supremeBold' style={{ fontSize: 13, textAlign: 'center', color: '#1a1430' }} numberOfLines={2}>
        {option?.name || 'Unknown club'}
      </Text>
    </Pressable>
  )
}
