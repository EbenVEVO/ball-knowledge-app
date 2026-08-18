import { StyleSheet, Text, View,Image, ScrollView, FlatList, TouchableOpacity, Pressable, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import React from 'react'
import _ from 'lodash';
import { Link } from 'expo-router';
import { supabase } from '../../lib/supabase';


const HEADER_FONT_SIZE = Platform.select({ web: 14, default: 11 })
const CELL_FONT_SIZE = Platform.select({ web: 14, default: 12 })
const CLUB_FONT_SIZE = Platform.select({ web: 15, default: 13 })
const ROW_PADDING = Platform.select({ web: 12, default: 6 })
const ROW_GAP = Platform.select({ web: 8, default: 4 })

export const LeagueTable = ({season ,showLast5, highlighted, rounded}) => {
    const [standings, setStandings] = useState([])
    const [fixtures, setFixtures] = useState([])

  useEffect(()=>{
    const fetchSeasonStandings= async ()=>{

        const {data,error} = await supabase.from('league_standings').select(`*, team:club_id(id, club_name, logo)`)
        .eq('season_id', season?.id).order('rank', {ascending:true})
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

  const sortedStandings = useMemo(() => {
    if (!selectedColumn) return standings
    const iteratee = selectedColumn === 'goals_against'
        ? (item) => item.goals_for - item.goals_against
        : selectedColumn
    return _.orderBy(standings, [iteratee], [direction])
  }, [standings, selectedColumn, direction])

  const groupedStandings = useMemo(() => {
    const groups = _.groupBy(sortedStandings, item => item.group ?? '')
    const groupNames = Object.keys(groups)
    // A normal single-table competition still tags every row with one group
    // (usually the competition's own name) - only split into sections when
    // there's genuinely more than one distinct group in this season.
    if (groupNames.length <= 1) return null
    return groupNames.sort().map(name => ({ name, rows: groups[name] }))
  }, [sortedStandings])

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
                <View className='flex flex-row items-center flex-1' style={{padding: ROW_PADDING, gap: ROW_GAP}}>
                <View className='flex flex-row items-center' style={{flex: 0.5}}>
                    <TouchableOpacity onPress={() => handleSort('rank')}>
                        <Text className='font-supremeBold' style={{fontSize: HEADER_FONT_SIZE}}>#</Text>
                    </TouchableOpacity>
                    {selectedColumn === 'rank' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center' style={{flex: 3}}>
                    <TouchableOpacity onPress={() => handleSort('team.club_name')}>
                        <Text className='font-supremeBold' style={{fontSize: HEADER_FONT_SIZE}}>CLUB</Text>
                    </TouchableOpacity>
                    {selectedColumn === 'team.club_name' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center justify-center' style={{flex: 1}}>
                    <TouchableOpacity onPress={() => handleSort('played')}>
                        <Text className='text-center font-supremeBold' numberOfLines={1} style={{fontSize: HEADER_FONT_SIZE}}>PLD</Text>
                    </TouchableOpacity>
                    {selectedColumn === 'points' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center justify-center' style={{flex: 0.8}}>
                    <TouchableOpacity onPress={() => handleSort('win')}>
                        <Text className='text-center font-supremeBold' numberOfLines={1} style={{fontSize: HEADER_FONT_SIZE}}>W</Text>
                    </TouchableOpacity>
                    {selectedColumn === 'win' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center justify-center' style={{flex: 0.8}}>
                    <TouchableOpacity onPress={() => handleSort('draw')}>
                        <Text className='text-center font-supremeBold' numberOfLines={1} style={{fontSize: HEADER_FONT_SIZE}}>D</Text>
                    </TouchableOpacity>
                    {selectedColumn === 'draw' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center justify-center' style={{flex: 0.8}}>
                    <TouchableOpacity onPress={() => handleSort('lose')}>
                        <Text className='text-center font-supremeBold' numberOfLines={1} style={{fontSize: HEADER_FONT_SIZE}}>L</Text>
                    </TouchableOpacity>
                    {selectedColumn === 'lose' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center justify-center' style={{flex: 1.5}}>
                    <TouchableOpacity onPress={() => handleSort('goals_for')}>
                        <Text className='text-center font-supremeBold' numberOfLines={1} style={{fontSize: HEADER_FONT_SIZE}}>+/-</Text>
                    </TouchableOpacity>
                    {selectedColumn === 'goals_for' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center justify-center' style={{flex: 0.8}}>
                    <TouchableOpacity onPress={() => handleSort('goals_against')}>
                        <Text className='text-center font-supremeBold' numberOfLines={1} style={{fontSize: HEADER_FONT_SIZE}}>GD</Text>
                    </TouchableOpacity>
                    {selectedColumn === 'goals_against' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center justify-center' style={{flex: 0.8}}>
                    <TouchableOpacity onPress={() => handleSort('points')}>
                        <Text className='text-center font-supremeBold' numberOfLines={1} style={{fontSize: HEADER_FONT_SIZE}}>PTS</Text>
                    </TouchableOpacity>
                    {selectedColumn === 'points' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                {showLast5&& <View className='flex flex-row items-center justify-center' style={{flex: 2}}>
                    <TouchableOpacity>
                        <Text className='text-center font-supremeBold' numberOfLines={1} style={{fontSize: HEADER_FONT_SIZE}}>Last 5</Text>
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
            {[...fixtures].reverse().map((fixture) => {
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
                <View className='flex flex-row items-center w-full' style={{padding: ROW_PADDING, gap: ROW_GAP}}>
                <View className='flex flex-row items-center' style={{flex: 0.5}}>
                    <Text className='font-supremeBold' style={{fontSize: CELL_FONT_SIZE}}>{item.rank}</Text>
                </View>
                <View className='flex flex-row items-center gap-2' style={{flex: 3}}>
                    <Image resizeMode='contain' source={{uri: item.team.logo}} style={{width: 20, height: 20}}/>
                    <Text className={`font-supreme ${highlighted === item.team.id ? '':'text-blue-600'}`} numberOfLines={1} style={{flex: 1, fontSize: CLUB_FONT_SIZE}}>
                        <Link disabled={highlighted === item.team.id} href={{pathname: '/club/[id]', params:{id: item.team.id}}}>
                            {item.team.club_name}
                        </Link>
                    </Text>
                </View>
                <Text className='text-center font-supreme' numberOfLines={1} style={{flex: 1, fontSize: CELL_FONT_SIZE}}>{item.played}</Text>
                <Text className='text-center font-supreme' numberOfLines={1} style={{flex: 0.8, fontSize: CELL_FONT_SIZE}}>{item.win}</Text>
                <Text className='text-center font-supreme' numberOfLines={1} style={{flex: 0.8, fontSize: CELL_FONT_SIZE}}>{item.draw}</Text>
                <Text className='text-center font-supreme' numberOfLines={1} style={{flex: 0.8, fontSize: CELL_FONT_SIZE}}>{item.lose}</Text>
                <Text className='text-center font-supreme' numberOfLines={1} style={{flex: 1.5, fontSize: CELL_FONT_SIZE}}>{item.goals_for}-{item.goals_against}</Text>
                <Text className='text-center font-supreme' numberOfLines={1} style={{flex: 0.8, fontSize: CELL_FONT_SIZE}}>{item.goals_for - item.goals_against}</Text>
                <Text className='text-center font-supreme' numberOfLines={1} style={{flex: 0.8, fontSize: CELL_FONT_SIZE}}>{item.points}</Text>
                {showLast5 && <View style={{flex:2}}>
                    {fixturesToForm(last5, item.team)}
                </View>}
                </View>
            </View>
            {index !== standings.length - 1&& <View className='border-b border-gray-300 w-full' />}
            </>
        )
    }

    const handleSort = (column) =>{
        const newDirection = direction === 'desc' ? 'asc' : 'desc'
        setDirection(newDirection)
        setSelectedColumn(column)
    }

    if (groupedStandings) {
        const visibleGroups = highlighted
            ? groupedStandings.filter(g => g.rows.some(row => row.team.id === highlighted))
            : groupedStandings

        return (
            <View className='p-5 w-full bg-white' style={{gap: 24, borderWidth: 1, borderColor: '#E5E5E5'}}>
                {visibleGroups.map(g => (
                    <View key={g.name}>
                        <Text className='font-supremeBold text-lg mb-2'>{g.name}</Text>
                        <FlatList
                            scrollEnabled={false}
                            data={g.rows}
                            style={{minWidth:'100%'}}
                            renderItem={({item, index}) => renderRow(item, index)}
                            ListHeaderComponent={renderHeader}
                            keyExtractor={(item) => item.id?.toString() || `${g.name}_${item.rank}`}
                        />
                    </View>
                ))}
            </View>
        )
    }

  return (
    <View className='w-full bg-white' style={{ borderWidth: 1, borderColor: '#E5E5E5', borderRadius: rounded && 25 }}>
        <FlatList
            scrollEnabled={false}
            data={sortedStandings}
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
