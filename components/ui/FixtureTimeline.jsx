import { View, Text, Image } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import {PlayerText} from '../ui/PlayerText'
import React, {Fragment, useState, useEffect} from 'react'

export const FixtureTimeline = ({fixture}) => {

    let homeColors = ['#655085', '#FFFFFF'], awayColors = ['#655085', '#FFFFFF']
    if (fixture?.home_team?.colors) {
        homeColors = fixture?.home_team?.colors
    }
    if (fixture?.away_team?.colors) {
        awayColors = fixture?.away_team?.colors
    }
    const [fistHalfevents, setfirstHalfEvents] = useState([])
    const [secondHalfEvents, setsecondHalfEvents] = useState([])
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

    fixture.events.forEach((event, index) => {
        if (event.time_elapsed <= 45 ) {
            firstHalf.push(event)
        } else {
            secondHalf.push(event)
        }
    })

    setfirstHalfEvents(firstHalf)
    setsecondHalfEvents(secondHalf)
    }, [fixture])

    

  return (
    <View className='flex flex-col bg-white rounded-2xl' style={{flex: 1}}>
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
            {fistHalfevents.map((event, index) => {
                    const playerOneStats = fixture.playerStats.find(stat => stat.player_id === event.player_id)
                    const playerTwoStats = fixture.playerStats.find(stat => stat.player_id === event.player2_id)
                    const combinedLineups = [...fixture.lineups[0].starting_lineup, ...fixture.lineups[0].substitutes, ...fixture.lineups[1].starting_lineup, ...fixture.lineups[1].substitutes]
                    const playerOne = combinedLineups.find(player => player.player_id === event.player_id)
                    const playerTwo = combinedLineups.find(player => player.player_id === event.player2_id)
                    return (
                    <>
                    <View key={index} className='flex flex-row items-center gap-3 p-2 px-5' style={{ justifyContent: event.team_id === fixture.home_team.id ? 'flex-start' : 'flex-end' }}>
                        {event.team_id === fixture.home_team.id ?
                            <>                                
                            <View className='relative'>
                                <View className='rounded-full  items-center justify-center p-5' style={{ width: 10, height: 30, backgroundColor: '#E8E8E8' }}>
                                        <Text className='text-lg  font-supremeBold'>{event.time_elapsed}'</Text>
                                        {event.time_extra !== null&&
                                        <View className='rounded-full absolute items-center justify-center p-2 ' style={{ width: 5, height: 10, backgroundColor: '#E8E8E8', bottom: -4 , right: -2 , borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.2)' }}>
                                            <Text className='text-xs  font-supreme'>+{event.time_extra}</Text>
                                            </View>
                                            }
                                </View></View>
                                {event.event_type === 'Goal' && <MaterialIcons name='sports-soccer' size={20}></MaterialIcons>}
                                {event.event_type === 'subst' && 
                                <View className='flex flex-row items-center '>
                                <AntDesign name="arrowdown" size={20} color="red" style={{marginBottom: -10}} />
                                <AntDesign name="arrowup" size={20} color="green" style={{marginLeft: -7, marginTop: -10}} />
                                </View> }
                                {event.event_details === 'Yellow Card' && <View style={{width: 12, height: 15, backgroundColor: '#FCFF36', borderRadius: 2}}/>
                }
                                {event.event_details === 'Red Card' && <View style={{width: 12, height: 15, backgroundColor: 'red', borderRadius: 2}}/>}
                                {event.event_type === 'Var' && <Image source={require('../../assets/images/var.png')} style={{width: 20, height: 20}} resizeMode='contain' />}
                                <View className='flex flex-col  gap-2' style={{ alignItems:'flex-start' }}>
                                     {event.event_type === 'Goal'&&
                                    <>
                                    <PlayerText player={playerOne} stats={playerOneStats} photo={playerOneStats.player.photo}>
                                    <Text className='text-lg text-black font-supreme'>{event.player_name}</Text>
                                    </PlayerText>

                                    {event.player2_name &&
                                    <PlayerText player={playerTwo} stats={playerTwoStats} photo={playerTwoStats.player.photo}>
                                    <Text className=' text-black font-supreme'>{ 'Assist: '}{event.player2_name}</Text>
                                    </PlayerText>}
                                    </>
                                }
                                {event.event_type === 'subst' &&
                                <>
                                <PlayerText player={playerTwo} stats={playerTwoStats} photo={playerTwoStats.player.photo}>
                                <Text style={{color: 'green'}} className='text-lg text-black font-supreme'>{event.player2_name}</Text>
                                </PlayerText>
                                <PlayerText player={playerOne} stats={playerOneStats} photo={playerOneStats.player.photo}>
                                <Text style={{color: 'red'}} className=' text-black font-supreme'>{event.player_name}</Text>
                                </PlayerText>
                                </>
                                }
                                {event.event_type === 'Card' &&
                                <>
                                <PlayerText player={playerOne} stats={playerOneStats} photo={playerOneStats.player.photo}>
                                <Text className='text-lg text-black font-supreme'>{event.player_name}</Text>
                                </PlayerText>
                                <Text className=' text-black font-supreme'>{event.event_details}</Text></>}

                                {event.event_type === 'Var' &&
                                <>
                                <PlayerText player={playerOne} stats={playerOneStats} photo={playerOneStats.player.photo}>
                                <Text className='text-lg text-black font-supreme'>{event.player_name}</Text>
                                </PlayerText>
                                <Text className=' text-black font-supreme ' style={{textTransform: 'capitalize'}}>{event.event_details}</Text></>}
                                </View></>
                        :
                        <><View className='flex flex-col  ' style={{ alignItems: 'flex-end' }}>
                                {event.event_type === 'Goal'&&
                                    <>
                                    <PlayerText player={playerOne} stats={playerOneStats} photo={playerOneStats.player.photo}>
                                    <Text className='text-lg text-black font-supreme'>{event.player_name}</Text>
                                    </PlayerText>

                                    {event.player2_name &&
                                    <PlayerText player={playerTwo} stats={playerTwoStats} photo={playerTwoStats.player.photo}>
                                    <Text className=' text-black font-supreme'>{ 'Assist: '}{event.player2_name}</Text>
                                    </PlayerText>}
                                    </>
                                }
                                {event.event_type === 'subst' &&
                                <>
                                <PlayerText player={playerTwo} stats={playerTwoStats} photo={playerTwoStats.player.photo}>
                                <Text style={{color: 'green'}} className='text-lg text-black font-supreme'>{event.player2_name}</Text>
                                </PlayerText>
                                <PlayerText player={playerOne} stats={playerOneStats} photo={playerOneStats.player.photo}>
                                <Text style={{color: 'red'}} className=' text-black font-supreme'>{event.player_name}</Text>
                                </PlayerText>
                                </>
                                }
                                 {event.event_type === 'Card' &&
                                <>
                                <PlayerText player={playerOne} stats={playerOneStats} photo={playerOneStats.player.photo}>
                                <Text className='text-lg text-black font-supreme'>{event.player_name}</Text>
                                </PlayerText>
                                <Text className=' text-black font-supreme'>{event.event_details}</Text></>}

                                {event.event_type === 'Var' &&
                                <>
                                <PlayerText player={playerOne} stats={playerOneStats} photo={playerOneStats.player.photo}>
                                <Text className='text-lg text-black font-supreme'>{event.player_name}</Text>
                                </PlayerText>
                                <Text className=' text-black font-supreme'>{event.event_details}</Text></>}
                                </View>
                                {event.event_type === 'Goal' && <MaterialIcons name='sports-soccer' size={20}></MaterialIcons>}
                                {event.event_type === 'subst' && 
                                <View className='flex flex-row items-center '>
                                <AntDesign name="arrowdown" size={20} color="red" style={{marginBottom: -10}} />
                                <AntDesign name="arrowup" size={20} color="green" style={{marginLeft: -7, marginTop: -10}} />
                                </View> }
                                {event.event_details === 'Yellow Card' && <View style={{width: 12, height: 15, backgroundColor: '#FCFF36', borderRadius: 2}}/> }
                                {event.event_details === 'Red Card' && <View style={{width: 12, height: 15, backgroundColor: 'red', borderRadius: 2}}/>}
                                <View className='relative'>
                                <View className='rounded-full  items-center justify-center p-5' style={{ width: 10, height: 30, backgroundColor: '#E8E8E8' }}>
                                        <Text className='text-lg  font-supremeBold'>{event.time_elapsed}'</Text>
                                        {event.time_extra !== null&&
                                        <View className='rounded-full absolute items-center justify-center p-2 ' style={{ width: 5, height: 10, backgroundColor: '#E8E8E8', bottom: -4 , right: -2 , borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.2)' }}>
                                            <Text className='text-xs  font-supreme'>+{event.time_extra}</Text>
                                            </View>
                                            }
                                </View></View></>
                            
                    }</View><View className='border-b border-gray-300 w-full'></View></>
                )
                
                
            })}
            <View className='items-center'>
            <Text className='text-lg font-supremeBold py-2'>HALF TIME</Text>
            <View className='border-b border-gray-300 w-full'></View>
            </View>
            {secondHalfEvents.map((event, index) => {
                 const playerOneStats = fixture.playerStats.find(stat => stat.player_id === event.player_id)
                    const playerTwoStats = fixture.playerStats.find(stat => stat.player_id === event.player2_id)
                    const combinedLineups = [...fixture.lineups[0].starting_lineup, ...fixture.lineups[0].substitutes, ...fixture.lineups[1].starting_lineup, ...fixture.lineups[1].substitutes]
                    const playerOne = combinedLineups.find(player => player.player_id === event.player_id)
                    const playerTwo = combinedLineups.find(player => player.player_id === event.player2_id)
                    return (
                    <>
                    <View key={index} className='flex flex-row items-center gap-3 p-2 px-5' style={{ justifyContent: event.team_id === fixture.home_team.id ? 'flex-start' : 'flex-end' }}>
                        {event.team_id === fixture.home_team.id ?
                            <>                                
                            <View className='relative'>
                                <View className='rounded-full  items-center justify-center p-5' style={{ width: 10, height: 30, backgroundColor: '#E8E8E8' }}>
                                        <Text className='text-lg  font-supremeBold'>{event.time_elapsed}'</Text>
                                        {event.time_extra !== null&&
                                        <View className='rounded-full absolute items-center justify-center p-2 ' style={{ width: 5, height: 10, backgroundColor: '#E8E8E8', bottom: -4 , right: -2 , borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.2)' }}>
                                            <Text className='text-xs  font-supreme'>+{event.time_extra}</Text>
                                            </View>
                                            }
                                </View></View>
                                {event.event_type === 'Goal' && <MaterialIcons name='sports-soccer' size={20}></MaterialIcons>}
                                {event.event_type === 'subst' && 
                                <View className='flex flex-row items-center '>
                                <AntDesign name="arrowdown" size={20} color="red" style={{marginBottom: -10}} />
                                <AntDesign name="arrowup" size={20} color="green" style={{marginLeft: -7, marginTop: -10}} />
                                </View> }
                                {event.event_details === 'Yellow Card' && <View style={{width: 12, height: 15, backgroundColor: '#FCFF36', borderRadius: 2}}/>
                }
                                {event.event_details === 'Red Card' && <View style={{width: 12, height: 15, backgroundColor: 'red', borderRadius: 2}}/>}
                                {event.event_type === 'Var' && <Image source={require('../../assets/images/var.png')} style={{width: 20, height: 20}} resizeMode='contain' />}
                                <View className='flex flex-col  gap-2' style={{ alignItems:'flex-start' }}>
                                     {event.event_type === 'Goal'&&
                                    <>
                                    <PlayerText player={playerOne} stats={playerOneStats} photo={playerOneStats.player.photo}>
                                    <Text className='text-lg text-black font-supreme'>{event.player_name}</Text>
                                    </PlayerText>

                                    {event.player2_name &&
                                    <PlayerText player={playerTwo} stats={playerTwoStats} photo={playerTwoStats.player.photo}>
                                    <Text className=' text-black font-supreme'>{ 'Assist: '}{event.player2_name}</Text>
                                    </PlayerText>}
                                    </>
                                }
                                {event.event_type === 'subst' &&
                                <>
                                <PlayerText player={playerTwo} stats={playerTwoStats} photo={playerTwoStats.player.photo}>
                                <Text style={{color: 'green'}} className='text-lg text-black font-supreme'>{event.player2_name}</Text>
                                </PlayerText>
                                <PlayerText player={playerOne} stats={playerOneStats} photo={playerOneStats.player.photo}>
                                <Text style={{color: 'red'}} className=' text-black font-supreme'>{event.player_name}</Text>
                                </PlayerText>
                                </>
                                }
                                {event.event_type === 'Card' &&
                                <>
                                <PlayerText player={playerOne} stats={playerOneStats} photo={playerOneStats.player.photo}>
                                <Text className='text-lg text-black font-supreme'>{event.player_name}</Text>
                                </PlayerText>
                                <Text className=' text-black font-supreme'>{event.event_details}</Text></>}

                                {event.event_type === 'Var' &&
                                <>
                                <PlayerText player={playerOne} stats={playerOneStats} photo={playerOneStats.player.photo}>
                                <Text className='text-lg text-black font-supreme'>{event.player_name}</Text>
                                </PlayerText>
                                <Text className=' text-black font-supreme'  style={{textTransform: 'capitalize'}}>{event.event_details}</Text></>}
                                </View></>
                        :
                        <><View className='flex flex-col  ' style={{ alignItems: 'flex-end' }}>
                                {event.event_type === 'Goal'&&
                                    <>
                                    <PlayerText player={playerOne} stats={playerOneStats} photo={playerOneStats.player.photo}>
                                    <Text className='text-lg text-black font-supreme'>{event.player_name}</Text>
                                    </PlayerText>

                                    {event.player2_name &&
                                    <PlayerText player={playerTwo} stats={playerTwoStats} photo={playerTwoStats.player.photo}>
                                    <Text className=' text-black font-supreme'>{ 'Assist: '}{event.player2_name}</Text>
                                    </PlayerText>}
                                    </>
                                }
                                {event.event_type === 'subst' &&
                                <>
                                <PlayerText player={playerTwo} stats={playerTwoStats} photo={playerTwoStats.player.photo}>
                                <Text style={{color: 'green'}} className='text-lg text-black font-supreme'>{event.player2_name}</Text>
                                </PlayerText>
                                <PlayerText player={playerOne} stats={playerOneStats} photo={playerOneStats.player.photo}>
                                <Text style={{color: 'red'}} className=' text-black font-supreme'>{event.player_name}</Text>
                                </PlayerText>
                                </>
                                }
                                 {event.event_type === 'Card' &&
                                <>
                                <PlayerText player={playerOne} stats={playerOneStats} photo={playerOneStats.player.photo}>
                                <Text className='text-lg text-black font-supreme'>{event.player_name}</Text>
                                </PlayerText>
                                <Text className=' text-black font-supreme'>{event.event_details}</Text></>}

                                {event.event_type === 'Var' &&
                                <>
                                <PlayerText player={playerOne} stats={playerOneStats} photo={playerOneStats.player.photo}>
                                <Text className='text-lg text-black font-supreme'>{event.player_name}</Text>
                                </PlayerText>
                                <Text className=' text-black font-supreme'>{event.event_details}</Text></>}
                                </View>
                                {event.event_type === 'Goal' && <MaterialIcons name='sports-soccer' size={20}></MaterialIcons>}
                                {event.event_type === 'subst' && 
                                <View className='flex flex-row items-center '>
                                <AntDesign name="arrowdown" size={20} color="red" style={{marginBottom: -10}} />
                                <AntDesign name="arrowup" size={20} color="green" style={{marginLeft: -7, marginTop: -10}} />
                                </View> }
                                {event.event_details === 'Yellow Card' && <View style={{width: 12, height: 15, backgroundColor: '#FCFF36', borderRadius: 2}}/> }
                                {event.event_details === 'Red Card' && <View style={{width: 12, height: 15, backgroundColor: 'red', borderRadius: 2}}/>}
                                <View className='relative'>
                                <View className='rounded-full  items-center justify-center p-5' style={{ width: 10, height: 30, backgroundColor: '#E8E8E8' }}>
                                        <Text className='text-lg  font-supremeBold'>{event.time_elapsed}'</Text>
                                        {event.time_extra !== null&&
                                        <View className='rounded-full absolute items-center justify-center p-2 ' style={{ width: 5, height: 10, backgroundColor: '#E8E8E8', bottom: -4 , right: -2 , borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.2)' }}>
                                            <Text className='text-xs  font-supreme'>+{event.time_extra}</Text>
                                            </View>
                                            }
                                </View></View></>
                            
                    }</View><View className='border-b border-gray-300 w-full'></View></>
                )
            })}
           
                       <View className='items-center'>
            <Text className='text-lg font-supremeBold py-2'>FULL TIME</Text>
            </View> 
            </View>
        </View>
             
    </View>
  )
}

export default FixtureTimeline