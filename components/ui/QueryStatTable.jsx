import { FlatList, StyleSheet, Text, View, ScrollView, Image } from 'react-native'
import React from 'react'

export const QueryStatTable = ({stats, queryType, highlightedStat}) => {
     const columnAbbreviationMap = {
     
      'minutes': 'M', 
      'dribbles_successful': 'DR',
      'goals': 'G',  
      'assists': 'A',  
      'penalties_scored': 'PK', 
      'shots': 'SH',
      'shots_on_goal': 'SOT',
      'passes': 'PS',
      'key_passes': 'KP',
      'tackles': 'TK',
      'interceptions': 'INT',
      'blocks': 'BL',
      'duels_won': 'DW',
      'fouls': 'FL',
      'fouled': 'FLD',
      'yellow_cards': 'YC',
      'red_cards': 'RC'
  };

    const formatDate = (date) => {
        const dateObj = new Date(date);
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${month}/${day}/${year}`;
    }
    const renderHeader = () => {
        return (
            <View className='flex flex-row w-full items-center p-3  gap-2'>
                <Text className='font-supreme ' style={{width: 200}}>Name</Text>
                <Text className='font-supreme text-center' style={{width: 150}}>Date</Text>
                <Text className='font-supreme text-center' style={{width: 20}}>M</Text>
                <Text className='font-supreme text-center' style={{width: 70}}>{columnAbbreviationMap[highlightedStat]}</Text>
                <Text className='font-supreme text-center' style={{width: 150}}>Club</Text>
                <Text className='font-supreme text-center' style={{width: 150}}>Opp</Text>
                <Text className='font-supreme text-center' style={{width: 70}}>Min</Text>
                {highlightedStat !== 'Goals' && <Text className='font-supreme text-center' style={{width: 70}} >G</Text>}
               {highlightedStat !== 'Assists' && <Text className='font-supreme  text-center'style={{width: 70}}>A</Text>}
                {highlightedStat !== 'penalties_scored' &&<Text className='font-supreme text-center'style={{width: 70}}>PK</Text>}
                <Text className='font-supreme text-center'style={{width: 70}}>Shots</Text>
                <Text className='font-supreme text-center'style={{width: 70}}>Shots on Target</Text>
                <Text className='font-supreme   text-center'style={{width: 70}}>Passes</Text>
                <Text className='font-supreme text-center'style={{width: 70}}>Key Passes</Text>
                <Text className='font-supreme text-center'style={{width: 70}}>Tackles</Text>
                <Text className='font-supreme text-center'style={{width: 70}}>Interceptions</Text>
                <Text className='font-supreme text-center'style={{width: 70}}>Blocks</Text>
                <Text className='font-supreme text-center'style={{width: 70}}>Duels Won</Text>
                <Text className='font-supreme text-center'style={{width: 70}}>Fouls</Text>
                <Text className='font-supreme text-center'style={{width: 70}}>Fouled</Text>
                <Text className='font-supreme text-center'style={{width: 70}}>Yellow Cards</Text>
                <Text className='font-supreme text-center'style={{width: 70}}>Red Cards</Text>
            </View>
        )
    }
   const renderRow = ({item, index}) => {
        return(
          <><View className='flex flex-row w-full items-center p-3  gap-2' key={index}>
            <View className='flex flex-row items-center gap-2' style={{ width: 200 }}>
              <Text className='font-supreme'>{index + 1}</Text>
              <Image source={{ uri: item.photo }} style={{ width: 30, height: 30 }} className=' rounded-full' />
              <Text className='font-supreme'>{item.transfermarkt_name}</Text>
            </View>
            <Text className='font-supreme text-center' style={{ width: 150 }}>{formatDate(item.date_time_utc)}</Text>
            <Text className='font-supreme text-center' style={{ width: 20 }}>{item.m}</Text>
            <Text className='font-supreme text-center' style={{ width: 70 }}>{item[highlightedStat]}</Text>
            <View className='flex flex-row items-center gap-2' style={{ width: 150 }}>
              <Image source={{ uri: item.player_club_logo }} style={{ width: 30, height: 30 }} className=' rounded-full' />
              <Text className='font-supreme text-center'>{item.player_club_name}</Text>
            </View>
            <Text className='font-supreme text-center' style={{ width: 150 }}>{item.home_club_id === item.player_club_id ? item.away_club_name : item.home_club_name}</Text>
            <Text className='font-supreme text-center' style={{ width: 70 }}>{item.minutes}</Text>
            {highlightedStat !== 'Goals' && <Text className='font-supreme text-center' style={{ width: 70 }}>{item.goals === null ? 0 : item.goals}</Text>}
            {highlightedStat !== 'Assists' && <Text className='font-supreme text-center' style={{ width: 70 }}>{item.assists === null ? 0 : item.assists}</Text>}
            {highlightedStat !== 'penalties_scored' && <Text className='font-supreme text-center' style={{ width: 70 }}>{item.penalties_scored === null ? 0 : item.penalties_scored}</Text>}
            <Text className='font-supreme text-center' style={{ width: 70 }}>{item.shots === null ? 0 : item.shots}</Text>
            <Text className='font-supreme text-center' style={{ width: 70 }}>{item.shots_on_goal === null ? 0 : item.shots_on_goal}</Text>
            <Text className='font-supreme text-center' style={{ width: 70 }}>{item.passes === null ? 0 : item.passes}</Text>
            <Text className='font-supreme text-center' style={{ width: 70 }}>{item.key_passes === null ? 0 : item.key_passes}</Text>
            <Text className='font-supreme text-center' style={{ width: 70 }}>{item.tackles === null ? 0 : item.tackles}</Text>
            <Text className='font-supreme text-center' style={{ width: 70 }}>{item.interceptions === null ? 0 : item.interceptions}</Text>
            <Text className='font-supreme text-center' style={{ width: 70 }}>{item.blocks === null ? 0 : item.blocks}</Text>
            <Text className='font-supreme text-center' style={{ width: 70 }}>{item.duels_won === null ? 0 : item.duels_won}</Text>
            <Text className='font-supreme text-center' style={{ width: 70 }}>{item.fouls === null ? 0 : item.fouls}</Text>
            <Text className='font-supreme text-center' style={{ width: 70 }}>{item.fouled === null ? 0 : item.fouled}</Text>
            <Text className='font-supreme text-center' style={{ width: 70 }}>{item.yellow_cards === null ? 0 : item.yellow_cards}</Text>
            <Text className='font-supreme text-center' style={{ width: 70 }}>{item.red_cards === null ? 0 : item.red_cards}</Text>
          </View><View className='border-b border-gray-300  w-full' /></>
          
        )
    }
  return (
    <View className='rounded-2xl bg-white shadow-xl w-full ' style={{flex: 1}}>
      <ScrollView horizontal={true} >
      <FlatList
      data={stats}
      ListHeaderComponent={renderHeader}
      renderItem={renderRow}
      />
      </ScrollView>
    </View>
  )
}

export default QueryStatTable

