import { StyleSheet, Text, View, Image } from 'react-native'
import React, { use, useEffect, useState } from 'react'

export const MatchStats = ({fixture}) => {
    const [homeStats, setHomeStats] = useState([])
    const [awayStats, setAwayStats] = useState([])
    const [homePossession, setHomePossession] = useState(0)
    const [awayPossession, setAwayPossession] = useState(0)
        let homeColors = ['#655085', '#FFFFFF'], awayColors = ['#655085', '#FFFFFF']
    if (fixture?.home_team?.colors) {
        homeColors = fixture?.home_team?.colors
    }
    if (fixture?.away_team?.colors) {
        awayColors = fixture?.away_team?.colors
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

    const statNames = ['Expected Goals (xG)', 
'Shots on Goal',
'Shots off Goal',
'Total Shots',
'Blocked Shots',
'Shots Outside Box',
'Shots Inside Box',
'Total passes',
'Accurate Passes',
'Fouls',
'Yellow Cards',
'Red Cards',
'Corner Kicks',
'Offsides',
'Goalkeeper Saves',
]        
const stats = fixture.teamStats
let home = stats.filter(stat => stat.team_id === fixture.home_team.id)
let away = stats.filter(stat => stat.team_id === fixture.away_team.id)
 

home = home.map(stat => {
  if (stat.type === "Accurate Passes") {
    return {
      ...stat,
      value: `${stat.value} (${home.find(s => s.type === "Passes %")?.value || "-"})`,
    };
  }
  return stat;
});

away = away.map(stat => {
  if (stat.type === "Accurate Passes") {
    return {
      ...stat,
      value: `${stat.value} (${away.find(s => s.type === "Passes %")?.value || "-"})`,
    };
  }
  return stat;
});
    useEffect(() => {
        setHomePossession(home.find(stat => stat.type === "Ball Possession")?.value)
        setAwayPossession(away.find(stat => stat.type === "Ball Possession")?.value)

        home = home.filter(stat => statNames.includes(stat.type))
        away = away.filter(stat => statNames.includes(stat.type))

        console.log(home)
        setHomeStats(home)
        setAwayStats(away)

    }, [fixture])
  return (
    <View className='flex flex-col bg-white rounded-2xl' style={{flex: 1}}>
      <Text className='text-xl text-black font-supremeBold p-5 text-center'>Match Stats</Text>
      <View className='flex flex-row items-center justify-between p-2 px-5'>
        <View className='flex flex-row items-center gap-2 p-2 px-5 ' style={{backgroundColor: darkenColor(homeColors[0]), width: '50%', borderBottomLeftRadius: 10, borderTopLeftRadius: 10, flex:1}} >
            <Image source={{ uri: fixture.home_team.logo }} style={{width: 30, height: 30}} resizeMode='contain' />
            <Text className='' style={{color: homeColors[0] === '#FFFFFF' ? homeColors[1]: '#ffffff'  }}>{fixture.home_team.club_name}</Text>
        </View>
        <View className='flex flex-row items-center gap-2 p-2 px-5' style={{backgroundColor: darkenColor(awayColors[0]), width: '50%', justifyContent: 'flex-end', borderBottomRightRadius: 10, borderTopRightRadius: 10, flex:1}}>
            <Image source={{ uri: fixture.away_team.logo }} style={{width: 30, height: 30}} resizeMode='contain' />
            <Text className='' style={{color: awayColors[0] === '#FFFFFF' ? awayColors[1]: '#ffffff'  }}>{fixture.away_team.club_name}</Text>

        </View>
      </View>
      <View className='flex flex-col items-center justify-center p-2 px-5'>
        <Text className='text-lg  font-supreme'>Ball Possesion</Text>
        <View className='flex flex-row justify-between w-full'>
                <View className='flex flex-row items-center ' style={{width: `${homePossession}`, backgroundColor: homeColors[0], height: 30, borderTopLeftRadius: 10, borderBottomLeftRadius: 10}}>
                    <Text className='text-md font-supreme px-3 text-white'>{homePossession}</Text>
                </View>
                <View className='flex flex-row items-center justify-center' style={{width: '0.5%', height: 30}}/>
                <View className='flex flex-row items-center ' style={{width: `${awayPossession}`, backgroundColor: awayColors[0], height: 30, borderTopRightRadius: 10, borderBottomRightRadius: 10, justifyContent: 'flex-end'}}>
                    <Text className='text-md px-3 font-supreme text-white' >{awayPossession}</Text>
                </View>
        </View>
      </View>
      <View className='flex flex-row justify-between pt-5'>

            <View className= 'flex gap-3'>

                {homeStats.map((stat, index) => {
                    const awayValue = awayStats.find(stat => stat.type === homeStats[index].type).value === null ? 0 : awayStats.find(stat => stat.type === homeStats[index].type).value

                    return (
                        <View className='flex flex-row items-center justify-center px-5 ' key={index} >
                            <Text className='text-lg font-supreme text-center px-3  rounded-full' style={{backgroundColor: stat.value > awayValue && darkenColor(homeColors[0]), color: stat.value > awayValue && (homeColors[0] === '#FFFFFF' ? homeColors[1]: '#ffffff'  )}}>{stat.value ? stat.value : 0}</Text>
                        </View>
                    )
                })}
            </View>
            <View className= 'flex gap-3'>
            {homeStats.map((stat, index) => {
                return (
                    <View className='flex flex-row items-center justify-center px-5' key={index}>
                        <Text className='text-lg font-supreme text-center' >{stat.type}</Text>
                    </View>
                )    
                }
            )}
            </View>

            <View className= 'flex gap-3'>
            {awayStats.map((stat, index) => {
                const homeValue = homeStats.find(stat => stat.type === awayStats[index].type).value === null ? 0 : homeStats.find(stat => stat.type === awayStats[index].type).value

                return (
                   <View className='flex flex-row items-center justify-center px-5' key={index}>
                        <Text className ='text-lg font-supreme text-center px-3  rounded-full' style={{backgroundColor: stat.value > homeValue && darkenColor(awayColors[0]), color: stat.value > homeValue && (awayColors[0] === '#FFFFFF' ? awayColors[1]: '#ffffff'  )}}>{stat.value ? stat.value : 0}</Text>
                   </View>
                )

                }
            )}
            </View>

      </View>
    </View>
  )
}

export default MatchStats

const styles = StyleSheet.create({})