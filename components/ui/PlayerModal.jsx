import {Modal as RNModal, StyleSheet, Text, View, TouchableWithoutFeedback, Platform, Image, TouchableOpacity, ScrollView } from 'react-native'
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

export const PlayerModal = ({isVisible, onClose, stats, player}) => {
    const {session} = useAuth()
    const [playerStats, setPlayerStats] = useState(null);
    const [commentsScreen, setCommentsScreen] = useState(false)
    const [reactionPicker, setReactionPicker] = useState(false)
    const [topReactions, setTopReactions] = useState([])
    const [reactions, setReactions] = useState([])
    const [reactionCount, setReactionCount] = useState()

    useEffect(()=> {
        const fetchReactionCount = async () => {
            const {data, count, error} = await supabase.from('social_player_reactions').select(`*`, {count: 'exact'}).eq('post_id', stats.id)
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
            .channel(`reactions-${stats.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*', 
                    schema: 'public',
                    table: 'social_player_reactions',
                    filter: `post_id=eq.${stats.id}`
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

    const dobtoage = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age
    }

    if (player.player_id === 0) return null

    return (
        <View>
            <RNModal visible={isVisible} onRequestClose={onClose} transparent>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}>
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <View style={styles.container}> 
                                <View style={{flex: 1, position: 'relative'}}>
                                    {/* Header Links */}
                                    <Link 
                                        href={{pathname: '/player/[id]', params:{id: player.player_id}}} 
                                        asChild 
                                        style={{position: 'absolute', top: 10, right: 10, zIndex: 10}}
                                    >
                                        <TouchableOpacity onPress={onClose}>
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                <Text style={{fontFamily: 'SupremeBold', fontSize: 14}}>Player Profile</Text>
                                                <Ionicons name="person-circle-sharp" size={20} color="black" />
                                            </View>
                                        </TouchableOpacity>
                                    </Link>

                                    <Link 
                                        href={{pathname: '/fixture/[id]', params:{id: stats.fixture_id}}} 
                                        asChild 
                                        style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}
                                    >
                                        <TouchableOpacity onPress={onClose}>
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                <Text style={{fontFamily: 'SupremeBold', fontSize: 14}}>Go to Match</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </Link>

                                    {/* Scrollable Content */}
                                    <ScrollView 
                                        style={{flex: 1}} 
                                        contentContainerStyle={{padding: 40, gap: 20}}
                                        showsVerticalScrollIndicator={true}
                                    >
                                        {/* Player Header */}
                                        <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                                            <View style={{position: 'relative'}}>
                                                <Image 
                                                    source={{uri: playerStats?.player.photo}} 
                                                    style={{width: 70, height: 70, borderRadius: 50}}
                                                />
                                                
                                                {playerStats?.rating > 0 && (
                                                    <View style={{
                                                        position: 'absolute',
                                                        zIndex: 1,
                                                        top: -4,
                                                        right: -15,
                                                        paddingHorizontal: 6,
                                                        paddingVertical: 1,
                                                        borderRadius: 50,
                                                        backgroundColor: playerStats?.rating > 8.9 ? '#12CCFF' 
                                                            : playerStats?.rating > 6.9 ? '#00F70C' 
                                                            : playerStats?.rating > 5.9 ? '#FF9C00' 
                                                            : 'red',
                                                    }}>
                                                        <Text style={{fontFamily: 'SupremeBold', fontSize: 14, color: 'white'}}>
                                                            {parseFloat(playerStats?.rating).toFixed(1)}
                                                        </Text>
                                                    </View>
                                                )}

                                                <View style={{
                                                    position: 'absolute',
                                                    zIndex: 1,
                                                    bottom: -4,
                                                    right: -15,
                                                    paddingHorizontal: 6,
                                                    paddingVertical: 1,
                                                    borderRadius: 50
                                                }}>
                                                    <Image 
                                                        source={{uri: playerStats?.team.logo}} 
                                                        style={{width: 25, height: 25, borderRadius: 50}}
                                                    />
                                                </View>
                                            </View>
                                            <Text style={{fontFamily: 'Supreme', fontSize: 20, textAlign: 'center', marginTop: 10}}>
                                                {player.player_name}
                                            </Text>
                                        </View>

                                        {/* Player Info */}
                                        {!commentsScreen ? (
                                            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <View style={{flex: 1, flexDirection: 'column', alignItems: 'center', gap: 8}}>
                                                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                                                        <Image 
                                                            source={{ uri: playerStats?.player.flag.flag_url }} 
                                                            style={{width: 30, height: 30, borderRadius: 15}} 
                                                            resizeMode='contain' 
                                                        />
                                                        <Text style={{fontFamily: 'Supreme', fontSize: 18}}>
                                                            {playerStats?.player.nationality}
                                                        </Text>
                                                    </View>
                                                    <Text style={{fontFamily: 'Supreme', fontSize: 14, color: '#666'}}>
                                                        Nationality
                                                    </Text>
                                                </View>
                                                <View style={{flex: 1, flexDirection: 'column', alignItems: 'center', gap: 8}}>
                                                    <Text style={{fontFamily: 'Supreme', fontSize: 18}}>
                                                        {dobtoage(playerStats?.player.DOB)}
                                                    </Text>
                                                    <Text style={{fontFamily: 'Supreme', fontSize: 14, color: '#666'}}>
                                                        Age
                                                    </Text>
                                                </View>
                                            </View>
                                        ) : (
                                            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                <View style={{flex: 1, flexDirection: 'column', alignItems: 'center', gap: 8}}>
                                                    <Text>{playerStats.rating}</Text>
                                                    <Text>Match Rating</Text>
                                                </View>
                                                <View style={{flex: 1, flexDirection: 'column', alignItems: 'center', gap: 8}}>
                                                    <Text>{playerStats.goals}</Text>
                                                    <Text>Goals</Text>
                                                </View>
                                                <View style={{flex: 1, flexDirection: 'column', alignItems: 'center', gap: 8}}>
                                                    <Text>{playerStats.assist}</Text>
                                                    <Text>Assists</Text>
                                                </View>
                                            </View>
                                        )}

                                        {/* Action Buttons */}
                                        <View style={{flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 20}}>
                                            <TouchableOpacity 
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    paddingHorizontal: 20,
                                                    paddingVertical: 8,
                                                    borderRadius: 50,
                                                    borderWidth: 1
                                                }}
                                                onPress={() => setCommentsScreen(!commentsScreen)}
                                            >   
                                                {!commentsScreen ? (
                                                    <>
                                                        <FontAwesome name="comment" size={20} color="#A477C7" />
                                                        <Text style={{fontFamily: 'Supreme'}}>{stats.comment_count}</Text>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Ionicons name="stats-chart" size={24} color="#A477C7" />
                                                        <Text style={{fontFamily: 'Supreme'}}>Stats</Text>
                                                    </>
                                                )}
                                            </TouchableOpacity>

                                            <TouchableOpacity 
                                                style={{flexDirection: 'row', alignItems: 'center', gap: 4}}
                                                onPress={() => setReactionPicker(!reactionPicker)}
                                            >
                                                {session !== null && !reactions.some(reaction => reaction.user_id === session.user.id) ? (
                                                    <>
                                                        <Entypo name="emoji-happy" size={24} color="black" />
                                                        <Text style={{fontSize: 18, fontFamily: 'Supreme'}}>{reactionCount}</Text>
                                                        <View style={{flexDirection: 'row', gap: 8}}>
                                                            {topReactions.map((reaction, index) => (
                                                                <Image 
                                                                    key={index}
                                                                    source={{ uri: `${TWITTER_EMOJI_BASE}${reaction.count.emoji.image}` }} 
                                                                    style={{ width: 20, height: 20 }} 
                                                                />
                                                            ))}
                                                        </View>
                                                    </>
                                                ) : (
                                                    <>
                                                        <View style={{flexDirection: 'row', gap: 8}}>
                                                            {topReactions.map((reaction, index) => (
                                                                <Image 
                                                                    key={index}
                                                                    source={{ uri: `${TWITTER_EMOJI_BASE}${reaction.count.emoji.image}`}} 
                                                                    style={{width: 20, height: 20}}
                                                                />
                                                            ))}
                                                        </View>                        
                                                        <Text style={{fontSize: 18, fontFamily: 'SupremeBold', marginLeft: 12, color: '#A477C7'}}>
                                                            {reactionCount}
                                                        </Text>
                                                    </>
                                                )}
                                            </TouchableOpacity>
                                        </View>

                                        {/* Stats or Comments */}
                                        {!commentsScreen ? (
                                            <PlayerStats playerStats={playerStats} />
                                        ) : (
                                            <Comments post_id={playerStats?.id} />
                                        )}
                                    </ScrollView>
                                </View>

                                {/* Reaction Picker Modal */}
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
                                                        post_id={stats.id}
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