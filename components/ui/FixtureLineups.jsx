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
  const [homeLineup , setHomeLineup] = useState(null)
  const [awayLineup , setAwayLineup] = useState(null)
  

  const { width: windowWidth } = useWindowDimensions(); 
  console.log(windowWidth)
const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width - 40);
  };

  useEffect(() => {
    const events = fixture.events
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

    setAwayLineup(lineupFormation(fixture.lineups[1].starting_lineup))
    setHomeLineup(lineupFormation(fixture.lineups[0].starting_lineup))
    
    
  }, [fixture])

  const lineupFormation = (lineup) =>{
    console.log('substitues ',fixture.lineups[0].substitutes)

    const players_by_row = {}
      lineup.forEach((player) => {
       const [row, column] = player.grid.split(':').map(Number)
        if (!players_by_row[row]) {
          players_by_row[row] = []
        }
        players_by_row[row].push(player)
      })

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
          if (players_by_row[3].length === 2){
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
              if (players_by_row[3].length === 2){
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
  return (
    <View 
      className='flex flex-col rounded-2xl '  
      
      onLayout={handleLayout}
    >
      <View className='flex flex-col p-5' style={{backgroundColor: '#B4FF80'}}>


      {(Platform.OS === 'web' && containerWidth > 970) ?
      <Field width={containerWidth}>
          {
          !homeLineup ? null : 
          fixture.lineups[0].starting_lineup.map((player, index) => {
          const position = homeLineup[player.grid.split(':')[0]][player.grid.split(':')[1]-1];
          const stats = fixture.playerStats.find(stat => stat.player_id === player.player_id)
          const goalScorer = goalScorers.includes(player.player_id)
          const assist = assisters.includes(player.player_id)
          const redCard = redCards.includes(player.player_id)
          const yellowCard = yellowCards.includes(player.player_id)
          const subbed = subbedOutPlayers.includes(player.player_id)
          const og = ownGoals.includes(player.player_id)
          const photo = stats.player.photo
          if (!position) {
            return null;
          }
          return (
            <LineupPlayer
              player={player}
              photo={photo}
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
          fixture.lineups[1].starting_lineup.map((player, index) => {
          const position = awayLineup[player.grid.split(':')[0]][player.grid.split(':')[1]-1];
          const stats = fixture.playerStats.find(stat => stat.player_id === player.player_id)
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
          fixture.lineups[0].starting_lineup.map((player, index) => {
          const position = homeLineup[player.grid.split(':')[0]][player.grid.split(':')[1]-1];
          const stats = fixture.playerStats.find(stat => stat.player_id === player.player_id)
          const goalScorer = goalScorers.includes(player.player_id)
          const assist = assisters.includes(player.player_id)
          const redCard = redCards.includes(player.player_id)
          const yellowCard = yellowCards.includes(player.player_id)
          const subbed = subbedOutPlayers.includes(player.player_id)
          const og = ownGoals.includes(player.player_id)
          const photo = stats.player.photo
          if (!position) {
            return null;
          }
          return (
            <LineupPlayer
              player={player}
              photo={photo}
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
          fixture.lineups[1].starting_lineup.map((player, index) => {
          const position = awayLineup[player.grid.split(':')[0]][player.grid.split(':')[1]-1];
          const stats = fixture.playerStats.find(stat => stat.player_id === player.player_id)
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
      <View className='flex flex-col p-5 bg-white gap-5' >
        <View className='flex flex-row items-center  '>
          <View style={{flex: 1, alignItem: 'flex-start'}}>
          <Text className='text-lg font-supremeBold'>{fixture.lineups[0].coach}</Text>
          </View>
            <View style={{flex: 1}}>
          <Text className='text-lg font-supremeBold text-center'>Head Coach</Text>
          </View>
          <View style={{flex: 1, alignItems: 'flex-end'}}>
          <Text className='text-lg font-supremeBold'>{fixture.lineups[1].coach}</Text>
          </View>
        </View>

        <View className = 'flex flex-col items-center justify-center mt-5'>
        <Text className='text-lg font-supremeBold '>Substitutes</Text>
 {containerWidth > 500 ? (
    // Wide layout: side by side
    <View className='flex flex-row items-start w-full'>
      <View className='flex flex-col' style={{flex: 1, alignItems: 'flex-start'}}>
        {fixture.lineups[0].substitutes.map((player, index) => {
          const stats = fixture.playerStats.find(stat => stat.player_id === player.player_id)
          const photo = stats.player.photo
          return (
            <View key={index} className='flex flex-row items-center gap-2 py-1'>
              <Text className='text-lg font-supremeBold w-8'>{player.number}</Text>
              <PlayerText player={player} stats={stats} photo={photo}>
                <Text className='text-base font-supremeBold'>{player.player_name}</Text>
              </PlayerText>
              {subbedPlayersIn.includes(player.player_id) && <AntDesign name="arrowup" size={16} color="green" />}
              {goalScorers.includes(player.player_id) && <MaterialIcons name='sports-soccer' size={16} />}
              {assisters.includes(player.player_id) && <FontAwesome name="magic" size={16} color="black" />}
            </View>
          )
        })}
      </View>

      <View className='flex flex-col' style={{flex: 1, alignItems: 'flex-end'}}>
        {fixture.lineups[1].substitutes.map((player, index) => {
          const stats = fixture.playerStats.find(stat => stat.player_id === player.player_id)
          const photo = stats.player.photo
          return (
            <View key={index} className='flex flex-row items-center gap-2 py-1'>
              {subbedPlayersIn.includes(player.player_id) && <AntDesign name="arrowup" size={16} color="green" />}
              {goalScorers.includes(player.player_id) && <MaterialIcons name='sports-soccer' size={16} />}
              {assisters.includes(player.player_id) && <FontAwesome name="magic" size={16} color="black" />}
              <PlayerText player={player} stats={stats} photo={photo}>
                <Text className='text-base font-supremeBold'>{player.player_name}</Text>
              </PlayerText>
              <Text className='text-lg font-supremeBold w-8 text-right'>{player.number}</Text>
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
      {fixture.lineups[0].substitutes.map((player, index) => {
        const stats = fixture.playerStats.find(stat => stat.player_id === player.player_id)
        const photo = stats.player.photo
        return (
          <PlayerText player={player} stats={stats} photo={photo}>
          <View key={index} className='flex flex-col items-center gap-2 py-1'>
            <Image source={{uri: photo}} style={{width: 40, height: 40, borderRadius: 25}} />
            
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
      {fixture.lineups[1].substitutes.map((player, index) => {
        const stats = fixture.playerStats.find(stat => stat.player_id === player.player_id)
        const photo = stats.player.photo
        return (
          <View key={index} className='flex flex-col items-center gap-2 py-1'>
            <Image source={{uri: photo}} style={{width: 40, height: 40, borderRadius: 25}} />
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