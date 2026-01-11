import {Modal as RNModal, StyleSheet, Text, View, TouchableWithoutFeedback, Platform, Image, TouchableOpacity } from 'react-native'
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
            console.log(count)
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
            console.log(Object.entries(reactionsObject) )
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

    // Cleanup subscription on unmount
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

        <RNModal visible={isVisible}  onRequestClose={onClose} transparent>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <View style={styles.container}> 
                        {Platform.OS === 'web'? 
            <View className='flex flex-col relative' style={{flex:1}} >

                <Link href={{pathname: '/player/[id]', params:{id: player.player_id}}} asChild style={{position: 'absolute', top: 10, right: 10, zIndex: 10}}>
                    <TouchableOpacity onPress={onClose}>
                        <View className='flex flex-row items-center '>
                                <Text className='font-supremeBold text-sm '> Player Profile </Text>
                                <Ionicons name="person-circle-sharp" size={20} color="black" />
                        </View>
                    </TouchableOpacity>
                </Link>

                <Link href={{pathname: '/fixture/[id]', params:{id: stats.fixture_id}}} asChild style={{position: 'absolute', top: 10, left: 10, zIndex: 10}}>
                    <TouchableOpacity onPress={onClose}>
                        <View className='flex flex-row items-center '>
                                <Text className='font-supremeBold text-sm '> Go to Match </Text>
                        </View>
                    </TouchableOpacity>
                </Link>

            <View className='flex flex-col gap-5 p-10'> 
            <View className='flex flex-col justify-center items-center '>
            
    
             <View className='relative'>
      <Image 
        source={{uri: playerStats?.player.photo}} 
        style={{width: 70, height: 70, borderRadius: 50}}
      />
      
       {playerStats?.rating > 0 && <View className=' rounded-full items-center justify-center 'style={{position: 'absolute', zIndex: 1, padding: 1, top: -4, right:-15, paddingHorizontal: 6,
            backgroundColor: playerStats?.rating > 8.9 ? '#12CCFF' : playerStats?.rating > 6.9 ? '#00F70C' : playerStats?.rating > 5.9 ? '#FF9C00' : 'red',

        }}>
            <Text className='text-center font-supremeBold text-sm text-white'>{parseFloat(playerStats?.rating).toFixed(1)}</Text>
        </View>}

        <View className=' rounded-full items-center justify-center 'style={{position: 'absolute', zIndex: 1, padding: 1, bottom: -4, right:-15, paddingHorizontal: 6}}>
            <Image 
                className='rounded-full' source={{uri:playerStats?.team.logo}} style={{width:25, height:25}}
            />
        </View>
       </View>
            <Text className='text-center font-supreme tracking-tight text-xl' > {player.player_name}</Text>
            </View>
            {!commentsScreen?           
            <View className='flex flex-row justify-center items-center'>
                <View className='flex flex-col items-center gap-2' style={{flex:1}}>
                    <View className='flex flex-row items-center gap-2' >
                    <Image className='rounded-full' source={{ uri: playerStats?.player.flag.flag_url }} style={{width: 30, height: 30}} resizeMode='contain' />
                    <Text className='font-supreme tracking-tight text-lg'>{playerStats?.player.nationality}</Text>
                    </View>
                    <Text className='font-supreme tracking-tight text-sm text-gray-600'>Nationality</Text>
                </View>
                <View className='flex flex-col items-center gap-2' style={{flex:1}}>
                    <Text className='font-supreme tracking-tight text-lg'>{dobtoage(playerStats?.player.DOB)}</Text>
                    <Text className='font-supreme tracking-tight text-sm text-gray-600'>Age</Text>
                </View>
            </View>:
                <View className='flex flex-row justify-center items-center'>
                    <View className='flex flex-col items-center gap-2' style={{flex:1}}>
                        <Text>{playerStats.rating}</Text>
                        <Text>Match Rating</Text>
                    </View>
                    <View className='flex flex-col items-center gap-2' style={{flex:1}}>
                        <Text>{playerStats.goals}</Text>
                        <Text>Goals</Text>
                    </View>
                    <View className='flex flex-col items-center gap-2' style={{flex:1}}>
                        <Text>{playerStats.assist}</Text>
                        <Text>Assists</Text>
                    </View>
           
                    
                 </View>
            }
                <View className='justify-center flex items-center gap-5 flex-row-reverse relative'>
                    <TouchableOpacity className='items-center flex flex-row gap-2 px-5 p-2 rounded-full' style={{borderWidth:1}}
                        onPress={()=>setCommentsScreen(!commentsScreen)}
                    >   
                        { !commentsScreen?
                        <><FontAwesome name="comment" size={20} color="#A477C7" /><Text className='font-supreme'>{stats.comment_count}</Text></>
                        :
                        <><Ionicons name="stats-chart" size={24} color="#A477C7" /> <Text className='font-supreme'>Stats</Text></>
                        }
                    </TouchableOpacity>

                    <TouchableOpacity className="flex flex-row items-center gap-1 " 
                        onPress={()=>setReactionPicker(!reactionPicker)}
                    >
                       {!reactions.some(reaction  => reaction.user_id === session.user.id) 
                       ?
                       <>
                        <Entypo name="emoji-happy" size={24} color="black" /><Text className='text-lg font-supreme'>{reactionCount}</Text><View className='flex flex-row gap-2'>
                            {topReactions.map(reaction => (
                            <Image source={{ uri: `${TWITTER_EMOJI_BASE}${reaction.count.emoji.image}` }} style={{ width: 20, height: 20 }} />
                            ))}
                        </View>
                        </>
                        :
                        <>
                        <View className='flex flex-row gap-2'>
                        {topReactions.map(reaction =>(
                            <Image source={{ uri: `${TWITTER_EMOJI_BASE}${reaction.count.emoji.image}`}} style={{width:20, height:20}}/>
                        ))}
                        </View>                        
                        <Text className='text-lg font-supremeBold ml-3' style={{color:'#A477C7'}}>{reactionCount}</Text>
                        </>
                        }
                    </TouchableOpacity>
                    
                    <RNModal
                        visible={reactionPicker}
                        transparent={true}
                        animationType='fade'
                        onRequestClose={()=>setReactionPicker(false)}
                    >
                        <TouchableWithoutFeedback onPress={()=>setReactionPicker(false)}>
                            <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}>
                                <TouchableWithoutFeedback 
                                className ="rounded-xl bg-white "
                                    style={{}}
                                    onPress={(e) => e.stopPropagation()}>
                                    <ReactionSelector height={400} width={600}
                                    post_id={stats.id}
                                    />
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>

                    </RNModal>
                </View>
            </View>{!commentsScreen ?
            <div style={{ 
                height: '100%',
                overflowY: 'auto',
                width: '100%',
                margin: 'auto',
                padding: '20px',
                gap: '10px'
            }}>
                
                <PlayerStats playerStats={playerStats}/> </div>:
                <Comments post_id={playerStats?.id}/>
                }
           
          </View>
            :
            <View className='flex flex-col  p-10 gap-5'>
            <View className='flex flex-col justify-center items-center gap-5'>
            <Image 
            source={{uri: photo}} 
            style={{width: 100, height: 100, borderRadius: 50}}/>
            <Text className='text-center font-supreme tracking-tight text-xl' > {player.player_name}</Text>
            </View>
            <View className='flex flex-row justify-between items-center'>
                <View className='flex flex-col items-center gap-2'>
                    
                    <Text className='font-supreme tracking-tight text-lg'>{position}</Text>
                    <Text className='font-supreme tracking-tight text-sm'>Position</Text>
                </View>
                <View className='flex flex-col items-center gap-2'>
                    <View className='flex flex-row items-center gap-2'>
                    <Image className='rounded-full' source={{ uri: playerStats?.player.flag.flag_url }} style={{width: 30, height: 30}} resizeMode='contain' />
                    <Text className='font-supreme tracking-tight text-lg'>{playerStats?.player.nationality}</Text>
                    </View>
                    <Text className='font-supreme tracking-tight text-sm'>Nationality</Text>
                </View>
                <View className='flex flex-col items-center gap-2'>
                    <Text className='font-supreme tracking-tight text-lg'>{dobtoage(playerStats?.player.DOB)}</Text>
                    <Text className='font-supreme tracking-tight text-sm'>Age</Text>
                </View>
            </View>
            
            <ScrollView>
                {!commentsScreen ?
                <PlayerStats playerStats={playerStats}/>:
                <Comments post_id={playerStats?.id}/>
                }
            </ScrollView>
          </View>}
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

    container:{


        width: '50%',
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
        // Shadow for Android
        elevation: 5,
        }
})