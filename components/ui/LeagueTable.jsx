import { StyleSheet, Text, View,Image, ScrollView, FlatList, TouchableOpacity, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import React from 'react'
import _ from 'lodash';
import { Link } from 'expo-router';
import { supabase } from '../../lib/supabase';


export const LeagueTable = ({season ,showLast5, highlighted}) => {
    const [standings, setStandings] = useState([])
    const [fixtures, setFixtures] = useState([])
    
  useEffect(()=>{
    const fetchSeasonStandings= async ()=>{
    
        const {data,error} = await supabase.from('league_standings').select(`*, team:club_id(id, club_name, logo)`).eq('season_id', season?.id)
        if(!error){
          setStandings(data)
          fetchLastFiveMatches()

        }
        else{
          console.log(error)
        }
      }
    const fetchLastFiveMatches = async ()=>{
        const{data, error}= await supabase.from('fixtures').select(`*`)
        .eq('season_id', season.id)
        .eq('match_status', 'Match Finished')
        .order('date_time_utc', {ascending:false})
        if(!error){
            setFixtures(data)
        }
    }

    fetchSeasonStandings()
  },[season])
  
  const [direction , setDirection] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  
    const qualificationColor = (description) =>{
      if(!description) return ''
        if(description.includes("Champions League")) return "#009DFF"
        if(description === "Relegation") return "red"
        if(description === "UEFA Europa League") return "#FF8C00"
        if(description === "Conference League Qualification") return "#00D613"
        return ''
    }
    
    const renderHeader = () =>{
        return(
            <>
            <View className='flex flex-row items-center' style={{width:'100%'}}>
                <View style={{width: 5}} />
                <View className='flex flex-row items-center p-3 gap-2 flex-1'>
                <View className='flex flex-row items-center' style={{flex: 0.5}}>
                    <TouchableOpacity onPress={() => handleSort('rank')}>
                        <Text className='font-supremeBold'>#</Text>
                    </TouchableOpacity>
                    {selectedColumn === 'rank' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center' style={{flex: 3}}>
                    <TouchableOpacity onPress={() => handleSort('team.club_name')}>
                        <Text className='font-supremeBold'>CLUB</Text>
                    </TouchableOpacity>
                    {selectedColumn === 'team.club_name' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center justify-center' style={{flex: 1}}>
                    <TouchableOpacity onPress={() => handleSort('played')}>
                        <Text className='text-center font-supremeBold'>PLD</Text>
                    </TouchableOpacity>
                    {selectedColumn === 'points' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center justify-center' style={{flex: 0.8}}>
                    <TouchableOpacity onPress={() => handleSort('win')}>
                        <Text className='text-center font-supremeBold'>W</Text>
                    </TouchableOpacity>
                    {selectedColumn === 'win' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center justify-center' style={{flex: 0.8}}>
                    <TouchableOpacity onPress={() => handleSort('draw')}>
                        <Text className='text-center font-supremeBold'>D</Text>
                    </TouchableOpacity>
                    {selectedColumn === 'draw' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center justify-center' style={{flex: 0.8}}>
                    <TouchableOpacity onPress={() => handleSort('lose')}>
                        <Text className='text-center font-supremeBold'>L</Text>
                    </TouchableOpacity>
                    {selectedColumn === 'lose' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center justify-center' style={{flex: 1.5}}>
                    <TouchableOpacity onPress={() => handleSort('goals_for')}>
                        <Text className='text-center font-supremeBold'>+/-</Text>
                    </TouchableOpacity>
                    {selectedColumn === 'goals_for' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center justify-center' style={{flex: 0.8}}>
                    <TouchableOpacity onPress={() => handleSort('goals_against')}>
                        <Text className='text-center font-supremeBold'>GD</Text>
                    </TouchableOpacity>
                    {selectedColumn === 'goals_against' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center justify-center' style={{flex: 0.8}}>
                    <TouchableOpacity onPress={() => handleSort('points')}>
                        <Text className='text-center font-supremeBold'>PTS</Text>
                    </TouchableOpacity>
                    {selectedColumn === 'points' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                {showLast5&& <View className='flex flex-row items-center justify-center' style={{flex: 2}}>
                    <TouchableOpacity>
                        <Text className='text-center font-supremeBold'>Last 5</Text>
                    </TouchableOpacity>
                </View>}
                </View>
            </View>
            <View className='border-b border-gray-300 w-full' />
            </>
        )
    }

    const fixturesToForm = (fixtures, team) =>{
        const getResult = (fixture, team_id) =>{
            const isHome = team_id === fixture.home_team_id

            if(isHome){
               if(fixture.home_score > fixture.away_score)return'W'
               if(fixture.home_score === fixture.away_score)return'D'
               else return'L'

            }
            else{
                if(fixture.home_score < fixture.away_score)return'W'
               if(fixture.home_score === fixture.away_score)return'D'
               else return'L'
            }
        }
        return(
            <View className='flex flex-row gap-3'>
            {fixtures.reverse().map((fixture) => {
                const res = getResult(fixture, team.id)
                return(
                <View className='items-center justify-center rounded-lg' key={fixture.id} style={{width:25, height:25, flex:1, backgroundColor: res === 'W' ? 'green' : res === 'L' ? 'red': 'gray' }}>
                    <Link href={{pathname: '/fixture/[id]' , params:{id: fixture.id}}}>
                    <Text className='font-supreme text-white'>{res}</Text>
                    </Link>
                </View>
                )
                }
            )}
            </View>
        )
    }

    const renderRow = (item, index) =>{
        const last5 = fixtures.filter(fixture => fixture.home_team_id === item.team.id || fixture.away_team_id === item.team.id).slice(0,5)
        
        return(
            <> 
            <View className='flex flex-row items-center 'style={{width: '100%', backgroundColor: item.team.id === highlighted && '#A6DEFF'}} key={index}>
                <View style={{width: 5, height: '100%', backgroundColor: qualificationColor(item.description)}} />
                <View className='flex flex-row items-center p-3 gap-2 w-full' >
                <View className='flex flex-row items-center' style={{flex: 0.5}}>
                    <Text className='font-supremeBold'>{item.rank}</Text>
                </View>
                <View className='flex flex-row items-center gap-3' style={{flex: 3}}>
                    <Image resizeMode='contain' source={{uri: item.team.logo}} style={{width: 25, height: 25}}/>
                    <Text className={`font-supreme text-md ${highlighted === item.team.id ? '':'text-blue-600'}`} numberOfLines={1} style={{flex: 1}}>
                        <Link disabled={highlighted === item.team.id} href={{pathname: '/club/[id]', params:{id: item.team.id}}}>
                            {item.team.club_name}
                        </Link>
                    </Text>
                </View>
                <Text className='text-center font-supreme' style={{flex: 1}}>{item.played}</Text>
                <Text className='text-center font-supreme' style={{flex: 0.8}}>{item.win}</Text>
                <Text className='text-center font-supreme' style={{flex: 0.8}}>{item.draw}</Text>
                <Text className='text-center font-supreme' style={{flex: 0.8}}>{item.lose}</Text>
                <Text className='text-center font-supreme' style={{flex: 1.5}}>{item.goals_for}-{item.goals_against}</Text>
                <Text className='text-center font-supreme' style={{flex: 0.8}}>{item.goals_for - item.goals_against}</Text>
                <Text className='text-center font-supreme' style={{flex: 0.8}}>{item.points}</Text>
                {showLast5 && <View style={{flex:2}}>
                    {fixturesToForm(last5, item.team)}
                </View>}
                </View>
            </View>
            <View className='border-b border-gray-300 w-full' />
            </>
        )
    }
    
    const handleSort = (column) =>{
        const newDirection = direction === 'desc' ? 'asc' : 'desc'
        if (column === 'date') {
            const sorted = _.orderBy(standings, [
                (item) => {
                    const [month, day, year] = item.date.split('/')
                    return new Date(year, month - 1, day)
                }
            ], [newDirection])
            setStandings(sorted)
        } 
        else if (column === 'goals_against') {
            const sorted = _.orderBy(standings, [
                (item) => {
                    return item.goals_for - item.goals_against
                }
            ], [newDirection])
            setStandings(sorted)
        }
        else {
            const sorted = _.orderBy(standings, [column], [newDirection])
            setStandings(sorted)
        }
        setDirection(newDirection)
        setSelectedColumn(column)
    }
    
  return (
    <View className='p-5 w-full bg-white'>
        <View className='flex flex-row border-gray-300 border-1'>
            <Pressable className='rounded-full'>
                <Text>Home</Text>
            </Pressable>
            <Pressable className='rounded-full'>
                <Text>Away</Text>
            </Pressable>
            <Pressable className='rounded-full'>
                <Text>Last 5</Text>
            </Pressable>
        </View>
        <FlatList 
            scrollEnabled={false} 
            data={standings}
            style={{minWidth:'100%'}}
            renderItem={({item, index}) => renderRow(item, index)} 
            ListHeaderComponent={renderHeader}
            keyExtractor={(item) => item.id?.toString() || item.rank.toString()}
        />

    </View>
  )
}

export default LeagueTable

const styles = StyleSheet.create({})