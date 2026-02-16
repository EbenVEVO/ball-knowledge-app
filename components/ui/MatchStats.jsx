import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'

const { width } = Dimensions.get('window');

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

  const statNames = [
    'Expected Goals (xG)', 'Total Shots', 'Shots on Goal', 'Shots off Goal',
    'Blocked Shots', 'Shots Outside Box', 'Shots Inside Box', 'Total passes',
    'Accurate Passes', 'Fouls', 'Yellow Cards', 'Red Cards', 'Corner Kicks',
    'Offsides', 'Goalkeeper Saves',
  ]

  useEffect(() => {
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

    setHomePossession(home.find(stat => stat.type === "Ball Possession")?.value)
    setAwayPossession(away.find(stat => stat.type === "Ball Possession")?.value)
    
    const filteredHome = home.filter(stat => statNames.includes(stat.type))
    const filteredAway = away.filter(stat => statNames.includes(stat.type))
    
    const sortedHome = filteredHome.sort((a, b) => 
      statNames.indexOf(a.type) - statNames.indexOf(b.type)
    )
    const sortedAway = filteredAway.sort((a, b) => 
      statNames.indexOf(a.type) - statNames.indexOf(b.type)
    )
  
    setHomeStats(sortedHome)
    setAwayStats(sortedAway)
  }, [fixture])

  return (
    <View
      
    style={styles.container}>
      <View style={styles.header}>
        <Text className='font-supremeBold' style={styles.title}>Match Stats</Text>
      </View>

      <View style={styles.teamNames}>
        <Text className='font-supremeBold' style={[styles.teamName, { flex: 1, textAlign: 'left' }]} numberOfLines={2}>
          {fixture.home_team.club_name}
        </Text>
        <Text className='font-supremeBold' style={[styles.teamName, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>
          {fixture.away_team.club_name}
        </Text>
      </View>

      {/* Ball Possession */}
      <Text 
              className='font-supreme' 
              style={[styles.statName, { flex: 2, textAlign: 'center' }]}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              Ball Possesion
            </Text>       
         <View className='flex flex-row justify-between w-full py-2'>
                <View className='flex flex-row items-center ' style={{width: `${homePossession}`, backgroundColor: darkenColor(homeColors[0]), height: 30, borderTopLeftRadius: 10, borderBottomLeftRadius: 10}}>
                    <Text className='text-md font-supreme px-3 text-white'>{homePossession}</Text>
                </View>
                <View className='flex flex-row items-center justify-center' style={{width: '0.5%', height: 30}}/>
                <View className='flex flex-row items-center ' style={{width: `${awayPossession}`, backgroundColor: darkenColor(awayColors[0]), height: 30, borderTopRightRadius: 10, borderBottomRightRadius: 10, justifyContent: 'flex-end'}}>
                    <Text className='text-md px-3 font-supreme text-white' >{awayPossession}</Text>
        </View>
        </View>

 

      {/* Other Stats */}
      {homeStats.map((stat, index) => {
        const awayValue = awayStats.find(s => s.type === stat.type)?.value || 0;
        const homeValue = stat.value || 0;
        
        // Convert to numbers for comparison (handle percentage strings)
        const numericHomeValue = typeof homeValue === 'string' 
          ? parseFloat(homeValue.split(' ')[0]) 
          : homeValue;
        const numericAwayValue = typeof awayValue === 'string' 
          ? parseFloat(awayValue.split(' ')[0]) 
          : awayValue;

        return (
          <View key={index} style={styles.statRow}>
            <Text className='font-supreme' 
              style={[
                styles.statValue, 
                { 
                  flex: 1, 
                  textAlign: 'left',
                  backgroundColor: numericHomeValue > numericAwayValue && darkenColor(homeColors[0]),
                  color: numericHomeValue > numericAwayValue && (homeColors[0] === '#FFFFFF' ? homeColors[1]: '#ffffff'),
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                }
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {homeValue}
            </Text>
            
            <Text 
              className='font-supreme' 
              style={[styles.statName, { flex: 2, textAlign: 'center' }]}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {stat.type}
            </Text>
            
            <Text 
            className='font-supreme' 
              style={[
                styles.statValue, 
                { 
                  flex: 1, 
                  textAlign: 'right',
                  backgroundColor: numericAwayValue > numericHomeValue && darkenColor(awayColors[0]),
                  color: numericAwayValue > numericHomeValue && (awayColors[0] === '#FFFFFF' ? awayColors[1]: '#ffffff'),
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                }
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {awayValue}
            </Text>
          </View>
        );
      })}
    </View>
  )
}

export default MatchStats

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: 'white', 
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  teamNames: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    gap: 8,
    minHeight: 32,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  statName: {
    fontSize: 12,
    color: '#666',
    flexShrink: 0,
  },
})