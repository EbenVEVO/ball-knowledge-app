import { View, Text, Image } from 'react-native'
import React, { useEffect, useState } from 'react'

const FixtureTopPlayers = ({fixture}) => {
    const [playerStats, setPlayerStats] = useState(null);
    const [topAwayPlayers, setTopAwayPlayers] = useState(null);
    const [topHomePlayers, setTopHomePlayers] = useState(null);
    useEffect(() => {
        if (fixture) {
            const stats = fixture.playerStats
                .filter(p => p.minutes)
                .sort((a, b) => b.rating - a.rating);
            setPlayerStats(stats.map(obj =>
                Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === null ? 0 : v]))
            ))

            const topAway = stats.filter(p => p.team_id === fixture.away_team_id).sort((a, b) => b.rating - a.rating).slice(0, 3);
            const topHome = stats.filter(p => p.team_id === fixture.home_team_id).sort((a, b) => b.rating - a.rating).slice(0, 3);
            setTopAwayPlayers(topAway);
            setTopHomePlayers(topHome);
        }
    }, [fixture]);

    if (!playerStats) return null
    console.log(topAwayPlayers, topHomePlayers)
  return (
    <View className='rounded-2xl bg-white w-full  p-4'>
      <Text className='font-supremeBold text-xl mb-2'>Top Performers</Text>
      <View className='flex flex-col gap-5'>
        <View className='flex flex-row justify-between p-2 '>
          {topHomePlayers?.map((p, index) => (
            <View key={index} className='flex flex-col items-center '>
                 <View className='relative'>
                    <Image className='rounded-full' source={{ uri: p.player.photo }} resizeMode='cover' style={{ width: 40, height: 40 }} />
                        <View className=' rounded-full items-center justify-center 'style={{position: 'absolute', zIndex: 1, padding: 1, top: -4, right:-15, paddingHorizontal: 6,
                            backgroundColor: p?.rating > 8.9 ? '#12CCFF' : p?.rating > 6.9 ? '#00F70C' : p?.rating > 5.9 ? '#FF9C00' : 'red',
                        }}>
                            <Text className='text-center font-supremeBold text-sm text-white'>{parseFloat(p?.rating).toFixed(1)}</Text>
                        </View>
                    <Image className='rounded-full absolute bottom-0 -right-1' source={{ uri: p.team.logo }} resizeMode='cover' style={{ width: 15, height: 15 }} />
                    </View>
                <Text style={{width: 80}} className='text-center font-supreme' numberOfLines={3}>{`${p.player_name} (${p.position})`}</Text>
            </View>
          ))}
        </View>
        <View  style={{height: 1,
    alignSelf: 'stretch',
    backgroundColor: '#bbbbbbff',
    marginVertical: 10,}}/>
        <View className='flex flex-row justify-between  p-2 '>
          {topAwayPlayers?.map((p, index) => (
            <View key={index}  className='flex flex-col items-center'>
                <View className='relative'>
                     <View className=' rounded-full items-center justify-center 'style={{position: 'absolute', zIndex: 1, padding: 1, top: -4, right:-15, paddingHorizontal: 6,
                            backgroundColor: p?.rating > 8.9 ? '#12CCFF' : p?.rating > 6.9 ? '#00F70C' : p?.rating > 5.9 ? '#FF9C00' : 'red',
                        }}>
                            <Text className='text-center font-supremeBold text-sm text-white'>{parseFloat(p?.rating).toFixed(1)}</Text>
                        </View>
                    <Image className='rounded-full' source={{ uri: p.player.photo }} resizeMode='cover' style={{ width: 40, height: 40 }} />
                    <Image className='rounded-full absolute bottom-0 -right-1' source={{ uri: p.team.logo }} resizeMode='cover' style={{ width: 15, height: 15 }} />
                </View>
                <Text className='text-center font-supreme' numberOfLines={2}>{`${p.player_name} (${p.position})`}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default FixtureTopPlayers