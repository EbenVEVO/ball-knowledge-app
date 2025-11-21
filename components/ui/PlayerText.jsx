import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import {PlayerModal} from '../ui/PlayerModal'   
import React, { useState, useEffect } from 'react'

export const PlayerText = ({children, player, stats, photo}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [playerStats, setPlayerStats] = useState(null);
    useEffect(() => {
            if (!stats) return
            newStats = Object.fromEntries(
            Object.entries(stats).map(([key, value]) => [key, value === null ? 0 : value])
            
          )
            setPlayerStats(newStats)
          },[stats])
    
  return (
    
    <View>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
      {children}
      </TouchableOpacity>
      <PlayerModal isVisible = {modalVisible} onClose={() => setModalVisible(false)} stats={stats} player={player} photo={photo}/>
    </View>
  )
}

export default PlayerText

const styles = StyleSheet.create({})