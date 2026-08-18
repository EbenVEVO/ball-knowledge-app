import { View, Text, Pressable, Modal, FlatList } from 'react-native'
import React, { useState } from 'react'
import Entypo from '@expo/vector-icons/Entypo'

const LeagueScopeDropdown = ({ options, value, onChange }) => {
  const [expanded, setExpanded] = useState(false)

  if (!options?.length) return null

  const current = options.find(o => o.value === value) ?? options[0]

  return (
    <>
      <Pressable
        className='flex flex-row items-center gap-1 bg-white rounded-xl p-2 px-4'
        style={{ borderWidth: 1, borderColor: '#DBDBDB', alignSelf: 'flex-start' }}
        onPress={() => setExpanded(true)}
      >
        <Text className='font-supreme' numberOfLines={1}>{current.label}</Text>
        <Entypo name='chevron-small-down' size={20} color='black' />
      </Pressable>

      <Modal transparent visible={expanded} animationType='fade' onRequestClose={() => setExpanded(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setExpanded(false)}
        >
          <View className='bg-white rounded-xl' style={{ minWidth: 220, maxHeight: '60%', paddingVertical: 8 }}>
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              renderItem={({ item }) => (
                <Pressable
                  className='p-3 px-5'
                  style={item.value === value ? { backgroundColor: '#f3f4f6' } : null}
                  onPress={() => {
                    onChange(item.value)
                    setExpanded(false)
                  }}
                >
                  <Text className={item.value === value ? 'font-supremeBold' : 'font-supreme'}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  )
}

export default LeagueScopeDropdown
