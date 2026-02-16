import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'

const DuelStats = ({fixture}) => {
    const [homeStats, setHomeStats] = useState([])
    const [awayStats, setAwayStats] = useState([])
    
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

  const getComparableValue = (value) => {
    if (typeof value !== 'string') return value;
    
    const percentMatch = value.match(/\((\d+\.?\d*)%\)/);
    if (percentMatch) {
      return parseFloat(percentMatch[1]); // Return percentage value
    }
    
    return parseFloat(value.split(' ')[0]) || 0;
  };

  useEffect(()=>{
    const playerStats = fixture.playerStats

    let home = playerStats.filter(stat => stat.team_id === fixture.home_team_id)
    let away = playerStats.filter(stat => stat.team_id === fixture.away_team_id)
    
    let attemptedDuelsCount = 0
    let successfulDuelsCount = 0
    let attemptedDribblesCount = 0
    let successfulDribblesCount = 0
    let dribbledPastCount = 0

    home.map(player=>{
        attemptedDuelsCount += player.duels || 0
        successfulDuelsCount += player.duels_won || 0
        attemptedDribblesCount += player.dribbles_attempted || 0
        successfulDribblesCount += player.dribbles_successful || 0
        dribbledPastCount += player.dribbled_past
    })

    setHomeStats([
        {type:'Duels Won', value: `${successfulDuelsCount} (${Math.round((successfulDuelsCount/attemptedDuelsCount)*100)}%)`},
        {type:'Successful Dribbles ',value: `${successfulDribblesCount} (${Math.round((successfulDribblesCount/attemptedDribblesCount)*100)}%)`},
        {type:'Dribbled Past', value: dribbledPastCount}
    ])

    attemptedDuelsCount = 0
    successfulDuelsCount = 0
    attemptedDribblesCount = 0
    successfulDribblesCount = 0
    dribbledPastCount = 0

    away.map(player=>{
        attemptedDuelsCount += player.duels || 0
        successfulDuelsCount += player.duels_won || 0
        attemptedDribblesCount += player.dribbles_attempted || 0
        successfulDribblesCount += player.dribbles_successful || 0
        dribbledPastCount += player.dribbled_past
    })
    setAwayStats([
        {type:'Duels Won', value: `${successfulDuelsCount} (${Math.round((successfulDuelsCount/attemptedDuelsCount)*100)}%)`},
        {type:'Successful Dribbles ',value: `${successfulDribblesCount} (${Math.round((successfulDribblesCount/attemptedDribblesCount)*100)}%)`},
        {type:'Dribbled Past', value: dribbledPastCount}
    ])


  },[fixture])
  return (
    <View style={styles.container}>
        <Text className='font-supremeBold' style={styles.title}>Duels</Text>
     {homeStats?.map((stat, index) => {
        const awayValue = awayStats.find(s => s.type === stat.type)?.value || 0;
        const homeValue = stat.value || 0;  
        const numericHomeValue = getComparableValue(homeValue);
        const numericAwayValue = getComparableValue(awayValue);

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

export default DuelStats
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