import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import React, { useEffect, useState } from 'react'
import { Link } from 'expo-router';
import { supabase } from '../../lib/supabase';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { last } from 'lodash';



const TWITTER_EMOJI_BASE = "https://cdn.jsdelivr.net/npm/emoji-datasource-twitter/img/twitter/64/";

export const PlayerLastGame = ({player}) => {
    const [lastGame , setLastGame] = useState()
    const [topReactions, setTopReactions] = useState([])
    const [reactions, setReactions] = useState([])
    const [reactionCount, setReactionCount] = useState()

    useEffect(()=>{
        const fetchLastGame = async () =>{
            const { data, error } = await supabase.from('player_stats').select(`*,
            fixture: fixture_id (date_time_utc, home_team : home_team_id (club_name, logo, id), away_team: away_team_id (club_name, logo, id), league: league_id (name, logo), home_score, away_score)
            `)
            .eq('player_id', player?.id)
            .order('fixture(date_time_utc)', { ascending: false })
            .limit(1)

            if(!error){
                console.log(data[0])
                setLastGame(data[0])
                fetchReactionCount(data[0].id)
            }
        }
        const fetchReactionCount = async (id) => {
            const {data, count, error} = await supabase.from('social_player_reactions').select(`*`, {count: 'exact'}).eq('post_id', id)
            if(!error){
            setReactionCount(count) 
            setReactions(data)
            const reactionsObject = data.reduce((acc, val)=>{
                const emoji = val.emoji.unified
                if(!acc[emoji]){
                  acc[emoji]= {emoji: val.emoji, count: 0}
                }
                acc[emoji].count++
                return acc
              },{})
            const topReacts = Object.entries(reactionsObject) 
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([reaction, count]) => ({ reaction, count }))

            setTopReactions(topReacts)
            }
        }
        fetchLastGame()

    },[player])

    const formatDate = (date) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
      };
      const getResult = () => {
        
        const isHome = lastGame?.fixture.home_team.id === lastGame?.team_id;

        if (isHome) {
            return lastGame?.fixture.home_score > lastGame?.fixture.away_score ? 'W' 
                 : lastGame?.fixture.home_score < lastGame?.fixture.away_score ? 'L' 
                 : 'D';
        } else {
            return lastGame?.fixture.home_score < lastGame?.fixture.away_score ? 'W' 
                 : lastGame?.fixture.home_score > lastGame?.fixture.away_score ? 'L' 
                 : 'D';
        }
    }
  return (
    <View className='rounded-xl flex flex-col bg-white' style={{flex:1}}>
        <Link href={{pathname: '/fixture/[id]', params: {id: lastGame?.fixture.fixture_id}}}>
        <Text>Lastest Performance</Text>
        </Link>
        <View className='flex flex-row gap-3 p-2'>
            <Image source={{uri: player?.photo}} style={{width:50, height:50}}/>
            <View >
                <Text className='font-supreme'>{player?.transfermarkt_name}</Text>
                <View className='flex flex-row gap-2 p-2 ml-5'>
                    <Image source={{uri:lastGame?.fixture.league.logo}} style={{height: 20, width:20}}/>

                    <Text>{formatDate(lastGame?.fixture.date_time_utc)}</Text>

                    <View className='flex flex-row gap-1'>
                        <Image source={{uri:lastGame?.fixture.home_team.id !== lastGame?.team_id ? lastGame?.fixture.home_team.logo: lastGame?.fixture.away_team.logo}} style={{width:20, height:20}}/>
                        <Text>vs {lastGame?.fixture.home_team.id !== lastGame?.team_id ? lastGame?.fixture.home_team.club_name: lastGame?.fixture.away_team.club_name}</Text>
                    </View>
                    <Text className='font-supremeBold text-center'>{getResult()} {lastGame?.fixture.home_team.id === lastGame?.fixture.team_id} {lastGame?.fixture.home_score}-{lastGame?.fixture.away_score}</Text>
                </View>
            </View>
        </View>

        <View>
            <TouchableOpacity className="flex flex-row lastGame?s-center gap-1 " 
                    >
                      
                <View className='flex flex-row gap-2' style={{flex:1}}>
                    {topReactions.map(reaction =>(
                        <Image source={{ uri: `${TWITTER_EMOJI_BASE}${reaction.count.emoji.image}`}} style={{width:20, height:20}}/>
                    ))}
                     <Text className='text-lg font-supremeBold ml-3'>{reactionCount}</Text>
                </View>                        
                   
                <View className='flex flex-row lastGame?s-center gap-2' style={{flex:1, alignSelf: 'flex-end'}}>
                    <FontAwesome name="comment" size={20} color="#A477C7" /><Text className='font-supreme'>{lastGame?.comment_count}</Text>
                </View>

                        
            </TouchableOpacity>
        </View>
        <View className='border-b border-gray-300 p-2 w-full' />
        <View className='mt-5 flex gap-3'>
            <View className='flex flex-row items-center px-10'>
                <View style={{flex:1}} className='items-center'>
                 <View className=' rounded-full items-center justify-center w-full 'style={{paddingHorizontal: 2,
                    backgroundColor: lastGame?.rating > 8.9 ? '#12CCFF' : lastGame?.rating > 6.9 ? '#00F70C' : lastGame?.rating > 5.9 ? '#FF9C00' : 'red',

                    }}>
                    <Text className='text-center font-supremeBold text-sm text-white'>{parseFloat(lastGame?.rating).toFixed(1)}</Text>
                    
                </View>
                <Text>Rating</Text>
                </View>
                <View className='items-center' style={{flex:1}}>
                    <Text>{lastGame?.minutes|| 0}</Text>
                    <Text>Minutes</Text>
                </View>
                <View className='items-center'  style={{flex:1}}>
                    <Text>{lastGame?.goals}</Text>
                    <Text>Goals</Text>
                </View>
                <View className='items-center' style={{flex:1}}>
                    <Text>{lastGame?.assist || 0}</Text>
                    <Text>Assists</Text>
                </View>
                <View className='items-center' style={{flex:1}}>
                    <Text>{lastGame?.shots_on_goal || 0} / {lastGame?.shots || 0}</Text>
                    <Text>Shots</Text>
                </View>
            </View>
            <View className='flex flex-row items-center px-10'>
                <View className='items-center' style={{flex:1}}>
                    <Text>{`${lastGame?.pass_accuracy || 0}/${lastGame?.passes || 0} (${parseFloat (((lastGame?.pass_accuracy || 0)/(lastGame?.passes || 0))*100)}%)`} </Text>
                    <Text>Pass %</Text>
                </View>
                <View className='items-center' style={{flex:1}}>
                    <Text>{lastGame?.dribbles_successful || 0} / {lastGame?.dribbles_attempted || 0}</Text>
                    <Text>Dribbles</Text>
                </View>
                <View className='items-center' style={{flex:1}}>
                    <Text>{`${lastGame?.key_passes || 0}`} </Text>
                    <Text>Key Passes</Text>
                </View>
                <View className='items-center' style={{flex:1}}>
                    <Text>{lastGame?.duels_won || 0} - {lastGame?.duels || 0 - lastGame?.duels_won ||0}</Text>
                    <Text>Duels W-L</Text>
                </View>
            </View>
        </View>
    </View>
  )
}

export default PlayerLastGame

const styles = StyleSheet.create({})