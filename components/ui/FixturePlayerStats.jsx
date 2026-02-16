import { View, Text, Image, TouchableOpacity, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import _ from 'lodash';
import { Ionicons } from '@expo/vector-icons';

import { FlashList } from '@shopify/flash-list'

const FixturePlayerStats = ({fixture}) => {
    const [section, setSection] = useState('Top Stats')
    const [direction , setDirection] = useState(null);
    const [selectedColumn, setSelectedColumn] = useState('rating');
    const [playerStats , setPlayerStats] = useState(null)

    const sections = ['Top Stats', 'Attacking', 'Defending', 'Duels']

    useEffect(()=>{
        if(fixture){
            const stats = fixture.playerStats.filter(player => player.minutes)
            .sort((a,b)=>b.rating - a.rating); 
        setPlayerStats(stats.map(obj =>
            Object.fromEntries(
              Object.entries(obj).map(([key, value]) => [
                key,
                value === null ? 0 : value
              ])
            )
          ))
        setSelectedColumn('rating')
        setDirection('desc')
    }
        
    },[fixture])

    useEffect(()=>{
        // Reset sort to rating descending when section changes
        if(playerStats){
            const sorted = _.orderBy(playerStats, ['rating'], ['desc'])
            setPlayerStats(sorted)
            setSelectedColumn('rating')
            setDirection('desc')
        }
    },[section])
    const renderHeader = () => {
        return (
            <><View className ='flex flex-row p-5 px-10 gap-10'>
                {sections.map(currentSection=>(
                    <Pressable className='p-2 px-7 rounded-full ' style={{borderColor:'#DBDBDB', borderWidth: 1 , backgroundColor: section === currentSection && 'black'}} onPress={()=>setSection(currentSection)}>
                        <Text className='font-supreme' style={{color: section === currentSection && 'white'}}>
                            {currentSection}
                        </Text>
                    </Pressable>
                ))}
            </View>
            <View className='flex flex-row w-full items-center p-7  gap-2'>
                    <View style={{ flex: 2 }}></View>
                    {section === 'Top Stats' &&
                        <>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 0.4 }}>
                                <TouchableOpacity
                                    onPress={() => handleSort('rating')}
                                >
                                    <Text numberOfLines={2} className='font-supreme text-center'>Rating</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'rating' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}

                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity
                                    onPress={() => handleSort('minutes')}
                                >
                                    <Text numberOfLines={2} className='font-supreme text-center'>Minutes</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'minutes' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}

                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity
                                    onPress={() => handleSort('goals')}
                                >
                                    <Text numberOfLines={2} className='font-supreme text-center'>Goals</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'goals' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}

                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center ' style={{ flex: 1 }}>
                                <TouchableOpacity
                                    onPress={() => handleSort('assists')}
                                >
                                    <Text numberOfLines={2} className='font-supreme text-center'>Assists</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'assists' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}

                            </View>

                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity
                                    onPress={() => handleSort('shots_on_goal')}
                                >
                                    <Text numberOfLines={2} className='font-supreme text-center'>Shots on Target</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'shots_on_goal' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}

                            </View>
                        </>}

                        {section === 'Attacking' &&
                        <>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 0.4 }}>
                                <TouchableOpacity onPress={() => handleSort('rating')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Rating</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'rating' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => handleSort('goals')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Goals</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'goals' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => handleSort('penalties_scored')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Penalties Scored</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'penalties_scored' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => handleSort('assists')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Assists</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'assists' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => handleSort('shots')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Total Shots</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'shots' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => handleSort('shots_on_goal')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Shots on Target</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'shots_on_goal' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => handleSort('dribbles_successful')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Successful Dribbles</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'dribbles_successful' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => handleSort('passes')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Accurate Passes</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'passes' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => handleSort('key_passes')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Key Passes</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'key_passes' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                        </>}
                    {section === 'Defending' &&
                        <>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 0.4 }}>
                                <TouchableOpacity onPress={() => handleSort('rating')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Rating</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'rating' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => handleSort('tackles')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Tackles</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'tackles' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => handleSort('interceptions')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Interceptions</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'interceptions' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => handleSort('blocks')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Blocks</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'blocks' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => handleSort('dribbled_past')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Dribbled Past</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'dribbled_past' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                        </>}

                    {section === 'Duels' &&
                        <>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 0.4 }}>
                                <TouchableOpacity onPress={() => handleSort('rating')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Rating</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'rating' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => handleSort('duels_won')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Duels Won</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'duels_won' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => handleSort('duels')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Duels Lost</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'duels' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => handleSort('fouls')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Fouls Commited</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'fouls' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => handleSort('fouled')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Was Fouled</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'fouled' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => handleSort('dribbles_successful')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Successful Dribbles</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'dribbles_successful' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                            <View className='flex flex-row items-center gap-2 justify-center' style={{ flex: 1 }}>
                                <TouchableOpacity onPress={() => handleSort('tackles')}>
                                    <Text numberOfLines={2} className='font-supreme text-center'>Tackles</Text>
                                </TouchableOpacity>
                                {selectedColumn === 'tackles' ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                            </View>
                        </>}

                </View></>
        )
    } 
    
    const renderPlayer =({item})=>(

        <><View className='flex flex-row w-full items-center px-3 p-1  gap-2'>
            <View className='flex flex-row gap-5 items-center' style={{ flex: 2 }}>
                <View className='relative'>
                    <Image className='rounded-full' source={{ uri: item.player.photo }} resizeMode='cover' style={{ width: 40, height: 40 }} />
                    <Image className='rounded-full absolute bottom-0 -right-1' source={{ uri: item.team.logo }} resizeMode='cover' style={{ width: 15, height: 15 }} />
                </View>
                <Text>{item.player_name}</Text>
            </View>
            {section === 'Top Stats' &&
                <>

                    <View style={{ flex: 0.4 }}>
                    <View className=' rounded-full items-center justify-center 'style={{paddingHorizontal: 2,
            backgroundColor: item.rating > 8.9 ? '#12CCFF' : item.rating > 6.9 ? '#00F70C' : item.rating > 5.9 ? '#FF9C00' : 'red',

        }}>
            <Text className='text-center font-supremeBold text-sm text-white'>{parseFloat(item.rating).toFixed(1)}</Text>
        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>
                            {item.minutes}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>{item.goals || 0}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>{item.assists || 0}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>{item.shots_on_goal || 0}</Text>
                    </View>
                </>}

            {section === 'Attacking'&&
                <>
                    <View style={{ flex: 0.4 }}>
                    <View className=' rounded-full items-center justify-center 'style={{paddingHorizontal: 2,
            backgroundColor: item.rating > 8.9 ? '#12CCFF' : item.rating > 6.9 ? '#00F70C' : item.rating > 5.9 ? '#FF9C00' : 'red',

        }}>
            <Text className='text-center font-supremeBold text-sm text-white'>{parseFloat(item.rating).toFixed(1)}</Text>
        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>
                            {item.goals ||0 }
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>{item.penalties_scored || 0}</Text>
                    </View>
                    
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>{item.assists || 0}</Text>
                    </View>
                    
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>{item.shots || 0}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>{item.shots_on_goal || 0}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>{item.dribbles_successful || 0}</Text>
                    </View>
                    
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>{`${item.passes || 0}(${item.pass_accuracy})`}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>{item.key_passes|| 0}</Text>
                    </View>
                </>
            }
            {section === 'Defending' &&
            <>
            <View style={{ flex: 0.4 }}>
                    <View className=' rounded-full items-center justify-center 'style={{paddingHorizontal: 2,
            backgroundColor: item.rating > 8.9 ? '#12CCFF' : item.rating > 6.9 ? '#00F70C' : item.rating > 5.9 ? '#FF9C00' : 'red',

        }}>
            <Text className='text-center font-supremeBold text-sm text-white'>{parseFloat(item.rating).toFixed(1)}</Text>
        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>
                            {item.tackles || 0}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>{item.interceptions || 0}</Text>
                    </View>
                    
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>{item.blocks || 0}</Text>
                    </View>
                    
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>{item.dribbled_past || 0}</Text>
                    </View>
            </>
            
            }
            {section === 'Duels' &&
            <>
            <View style={{ flex: 0.4 }}>
                    <View className=' rounded-full items-center justify-center 'style={{paddingHorizontal: 2,
            backgroundColor: item.rating > 8.9 ? '#12CCFF' : item.rating > 6.9 ? '#00F70C' : item.rating > 5.9 ? '#FF9C00' : 'red',

        }}>
            <Text className='text-center font-supremeBold text-sm text-white'>{parseFloat(item.rating).toFixed(1)}</Text>
        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>
                            {item.duels_won}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>{(item.duels || 0) - (item.duels_won) || 0}</Text>
                    </View>
                    
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>{item.fouls || 0}</Text>
                    </View>
                    
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>{item.fouled || 0}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>{item.dribbles_successful || 0}</Text>
                    </View> 
                    <View style={{ flex: 1 }}>
                        <Text className='text-center font-supreme'>{item.tackles || 0}</Text>
                    </View>
                    
            </>
            }


        </View><View className='border-b border-gray-300  w-full' /></>

    )

    const handleSort = (column) =>{
        const newDirection = direction === 'desc' ? 'asc' : 'desc'
        const sorted = _.orderBy(playerStats, [column], [newDirection])
        setPlayerStats(sorted)
        setDirection(newDirection)
        setSelectedColumn(column)
    }
  return (
    <View className='bg-white rounded-xl '>
      <Text className='p-5 font-supremeBold text-xl text-center'>Player Stats</Text>
      <FlashList
        ListHeaderComponent={renderHeader}
        renderItem={renderPlayer}
        data={playerStats}
        scrollEnabled
    />

    
    </View>
  )
}

export default FixturePlayerStats