import { View, Text, Image, Platform, Pressable } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import {PlayerText} from '../ui/PlayerText'
import React, {Fragment, useState, useEffect, useMemo} from 'react'
import { isFixtureNotStarted, isFixtureFinished } from '../../lib/matchStatus'
import { supabase } from '../../lib/supabase';
import ReactionSelector from "./ReactionSelector";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAuth } from "../../contexts/AuthContext";

const TWITTER_EMOJI_BASE = "https://cdn.jsdelivr.net/npm/emoji-datasource-twitter/img/twitter/64/";

const MissedPenaltyIcon = ({ size = 20 }) => (
    <View style={{ width: size, height: size, borderRadius: size * 0.3, borderWidth: 1.5, borderColor: '#ef4444', alignItems: 'center', justifyContent: 'center' }}>
        <AntDesign name="close" size={size * 0.6} color="#ef4444" />
    </View>
)

const normalizeLineupPlayers = (lineup) => {
    if (!lineup || !Array.isArray(lineup)) return []
    return lineup.map(entry =>
        entry?.player ? {
            player_id: entry.player.id,
            player_name: entry.player.name,
            number: entry.player.number,
            grid: entry.player.grid,
            position: entry.player.pos,
        } : entry
    )
}

// Statuses (api-football status.long) that mean kickoff has happened and the
// first half is over.
const PAST_HALFTIME_STATUSES = ['Halftime', 'Second Half', 'Break Time', 'Extra Time', 'Penalty In Progress']
// Statuses that mean the 90 minute mark has been reached.
const PAST_FULLTIME_STATUSES = ['Break Time', 'Extra Time', 'Penalty In Progress']
// Statuses/finished states that mean extra time has actually started.
const EXTRA_TIME_STATUSES = ['Extra Time', 'Penalty In Progress']
const EXTRA_TIME_FINISHED_STATUSES = ['Match Finished After Extra Time', 'Match Finished After Penalty']

