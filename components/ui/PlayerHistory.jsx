import { StyleSheet, Text, View, Image, TouchableOpacity, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase';

export const PlayerHistory = ({player, club}) => {
    const [playerSeasons, setPlayerSeasons] = useState(null)
    const [playerClubs, setPlayerClubs] = useState(null)
    let colors = ['#655085', '#FFFFFF']
    if (club?.colors) {
    colors = club?.colors
      }
        function lightenColor(hex, percent) {
  // strip the leading #
  hex = hex.replace(/^#/, '');
  
  // parse r,g,b
  let r = parseInt(hex.substring(0,2), 16);
  let g = parseInt(hex.substring(2,4), 16);
  let b = parseInt(hex.substring(4,6), 16);

  // increase each channel
  r = Math.min(255, Math.floor(r + (255 - r) * percent));
  g = Math.min(255, Math.floor(g + (255 - g) * percent));
  b = Math.min(255, Math.floor(b + (255 - b) * percent));

  // convert back to hex
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
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
    useEffect(() => {
        const fetchSeasons =  async ()=>{
             const {data: seasons , error} = await supabase.from('player_seasons').select(`*,
                team:team_id (club_name,logo, national_team)
                `).eq('player_id', player?.id ).order('season', { ascending: false })
            if (!error){ 
                setPlayerSeasons(seasons)
                 const grouped = seasons.reduce((acc, season) => {
                   const clubName = season.team?.club_name ?? "Unknown Club";
                   if (!acc[clubName]) acc[clubName] = [];
                   acc[clubName].push({season: season.season, national_team: season.team.national_team, team: season.team});
                   return acc;
                 }, {});
                console.log(grouped)
                const clubs = Object.entries(grouped).map(([club_name, seasons]) => ({
                        club_name,
                        seasons: seasons.map(s => s.season),
                        team: seasons[0].team,
                        national_team: seasons[0].national_team
                      }));
                console.log(clubs)
                setPlayerClubs(clubs)
        }
        }
        if(player){
            fetchSeasons()

            
        
        }
       
    },[player])
  return (
    <View className='bg-white  rounded-xl w-full' style={{backgroundColor : darkenColor(colors[0]), flex: Platform.OS === 'web' ? 1 : 0}}>
      <Text className='text-2xl font-supremeBold p-5'
      style={{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}
      >Career</Text>
        <View className='border-b ' style={{borderColor: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}/>
      <Text className='text-xl font-supremeBold p-5'
      style={{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}
      >Club Career</Text>
      <View className='flex flex-col  p-5 '>
            {playerClubs?.map((club, index) => (
                !club.national_team &&
                (<View key={index} className='flex flex-row  gap-5  p-2 items-center '>
                    <Image source={{ uri: club.team.logo }} style={{ width: 40, height: 40 }} resizeMode='contain' />
                    <View className='flex flex-col '>
                    <Text className='text-lg font-supremeBold' 
                    style={{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}
                    >{club.club_name}</Text>
                    <Text className='text-sm font-supreme'
                    style={{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}
                    >{Math.min(...club.seasons) } - {index == 0 ? 'Present' :Math.max(...club.seasons) }</Text>
                    </View>
                </View> )            
            ))}
      </View>
      <View className='border-b ' style={{borderColor: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}/>
      <Text className='text-xl font-supremeBold p-5'
      style={{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}     
      >National Team</Text>
      <View className='flex flex-col  p-5 '>
        {playerClubs?.map((club, index) => (
            club.national_team &&
            (<View key={index} className='flex flex-row  gap-5  p-2 items-center '>
                <Image source={{ uri: club.team.logo }} style={{ width: 40, height: 40 }} resizeMode='contain' />
                <View className='flex flex-col '>
                <Text className='text-lg font-supremeBold'
                style={{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}
                >{club.club_name}</Text>
                <Text className='text-sm font-supreme'
                style={{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}
                >{Math.min(...club.seasons) } - {Math.max(...club.seasons) }</Text>
                </View>
            </View> )
        ))}
      </View>
    </View>
  )
}

export default PlayerHistory

const styles = StyleSheet.create({})