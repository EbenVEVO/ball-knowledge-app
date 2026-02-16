import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {MiniField} from '../ui/MiniField'
import {MiniLineupPlayer} from '../ui/MiniLineupPlayer'

export const LastLineup = ({club}) => {

  const [lastXI, setLastXI] = useState()
  const [lineup, setLineup] = useState()
  const [playerStats, setPlayerStats] = useState()
  useEffect(()=>{
    const fetchLastXI= async () =>{
        const {data, error} = await supabase.from('fixtures').select(`*`)
        .or(`home_team_id.eq.${club.id},away_team_id.eq.${club.id}`)
        .eq('match_status', 'Match Finished')
        .order('date_time_utc', { ascending: false })
        .limit(1)

        if (!error){
          console.log(data, 'lastMatch')
          const { data: playerStats, error: playerStatsError } = await supabase
          .from('player_stats')
          .select(`*, team:team_id(club_name, logo), player:player_id (photo, nationality, DOB, country_code, flag: country_code(flag_url))`)
          .eq('fixture_id', data[0].id)
          if(!playerStatsError){
            setPlayerStats(playerStats)
          }
          const { data: lineups, error: lineupsError } = await supabase
          .from('fixture_lineups')
          .select('*')
          .eq('fixture_id', data[0].id)
          if(!lineupsError){
            const XI = lineups.filter(lineup => lineup.team_id === club?.id)
              console.log(XI)
              setLastXI(XI[0])
              setLineup(lineupFormation(XI[0].starting_lineup))
          }
  
        }
    }
    if(club) fetchLastXI()
  }, [club])

  const lineupFormation = (lineup) =>{
    console.log('lineup in formation ', )
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
    <View>
      <Text>Last XI</Text>
      <MiniField>
        {lastXI?.starting_lineup.map(player=>{
          const position = lineup[player.grid.split(':')[0]][player.grid.split(':')[1]-1];
          const stats = playerStats.find(stat => stat.player_id === player.player_id)

          if (!position) {
            return null;
          }
          return(
              <MiniLineupPlayer
                player={player}
                stats={stats}
                position={position}
              />
          )
        }
          )}
      </MiniField>
    </View>
  )
}

export default LastLineup