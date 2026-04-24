import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { PlayerModal } from '../ui/PlayerModal'
import { Link } from 'expo-router'
import React, { useState, useEffect } from 'react'

export const PlayerText = ({ children, player, stats }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [playerStats, setPlayerStats] = useState(null);

  useEffect(() => {
    if (!stats) return
    const newStats = Object.fromEntries(
      Object.entries(stats).map(([key, value]) => [key, value === null ? 0 : value])
    )
    setPlayerStats(newStats)
  }, [stats])

  if (!stats) {
    return (
      <Link href={{ pathname: '/player/[id]', params: { id: player.player_id } }} asChild>
        <TouchableOpacity>{children}</TouchableOpacity>
      </Link>
    )
  }

  return (
    <View>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        {children}
      </TouchableOpacity>
      <PlayerModal isVisible={modalVisible} onClose={() => setModalVisible(false)} stats={stats} player={player} />
    </View>
  )
}

export default PlayerText