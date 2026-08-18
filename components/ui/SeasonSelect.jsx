import { View, Text, Pressable, Modal, FlatList } from 'react-native'
import React, { useState } from 'react'
import Entypo from '@expo/vector-icons/Entypo';

const formatSeason = (season) => `${season}/${season + 1}`

const SeasonSelect = ({seasons, currentSeason, setSeason}) => {
    const [expanded, setExpanded] = useState(false)

    if (!seasons || seasons.length === 0 || !currentSeason) {
        return null
    }

  return (
    <>
    <Pressable
        className='flex flex-row items-center gap-1 bg-white rounded-xl p-2 px-5'
        style={{borderWidth:1, borderColor: '#DBDBDB'}}
        onPress={()=>setExpanded(true)}
    >
        <Text className='font-supreme'>{formatSeason(currentSeason.season)}</Text>
        <Entypo name="chevron-small-down" size={24} color="black" />
    </Pressable>

    <Modal transparent visible={expanded} animationType="fade" onRequestClose={()=>setExpanded(false)}>
        <Pressable style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center'}} onPress={()=>setExpanded(false)}>
            <View className='bg-white rounded-xl' style={{minWidth: 200, maxHeight: '60%', paddingVertical: 8}}>
                <FlatList
                    data={seasons}
                    keyExtractor={(season) => season.id.toString()}
                    renderItem={({item: season}) => (
                        <Pressable
                            className='p-3 px-5'
                            style={season.id === currentSeason.id ? {backgroundColor: '#f3f4f6'} : null}
                            onPress={()=>{
                                setSeason(season)
                                setExpanded(false)
                            }}
                        >
                            <Text className={season.id === currentSeason.id ? 'font-supremeBold' : 'font-supreme'}>
                                {formatSeason(season.season)}
                            </Text>
                        </Pressable>
                    )}
                />
            </View>
        </Pressable>
    </Modal>
    </>
  )
}

export default SeasonSelect
