import { View, Text } from 'react-native'
import React from 'react'

const PlayerStats = ({playerStats}) => {
  return (
    <><Text className='py-3 font-supremeBold text-xl'>Player Stats</Text><View className='flex flex-col gap-3 py-3'>
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
      </View><Text className='py-3 font-supremeBold text-xl'>Attack</Text><View className='flex flex-col gap-3 py-3'>
              <View className='flex flex-row items-center justify-between'>
                  <Text className='font-supreme tracking-tight text-lg'>Shots on Target</Text>
                  <Text className='font-supreme tracking-tight text-lg'>{playerStats?.shots_on_goal}/{playerStats?.shots}</Text>
              </View>
              <View className='flex flex-row items-center justify-between'>
                  <Text className='font-supreme tracking-tight text-lg'>Completd Passes</Text>
                  <Text className='font-supreme tracking-tight text-lg'>{playerStats?.pass_accuracy}/{playerStats?.passes}{(playerStats?.passes > 0) && ` (${Math.round((playerStats.pass_accuracy / playerStats.passes) * 100)}%)`}</Text>
              </View>
              <View className='flex flex-row items-center justify-between'>
                  <Text className='font-supreme tracking-tight text-lg'>Key Passes</Text>
                  <Text className='font-supreme tracking-tight text-lg'>{playerStats?.key_passes}</Text>
              </View>
              <View className='flex flex-row items-center justify-between'>
                  <Text className='font-supreme tracking-tight text-lg'>Successful Dribbles</Text>
                  <Text className='font-supreme tracking-tight text-lg'>{playerStats?.dribbles_successful}/{playerStats?.dribbles_attempted}{(playerStats?.dribbles_attempted > 0) && ` (${Math.round((playerStats.dribbles_successful / playerStats.dribbles_attempted) * 100)}%)`}</Text>
              </View>
              <View className='flex flex-row items-center justify-between'>
                  <Text className='font-supreme tracking-tight text-lg'>Penalty Goals</Text>
                  <Text className='font-supreme tracking-tight text-lg'>{playerStats?.penalties_scored}/{playerStats?.penaties_missed + playerStats?.penalties_scored}</Text>
              </View>

          </View><Text className='py-3 font-supremeBold text-xl'>Defence</Text><View className='flex flex-col gap-3 py-3'>
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
                  <Text className='font-supreme tracking-tight text-lg'>Goals Conceded</Text>
                  <Text className='font-supreme tracking-tight text-lg'>{playerStats?.goals_conceded}</Text>
              </View>
          </View><Text className='py-3 font-supremeBold text-xl'>Duels</Text><View className='flex flex-col gap-3 py-3'>
              <View className='flex flex-row items-center justify-between'>
                  <Text className='font-supreme tracking-tight text-lg'>Duels Won</Text>
                  <Text className='font-supreme tracking-tight text-lg'>{playerStats?.duels_won}/{playerStats?.duels}{(playerStats?.duels > 0) && ` (${Math.round((playerStats.duels_won / playerStats.duels) * 100)}%)`}</Text>
              </View>
              <View className='flex flex-row items-center justify-between'>
                  <Text className='font-supreme tracking-tight text-lg'>Was Fouled</Text>
                  <Text className='font-supreme tracking-tight text-lg'>{playerStats?.fouled}</Text>
              </View>
              <View className='flex flex-row items-center justify-between'>
                  <Text className='font-supreme tracking-tight text-lg'>Fouls Committed</Text>
                  <Text className='font-supreme tracking-tight text-lg'>{playerStats?.fouls}</Text>
              </View>
          </View></>
  )
}

export default PlayerStats