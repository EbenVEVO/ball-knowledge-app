import {Modal as RNModal, StyleSheet, Text, View, TouchableWithoutFeedback, Platform, Image, TouchableOpacity, ScrollView, Pressable } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link } from 'expo-router';
import PlayerStats from './PlayerStats';
import Entypo from '@expo/vector-icons/Entypo';
import { EmojiStyle } from 'emoji-picker-react';
import EmojiPicker from 'emoji-picker-react';
import Comments from '../screens/Comments';
import ReactionSelector from './ReactionSelector';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext'

const TWITTER_EMOJI_BASE = "https://cdn.jsdelivr.net/npm/emoji-datasource-twitter/img/twitter/64/";

export const PlayerModal = ({isVisible, onClose, stats, player }) => {
    const {session} = useAuth()
    const [playerStats, setPlayerStats] = useState(null);
    const [commentsScreen, setCommentsScreen] = useState(false)
    const [reactionPicker, setReactionPicker] = useState(false)
    const [topReactions, setTopReactions] = useState([])
    const [reactions, setReactions] = useState([])
    const [reactionCount, setReactionCount] = useState()



    useEffect(()=> {
        console.log(player)
        const fetchReactionCount = async () => {
            const {data, count, error} = await supabase.from('social_player_reactions').select(`*`, {count: 'exact'}).eq('post_id', stats?.id)
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
        fetchReactionCount()
        const channel = supabase
            .channel(`reactions-${stats?.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*', 
                    schema: 'public',
                    table: 'social_player_reactions',
                    filter: `post_id=eq.${stats?.id}`
                },
                (payload) => {
                    console.log('Reaction change:', payload)
                    fetchReactionCount()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    },[stats])

    useEffect(() => {
        if (!stats) return
        
        const newStats = Object.fromEntries(
            Object.entries(stats).map(([key, value]) => [key, value === null ? 0 : value])
        )
        setPlayerStats(newStats)
    },[stats])

    useEffect(() => {
        if(isVisible){
            console.log('stats', stats, 'player', player)
        }
    },[isVisible])


    const StatItem = ({ label, value }) => (
        <View style={{ width: '9%', paddingVertical: 10, alignItems: 'center', gap: 4 }}>
          <Text className='font-supremeBold text-lg'>{value ? value : 0}</Text>
          <Text className='font-supreme uppercase text-center' >{label}</Text>
        </View>
      )
      
      const StatSection = ({ title, children }) => (
        <View style={{ marginBottom: 12, justifyContent:'center' }}>
          <Text className='font-supremeBold' style={{ paddingHorizontal: 5,  color: '#A477C7' }}>
            {title}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 }}>
            {children}
          </View>
        </View>
      )

    if (player?.player_id === 0) return null

    return (
        <View>
            <RNModal visible={isVisible} onRequestClose={onClose} transparent>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}>
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <View style={styles.container}> 
                                
                                <View style={{flex:1}}>
                                    <Comments 
                                        post_id={stats?.id}
                                        type={player}
                                        ListHeaderComponent ={            
                                <View style={{padding:20}}>
                                <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
                                
                                    <Link href={{ pathname: '/player/[id]', params: { id: player?.player_id } }} asChild>
                                        <Pressable>
                                        <View style={{ position: 'relative' }}>
                                            <Image source={{ uri: playerStats?.player.photo }} style={{ width: 125, height: 125, borderRadius: 62.5, borderWidth:1 }} />
                                                {playerStats?.rating > 0 && (
                                                    <View style={{
                                                        position: 'absolute',
                                                        zIndex: 1,
                                                        top: 5,
                                                        right: -5,
                                                        paddingHorizontal: 9,
                                                        paddingVertical: 3,
                                                        borderRadius: 50,
                                                        backgroundColor: playerStats?.rating > 8.9 ? '#12CCFF': playerStats?.rating > 6.9 ? '#00F70C': playerStats?.rating > 5.9 ? '#FF9C00': 'red',}}>
                                                            <Text style={{ fontFamily: 'SupremeBold', fontSize: 14, color: 'white' }}>{parseFloat(playerStats?.rating).toFixed(1)}</Text>
                                                    </View>
                                                )}
                                                <View style={{
                                                    position: 'absolute',
                                                    zIndex: 1,
                                                    bottom: -4,
                                                    right: -5,
                                                    paddingHorizontal: 6,
                                                    paddingVertical: 1,
                                                    borderRadius: 50
                                                }}>
                                                    <Image resizeMode='contain' source={{ uri: playerStats?.team.logo }} style={{ width: 35, height: 35, borderRadius: 50 }} />
                                                </View>
                                        </View>
                                    <View>
                                        <View className='flex flex-row gap-2 items-center justify-center pt-2'>
                                            <Text style={{ fontFamily: 'Supreme', fontSize: 20, textAlign: 'center', }}>
                                                {player?.player_name ? player?.player_name : player?.name}
                                            </Text>
                                            <Text style={{ fontFamily: 'Supreme', fontSize: 20, textAlign: 'center', }}>#{player?.number}</Text>
                                            <Image source={playerStats?.player?.flag?.flag_url} style={{ width: 20, height: 20, borderRadius:10 }} />                                                    
                                        </View>
                                    </View>  
                                    </Pressable>                                  
                                    </Link>

                                    <View className='p-3'>
                                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} onPress={() => setReactionPicker(!reactionPicker)}>
                                            {session !== null && !reactions.some(reaction => reaction.user_id === session.user.id) ? (
                                                <>
                                                    <Entypo name="emoji-happy" size={24} color="black" />
                                                     <Text style={{ fontSize: 18, fontFamily: 'Supreme' }}>{reactionCount}</Text>
                                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                                        {topReactions.map((reaction, index) => (
                                                           <Image
                                                                key={index}
                                                                source={{ uri: `${TWITTER_EMOJI_BASE}${reaction.count.emoji.image}` }}
                                                                style={{ width: 20, height: 20 }} />
                                                        ))}
                                                   </View>
                                                </>
                                                ) 
                                                : 
                                                (
                                                <>
                                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                                        {topReactions.map((reaction, index) => (
                                                        <Image
                                                            key={index}
                                                            source={{ uri: `${TWITTER_EMOJI_BASE}${reaction.count.emoji.image}` }}
                                                            style={{ width: 20, height: 20 }} />
                                                        ))}
                                                    </View>
                                                    <Text style={{ fontSize: 18, fontFamily: 'SupremeBold', marginLeft: 12, color: '#A477C7' }}>
                                                        {reactionCount}
                                                    </Text>
                                                </>
                                                )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ borderWidth: 1, borderColor: '#CCCCCC', marginVertical: 10, opacity:0.6 }} /><View className='flex flex-row justify-between p-2'>
                                    <Link href={{ pathname: '/fixture/[id]', params: { id: playerStats?.fixture_id } }}>
                                        <View className='flex flex-row items-center'>
                                            <View className='flex flex-row gap-2  items-center'>
                                                <Image resizeMode='contain' style={{ width: 30, height: 30 }} source={playerStats?.fixture.home_team.logo} />
                                                    <Text className='text-lg font-supreme' style={{ color: '#A477C7' }}>
                                                        {playerStats?.fixture.home_score}
                                                    </Text>
                                            </View>
                                            <Text className='text-lg font-supreme' style={{ color: '#A477C7' }}> - </Text>
                                            <View className='flex flex-row  items-center gap-2'>
                                            <Text className='text-lg font-supreme' style={{ color: '#A477C7' }}>
                                                {playerStats?.fixture.away_score}
                                            </Text>
                                            <Image resizeMode='contain' style={{ width: 30, height: 30 }} source={playerStats?.fixture.away_team.logo} />

                                            </View>
                                        </View>
                                    </Link>

                                    <View>
                                        <Text className='font-supremeBold text-xl'>Ball Knowledge</Text>
                                    </View>
                                </View>
                                <View className='flex flex-row gap-5 p-5 px-10'>
                                    <View className='p-2 rounded-2xl items-center justify-center ' style={{ flex: 1 }}>
                                        <Text className='font-supremeBold text-2xl'>{stats?.minutes}</Text>
                                        <Text className='font-supremeBold'>Minutes</Text>
                                    </View>
                                    <View className='p-2 rounded-2xl items-center justify-center ' style={{ flex: 1 }}>
                                        <Text className='font-supremeBold text-2xl'>{stats?.goals ? stats?.goals : 0}</Text>
                                        <Text className='font-supremeBold'>Goals</Text>
                                     </View>
                                    <View className='p-2 rounded-2xl items-center justify-center ' style={{ flex: 1 }}>
                                        <Text className='font-supremeBold text-2xl'>{stats?.assists ? stats?.assists : 0}</Text>
                                        <Text className='font-supremeBold'>Assists</Text>
                                    </View>
                                </View>
                                <StatSection title="Attacking">
                                    <StatItem label="Min"   value={playerStats?.minutes} />
                                    <StatItem label="Gls"     value={playerStats?.goals} />
                                    <StatItem label="Ast"   value={playerStats?.assists} />
                                    <StatItem label="SH(OG)"   value={`${playerStats?.shots}(${playerStats?.shots_on_goal})`} />
                                    <StatItem label="Pas" value={`${playerStats?.passes}(${playerStats?.pass_accuracy})`} />
                                    <StatItem label="PA%"      value={`${((playerStats?.pass_accuracy / playerStats?.passes) * 100).toFixed(0)}%`} />
                                    <StatItem label="KP"       value={playerStats?.key_passes} />
                                    <StatItem label="Drb"      value={`${playerStats?.dribbles_successful}/${playerStats?.dribbles_attempted}`} />
                                    <StatItem label="Fld"      value={playerStats?.fouled} />
                                    <StatItem label="Pen" value={`${playerStats?.penalties_scored + playerStats?.penalties_missed}(${playerStats?.penalties_scored})`} />
                                    <StatItem label="PW"       value={playerStats?.penalties_won} />
                                </StatSection>
                                <StatSection title="Defending">
                                    <StatItem label="Tkl"   value={playerStats?.tackles} />
                                    <StatItem label="Blk"   value={playerStats?.blocks} />
                                    <StatItem label="Int"   value={playerStats?.interceptions} />
                                    <StatItem label="Fls"   value={playerStats?.fouls} />
                                    <StatItem label="YC"    value={playerStats?.yellow_cards} />
                                    <StatItem label="RC"    value={playerStats?.red_cards} />
                                    <StatItem label="Dls"   value={`${playerStats?.duels_won}/${playerStats?.duels}`} />
                                    <StatItem label="Dpst"  value={playerStats?.dribbled_past} />
                                    <StatItem label="PC"    value={playerStats?.penalties_conceded} />
                                </StatSection>
                                </View>                                            

                                }/>
                                </View>

                                <RNModal
                                    visible={reactionPicker}
                                    transparent={true}
                                    animationType='fade'
                                    onRequestClose={() => setReactionPicker(false)}
                                >
                                    <TouchableWithoutFeedback onPress={() => setReactionPicker(false)}>
                                        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}>
                                            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                                                <View>
                                                    <ReactionSelector 
                                                        height={400} 
                                                        width={Platform.OS === 'web' ? 600 : 350}
                                                        post_id={stats?.id}
                                                    />
                                                </View>
                                            </TouchableWithoutFeedback>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </RNModal>   

                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </RNModal>
        </View>
    )
}

export default PlayerModal

const styles = StyleSheet.create({
    container: {
        width: Platform.OS === 'web' ? '50%' : '90%',
        height: '85%',
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
})