export const FixtureTimeline = ({fixture}) => {

    let homeColors = ['#655085', '#FFFFFF'], awayColors = ['#655085', '#FFFFFF']
    if (fixture?.home_team?.colors) {
        homeColors = fixture?.home_team?.colors
    }
    if (fixture?.away_team?.colors) {
        awayColors = fixture?.away_team?.colors
    }
    const [firstHalfevents, setfirstHalfEvents] = useState([])
    const [secondHalfEvents, setsecondHalfEvents] = useState([])
    const [extraTimeEvents, setExtraTimeEvents] = useState([])
    const [penaltyShootoutEvents, setPenaltyShootoutEvents] = useState([])
    const [reactions, setReactions] = useState([])
    const [eventReactionID, setEventReactionID] = useState(null)
    const [reactionPicker, setReactionPicker] = useState(false);
    const { session } = useAuth();

    const darkenColor = (hex, percent = .2) => {
  if (!hex) return "#000000";
  hex = hex.replace("#", "");

  let r = parseInt(hex.substring(0,2), 16);
  let g = parseInt(hex.substring(2,4), 16);
  let b = parseInt(hex.substring(4,6), 16);

  r = Math.max(0, r - (r * percent ));
  g = Math.max(0, g - (g * percent ));
  b = Math.max(0, b - (b * percent ));

  return `rgb(${r}, ${g}, ${b})`;
};
    useEffect(() => {
    const firstHalf = []
    const secondHalf = []
    const extraTime = []

    const shootoutEvents = fixture.events
        .filter(e => e.comments === 'Penalty Shootout')
        .sort((a, b) => a.id - b.id)

    const sortedEvents = fixture.events
        .filter(e => e.comments !== 'Penalty Shootout')
        .sort((a, b) => {
            if (a.time_elapsed !== b.time_elapsed) return a.time_elapsed - b.time_elapsed
            return (a.time_extra || 0) - (b.time_extra || 0)
        })

    sortedEvents.forEach((event) => {
        if (event.time_elapsed <= 45 ) {
            firstHalf.push(event)
        } else if (event.time_elapsed <= 90) {
            secondHalf.push(event)
        } else {
            extraTime.push(event)
        }
    })

    setfirstHalfEvents(firstHalf)
    setsecondHalfEvents(secondHalf)
    setExtraTimeEvents(extraTime)
    setPenaltyShootoutEvents(shootoutEvents)
    }, [fixture])

    useEffect(()=>{
        const fetchEventReactions = async ()=>{
            const {data, error} = await supabase.from('social_fixture_event_reactions')
            .select(`*`)
            .eq('fixture_id', fixture.id)

            if(!error){
                setReactions(data)
            }
            else{
                console.log(error)
            }
        }
        fetchEventReactions()
        const channel = supabase
                .channel(`reactions-${fixture?.id}`)
                .on(
                  "postgres_changes",
                  {
                    event: "*",
                    schema: "public",
                    table: "social_fixture_event_reactions",
                    filter: `fixture_id=eq.${fixture?.id}`,
                  },
                  (payload) => {
                    console.log("Reaction change:", payload);
                    fetchEventReactions();
                  },
                )
                .subscribe();
        
              return () => {
                supabase.removeChannel(channel);
              };
            
    })

    const combinedLineups = useMemo(() => {
        if (!fixture?.lineups || fixture.lineups.length < 2) return []
        return [
            ...normalizeLineupPlayers(fixture.lineups[0]?.starting_lineup),
            ...normalizeLineupPlayers(fixture.lineups[0]?.substitutes),
            ...normalizeLineupPlayers(fixture.lineups[1]?.starting_lineup),
            ...normalizeLineupPlayers(fixture.lineups[1]?.substitutes),
        ]
    }, [fixture?.lineups])

    const status = fixture?.match_status
    const notStarted = isFixtureNotStarted(status)
    const finished = isFixtureFinished(status)

    const halfTimeReached = !notStarted && (finished || PAST_HALFTIME_STATUSES.includes(status))
    const fullTimeReached = !notStarted && (finished || PAST_FULLTIME_STATUSES.includes(status))
    const extraTimeReached = extraTimeEvents.length > 0
        || EXTRA_TIME_STATUSES.includes(status)
        || EXTRA_TIME_FINISHED_STATUSES.includes(status)

    const renderEvent = (event, index) => {
        const playerOneStats = fixture.playerStats.find(stat => stat.player_id === event.player_id)
        const playerTwoStats = fixture.playerStats.find(stat => stat.player_id === event.player2_id)
        const playerOne = combinedLineups.find(player => player.player_id === event.player_id)
        const playerTwo = combinedLineups.find(player => player.player_id === event.player2_id)
        
        const eventReactions = reactions.filter(reaction => reaction.fixture_event_id === event.id)

        const reactionsObject = eventReactions?.reduce((acc, val) => {
          const emoji = val.emoji.unified;
          if (!acc[emoji]) {
            acc[emoji] = { emoji: val.emoji, count: 0 };
          }
          acc[emoji].count++;
          return acc;
        }, {});
        const topReacts = reactionsObject && Object.entries(reactionsObject)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([reaction, count]) => ({ reaction, count }));

        return (
        <Fragment key={index}>
        <View className='flex flex-row items-center gap-3 p-2 px-5' style={{ justifyContent: event.team_id === fixture.home_team.id ? 'flex-start' : 'flex-end' }}>
            {event.team_id === fixture.home_team.id ?
                <>
                <View className='relative'>
                   <View style={{ minWidth: 36, height: 36, backgroundColor: '#E8E8E8', borderRadius: 18, alignItems: 'center', justifyContent: 'center',paddingHorizontal: 8}}>
                            <Text className='text-lg  font-supremeBold'>{event.time_elapsed}'</Text>
                            {event.time_extra !== null&&
                    <View style={{ position: 'absolute', bottom: -10, right: -4,backgroundColor: '#D0D0D0', borderRadius: 8,paddingHorizontal: 3, paddingVertical: 1,borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)'}}>
                                <Text className='text-xs  font-supreme'>+{event.time_extra}</Text>
                                </View>
                                }
                    </View></View>
                    {event.event_type === 'Goal' && (event.event_details === 'Missed Penalty' ? <MissedPenaltyIcon size={20} /> : <MaterialIcons name='sports-soccer' size={20}></MaterialIcons>)}
                    {event.event_type === 'subst' &&
                    <View className='flex flex-row items-center '>
                    <AntDesign name="arrow-down" size={20} color="red" style={{marginBottom: -10}} />
                    <AntDesign name="arrow-up" size={20} color="green" style={{marginLeft: -7, marginTop: -10}} />
                    </View> }
                    {event.event_details === 'Yellow Card' && <View style={{width: 12, height: 15, backgroundColor: '#FCFF36', borderRadius: 2}}/>
    }
                    {event.event_details === 'Red Card' && <View style={{width: 12, height: 15, backgroundColor: 'red', borderRadius: 2}}/>}
                    {event.event_type === 'Var' && <Image source={require('../../assets/images/var.png')} style={{width: 20, height: 20}} resizeMode='contain' />}

                    <View className='flex flex-col  gap-2' style={{ alignItems:'flex-start' }}>
                         {event.event_type === 'Goal'&&
                        <>
                        <PlayerText fixture={fixture} player={playerOne} stats={playerOneStats} >
                        <Text className='text-lg text-black font-supreme'>{event.player_name}</Text>
                        </PlayerText>
                        {event.event_details === 'Penalty' &&
                        <Text className=' text-black font-supreme'>Penalty</Text>}

                        {event.player2_name &&
                        <PlayerText fixture={fixture} player={playerTwo} stats={playerTwoStats} >
                        <Text className=' text-black font-supreme'>{ 'Assist: '}{event.player2_name}</Text>
                        </PlayerText>}
                        </>
                    }
                    {event.event_type === 'subst' &&
                    <>
                    <PlayerText fixture={fixture} player={playerTwo} stats={playerTwoStats}>
                    <Text style={{color: 'green'}} className='text-lg text-black font-supreme'>{event.player2_name}</Text>
                    </PlayerText>
                    <PlayerText fixture={fixture} player={playerOne} stats={playerOneStats} >
                    <Text style={{color: 'red'}} className=' text-black font-supreme'>{event.player_name}</Text>
                    </PlayerText>
                    </>
                    }
                    {event.event_type === 'Card' &&
                    <>
                    <PlayerText fixture={fixture} player={playerOne} stats={playerOneStats} >
                    <Text className='text-lg text-black font-supreme'>{event.player_name}</Text>
                    </PlayerText>
                    <Text className=' text-black font-supreme'>{event.event_details}</Text></>}

                    {event.event_type === 'Var' &&
                    <>
                    <PlayerText fixture={fixture} player={playerOne} stats={playerOneStats} >
                    <Text className='text-lg text-black font-supreme'>{event.player_name}</Text>
                    </PlayerText>
                    <Text className=' text-black font-supreme ' style={{textTransform: 'capitalize'}}>{event.event_details}</Text></>}
                    </View></>
            :
            <><View className='flex flex-col  ' style={{ alignItems: 'flex-end' }}>
                    {event.event_type === 'Goal'&&
                        <>
                        <PlayerText fixture={fixture} player={playerOne} stats={playerOneStats}>
                        <Text className='text-lg text-black font-supreme'>{event.player_name}</Text>
                        </PlayerText>
                        {event.event_details === 'Penalty' &&
                        <Text className=' text-black font-supreme'>Penalty</Text>}

                        {event.player2_name &&
                        <PlayerText  fixture={fixture} player={playerTwo} stats={playerTwoStats}>
                        <Text className=' text-black font-supreme'>{ 'Assist: '}{event.player2_name}</Text>
                        </PlayerText>}
                        </>
                    }
                    {event.event_type === 'subst' &&
                    <>
                    <PlayerText fixture={fixture} player={playerTwo} stats={playerTwoStats}>
                    <Text style={{color: 'green'}} className='text-lg text-black font-supreme'>{event.player2_name}</Text>
                    </PlayerText>
                    <PlayerText fixture={fixture} player={playerOne} stats={playerOneStats}>
                    <Text style={{color: 'red'}} className=' text-black font-supreme'>{event.player_name}</Text>
                    </PlayerText>
                    </>
                    }
                     {event.event_type === 'Card' &&
                    <>
                    <PlayerText fixture={fixture} player={playerOne} stats={playerOneStats} >
                    <Text className='text-lg text-black font-supreme'>{event.player_name}</Text>
                    </PlayerText>
                    <Text className=' text-black font-supreme'>{event.event_details}</Text></>}

                    {event.event_type === 'Var' &&
                    <>
                    <PlayerText fixture={fixture} player={playerOne} stats={playerOneStats} >
                    <Text className='text-lg text-black font-supreme'>{event.player_name}</Text>
                    </PlayerText>
                    <Text className=' text-black font-supreme'>{event.event_details}</Text></>}
                    </View>
                    {event.event_type === 'Goal' && (event.event_details === 'Missed Penalty' ? <MissedPenaltyIcon size={20} /> : <MaterialIcons name='sports-soccer' size={20}></MaterialIcons>)}
                    {event.event_type === 'subst' &&
                    <View className='flex flex-row items-center '>
                    <AntDesign name="arrow-down" size={20} color="red" style={{marginBottom: -10}} />
                    <AntDesign name="arrow-up" size={20} color="green" style={{marginLeft: -7, marginTop: -10}} />
                    </View> }
                    {event.event_details === 'Yellow Card' && <View style={{width: 12, height: 15, backgroundColor: '#FCFF36', borderRadius: 2}}/> }
                    {event.event_details === 'Red Card' && <View style={{width: 12, height: 15, backgroundColor: 'red', borderRadius: 2}}/>}
                    <View className='relative'>
                   <View style={{ minWidth: 36, height: 36, backgroundColor: '#E8E8E8', borderRadius: 18, alignItems: 'center', justifyContent: 'center',paddingHorizontal: 8}}>
                            <Text className='text-lg  font-supremeBold'>{event.time_elapsed}'</Text>
                            {event.time_extra !== null&&
                    <View style={{ position: 'absolute', bottom: -10, right: -4,backgroundColor: '#D0D0D0', borderRadius: 8,paddingHorizontal: 3, paddingVertical: 1,borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)'}}>
                                <Text className='text-xs  font-supreme'>+{event.time_extra}</Text>
                                </View>
                                }
                    </View></View></>

        }</View>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 8,
            padding: 8,
            justifyContent: event.team_id === fixture.home_team.id ? 'flex-start' : 'flex-end',
          }}
        >
            {topReacts?.map((reaction, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: '#F0F0F0',
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <Image
                  source={{ uri: `${TWITTER_EMOJI_BASE}${reaction.count.emoji.image}` }}
                  style={{ width: 18, height: 18 }}
                />
                <Text style={{ fontSize: 15, fontFamily: 'Supreme', color: '#333' }}>
                  {reaction.count.count.toLocaleString()}
                </Text>
              </View>
            ))}
            {session && (
              <Pressable
                onPress={() => {
                    setEventReactionID(event.id)
                    setReactionPicker(true)
                }}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: '#F0F0F0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons name="emoticon-plus-outline" size={20} color="#333" />
              </Pressable>
            )}
        </View>
        <View className='border-b border-gray-300 w-full'></View>
        </Fragment>
        )
    }

  return (
    <View className='flex flex-col bg-white rounded-2xl' style={{flex: Platform.OS === 'web' && 1, borderWidth: 1, borderColor: '#E5E5E5'}}>
      <Text className='text-xl text-black font-supremeBold p-5 text-center'>Timeline</Text>
      <View className='flex flex-row items-center justify-between p-2 px-5'>
        <View className='flex flex-row items-center gap-2 p-2 px-5 ' style={{backgroundColor:(homeColors[0]), width: '50%', borderBottomLeftRadius: 10, borderTopLeftRadius: 10}} >
            <Image source={{ uri: fixture.home_team.logo }} style={{width: 30, height: 30}} resizeMode='contain' />
            <Text className='' style={{color: homeColors[0] === '#FFFFFF' ? homeColors[1]: '#ffffff'  }}>{fixture.home_team.club_name}</Text>
        </View>
        <View className='flex flex-row items-center gap-2 p-2 px-5' style={{backgroundColor: darkenColor(awayColors[0]), width: '50%', justifyContent: 'flex-end', borderBottomRightRadius: 10, borderTopRightRadius: 10}}>
            <Image source={{ uri: fixture.away_team.logo }} style={{width: 30, height: 30}} resizeMode='contain' />
            <Text className='' style={{color: awayColors[0] === '#FFFFFF' ? awayColors[1]: '#ffffff'  }}>{fixture.away_team.club_name}</Text>

        </View>
      </View>
        <View className='flex flex-row items-center p-2 px-5'>
            <View className='w-full'>
            {firstHalfevents.map(renderEvent)}
            {halfTimeReached &&
            <View className='items-center'>
            <Text className='text-lg font-supremeBold py-2'>HALF TIME</Text>
            <View className='border-b border-gray-300 w-full'></View>
            </View>
            }
            {secondHalfEvents.map(renderEvent)}
            {fullTimeReached &&
            <View className='items-center'>
            <Text className='text-lg font-supremeBold py-2'>FULL TIME</Text>
            </View>
            }

            {extraTimeReached && (
                <>
                <View className='items-center'>
                <View className='border-b border-gray-300 w-full'></View>
                <Text className='text-lg font-supremeBold py-2'>EXTRA TIME</Text>
                </View>
                {extraTimeEvents.map(renderEvent)}
                </>
            )}

            {penaltyShootoutEvents.length > 0 && (
                <>
                <View className='items-center'>
                <View className='border-b border-gray-300 w-full'></View>
                <Text className='text-lg font-supremeBold py-2'>PENALTY SHOOTOUT</Text>
                </View>
                {(() => {
                    let homeScore = 0
                    let awayScore = 0
                    return penaltyShootoutEvents.map((event, index) => {
                        const isHome = event.team_id === fixture.home_team.id
                        const scored = event.event_details === 'Penalty'
                        if (scored) {
                            if (isHome) homeScore += 1
                            else awayScore += 1
                        }
                        const playerOneStats = fixture.playerStats.find(stat => stat.player_id === event.player_id)
                        const playerOne = combinedLineups.find(player => player.player_id === event.player_id)
                        const iconColor = scored ? '#22c55e' : '#ef4444'
                        const icon = (
                            <View style={{width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: iconColor, alignItems: 'center', justifyContent: 'center'}}>
                                <AntDesign name={scored ? 'check' : 'close'} size={14} color={iconColor} />
                            </View>
                        )
                        const nameWithScore = (
                            <PlayerText fixture={fixture} player={playerOne} stats={playerOneStats}>
                                <Text className='text-lg text-black font-supreme'>{event.player_name} ({homeScore} - {awayScore})</Text>
                            </PlayerText>
                        )
                        return (
                            <View key={event.id ?? index} className='flex flex-row items-center gap-3 p-2 px-5' style={{ justifyContent: isHome ? 'flex-start' : 'flex-end' }}>
                                {isHome ? (<>{nameWithScore}{icon}</>) : (<>{icon}{nameWithScore}</>)}
                            </View>
                        )
                    })
                })()}
                </>
            )}

            </View>
        </View>
            <ReactionSelector
                visible={reactionPicker}
                 onClose={() => setReactionPicker(false)}
                height={Platform.OS === "web" ? 400 : 600}
                width={Platform.OS === "web" ?400 : undefined}
                table="social_fixture_event_reactions"
                filters={{ fixture_id: fixture?.id, fixture_event_id: eventReactionID}}
            />
    </View>
    
  )
}

export default FixtureTimeline
