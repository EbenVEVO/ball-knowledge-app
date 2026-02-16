import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'

const DefenseStats = ({fixture}) => {

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


    useEffect(()=>{
        const playerStats = fixture.playerStats

        let home = playerStats.filter(stat => stat.team_id === fixture.home_team_id)
        let away = playerStats.filter(stat => stat.team_id === fixture.away_team_id)
        
        console.log(home, away)

        let blockCount = 0
        let interceptionsCount = 0
        let tacklesCount = 0

        home.map(player => {
            blockCount += player.blocks || 0
            interceptionsCount += player.interceptions || 0
            tacklesCount += player.tackles
        })

        setHomeStats([
            {type:'Blocks', value: blockCount},
            {type:'Interceptions', value: interceptionsCount},
            {type:'Tackles', value: tacklesCount}
        ])


        blockCount = 0
        interceptionsCount = 0
        tacklesCount = 0

        away.map(player => {
            if(player.blocks)console.log(player)
            blockCount += player.blocks || 0
            interceptionsCount += player.interceptions || 0
            tacklesCount += player.tackles
        })

        setAwayStats([
            {type:'Blocks', value: blockCount},
            {type:'Interceptions', value: interceptionsCount},
            {type:'Tackles', value: tacklesCount}
        ])


    },[fixture])

    

  return (
    <View style={styles.container}>
        <Text className='font-supremeBold' style={styles.title}>Defense</Text>
     {homeStats?.map((stat, index) => {
        const awayValue = awayStats.find(s => s.type === stat.type)?.value || 0;
        const homeValue = stat.value || 0;  
        
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

export default DefenseStats
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