import { Text, View, ScrollView, Image } from 'react-native'
import React from 'react'
import { getStatLabel, getStatValue, isRatingStat, getRatingColor } from '@/constants/statLabels'

export const QueryStatTable = ({results, highlightedStat}) => {

const highlightedStatLabel = getStatLabel(highlightedStat);
const showDate = results.some(item => item.date_time_utc != null);
const showOpponent = results.some(item => item.home_team != null || item.away_team != null);
const showSeason = results.some(item => item.season != null);
const showCompetition = results.some(item => item.league_name != null);
const highlightedIsRating = isRatingStat(highlightedStat);

    const formatDate = (date) => {
        const dateObj = new Date(date);
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${month}/${day}/${year}`;
    }
    const formatSeason = (season) => `${season}/${String(parseInt(season) + 1).slice(-2)}`
    const renderHeader = () => {
      return (
          <View className='flex flex-row w-full items-center p-3 gap-2'>
              <Text className='font-supreme' style={{width: 200}}>Name</Text>
              {showSeason && <Text className='font-supreme text-center uppercase' style={{width: 100}}>Season</Text>}
              {showDate && <Text className='font-supreme text-center uppercase' style={{width: 150}}>Date</Text>}
              {showCompetition && <Text className='font-supreme text-center uppercase' style={{width: 150}}>Competition</Text>}
              <Text className='font-supreme text-center uppercase font-bold text-purple-500' style={{width: 70}}>{highlightedStatLabel}</Text>
              <Text className='font-supreme text-center uppercase' style={{width: 150}}>Club</Text>
              {showOpponent && <Text className='font-supreme text-center uppercase' style={{width: 150}}>Opp</Text>}
              {highlightedStat !== 'minutes' && <Text className='font-supreme text-center uppercase' style={{width: 70}}>Min</Text>}
              {highlightedStat !== 'goals' && <Text className='font-supreme text-center uppercase' style={{width: 70}}>Gls</Text>}
              {highlightedStat !== 'assists' && <Text className='font-supreme text-center uppercase' style={{width: 70}}>Ast</Text>}
              {highlightedStat !== 'penalties_scored' && <Text className='font-supreme text-center uppercase' style={{width: 70}}>Pen</Text>}
              {highlightedStat !== 'shots' && <Text className='font-supreme text-center uppercase' style={{width: 70}}>SH(OG)</Text>}
              {highlightedStat !== 'passes' && <Text className='font-supreme text-center uppercase' style={{width: 70}}>Pas</Text>}
              {highlightedStat !== 'key_passes' && <Text className='font-supreme text-center uppercase' style={{width: 70}}>KP</Text>}
              {highlightedStat !== 'dribbles_successful' && <Text className='font-supreme text-center uppercase' style={{width: 70}}>Drb</Text>}
              {highlightedStat !== 'tackles' && <Text className='font-supreme text-center uppercase' style={{width: 70}}>Tkl</Text>}
              {highlightedStat !== 'interceptions' && <Text className='font-supreme text-center uppercase' style={{width: 70}}>Int</Text>}
              {highlightedStat !== 'blocks' && <Text className='font-supreme text-center uppercase' style={{width: 70}}>Blk</Text>}
              {highlightedStat !== 'duels_won' && <Text className='font-supreme text-center uppercase' style={{width: 70}}>Dls</Text>}
              {highlightedStat !== 'fouls' && <Text className='font-supreme text-center uppercase' style={{width: 70}}>Fls</Text>}
              {highlightedStat !== 'fouled' && <Text className='font-supreme text-center uppercase' style={{width: 70}}>Fld</Text>}
              {highlightedStat !== 'yellow_cards' && <Text className='font-supreme text-center uppercase' style={{width: 70}}>YC</Text>}
              {highlightedStat !== 'red_cards' && <Text className='font-supreme text-center uppercase' style={{width: 70}}>RC</Text>}
          </View>
      )
  }
   const renderRow = ({item, index}) => {
        return(
          <React.Fragment key={index}><View className='flex flex-row w-full items-center p-3  gap-2'>
            <View className='flex flex-row items-center gap-2' style={{ width: 200 }}>
              <Text className='font-supreme'>{index + 1}</Text>
              <Image source={{ uri: item.photo }} style={{ width: 30, height: 30 }} className=' rounded-full' />
              <Text className='font-supreme'>{item.transfermarkt_name}</Text>
            </View>
            {showSeason && <Text className='font-supreme text-center' style={{ width: 100 }}>{formatSeason(item.season)}</Text>}
            {showDate && <Text className='font-supreme text-center' style={{ width: 150 }}>{formatDate(item.date_time_utc)}</Text>}
            {showCompetition &&
              <View className='flex flex-row items-center justify-center gap-2' style={{ width: 150 }}>
                {item.league_logo && <Image source={{ uri: item.league_logo }} resizeMode='contain' style={{ width: 20, height: 20 }} />}
                <Text className='font-supreme text-center' numberOfLines={1}>{item.league_name}</Text>
              </View>}
            <View style={{ width: 70, alignItems: 'center' }}>
              {highlightedIsRating ?
                <View style={{ backgroundColor: getRatingColor(getStatValue(item, highlightedStat)), borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, minWidth: 46, alignItems: 'center' }}>
                  <Text className='font-supremeBold text-white'>{getStatValue(item, highlightedStat) ?? '-'}</Text>
                </View>
                :
                <Text className='font-supreme text-center'>{getStatValue(item, highlightedStat)}</Text>}
            </View>
            <View className='flex flex-row items-center justify-center gap-2' style={{ width: 150 }}>
              <Image source={{ uri: item.club_logo}} resizeMode='contain' style={{ width: 25, height:25 }} />
              <Text className='font-supreme text-center'>{item.club_name}</Text>
            </View>
            {showOpponent && <View className='flex flex-row items-center justify-center gap-2' style={{ width: 150 }}>
                <Image source={{uri: item.home_team === item.club_name ? item.away_team_logo : item.home_team_logo}} resizeMode='contain' style={{ width: 25, height: 25 }}  />
                <Text>{item.home_team === item.club_name ? item.away_team : item.home_team}</Text>
            </View>}
            {highlightedStat !== 'minutes' && <Text className='font-supreme text-center' style={{ width: 70 }}>{item.minutes}</Text>}
            {highlightedStat !== 'goals' && <Text className='font-supreme text-center' style={{ width: 70 }}>{item.goals === null ? 0 : item.goals}</Text>}
            {highlightedStat !== 'assists' && <Text className='font-supreme text-center' style={{ width: 70 }}>{item.assists === null ? 0 : item.assists}</Text>}
            {highlightedStat !== 'penalties_scored' && <Text className='font-supreme text-center' style={{ width: 70 }}>{item.penalties_scored === null ? 0 : item.penalties_scored}</Text>}
            {highlightedStat !== 'shots' && <Text className='font-supreme text-center' style={{ width: 70 }}>{`${item.shots ?? 0}(${item.shots_on_goal ?? 0})`}</Text>}
            {highlightedStat !== 'passes' && <Text className='font-supreme text-center' style={{ width: 70 }}>{item.passes === null ? 0 : item.passes}</Text>}
            {highlightedStat !== 'key_passes' && <Text className='font-supreme text-center' style={{ width: 70 }}>{item.key_passes === null ? 0 : item.key_passes}</Text>}
            {highlightedStat !== 'dribbles_successful' && <Text className='font-supreme text-center' style={{ width: 70 }}>{item.dribbles_successful === null ? 0 : item.dribbles_successful}</Text>}
            {highlightedStat !== 'tackles' && <Text className='font-supreme text-center' style={{ width: 70 }}>{item.tackles === null ? 0 : item.tackles}</Text>}
            {highlightedStat !== 'interceptions' && <Text className='font-supreme text-center' style={{ width: 70 }}>{item.interceptions === null ? 0 : item.interceptions}</Text>}
            {highlightedStat !== 'blocks' && <Text className='font-supreme text-center' style={{ width: 70 }}>{item.blocks === null ? 0 : item.blocks}</Text>}
            {highlightedStat !== 'duels_won' && <Text className='font-supreme text-center' style={{ width: 70 }}>{item.duels_won === null ? 0 : item.duels_won}</Text>}
            {highlightedStat !== 'fouls' && <Text className='font-supreme text-center' style={{ width: 70 }}>{item.fouls === null ? 0 : item.fouls}</Text>}
            {highlightedStat !== 'fouled' && <Text className='font-supreme text-center' style={{ width: 70 }}>{item.fouled === null ? 0 : item.fouled}</Text>}
            {highlightedStat !== 'yellow_cards' && <Text className='font-supreme text-center' style={{ width: 70 }}>{item.yellow_cards === null ? 0 : item.yellow_cards}</Text>}
            {highlightedStat !== 'red_cards' && <Text className='font-supreme text-center' style={{ width: 70 }}>{item.red_cards === null ? 0 : item.red_cards}</Text>}
          </View><View className='border-b border-gray-300  w-full' /></React.Fragment>

        )
    }
  return (
    <View className='rounded-2xl bg-white shadow-sm p-5  '>
      <ScrollView horizontal={true}>
        <View>
          {renderHeader()}
          {results.map((item, index) => renderRow({ item, index }))}
        </View>
      </ScrollView>
    </View>
  )
}

export default QueryStatTable

