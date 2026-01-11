import { View, Text, Platform, Image, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState,  } from 'react'
import { supabase } from '../../lib/supabase'
import { Link } from 'expo-router'
import Fontisto from '@expo/vector-icons/Fontisto';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { FontAwesome } from '@expo/vector-icons';
import {usePlayerModalStore} from '../../contexts/modalStore'

export const PlayerGames = ({player, setIsVisible, setPlayerStats, setPlayerInfo}) => {
    const MATCHES_PER_PAGE = 15
    const [matches, setMatches] = useState([])
    const [hovered, setHovered] = useState(null)
    const [page, setPage] = useState(0)
    useEffect(() => {
        if (Platform.OS === 'web') {
            fetchMatches()
        }
    }, [page, player])

    const fetchMatches = async () => {
        let query = supabase.from('player_stats').select(`*,
            team:team_id(club_name, logo),
            player: player_id (photo, nationality, DOB, country_code, flag: country_code(flag_url)),
            fixture: fixture_id 
                    (date_time_utc, 
                    home_team: home_team_id (club_name, logo, id), 
                    away_team: away_team_id (club_name, logo, id), league: league_id (name, logo), home_score, away_score)
        `).eq('player_id', player?.id)

        if (page === 0){
            query = query
            .order('fixture(date_time_utc)', { ascending: false })
            .range(0, MATCHES_PER_PAGE - 1)
        }
        if (page > 0){
            query = query
            .order('fixture(date_time_utc)', { ascending: false })
            .range(page * MATCHES_PER_PAGE, (page + 1) * MATCHES_PER_PAGE - 1)
        }
        const {data, error} = await query
        if (!error) {
            console.log(data)
            const fixture_ids = data.map((match) => match.fixture_id)
            console.log(fixture_ids)

            const {data: lineupPlayers, error: lineupPlayersError} = await supabase.from('fixture_lineups').select(`*`).in('fixture_id', fixture_ids)
            
            console.log(lineupPlayers)
            
            const mergedData = data.map(match=>{
                const lineup = lineupPlayers.filter(l => l.fixture_id === match.fixture_id)
                console.log(lineup)
                const playerInLineup = lineup.find(l =>
                    {
                    const inStarting = l.starting_lineup?.find(p => p.player_id === player.id);
                     const inSubs     = l.substitutes?.find(p => p.player_id === player.id);

                    return inStarting || inSubs}
                )
                const combinedLineups = [...playerInLineup.substitutes, ...playerInLineup.starting_lineup]
                const playerObject = combinedLineups.find(p => p.player_id === player.id)
                match.playerInfo = playerObject           
            })
            console.log(data)
            setMatches(data)
        }
        else{console.log(error)}

    }
    const formatDate = (date) => {
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      return new Date(date).toLocaleDateString('en-US', options);
    };
    const renderHeader = () => {
        return (
            <View className='flex flex-row w-full items-center p-3  gap-2'>
                <View style={{flex: 2}}>

                </View>
                <View className='flex flex-row items-center gap-2' style={{flex: 1}}>
                <Fontisto name="stopwatch" size={20} color="black" style={{flex: 1, textAlign: 'center'}}/>
                <MaterialIcons name='sports-soccer' size={20} style={{flex: 1, textAlign: 'center'}}/>
                <FontAwesome name="magic" size={20} color="black" style={{flex: 1, textAlign: 'center'}} />
                <View style={{flex: 1, alignItems: 'center'}}>
                <View style={{width: 12, height: 15, backgroundColor: '#ffea2cff', borderRadius: 2}} />
                </View>
                <View style={{flex: 1, alignItems: 'center'}}>
                <View style={{width: 12, height: 15, backgroundColor: 'red', borderRadius: 2}}/>
                </View>
                <AntDesign name="star" size={20} color="black" style={{flex: 1, textAlign: 'center'}}/>
                </View>
            </View>
        )
    }
    const renderMatch = ({item,index}) => {
        const getResult = () => {
                const isHome = item.fixture.home_team.id === item.team_id;

                if (isHome) {
                    return item.fixture.home_score > item.fixture.away_score ? 'W' 
                         : item.fixture.home_score < item.fixture.away_score ? 'L' 
                         : 'D';
                } else {
                    return item.fixture.home_score < item.fixture.away_score ? 'W' 
                         : item.fixture.home_score > item.fixture.away_score ? 'L' 
                         : 'D';
                }
            }
        return (
          <TouchableOpacity className='flex flex-row w-full items-center p-3  gap-2'
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                style={{backgroundColor: hovered === index && '#e4e4e4ff'}}
                onPress={()=>{
                    setIsVisible(true)
                    setPlayerInfo(item.playerInfo)
                    setPlayerStats(item)
                }}
        
            >
            <View className='flex flex-row w-full items-center '>
                <View className='flex flex-row items-center gap-2' style={{flex: 2}}>
                <View className='flex flex-row items-center gap-2' style={{flex: 1}}>
                <Image source={{ uri: item.fixture.league.logo }} style={{width: 20, height: 20}} resizeMode='contain' />
                <Text className='text-xs font-supreme'>{formatDate(item.fixture.date_time_utc)}</Text>
                </View>
                <View className='flex flex-row items-center gap-2' style={{flex: 1}}>
                    <Image source={{ uri: item.team_id === item.fixture.home_team.id ? item.fixture.away_team.logo : item.fixture.home_team.logo }} style={{ width: 25, height: 25 }} resizeMode='contain' />
                    <Text className='font-supreme '>{item.team_id === item.fixture.home_team.id ? 'VS ' + item.fixture.away_team.club_name : '@ ' + item.fixture.home_team.club_name}</Text>
                </View>
                <View className='flex flex-row items-center gap-2' style={{flex: 1}}>
                    <Text className='font-supremeBold text-center'>{getResult()} {item.fixture.home_team.id === item.fixture.team_id} {item.fixture.home_score}-{item.fixture.away_score}</Text>
                </View>
                </View>
                <View className='flex flex-row items-center gap-2' style={{flex: 1}}>
                    <Text style={{flex: 1, textAlign: 'center'}} className='font-supreme'>{item.minutes === null ? '0' : item.minutes}</Text>
                    <Text style={{flex: 1, textAlign: 'center'}} className='font-supreme'>{item.goals === null ? '0' : item.goals}</Text>
                    <Text style={{flex: 1, textAlign: 'center'}} className='font-supreme'>0{item.assists === null ? '0' : item.assists}</Text>
                    <Text style={{flex: 1, textAlign: 'center'}} className='font-supreme'>{item.yellow_cards === null ? '0' : item.yellow_cards}</Text>
                    <Text style={{flex: 1, textAlign: 'center'}} className='font-supreme'>{item.red_cards === null ? '0' : item.red_cards}</Text>
                    <Text style={{flex: 1, textAlign: 'center'}} className='font-supreme'>{item.rating === null ? '-' : item.rating}</Text>
                </View>
           </View>
           </TouchableOpacity>
        )
    }
  return (
    <View className='rounded-2xl bg-white shadow-xl w-full ' style={{flex: 1}}>
               
        <FlatList
        ListHeaderComponent={renderHeader}
        data={matches}
        renderItem={renderMatch}  />  {Platform.OS == 'web' &&
               <View className='flex flex-row items-center justify-between w-full p-5 px-10'>
       
        <TouchableOpacity className='flex flex-row items-center gap-5' onPress={() => setPage(page + 1)}>
            <View className='w-10 h-10 rounded-full justify-center items-center' style={{backgroundColor: '#D1D1D1', width: 30, height: 30}}>
                <AntDesign name="left" size={15} color="black" />    
            </View>
            <Text className='font-supremeBold uppercase text-lg'>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity className='flex flex-row items-center gap-5' onPress={() => setPage(page - 1)}>
            <Text className='font-supremeBold uppercase text-lg' style={{color: page === 0 && '#b9b5b5ff' }}>Next</Text>
            <View className='w-10 h-10 rounded-full justify-center items-center' style={{backgroundColor:page === 0 ? '#f3f1f1ff' : '#D1D1D1', width: 30, height: 30}}>
                
                <AntDesign name="right" size={15} color="black" />
            </View>
        </TouchableOpacity>
      </View>}
    </View>
  )
}

export default PlayerGames