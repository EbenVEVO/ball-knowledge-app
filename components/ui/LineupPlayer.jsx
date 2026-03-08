import { Image, StyleSheet, Text, TouchableOpacity, View, Platform, ScrollView } from 'react-native'
import { PlayerModal } from '../ui/PlayerModal'
import { AntDesign, MaterialIcons, FontAwesome } from '@expo/vector-icons'
import React, { useState, useMemo } from 'react'

export const LineupPlayer = ({ 
  player, 
  position, 
  awayTeam = false, 
  stats, 
  goalScorer, 
  assist, 
  subbed, 
  horizontal = true 
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Use useMemo to prevent re-calculating position object on every render
  const gridPosition = useMemo(() => {
    const pos = horizontal ? {
      'GK': { x: -2, y: 45 },
      'LCB': { x: 8, y: 23 },
      'CB': { x: 8, y: 45 },
      'RCB': { x: 8, y: 62 },
      'LB': { x: 8, y: 5 },
      'RB': { x: 8, y: 83 },
      'LM': { x: 20, y: 6 },
      'LCM': { x: 20, y: 23 },
      'CM': { x: 20, y: 45 },
      'RCM': { x: 20, y: 62 },
      'RM': { x: 20, y: 83 },
      'LW': { x: 38, y: 15 },
      'LAM': { x: 29, y: 13 },
      'CAM': { x: 29, y: 45 },
      'RAM': { x: 29, y: 77 },
      'ST': { x: 38, y: 45 },
      'LS': { x: 38, y: 28 },
      'RS': { x: 38, y: 72 },
      'RW': { x: 38, y: 75 },
    } : {
  /* VERTICAL FIELD - Values are % from the team's defending goal line */
  'GK':  { x: 50, y: 92 }, 
  
  // Defenders (Deepest)
  'LB':  { x: 15, y: 82 },
  'LCB': { x: 35, y: 82 },
  'CB':  { x: 50, y: 82 },
  'RCB': { x: 65, y: 82 },
  'RB':  { x: 85, y: 82 },
  
  // Midfielders (Middle of the half)
  'LM':  { x: 12, y: 71 },
  'LCM': { x: 32, y: 71 },
  'CM':  { x: 50, y: 73 },
  'RCM': { x: 68, y: 71 },
  'RM':  { x: 88, y: 71 },
  
  // Attacking Midfielders
  'LAM': { x: 18, y: 60 },
  'CAM': { x: 50, y: 60 },
  'RAM': { x: 82, y: 60 },
  
  // Forwards (Closest to the halfway line)
  'LW':  { x: 20, y: 51 },
  'LS':  { x: 38, y: 51 },
  'ST':  { x: 50, y: 51 },
  'RS':  { x: 62, y: 51 },
  'RW':  { x: 80, y: 51 },
};
    return position && pos[position] ? pos[position] : { x: 0, y: 0 };
  }, [position, horizontal]);

  // Calculate dynamic style based on orientation and team
  const getPlayerStyle = () => {
    const pWidth = 150;
    const pHeight = 100;

    if (horizontal) {
      return {
        left: !awayTeam ? `${gridPosition.x}%` : undefined,
        right: awayTeam ? `${gridPosition.x}%` : undefined,
        top: `${gridPosition.y}%`,
      };
    } else {
    // VERTICAL LOGIC
    // 1. Mirror X for away team (Left Wing becomes Right Wing from broadcast view)
    const finalX = awayTeam ? (100 - gridPosition.x) : gridPosition.x;

    return {
      position: 'absolute',
      left: `${finalX}%`,
      // Home team is placed relative to TOP (pushes them to bottom half)
      // Away team is placed relative to BOTTOM (pushes them to top half)
      top: !awayTeam ? `${gridPosition.y}%` : undefined,
      bottom: awayTeam ? `${gridPosition.y}%` : undefined,
      transform: [
        { translateX: -pWidth / 2 },
        // If awayTeam, we adjust the center-point offset slightly differently
      ]
    };
  }
};
  const ratingColor = stats?.rating > 8.9 ? '#12CCFF' : stats?.rating > 6.9 ? '#00F70C' : stats?.rating > 5.9 ? '#FF9C00' : 'red';

  return (
    <View 
      className='absolute items-center justify-center' 
      style={[{ width: 150, height: 70, zIndex: 10 }, getPlayerStyle()]}
    >
      <TouchableOpacity 
        className='flex items-center flex-col' 
        onPress={() => setModalVisible(true)}
      >
        <View className='relative'>
          <Image 
            source={{ uri: stats?.player?.photo }} 
            style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: 'white' }}
          />
          
          {/* Goal Scorer Badge */}
          {goalScorer && (
            <View className='bg-white rounded-full absolute' style={{ bottom: -5, right: -10, padding: 1 }}>
              <MaterialIcons name='sports-soccer' size={18} color="black" />
            </View>
          )}

          {/* Assist Badge */}
          {assist && (
            <View className='bg-white rounded-full absolute' style={{ bottom: -5, left: -10, padding: 1 }}>
              <FontAwesome name="magic" size={16} color="black" />
            </View>
          )}

          {/* Subbed Badge */}
          {subbed && (
            <View className='bg-white rounded-full absolute' style={{ top: -4, left: -10, padding: 2 }}>
              <View className='rounded-full bg-red-500' style={{ padding: 1 }}>
                <AntDesign name="arrowdown" size={12} color="white" />
              </View>
            </View>
          )}

          {/* Rating Badge */}
          <View 
            className='rounded-full absolute items-center justify-center' 
            style={{ top: -4, right: -18, paddingHorizontal: 5, paddingVertical: 1, backgroundColor: ratingColor }}
          >
            <Text className='text-center font-supremeBold text-[10px] text-white'>
              {parseFloat(stats?.rating || 0).toFixed(1)}
            </Text>
          </View>
        </View>

        <Text 
          className='text-center font-supremeBold tracking-tight text-xs mt-1 text-black' 
          style={{ width: 140, textShadowColor: 'rgba(255, 255, 255, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 }}
          numberOfLines={1}
        >
          {player.number}. {player.player_name}
        </Text>
      </TouchableOpacity>

      <PlayerModal 
        isVisible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        player={player} 
        stats={stats} 
      />
    </View>
  )
}