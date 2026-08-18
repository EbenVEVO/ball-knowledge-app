import { View, Text, Image, Platform } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { Link } from 'expo-router'
import { FlashList } from '@shopify/flash-list'
import { Tabs } from 'react-native-collapsible-tab-view'

const List = Platform.OS === 'web' ? FlashList : Tabs.FlatList

const FixtureHeadToHead = ({fixture}) => {
    let homeColors = ['#655085', '#FFFFFF'], awayColors = ['#655085', '#FFFFFF']
    if (fixture?.home_team?.colors) {
        homeColors = fixture?.home_team?.colors
    }
    if (fixture?.away_team?.colors) {
        awayColors = fixture?.away_team?.colors
    }
    const [fixtures, setFixtures] = useState([])

    useEffect(()=>{
        if (!fixture?.home_team_id || !fixture?.away_team_id) return
        const fetchHeadToHead = async()=>{
            const homeId = fixture.home_team_id
            const awayId = fixture.away_team_id
            const {data, error} = await supabase.from('fixtures').select(`*,
                home_team:clubs!home_team_id (id, club_name, logo, colors),
                away_team:clubs!away_team_id (id, club_name, logo, colors),
                competition:competitions!league_id (id, name, logo)`)
            .or(`and(home_team_id.eq.${homeId},away_team_id.eq.${awayId}),and(home_team_id.eq.${awayId},away_team_id.eq.${homeId})`)
            .eq('match_status', 'Match Finished')
            .order('date_time_utc', {ascending:false})
            if(error) console.error(error)
            if(data) setFixtures(data)
        }
        fetchHeadToHead()
    },[fixture])

    const getWins = (id) =>{
        if (!id) return fixtures.filter(f=>f.home_score === f.away_score).length
        return fixtures.filter(f => (((f.home_team_id === id) && f.home_score > f.away_score) || ((f.away_team_id === id) && f.home_score < f.away_score))).length
    }

    const FixtureRow = ({ item, formatDate, formatTime }) => {
      const [rowWidth, setRowWidth] = useState(0)
    
      const logoSize = rowWidth ? Math.max(22, Math.min(48, rowWidth * 0.075)) : Platform.select({ web: 40, default: 30 })
      const teamWidth = rowWidth ? Math.max(80, (rowWidth - 40 - 140) / 2) : Platform.select({ web: 200, default: 140 })
      const fontSize = rowWidth ? Math.max(11, Math.min(20, rowWidth * 0.038)) : 18
      const resultFontSize = rowWidth ? Math.max(10, Math.min(16, rowWidth * 0.030)) : 14
    
      return (
        <Link href={{ pathname: '/fixture/[id]', params: { id: item.id } }}>
          <View className='flex flex-col p-5 px-5' onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}>
            <View className='flex flex-row items-center justify-between w-full'>
              <Text className='text-sm font-supreme'>{formatDate(item?.date_time_utc)}</Text>
              <View className='flex flex-row items-center gap-2'>
                <Image source={{ uri: item.competition.logo }} style={{ width: 15, height: 15 }} resizeMode='contain' />
                <Text className='text-sm font-supreme'>{item.competition.name}</Text>
              </View>
            </View>
    
            <View className='flex flex-row items-center justify-center gap-5'>
              <View className='flex flex-row items-center gap-2' style={{ width: teamWidth, justifyContent: 'flex-end' }}>
                <Text style={{ fontFamily: 'Supreme', fontSize, textAlign: 'right' }} numberOfLines={2} adjustsFontSizeToFit>
                  {item.home_team.club_name}
                </Text>
                <Image source={{ uri: item.home_team.logo }} style={{ width: logoSize, height: logoSize }} resizeMode='contain' />
              </View>
    
              {item.match_status === 'Match Finished' ? (
                <View className='p-2 px-5 rounded-full justify-center' >
                  <Text style={{ fontFamily: 'SupremeBold', fontSize: resultFontSize}}>{`${item.home_score} - ${item.away_score}`}</Text>
                </View>
              ) : (
                <View className='p-2 px-1 justify-center'>
                  <Text style={{ fontFamily: 'SupremeBold', fontSize: resultFontSize, color: 'black' }}>{formatTime(item.date_time_utc)}</Text>
                </View>
              )}
    
              <View className='flex flex-row items-center gap-2 p-2' style={{ width: teamWidth, justifyContent: 'flex-start' }}>
                <Image source={{ uri: item.away_team.logo }} style={{ width: logoSize, height: logoSize }} resizeMode='contain' />
                <Text style={{ fontFamily: 'Supreme', fontSize, textAlign: 'center' }} numberOfLines={2} adjustsFontSizeToFit>
                  {item.away_team.club_name}
                </Text>
              </View>
            </View>
          </View>
        </Link>
      )
    }
    const formatDate = (date) => {
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      return new Date(date).toLocaleDateString('en-US', options);
    }

    const formatTime = (date) => {
        const options = { hour: 'numeric', minute: '2-digit' , hour12: true};
        return new Date(date).toLocaleTimeString('en-US', options);
    }

    const renderFixture = useCallback(({item}) => (
        <FixtureRow
            item={item}
            formatDate={formatDate}
            formatTime={formatTime}
        />
    ), [formatDate, formatTime])

  return (
    <View className='p-2 bg-white' style={{ borderWidth: 1, borderColor: '#E5E5E5' }}>

        <View className='flex flex-row justify-between p-10' >
            <View className='flex flex-row gap-5 items-center'>
                <Image source={{uri: fixture?.home_team.logo}} style={{width:100, height:100}} resizeMode='contain'/>
                <View className='flex gap-3 items-center '>
                    <View className='p-3 px-10 rounded-full justify-center' style={{backgroundColor: homeColors[0]}}>
                        <Text className='text-white font-supremeBold text-2xl'>{getWins(fixture?.home_team_id)}</Text>
                    </View>
                    <Text className='font-supreme  text-xl'>Wins</Text>
                </View>
            </View>
            <View className='flex flex-row'>
                <View className='flex gap-3 items-center '>
                    <View className='p-3 px-10 rounded-full justify-center' style={{backgroundColor:'#6b7280'}}>
                        <Text className='text-white font-supremeBold text-2xl'>{getWins()}</Text>
                    </View>
                    <Text className='font-supreme  text-xl'>Draws</Text>
                </View>
            </View>
            <View className='flex flex-row gap-5 items-center'>
                
                <View className='flex gap-3 items-center '>
                    <View className='p-3 px-10 rounded-full justify-center' style={{backgroundColor: awayColors[0]}}>
                        <Text className='text-white font-supremeBold text-2xl'>{getWins(fixture?.away_team_id)}</Text>
                    </View>
                    <Text className='font-supreme  text-xl'>Wins</Text>
                </View>
                <Image source={{uri: fixture?.away_team.logo}} style={{width:100, height:100}} resizeMode='contain'/>
            </View>
            
        </View>
        <List
            style={{flex:1}}
            data={fixtures}
            contentContainerStyle={{ flexGrow: 1 }}
            renderItem={renderFixture}
            keyExtractor={(item, idx) => idx.toString()}
        />
    </View>
  )
}

export default FixtureHeadToHead