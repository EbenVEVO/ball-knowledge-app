import { View, Text, Image, Pressable } from 'react-native'
import React from 'react'

// A single row in the saved-lineups sidebar - tap to load that lineup into the builder.
function SavedLineupRow({ lineup, onPress }) {
  const players = (lineup.users_lineup_players ?? []).filter((p) => p.player)
  const preview = players.find((p) => p.player?.photo)?.player

  return (
    <Pressable
      onPress={() => onPress(lineup)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#f8f5fc',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#e0d6f5',
        padding: 10,
        marginBottom: 10,
      }}
    >
      {preview?.photo ? (
        <Image source={{ uri: preview.photo }} style={{ width: 36, height: 36, borderRadius: 18 }} />
      ) : (
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#e0d6f5' }} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'SupremeExtraBold', fontSize: 14, color: '#1a1430' }} numberOfLines={1}>
          {lineup.title}
        </Text>
        <Text style={{ fontFamily: 'Supreme', fontSize: 12, color: '#888' }} numberOfLines={1}>
          {lineup.formation?.name ?? 'Custom'} · {players.length} players
        </Text>
      </View>
    </Pressable>
  )
}

// Sidebar list of a user's saved team-builder lineups; tapping one fills the pitch with it.
export default function SavedLineupsPanel({ lineups, onSelect, style }) {
  return (
    <View style={[{ width: 260 }, style]}>
      <Text style={{ fontFamily: 'SupremeExtraBold', fontSize: 16, color: '#1a1430', marginBottom: 12 }}>
        Saved Lineups
      </Text>
      {lineups.length === 0 ? (
        <Text style={{ fontFamily: 'Supreme', color: '#aaa', fontSize: 13 }}>
          No saved lineups yet. Save one to see it here.
        </Text>
      ) : (
        lineups.map((lineup) => (
          <SavedLineupRow key={lineup.id} lineup={lineup} onPress={onSelect} />
        ))
      )}
    </View>
  )
}
