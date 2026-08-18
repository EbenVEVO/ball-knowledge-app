import { View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import AntDesign from '@expo/vector-icons/AntDesign'

const PURPLE = '#A477C7'

// A single pitch slot in the team builder - empty (tap to search) or filled (tap to replace).
export default function TeamBuilderSlot({ role, player, style, onPress }) {
  return (
    <Pressable onPress={onPress} style={[{ width: 65, alignItems: 'center' }, style]}>
      {player ? (
        <View style={{ alignItems: 'center' }}>
          <Image
            source={{ uri: player.photo }}
            style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: 'white' }}
          />
          <Text
            style={{
              fontFamily: 'SupremeBold',
              fontSize: 10,
              color: player.highlighted ? PURPLE : 'black',
              marginTop: 4,
              textAlign:'center',
              textShadowColor: 'rgba(255,255,255,0.75)',
              textShadowOffset: { width: -1, height: 1 },
              textShadowRadius: 10,
            }}
            numberOfLines={2}
          >
            {player.name}
          </Text>
        </View>
      ) : (
        <View>
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              borderWidth: 2,
              borderColor: PURPLE,
              backgroundColor: '#F5F0FF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FontAwesome name="user" size={22} color={PURPLE} />
          </View>
          <View
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AntDesign name="plus" size={11} color={PURPLE} />
          </View>
        </View>
      )}
    </Pressable>
  )
}
