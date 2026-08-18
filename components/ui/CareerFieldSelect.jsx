import { View, Text, Pressable, Modal, FlatList } from 'react-native'
import React, { useState } from 'react'
import Entypo from '@expo/vector-icons/Entypo'

// Rounded-pill single-select used by the My Journey setup screen (Nationality/Position).
// Same modal-list mechanics as LeagueScopeDropdown, restyled to match the "My Pro" mockup.
export default function CareerFieldSelect({ label, value, options = [], onChange, placeholder = 'Select', disabled = false, emptyText = 'Nothing available yet' }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <View>
      <Text className='font-supreme' style={{ fontSize: 14, marginBottom: 6, color: '#1a1430' }}>{label}</Text>
      <Pressable
        disabled={disabled}
        onPress={() => setExpanded(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1.5,
          borderColor: '#DBDBDB',
          borderRadius: 999,
          paddingHorizontal: 20,
          paddingVertical: 14,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Text className={value ? 'font-supremeBold' : 'font-supreme'} style={{ fontSize: 16, color: value ? '#1a1430' : '#999' }} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Entypo name='chevron-small-down' size={20} color='#1a1430' />
      </Pressable>

      <Modal transparent visible={expanded} animationType='fade' onRequestClose={() => setExpanded(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setExpanded(false)}
        >
          <View className='bg-white rounded-xl' style={{ minWidth: 240, maxHeight: '60%', paddingVertical: 8 }}>
            {options.length === 0 ? (
              <Text className='font-supreme' style={{ color: '#999', padding: 20, textAlign: 'center' }}>{emptyText}</Text>
            ) : (
              <FlatList
                data={options}
                keyExtractor={(o) => o}
                renderItem={({ item }) => (
                  <Pressable
                    className='p-3 px-5'
                    style={item === value ? { backgroundColor: '#f3f4f6' } : null}
                    onPress={() => {
                      onChange(item)
                      setExpanded(false)
                    }}
                  >
                    <Text className={item === value ? 'font-supremeBold' : 'font-supreme'}>{item}</Text>
                  </Pressable>
                )}
              />
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}
