import { StyleSheet, Text, View, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase';
import { Link } from 'expo-router';

export const PlayerLastGames = ({player, club}) => {
    const [lastGames, setLastGames] = useState(null)
    let colors = ['#655085', '#FFFFFF']
  if (club?.colors) {
    colors = club?.colors
    console.log(colors)
  } 
  const darkenColor = (hex, percent = .2) => {
  if (!hex) return "#000000"; 
  hex = hex.replace("#", "");

  let r = parseInt(hex.substring(0,2), 16);
  let g = parseInt(hex.substring(2,4), 16);
  let b = parseInt(hex.substring(4,6), 16);

  r = Math.max(0, r - (r * percent ));
  g = Math.max(0, g - (g * percent ));
  b = Math.max(0, b - (b * percent ));

  return `rgb(${r}, ${g}, ${b})`;
};
const formatDate = (date) => {
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      return new Date(date).toLocaleDateString('en-US', options);
    };
  useEffect(() => {
    const fetchGames = async () => {
      const { data, error } = await supabase.from('player_stats').select(`*,
        fixture: fixture_id (date_time_utc, home_team : home_team_id (club_name, logo, id), away_team: away_team_id (club_name, logo, id), league: league_id (name, logo), home_score, away_score)
        `)
        .eq('player_id', player?.id)
        .order('fixture(date_time_utc)', { ascending: false })
        .range(0, 4)

      if (!error) {
        console.log(data)
        setLastGames(data)
      }
    }
    fetchGames()
  }, [player])
  return (
    <View className='rounded-2xl bg-white shadow-xl w-full ' style={{flex: 1}}>
      <Text className='text-2xl font-supremeBold p-2'> Last Games</Text>
       <View className='border-b border-gray-300  w-full' />
      <View className='flex flex-col'>
        {lastGames?.map((game, index) =>
            {
            const getResult = () => {
                const isHome = game.fixture.home_team.id === game.team_id;

                if (isHome) {
                    return game.fixture.home_score > game.fixture.away_score ? 'W' 
                         : game.fixture.home_score < game.fixture.away_score ? 'L' 
                         : 'D';
                } else {
                    return game.fixture.home_score < game.fixture.away_score ? 'W' 
                         : game.fixture.home_score > game.fixture.away_score ? 'L' 
                         : 'D';
                }
            }
            return(
              <><View key={index} className='flex flex-col  p-3  gap-2'>
                    <View className='flex flex-row items-center gap-2 py-2' style={{alignSelf: 'flex-end'}}>
                        <Image source={{ uri: game.fixture.league.logo }} style={{ width: 20, height: 20 }} resizeMode='contain' />
                        <Text className='font-supreme text-xs'>{game.fixture.league.name}</Text>
                    </View>
                    <View className='flex flex-row items-center gap-2'>
                        <Text style={{flex:3 }} className='font-supreme '>{formatDate(game.fixture.date_time_utc)}</Text>
                        <View style={{ flex: 2}}></View>
                        <Text style={{ flex: 1 }} className='font-supreme text-center'>Min</Text>
                        <Text style={{ flex: 1 }} className='font-supreme text-center'>G</Text>
                        <Text style={{ flex: 1 }} className='font-supreme text-center'>A</Text>
                    </View>
                    <View className='flex flex-row items-center gap-2'>
                        
                        <View className='flex flex-row items-center gap-2' style={{ flex: 3 }}>
                            <Image source={{ uri: game.team_id === game.fixture.home_team.id ? game.fixture.away_team.logo : game.fixture.home_team.logo }} style={{ width: 25, height: 25 }} resizeMode='contain' />
                            <Link href={{ pathname: '/fixture/[id]', params: { id: game.fixture_id } }}>
                            <Text ellipsizeMode='tail' numberOfLines={1} className='font-supreme ' style={{color:'blue', textDecorationLine: 'underline', flexShrink: 1 }}>{game.team_id === game.fixture.home_team.id ? 'VS ' + game.fixture.away_team.club_name : '@ ' + game.fixture.home_team.club_name}</Text>
                            </Link>
                        </View>
                        <View style={{ flex: 2}}>
                            <Text className='font-supremeBold text-center'>{getResult()} {game.fixture.home_team.id === game.fixture.team_id} {game.fixture.home_score}-{game.fixture.away_score}</Text>
                        </View>
                        <Text style={{ flex: 1}} className='font-supreme text-center'>{game.minutes === null ? 0 : game.minutes}</Text>
                        <Text style={{ flex: 1 }} className='font-supreme text-center'>{game.goals === null ? 0 : game.goals}</Text>
                        <Text style={{ flex: 1 }} className='font-supreme text-center'>0{game.assists === null ? 0 : game.assists}</Text>
                    </View>
                </View>{index !== lastGames.length - 1 && <View className='border-b border-gray-300  w-full' />}</>
            )})}
      </View>
    </View>
  )
}

export default PlayerLastGames

const styles = StyleSheet.create({})