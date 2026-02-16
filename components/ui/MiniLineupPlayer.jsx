import { Image, StyleSheet, Text, TouchableOpacity, View, Platform, ScrollView } from 'react-native'

import React from 'react'

export const MiniLineupPlayer = ({position, player, stats }) => {

  const getGridPosition = (position) => {
    // Adjusted for vertical half-field (400w x 600h)
    // x: horizontal position (0 = left edge, 100 = right edge as %)
    // y: vertical position (0 = top/halfway line, 100 = bottom/goal line as %)
    const pos = {
      // Goalkeeper
      'GK': { x: 50, y: 91 },
      
      // Defenders (around 75-85% down the field)
      'LCB': { x: 30, y: 74 },
      'CB': { x: 50, y: 77 },
      'RCB': { x: 70, y: 74 },
      'LB': { x: 15, y: 70 },
      'RB': { x: 85, y: 70 },
      
      // Midfielders (around 45-60% down the field)
      'LM': { x: 12, y: 50 },
      'LCM': { x: 35, y: 50 },
      'CM': { x: 50, y: 52 },
      'RCM': { x: 65, y: 50 },
      'RM': { x: 88, y: 50 },
      
      // Attacking midfielders (around 30-40% down the field)
      'LW': { x: 18, y: 30 },
      'LAM': { x: 23, y: 28 },
      'CAM': { x: 50, y: 28 },
      'RAM': { x: 77, y: 28 },
      'RW': { x: 85, y: 30 },
      
      // Strikers (around 10-20% down the field)
      'ST': { x: 50, y: 8 },
      'LS': { x: 38, y: 8 },
      'RS': { x: 62, y: 8 },
    }
    
    return position && pos[position] ? pos[position] : { x: 50, y: 50 };
  }

  const gridPosition = getGridPosition(position);
  
  // Convert percentage to pixels (assuming 400w x 600h field)
  const fieldWidth = 400;
  const fieldHeight = 600;
  
  const pixelX = (gridPosition.x / 100) * fieldWidth;
  const pixelY = (gridPosition.y / 100) * fieldHeight;

  return (
    <View>
      <View 
        className='absolute' 
        style={{
          width: 150, 
          height: 50,
          left: pixelX - 75, // Center the 150px wide element
          top: pixelY - 25,   // Center the 50px tall element
        }}
      >
        <TouchableOpacity className='flex items-center flex-col gap-2'>
          <View className='relative'>
            <Image 
              source={{uri: stats.player.photo}} 
              style={{width: 50, height: 50, borderRadius: 50}}
            />
          </View>
          <Text className='text-center font-supremeBold tracking-tight text-sm' style={{width: 100}}>
             {player.player_name}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default MiniLineupPlayer