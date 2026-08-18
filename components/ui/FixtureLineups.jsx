import { StyleSheet, Text, View, Image, Platform, useWindowDimensions } from 'react-native'
import {Field} from '../ui/Field'
import { AntDesign } from '@expo/vector-icons'
import { MaterialIcons } from '@expo/vector-icons'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {LineupPlayer} from '../ui/LineupPlayer'
import React, { useEffect, useState, useMemo, use } from 'react'
import {PlayerText} from '../ui/PlayerText'
import PlayerProfile from '../PlayerProfile';
import VerticalField from './VerticalField';

export const FixtureLineups = ({fixture}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [subbedPlayersIn , setSubbedPlayersIn] = useState([])
  const [subbedOutPlayers , setSubbedOutPlayers] = useState([])
  const [ownGoals , setOwnGoals] = useState([])
  const [goalScorers , setGoalScorers] = useState([])
  const [assisters , setAssisters] = useState([])
  const [redCards , setRedCards] = useState([])
  const [yellowCards , setYellowCards] = useState([])


  const { width: windowWidth } = useWindowDimensions();
  console.log(windowWidth)

  const playerStats = fixture.playerStats || []
  const homeLineupInfo = fixture.lineups?.[0]
  const awayLineupInfo = fixture.lineups?.[1]

const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width - 40);
  };

  useEffect(() => {
    const events = fixture.events || []
    let temp = []
    const subs = events.filter(e => e.event_type === 'subst')
    temp = []
    subs.map((sub) => {
      temp.push(sub.player2_id )
    })
    setSubbedPlayersIn(temp)

    temp = []
    subs.map((sub) => {
      temp.push(sub.player_id )
    })
    setSubbedOutPlayers(temp)
    

    const goals = events.filter(e => e.event_type === 'Goal')
    temp = []

    goals.map((goal) => {
  
      temp.push(goal.player_id)
    })
    
    setGoalScorers(temp)

    temp = []
    const ownGoals = events.filter(e => e.event_type === 'Own Goal')
    ownGoals.map((goal) => {
      temp.push(goal.player_id)
    })
    setOwnGoals(temp)
    temp = []
    const assists = events.filter(e => e.event_type === 'Goal')
    assists.map((assist) => {
     temp.push(assist.player2_id)
    })

    setAssisters(temp)

    temp = []
    const redCards = events.filter(e => e.event_details === 'Red Card')
    redCards.map((card) => {
      temp.push(card.player_id)
    })
    setRedCards(temp)
    
    temp = []
    const yellowCards = events.filter(e => e.event_details === 'Yellow Card')
    yellowCards.map((card) => {
     temp.push(card.player_id )
    })    
    setYellowCards(temp)
  }, [fixture])

  const lineupFormation = (lineup) => {
    
    console.log('linueup', lineup)
    const normalized = lineup.map(player => {
      if (player?.player) {
        // Format: { player: { id, grid, name, number, pos } }
        return {
          player_id: player.player.id ? player.player.id : player.player.player_id,
          player_name: player.player.name ? player.player.name : player.player.player_name,
          number: player.player.number,
          grid: player.player.grid,
          position: player.player.pos,
        }
      }
      // Format: { grid, number, position, player_id, player_name }
      return player
    })
    
    console.log('normalized', normalized)
    const players_by_row = {}
    normalized
      .filter(player => player?.grid)
      .forEach((player) => {
        const [row] = player.grid.split(':').map(Number)
        if (!players_by_row[row]) players_by_row[row] = []
        players_by_row[row].push(player)
      })

      console.log('players_by_row', players_by_row)
      if (Object.keys(players_by_row).length === 0) return null

      const posMap = Object.keys(players_by_row).length < 5 ?
      {
        1:["GK"],
        2:(()=>{
          if(players_by_row[2].length === 3){
            return ['LCB', 'CB', 'RCB']
           }
           else if(players_by_row[2].length === 4){
             return ['LB', 'LCB', 'RCB', 'RB']
           }
           else if(players_by_row[2].length === 5){
             return ['LB', 'LCB', 'CB', 'RCB', 'RB']
           }
          })(),
        3: (()=>{
          if (players_by_row[3].length === 1){
            return ['CDM']
          }
          else if (players_by_row[3].length === 2){
            return ['LCM', 'RCM']
          }

          else if(players_by_row[3].length === 3){
            return ['LCM', 'CM', 'RCM']
          }
          else if(players_by_row[3].length === 4){
            return ['LM', 'LCM', 'RCM', 'RM']
          }
          else if(players_by_row[3].length === 5){
            return ['LM', 'LCM', 'CM', 'RCM', 'RM']
          }
        })(),
        4: (()=>{
          if(players_by_row[4].length === 1){
            return ['ST']
          }

          else if (players_by_row[4].length === 2){
            return ['LS', 'RS']
          }
          else if(players_by_row[4].length === 3){
            return ['LW', 'ST', 'RW']
          }


        })()
        }  
        :
        {
          1: ["GK"],
          2:(()=>{
            if(players_by_row[2].length === 3){
              return ['LCB', 'CB', 'RCB']
             }
             else if(players_by_row[2].length === 4){
               return ['LB', 'LCB', 'RCB', 'RB']
             }
             else if(players_by_row[2].length === 5){
               return ['LB', 'LCB', 'CB', 'RCB', 'RB']
             }
            })(),
            3:(()=>{
              if (players_by_row[3].length === 1){
                return ['CDM']
              }
              else if (players_by_row[3].length === 2){
                return ['LCM', 'RCM']
              }
              else if(players_by_row[3].length === 3){
                return ['LCM', 'CM', 'RCM']
              }
              else if(players_by_row[3].length === 4){
                return ['LM', 'LCM', 'RCM', 'RM']
              }
              else if(players_by_row[3].length === 5){
                return ['LM', 'LCM', 'CM', 'RCM', 'RM']
              }
            })(),
            4:(()=>{
              if(players_by_row[4].length === 1){
                return ['CAM']
              }
              else if (players_by_row[4].length === 2){
                return ['LAM', 'RAM']
              }
              else if(players_by_row[4].length === 3){
                return ['LAM', 'CAM', 'RAM']
              }
              else if(players_by_row[4].length === 4){
                return ['LM', 'LCM', 'RCM', 'RM']
              }
              else if(players_by_row[4].length === 5){
                return ['LM', 'LCM', 'CAM', 'RCM', 'RM']
              }
            })(),
            5:(()=>{
              if(players_by_row[5].length === 1){
                return ['ST']
              }
              else if (players_by_row[5].length === 2){
                return ['LS', 'RS']
              }
              else if(players_by_row[5].length === 3){
                return ['LW', 'ST', 'RW']
              }
            })()
        }
          
        return posMap

  }

  const homeLineup = useMemo(
    () => fixture.lineups?.[0]?.starting_lineup ? lineupFormation(fixture.lineups[0].starting_lineup) : null,
    [fixture],
  )
  const awayLineup = useMemo(
    () => fixture.lineups?.[1]?.starting_lineup ? lineupFormation(fixture.lineups[1].starting_lineup) : null,
    [fixture],
  )

  const normalizePlayers = (lineup) => {
    if (!lineup || !Array.isArray(lineup)) return []
    return lineup.map(player =>
      player?.player ? {
        player_id: player.player.id,
        player_name: player.player.name,
        number: player.player.number,
        grid: player.player.grid,
        position: player.player.pos,
      } : player
    )
  }

  const hasGridData = useMemo(() => {
    const sideHasFullGrid = (players) => {
      if (!players || players.length === 0) return false
      return players.every(player => (player?.player ? player.player.grid : player?.grid))
    }
    return sideHasFullGrid(fixture.lineups?.[0]?.starting_lineup) && sideHasFullGrid(fixture.lineups?.[1]?.starting_lineup)
  }, [fixture])

  const homeStartingPlayers = useMemo(
    () => normalizePlayers(fixture.lineups?.[0]?.starting_lineup),
    [fixture],
  )
  const awayStartingPlayers = useMemo(
    () => normalizePlayers(fixture.lineups?.[1]?.starting_lineup),
    [fixture],
  )

  const renderPlayerIcons = (playerId) => {
    const events = fixture.events || []
    const subOut = events.find(e => e.event_type === 'subst' && e.player_id === playerId)
    const yellowCard = events.find(e => e.event_details === 'Yellow Card' && e.player_id === playerId)
    const redCard = events.find(e => e.event_details === 'Red Card' && e.player_id === playerId)
    const goals = events.filter(e => e.event_type === 'Goal' && e.player_id === playerId && e.event_details !== 'Missed Penalty')
    const assists = events.filter(e => e.event_type === 'Goal' && e.player2_id === playerId)

    return (
      <>
        {subOut && (
          <View style={{ alignItems: 'center' }}>
            <AntDesign name="arrow-down" size={12} color="red" />
            <Text style={{ fontSize: 10, color: 'red' }}>{subOut.time_elapsed}'</Text>
          </View>
        )}
        {goals.map((goal, i) => (
          <MaterialIcons key={`goal-${i}`} name='sports-soccer' size={14} />
        ))}
        {assists.map((assist, i) => (
          <FontAwesome key={`assist-${i}`} name="magic" size={12} color="black" />
        ))}
        {yellowCard && <View style={{ width: 10, height: 14, backgroundColor: '#FCFF36', borderRadius: 2 }} />}
        {redCard && <View style={{ width: 10, height: 14, backgroundColor: 'red', borderRadius: 2 }} />}
      </>
    )
  }

  const renderSimpleLineup = () => {
    const rowCount = Math.max(homeStartingPlayers.length, awayStartingPlayers.length)
    return (
      <View className='flex flex-col bg-white rounded-2xl p-3' style={{ width: '100%', borderWidth: 1, borderColor: '#E5E5E5' }}>
        <View className='flex flex-row items-center justify-between px-2 pb-3'>
          <Image source={{ uri: fixture.home_team.logo }} style={{ width: 24, height: 24 }} resizeMode='contain' />
          <Text className='text-lg font-supremeBold'>Lineup</Text>
          <Image source={{ uri: fixture.away_team.logo }} style={{ width: 24, height: 24 }} resizeMode='contain' />
        </View>
        {Array.from({ length: rowCount }).map((_, index) => {
          const home = homeStartingPlayers[index]
          const away = awayStartingPlayers[index]
          const homeStats = home && playerStats.find(stat => stat.player_id === home.player_id)
          const awayStats = away && playerStats.find(stat => stat.player_id === away.player_id)
          return (
            <View key={index} className='flex flex-row items-center justify-between py-2 border-b border-gray-100'>
              <View className='flex flex-row items-center gap-2' style={{ flex: 1 }}>
                {home && (
                  <PlayerText fixture={fixture} player={home} stats={homeStats}>
                    <View className='flex flex-row items-center gap-2'>
                      <Image source={{ uri: homeStats?.player?.photo }} style={{ width: 28, height: 28, borderRadius: 14 }} />
                      <Text className='font-supremeBold' style={{ width: 24 }}>{home.number}</Text>
                      <Text className='font-supremeBold' numberOfLines={1}>{home.player_name}</Text>
                      {renderPlayerIcons(home.player_id)}
                    </View>
                  </PlayerText>
                )}
              </View>
              <View className='flex flex-row items-center gap-2 justify-end' style={{ flex: 1 }}>
                {away && (
                  <PlayerText fixture={fixture} player={away} stats={awayStats}>
                    <View className='flex flex-row items-center gap-2'>
                      {renderPlayerIcons(away.player_id)}
                      <Text className='font-supremeBold' style={{ textAlign: 'right' }} numberOfLines={1}>{away.player_name}</Text>
                      <Text className='font-supremeBold' style={{ width: 24, textAlign: 'right' }}>{away.number}</Text>
                      <Image source={{ uri: awayStats?.player?.photo }} style={{ width: 28, height: 28, borderRadius: 14 }} />
                    </View>
                  </PlayerText>
                )}
              </View>
            </View>
          )
        })}
      </View>
    )
  }

  return (
    <View
      className='flex flex-col rounded-2xl '
      style={{ borderWidth: 1, borderColor: '#E5E5E5', overflow: 'hidden' }}
      onLayout={handleLayout}
    >
      <View className='flex flex-col p-5' style={{backgroundColor: '#B4FF80'}}>


      {!hasGridData ? renderSimpleLineup() :
      (Platform.OS === 'web' && containerWidth > 970) ?
      <Field width={containerWidth}>
          {
          !homeLineup ? null : 
          normalizePlayers(fixture.lineups[0].starting_lineup).map((player, index) => {
            const position = player?.grid ? homeLineup?.[player.grid.split(':')[0]]?.[player.grid.split(':')[1]-1] : undefined;
            const stats = playerStats.find(stat => stat.player_id === (player.id ? player.id : player.player_id  ))
            const goalScorer = goalScorers.includes(player.player_id)
            const assist = assisters.includes(player.player_id)
            const redCard = redCards.includes(player.player_id)
            const yellowCard = yellowCards.includes(player.player_id)
            const subbed = subbedOutPlayers.includes(player.player_id)
            const og = ownGoals.includes(player.player_id)
          if (!position) {
            return null;
          }
          return (
            <LineupPlayer
              fixture={fixture}
              player={player}
              stats={stats}
              position={position}
              goalScorer={goalScorer}
              assist={assist}
              redCard={redCard}
              yellowCard={yellowCard}
              subbed={subbed}
              ownGoal={og}
              awayTeam={false}
            />
          );
          })
        }
        {
          !awayLineup ? null : 
          normalizePlayers(fixture.lineups[1].starting_lineup).map((player, index) => {
          const position = player?.grid ? awayLineup?.[player.grid.split(':')[0]]?.[player.grid.split(':')[1]-1] : undefined;
          const stats = playerStats.find(stat => stat.player_id === (player.id ? player.id : player.player_id  ))
          const goalScorer = goalScorers.includes(player.player_id)
          const assist = assisters.includes(player.player_id)
          const redCard = redCards.includes(player.player_id)
          const yellowCard = yellowCards.includes(player.player_id)
          const subbed = subbedOutPlayers.includes(player.player_id)
          const og = ownGoals.includes(player.player_id)
          if (!position) {
            return null;
          }
          return (
            <LineupPlayer
             fixture={fixture}
              player={player}
              stats={stats}
              position={position}
              goalScorer={goalScorer}
              assist={assist}
              redCard={redCard}
              yellowCard={yellowCard}
              subbed={subbed}
              ownGoal={og}
              awayTeam={true}
            />
          );
          })
        }
        
      </Field>:
      <VerticalField width={containerWidth}>
        {
          !homeLineup ? null : 
          normalizePlayers(fixture.lineups[0].starting_lineup).map((player, index) => {
          const position = player?.grid ? homeLineup?.[player.grid.split(':')[0]]?.[player.grid.split(':')[1]-1] : undefined;
          const stats = playerStats.find(stat => stat.player_id === (player.id ? player.id : player.player_id  ))
          const goalScorer = goalScorers.includes(player.player_id)
          const assist = assisters.includes(player.player_id)
          const redCard = redCards.includes(player.player_id)
          const yellowCard = yellowCards.includes(player.player_id)
          const subbed = subbedOutPlayers.includes(player.player_id)
          const og = ownGoals.includes(player.player_id)
          if (!position) {
            return null;
          }
          return (
            <LineupPlayer
              fixture={fixture}
              player={player}
              stats={stats}
              position={position}
              goalScorer={goalScorer}
              assist={assist}
              redCard={redCard}
              yellowCard={yellowCard}
              subbed={subbed}
              ownGoal={og}
              awayTeam={false}
              horizontal={false}
            />
          );
          })
        }
        {
          !awayLineup ? null : 
          normalizePlayers(fixture.lineups[1].starting_lineup).map((player, index) => {
          const position = player?.grid ? awayLineup?.[player.grid.split(':')[0]]?.[player.grid.split(':')[1]-1] : undefined;
          const stats = playerStats.find(stat => stat.player_id === (player.id ? player.id : player.player_id  ))
          const goalScorer = goalScorers.includes(player.player_id)
          const assist = assisters.includes(player.player_id)
          const redCard = redCards.includes(player.player_id)
          const yellowCard = yellowCards.includes(player.player_id)
          const subbed = subbedOutPlayers.includes(player.player_id)
          const og = ownGoals.includes(player.player_id)
          if (!position) {
            return null;
          }
          return (
            <LineupPlayer
              fixture={fixture}
              player={player}
              stats={stats}
              position={position}
              goalScorer={goalScorer}
              assist={assist}
              redCard={redCard}
              yellowCard={yellowCard}
              subbed={subbed}
              ownGoal={og}
              awayTeam={true}
              horizontal={false}
            />
          );
          })
        }
      </VerticalField>}
      </View>
      <View className='flex flex-col p-5 bg-white gap-5' style={{ borderWidth: 1, borderColor: '#E5E5E5' }}>
        <View className='flex flex-row items-center  '>
          <View style={{flex: 1, alignItem: 'flex-start'}}>
          <Text className='text-lg font-supremeBold'>{homeLineupInfo?.coach ?? '-'}</Text>
          </View>
            <View style={{flex: 1}}>
          <Text className='text-lg font-supremeBold text-center'>Head Coach</Text>
          </View>
          <View style={{flex: 1, alignItems: 'flex-end'}}>
          <Text className='text-lg font-supremeBold'>{awayLineupInfo?.coach ?? '-'}</Text>
          </View>
        </View>

        <View className = 'flex flex-col items-center justify-center mt-5'>
        <Text className='text-lg font-supremeBold '>Substitutes</Text>
 {containerWidth > 500 ? (
    // Wide layout: side by side
    <View className='flex flex-row items-start w-full'>
      <View className='flex flex-col' style={{flex: 1, alignItems: 'flex-start'}}>
        {normalizePlayers(homeLineupInfo?.substitutes).map((player, index) => {
              const stats = playerStats.find(stat => stat.player_id === (player.id ? player.id : player.player_id  ))
              return (
            <View key={index} className='flex flex-row items-center gap-2 py-1'>
              <Text className='text-lg font-supremeBold w-8'>{player.number}</Text>
              <PlayerText fixture={fixture} player={player} stats={stats} >
                <Text className='text-base font-supremeBold'>{player.player_name ? player.player_name : player.name}</Text>
              </PlayerText>
              {subbedPlayersIn.includes(player.player_id) && <AntDesign name="arrow-up" size={16} color="green" />}
              {goalScorers.includes(player.player_id) && <MaterialIcons name='sports-soccer' size={16} />}
              {assisters.includes(player.player_id) && <FontAwesome name="magic" size={16} color="black" />}
            </View>
          )
        })}
      </View>

      <View className='flex flex-col' style={{flex: 1, alignItems: 'flex-end'}}>
        {normalizePlayers(awayLineupInfo?.substitutes).map((player, index) => {
          const stats = playerStats.find(stat => stat.player_id === (player.id ? player.id : player.player_id  ))
          return (
            <View key={index} className='flex flex-row items-center gap-2 py-1'>
              {subbedPlayersIn.includes(player.player_id) && <AntDesign name="arrow-up" size={16} color="green" />}
              {goalScorers.includes(player.player_id) && <MaterialIcons name='sports-soccer' size={16} />}
              {assisters.includes(player.player_id) && <FontAwesome name="magic" size={16} color="black" />}
              <PlayerText fixture={fixture} player={player} stats={stats} >
                <Text className='text-base font-supremeBold'>{player.player_name ? player.player_name : player.name}</Text>
              </PlayerText>
              <Text className='text-lg font-supremeBold w-8'>{player.number}</Text>
            </View>
          )
        })}
      </View>
    </View>
  ) : (
    <View className='flex flex-row justify-between w-full'>
    <View className='flex flex-col'>
      {/* Home team */}
      <View className='flex flex-row items-center gap-2 mt-3 mb-1'>
        <Image source={{ uri: fixture.home_team.logo }} style={{width: 16, height: 16}} resizeMode='contain' />
        <Text className='font-supremeBold'>{fixture.home_team.club_name}</Text>
      </View>
      <View className='flex flex-col gap-2' style={{height: '100%'}}>
      {normalizePlayers(homeLineupInfo?.substitutes).map((player, index) => {
        const stats = playerStats.find(stat => stat.player_id === player.player_id)
        return (
          <PlayerText player={player} stats={stats}>
          <View key={index} className='flex flex-col items-center gap-2 py-1'>
            <Image source={{uri: stats?.player?.photo}} style={{width: 40, height: 40, borderRadius: 25}} />
            
            <Text className='text-xs font-supremeBold'>{`${player.number}. ${player.player_name}`}</Text>
          </View>
          </PlayerText>
        )
      })}
      </View>
    </View>
    <View className='flex flex-col'>
      {/* Away team */}
      <View className='flex flex-row items-center gap-2 mt-3 mb-1'>
        <Image source={{ uri: fixture.away_team.logo }} style={{width: 16, height: 16}} resizeMode='contain' />
        <Text className='font-supremeBold'>{fixture.away_team.club_name}</Text>
      </View>
      <View className='flex flex-col gap-2' style={{height: '100%'}}>
      {normalizePlayers(awayLineupInfo?.substitutes).map((player, index) => {
        const stats = playerStats.find(stat => stat.player_id === player.player_id)
        return (
          <View key={index} className='flex flex-col items-center gap-2 py-1'>
            <Image source={{uri: stats?.player?.photo}} style={{width: 40, height: 40, borderRadius: 25}} />
            <Text className='text-xs font-supremeBold'>{`${player.number}. ${player.player_name}`}</Text>
          </View>
        )
      })}
      </View>
    </View>  
    </View>

  )}
  
      </View>

      </View>
    </View>
    )
}

export default FixtureLineups

const styles = StyleSheet.create({})