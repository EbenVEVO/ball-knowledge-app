import { Image, StyleSheet, Text, TouchableOpacity, View, Platform, ScrollView } from 'react-native'
import {PlayerModal} from '../ui/PlayerModal'
import { AntDesign } from '@expo/vector-icons'
import { MaterialIcons } from '@expo/vector-icons'
import FontAwesome from '@expo/vector-icons/FontAwesome';

import React, { useEffect, useState } from 'react'

export const LineupPlayer = ({player, position, awayTeam = false, photo,stats, goalScorer, assist, yellowCard, redCard, subbed, ownGoal}) => {
    const [modalVisible, setModalVisible] = useState(false);

  const getGridPosition = (position) => {
    const pos = {
      'GK': { x: -2, y: 45},
      'LCB': {x: 8, y: 23},
      'CB': {x: 8, y: 45},
      'RCB': {x: 8, y: 62},
      'LB': {x: 8, y: 5},
      'RB': {x:8, y: 83},
      'LM': {x: 20, y:6},
      'LCM': {x: 20, y: 23},
      'CM': {x: 20, y: 45},
      'RCM': {x: 20, y: 62},
      'RM': {x: 20, y: 83},
      'LW': {x: 38, y:15},
      'LAM': {x: 29, y: 13},
      'CAM': {x: 29, y:45},
      'RAM': {x: 29, y: 77},
      'ST': {x: 38, y: 45},
      'LS': {x: 38, y: 28},
      'RS': {x: 38, y: 72},
      'RW': {x: 38, y: 75},
    }
    
    return position && pos[position] ? pos[position] : { x: 0, y: 0 };
  }



  const gridPosition = getGridPosition(position);

  
  return (
    
    <View 
      className='rounded-full absolute' 
      style={{
        width: 150, 
        height: 50, 
        left: !awayTeam &&  `${gridPosition.x}%`, 
        right: awayTeam && `${gridPosition.x}%` ,
        top: !awayTeam && `${gridPosition.y}%`,
        bottom: awayTeam && `${2+gridPosition.y}%`
      }}
    ><TouchableOpacity className = 'flex items-center flex-col gap-2 ' onPress={() => setModalVisible(true)} >
        <View className='relative'>
      <Image 
        source={{uri: photo}} 
        style={{width: 50, height: 50, borderRadius: 50}}
      />
      {goalScorer && <View className='bg-white rounded-full items-center justify-center 'style={{position: 'absolute', zIndex: 1, padding: 1, bottom: -5, right:-10}}>
        <MaterialIcons name='sports-soccer' size={20}/>
        </View>}
        {assist && <View className='bg-white rounded-full items-center justify-center 'style={{position: 'absolute', zIndex: 1, padding: 1, bottom: -5, left:-5}}>
         <FontAwesome name="magic" size={20} color="black" />
        </View>}
        {subbed && <View className='bg-white rounded-full items-center justify-center 'style={{position: 'absolute', zIndex: 1, padding: 2, top: -4, left:-6}}>
            <View className='rounded-full' style={{backgroundColor: 'red', padding: 1}}>
            <AntDesign name="arrowdown" size={15} color="white"  />
            </View>
        </View>}
        <View className=' rounded-full items-center justify-center 'style={{position: 'absolute', zIndex: 1, padding: 1, top: -4, right:-15, paddingHorizontal: 6,
            backgroundColor: stats?.rating > 8.9 ? '#12CCFF' : stats?.rating > 6.9 ? '#00F70C' : stats?.rating > 5.9 ? '#FF9C00' : 'red',

        }}>
            <Text className='text-center font-supremeBold text-sm text-white'>{parseFloat(stats?.rating).toFixed(1)}</Text>
        </View>
       </View>
      <Text className='text-center font-supremeBold tracking-tight text-sm ' style={{width: 130}}>{player.number} {player.player_name}</Text>
      </TouchableOpacity>

      <PlayerModal isVisible={modalVisible} onClose={() => setModalVisible(false)} player={player} stats={stats} photo={photo}/>

    </View>
    
  )
}