import {Modal as RNModal, StyleSheet, Text, View, TouchableWithoutFeedback, Platform, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';

export const PlayerModal = ({isVisible, onClose, stats, player, photo}) => {
    const [playerStats, setPlayerStats] = useState(null);
      useEffect(() => {
        if (!stats) return
        newStats = Object.fromEntries(
        Object.entries(stats).map(([key, value]) => [key, value === null ? 0 : value])
        
      )
        setPlayerStats(newStats)
      },[stats])
    const dobtoage = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age
      }
if (player.player_id === 0) return null
  return (
    <View>

        <RNModal visible={isVisible}  onRequestClose={onClose} transparent>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <View style={styles.container}> 
                        {Platform.OS === 'web'? 
            <View className='flex flex-col relative' style={{flex:1}} >

                <Link href={{pathname: '/player/[id]', params:{id: player.player_id}}} asChild style={{position: 'absolute', top: 10, right: 10, zIndex: 10}}>
                    <TouchableOpacity onPress={onClose}>
                        <View className='flex flex-row items-center '>
                                <Text className='font-supremeBold text-sm '> Player Profile </Text>
                                <Ionicons name="person-circle-sharp" size={20} color="black" />
                        </View>
                    </TouchableOpacity>
                </Link>
            <View className='flex flex-col gap-5 p-10'> 
            <View className='flex flex-col justify-center items-center '>
            
             <View className='relative'>
      <Image 
        source={{uri: photo}} 
        style={{width: 70, height: 70, borderRadius: 50}}
      />
      
       {playerStats?.rating > 0 && <View className=' rounded-full items-center justify-center 'style={{position: 'absolute', zIndex: 1, padding: 1, top: -4, right:-15, paddingHorizontal: 6,
            backgroundColor: playerStats?.rating > 8.9 ? '#12CCFF' : playerStats?.rating > 6.9 ? '#00F70C' : playerStats?.rating > 5.9 ? '#FF9C00' : 'red',

        }}>
            <Text className='text-center font-supremeBold text-sm text-white'>{parseFloat(playerStats?.rating).toFixed(1)}</Text>
        </View>}
       </View>
            <Text className='text-center font-supreme tracking-tight text-xl' > {player.player_name}</Text>
            </View>
            <View className='flex flex-row justify-center items-center'>

                <View className='flex flex-col items-center gap-2' style={{flex:1}}>
                    <View className='flex flex-row items-center gap-2' >
                    <Image className='rounded-full' source={{ uri: playerStats?.player.flag.flag_url }} style={{width: 30, height: 30}} resizeMode='contain' />
                    <Text className='font-supreme tracking-tight text-lg'>{playerStats?.player.nationality}</Text>
                    </View>
                    <Text className='font-supreme tracking-tight text-sm text-gray-600'>Nationality</Text>
                </View>
                <View className='flex flex-col items-center gap-2' style={{flex:1}}>
                    <Text className='font-supreme tracking-tight text-lg'>{dobtoage(playerStats?.player.DOB)}</Text>
                    <Text className='font-supreme tracking-tight text-sm text-gray-600'>Age</Text>
                </View>
            </View></View>
            <div style={{ 
                height: '100%',
                overflowY: 'auto',
                width: '100%',
                margin: 'auto',
                padding: '20px',
                gap: '10px'
            }}>
                <Text  className='py-3 font-supremeBold text-xl'>Player Stats</Text>
                <View className='flex flex-col gap-3 py-3'>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-lg'>Minutes Played</Text>
                        <Text className='font-supreme tracking-tight text-lg'>{playerStats?.minutes}</Text>
                    </View>    
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-lg'>Goals</Text>
                        <Text className='font-supreme tracking-tight text-lg'>{playerStats?.goals}</Text>
                    </View>    
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-lg'>Assists</Text>
                        <Text className='font-supreme tracking-tight text-lg'>{playerStats?.assists}</Text>
                    </View>    

                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-lg'>Total Shots</Text>
                        <Text className='font-supreme tracking-tight text-lg'>{playerStats?.shots}</Text>
                    </View>
                </View>

                <Text  className='py-3 font-supremeBold text-xl'>Attack</Text>   
                <View className='flex flex-col gap-3 py-3'>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-lg'>Shots on Target</Text>
                        <Text className='font-supreme tracking-tight text-lg'>{playerStats?.shots_on_goal}/{playerStats?.shots}</Text>
                    </View>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-lg'>Completd Passes</Text>
                        <Text className='font-supreme tracking-tight text-lg'>{playerStats?.pass_accuracy}/{playerStats?.passes}{(playerStats?.passes > 0 ) && ` (${Math.round((playerStats.pass_accuracy / playerStats.passes) * 100)}%)`}</Text>
                    </View>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-lg'>Key Passes</Text>
                        <Text className='font-supreme tracking-tight text-lg'>{playerStats?.key_passes}</Text>
                    </View>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-lg'>Successful Dribbles</Text>
                        <Text className='font-supreme tracking-tight text-lg'>{playerStats?.dribbles_successful}/{playerStats?.dribbles_attempted}{(playerStats?.dribbles_attempted > 0 ) && ` (${Math.round((playerStats.dribbles_successful / playerStats.dribbles_attempted) * 100)}%)`}</Text>
                    </View>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-lg'>Penalty Goals</Text>
                        <Text className='font-supreme tracking-tight text-lg'>{playerStats?.penalties_scored}/{playerStats?.penaties_missed+playerStats?.penalties_scored}</Text>
                    </View>

                </View> 
                <Text  className='py-3 font-supremeBold text-xl'>Defence</Text>
                <View className='flex flex-col gap-3 py-3'>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-lg'>Tackles Won</Text>
                        <Text className='font-supreme tracking-tight text-lg'>{playerStats?.tackles}</Text>
                    </View> 
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-lg'>Interceptions</Text>
                        <Text className='font-supreme tracking-tight text-lg'>{playerStats?.interceptions}</Text>
                    </View> 
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-lg'>Blocks</Text>
                        <Text className='font-supreme tracking-tight text-lg'>{playerStats?.blocks}</Text>
                    </View>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-lg'>Yellow Cards</Text>
                        <Text className='font-supreme tracking-tight text-lg'>{playerStats?.yellow_cards}</Text>
                    </View>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-lg'>Red Cards</Text>
                        <Text className='font-supreme tracking-tight text-lg'>{playerStats?.red_cards}</Text>
                    </View>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className ='font-supreme tracking-tight text-lg'>Goals Conceded</Text>   
                        <Text className='font-supreme tracking-tight text-lg'>{playerStats?.goals_conceded}</Text>
                    </View>        
                </View>
                <Text className='py-3 font-supremeBold text-xl'>Duels</Text>
                <View className='flex flex-col gap-3 py-3'>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-lg'>Duels Won</Text>
                        <Text className='font-supreme tracking-tight text-lg'>{playerStats?.duels_won}/{playerStats?.duels}{(playerStats?.duels > 0 ) && ` (${Math.round((playerStats.duels_won / playerStats.duels) * 100)}%)`}</Text>
                    </View> 
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-lg'>Was Fouled</Text>
                        <Text className='font-supreme tracking-tight text-lg'>{playerStats?.fouled}</Text>
                    </View> 
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-lg'>Fouls Committed</Text>
                        <Text className='font-supreme tracking-tight text-lg'>{playerStats?.fouls}</Text>
                    </View>
                </View>
            </div>
          </View>
            :
            <View className='flex flex-col  p-10 gap-5'>
            <View className='flex flex-col justify-center items-center gap-5'>
            <Image 
            source={{uri: photo}} 
            style={{width: 100, height: 100, borderRadius: 50}}/>
            <Text className='text-center font-supreme tracking-tight text-xl' > {player.player_name}</Text>
            </View>
            <View className='flex flex-row justify-between items-center'>
                <View className='flex flex-col items-center gap-2'>
                    
                    <Text className='font-supreme tracking-tight text-lg'>{position}</Text>
                    <Text className='font-supreme tracking-tight text-sm'>Position</Text>
                </View>
                <View className='flex flex-col items-center gap-2'>
                    <View className='flex flex-row items-center gap-2'>
                    <Image className='rounded-full' source={{ uri: playerStats?.player.flag.flag_url }} style={{width: 30, height: 30}} resizeMode='contain' />
                    <Text className='font-supreme tracking-tight text-lg'>{playerStats?.player.nationality}</Text>
                    </View>
                    <Text className='font-supreme tracking-tight text-sm'>Nationality</Text>
                </View>
                <View className='flex flex-col items-center gap-2'>
                    <Text className='font-supreme tracking-tight text-lg'>{dobtoage(playerStats?.player.DOB)}</Text>
                    <Text className='font-supreme tracking-tight text-sm'>Age</Text>
                </View>
            </View>
            <ScrollView>
                <Text>Player Stats</Text>
                <View className='flex flex-col gap-2'>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Minutes Played</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.minutes}</Text>
                    </View>    
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Goals</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.goals}</Text>
                    </View>    
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Assists</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.assists}</Text>
                    </View>    
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Yellow Cards</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.yellow_cards}</Text>
                    </View>    
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Red Cards</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.red_cards}</Text>
                    </View>

                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Total Shots</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.shots}</Text>
                    </View>
                </View>

                <Text>Attack</Text>   
                <View className='flex flex-col gap-2'>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Shots on Target</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.shots_on_goal}/{playerStats?.shots}</Text>
                    </View>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Completed Passes</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.pass_accuracy}/{playerStats?.passes}{(playerStats?.passes > 0 ) && ` (${Math.round((playerStats.pass_accuracy / playerStats.passes) * 100)}%)`}</Text>
                    </View>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Key Passes</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.key_passes}</Text>
                    </View>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Successful Dribbles</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.dribbles_successful}/{playerStats?.dribbles_attempted}{(playerStats?.dribbles_attempted > 0 ) && ` (${Math.round((playerStats.dribbles_successful / playerStats.dribbles_attempted) * 100)}%)`}</Text>
                    </View>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Penalty Goals</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.penalties_scored}/{playerStats?.penaties_missed+playerStats?.penalties_scored}</Text>
                    </View>

                </View> 
                <Text>Defence</Text>
                <View className='flex flex-col gap-2'>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Tackles Won</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.tackles}</Text>
                    </View> 
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Interceptions</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.interceptions}</Text>
                    </View> 
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Blocks</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.blocks}</Text>
                    </View>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Yellow Cards</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.yellow_cards}</Text>
                    </View>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Red Cards</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.red_cards}</Text>
                    </View>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className ='font-supreme tracking-tight text-sm'>Goals Conceded</Text>   
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.goals_conceded}</Text>
                    </View>        
                </View>
                <Text>Duels</Text>
                <View className='flex flex-col gap-2'>
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Duels Won</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.duels_won}/{playerStats?.duels}{(playerStats?.duels > 0 ) && ` (${Math.round((playerStats.duels_won / playerStats.duels) * 100)}%)`}</Text>
                    </View> 
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Was Fouled</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.fouled}</Text>
                    </View> 
                    <View className='flex flex-row items-center justify-between'>
                        <Text className='font-supreme tracking-tight text-sm'>Fouls Commited</Text>
                        <Text className='font-supreme tracking-tight text-sm'>{playerStats?.fouls}</Text>
                    </View>
                </View>
            </ScrollView>
          </View>}
                        </View>
                    </TouchableWithoutFeedback>
            </View>
            </TouchableWithoutFeedback>
        </RNModal>
    </View>
  )
}

export default PlayerModal

const styles = StyleSheet.create({

    container:{


        width: '25%',
        height: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        // Shadow for Android
        elevation: 5,
        }
})