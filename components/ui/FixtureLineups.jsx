import { StyleSheet, Text, View, Image } from 'react-native'
import {Field} from '../ui/Field'
import { AntDesign } from '@expo/vector-icons'
import { MaterialIcons } from '@expo/vector-icons'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {LineupPlayer} from '../ui/LineupPlayer'
import React, { useEffect, useState, useMemo } from 'react'
import {PlayerText} from '../ui/PlayerText'
import PlayerProfile from '../PlayerProfile';

export const FixtureLineups = ({fixture}) => {
  const [containerWidth, setContainerWidth] = useState(1000);
  const [subbedPlayersIn , setSubbedPlayersIn] = useState([])
  const [subbedOutPlayers , setSubbedOutPlayers] = useState([])
  const [ownGoals , setOwnGoals] = useState([])
  const [goalScorers , setGoalScorers] = useState([])
  const [assisters , setAssisters] = useState([])
  const [redCards , setRedCards] = useState([])
  const [yellowCards , setYellowCards] = useState([]) 
  const [homeLineup , setHomeLineup] = useState(null)
  const [awayLineup , setAwayLineup] = useState(null)
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
      <Text className='text-2xl font-supremeBold'>Lineups</Text>

      <View className='flex flex-row justify-between items-center p-3 px-10'>
          <View className='flex flex-row items-center gap-2 '>
            <Image 
            source={{ uri: fixture.home_team.logo }}
            style={{width: 20, height: 20}}
            resizeMode='contain'
            />
            <Text className='text-lg font-supremeBold'>{fixture.home_team.club_name}</Text>
            <Text>{fixture.lineups[0].formation}</Text>
          </View>

          <View className='flex flex-row items-center gap-2 '>
            <Text>{fixture.lineups[1].formation}</Text>
            <Text className='text-lg font-supremeBold'>{fixture.away_team.club_name}</Text>           
             <Image 
            source={{ uri: fixture.away_team.logo }}
            style={{width: 20, height: 20}}
            resizeMode='contain'
            />
          </View>
      </View>
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
              awayTeam={true}
            />
          );
          })
        }
        
      </Field>
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

        <View className = 'flex flex-col items-center justify-center '>
        <Text className='text-lg font-supremeBold '>Substitutes</Text>
        <View className='flex flex-row items-center w-full '>
          <View className='flex flex-col  ' style={{flex: 1, alignItems: 'flex-start'}}>
              {fixture.lineups[0].substitutes.map((player, index) => {
                const stats = fixture.playerStats.find(stat => stat.player_id === player.player_id)
                const photo = stats.player.photo
                return(
                
                <View key={index} className='flex flex-row items-center gap-5 '>
                  <View style={{width: 200 , alignItems: 'flex-center', flexDirection: 'row', gap:5}}>
                    <View style={{width: 30}}>
                  <Text className='text-lg font-supremeBold '> {player.number}</Text>
                  </View>
                    <PlayerText player={player} stats={stats} photo = {photo}>
                        <Text className='text-lg font-supremeBold' > {player.player_name}</Text>
                    </PlayerText>
                    {subbedPlayersIn.includes(player.player_id) &&   <AntDesign name="arrowup" size={20} color="green"  />}
                    {goalScorers.includes(player.player_id) &&   <MaterialIcons name='sports-soccer' size={20}></MaterialIcons>}
                    {assisters.includes(player.player_id) &&   <FontAwesome name="magic" size={20} color="black" />}
                    
                  </View>
                  
                </View>
                )
              })}
              </View>
              <View className='flex flex-col  ' style={{flex: 1, alignItems: 'flex-end'}} >
              {fixture.lineups[1].substitutes.map((player, index) => {
                const stats = fixture.playerStats.find(stat => stat.player_id === player.player_id)
                const photo = stats.player.photo
                return(
                
                <View key={index} className='flex flex-row items-center gap-5 '>
                  <View style={{width: 200 , alignItems: 'flex-center', flexDirection: 'row', gap:5}}>
                    {subbedPlayersIn.includes(player.player_id) &&   <AntDesign name="arrowup" size={20} color="green"  />}
                    {goalScorers.includes(player.player_id) &&   <MaterialIcons name='sports-soccer' size={20}></MaterialIcons>}
                    {assisters.includes(player.player_id) &&   <FontAwesome name="magic" size={20} color="black" />}
                    <PlayerText player={player} stats={stats} photo = {photo}>
                        <Text className='text-lg font-supremeBold' > {player.player_name}</Text>
                    </PlayerText>
                  </View>
                  <View style={{width: 30}}>
                  <Text className='text-lg font-supremeBold '> {player.number}</Text>
                  </View>
                </View>
                )
              })}
              </View>
        </View>
        </View>
      </View>
    </View>
  )
}

export default FixtureLineups

const styles = StyleSheet.create({})