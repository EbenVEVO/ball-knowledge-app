import { StyleSheet, Text, View, Image, ScrollView, Pressable } from 'react-native'
import React from 'react'

export const StatsCard = ({playerData, colors}) => {
  const columns = [
    { key: 'rank', label: '', width: 40 },
    { key: 'photo', label: '', width: 60 },
    { key: 'name', label: 'NAME', width: 120 },
    { key: 'season', label: 'SEASON', width: 80 },
    { key: 'club', label: 'CLUB', width: 120 },
    { key: 'matches', label: 'M', width: 40 },
    { key: 'minutes', label: 'MIN', width: 60 },
    { key: 'starts', label: 'START', width: 60 },
    { key: 'goals', label: 'G', width: 40 },
    { key: 'ownGoals', label: 'O/M', width: 50 },
    { key: 'goalRatio', label: 'G/M', width: 50 },
    { key: 'assists', label: 'A', width: 40 },
    { key: 'goalAssist', label: 'G+A', width: 50 },
    { key: 'penalties', label: 'PK', width: 40 },
    { key: 'penaltiesMissed', label: 'FK', width: 40 },
    { key: 'shots', label: 'SH', width: 40 },
    { key: 'shotsOnTarget', label: 'SOT', width: 50 },
    { key: 'woodwork', label: 'WOOD', width: 60 }
  ];    

  colors = [{
    color: '#FF0000',
    backgroundColor: '#FF0000'
  },

]
   const renderTableHeader = () => {
    return( 
      <View className='flex flex-row bg-gray-900 border-b-2 border-gray-300 py-3'>
        {columns.map((column, index) => (
          <View
            key={index}
            style={{ width: column.width }}
            className="flex items-center justify-center px-1"
          >
            <Text className="text-xs font-semibold text-gray-600 text-center uppercase tracking-wide">
              {column.label}
            </Text>
          </View>
        ))}
      </View>
    )
  };
  
  const renderRow = (item, index) => {
    return(
      <View 
        key={index} 
        className={`flex flex-row items-center py-2 border-b  min-h-12 ${
          index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-900'
        }`}
      >
        {/* Rank */}
        <View style={{ width: columns[0].width }} className="flex items-center justify-center px-1">
          <Text className="text-sm font-medium text-white">{item.rank}</Text>
        </View>

        {/* Photo */}
        <View style={{ width: columns[1].width }} className="flex items-center justify-center px-1">
          <Image 
            source={{ uri: item.photo }} 
            style={{ width: 32, height: 32, borderRadius: 16 }}
            className="bg-gray-100"
          />
        </View>

        {/* Name */}
        <View style={{ width: columns[2].width }} className="flex items-start justify-center px-1">
          <Text className="text-sm font-semibold text-white" numberOfLines={1}>
            {item.name}
          </Text>
        </View> 

        {/* Season */}
        <View style={{ width: columns[3].width }} className="flex items-center justify-center px-1">
          <Text className="text-sm text-white">{item.season}</Text>
        </View> 

        {/* Club */}
        <View style={{ width: columns[4].width }} className="flex items-start justify-center px-1">
          <View className="flex flex-row items-center">
            <Image 
              source={{ uri: item.clubLogo }} 
              style={{ width: 16, height: 16, marginRight: 4 }}
            />
            <Text className="text-xs font-medium text-white" numberOfLines={1}>
              {item.club}
            </Text>
          </View>
        </View>

        {/* Stats columns */}
        {columns.slice(5).map((column) => (
          <View 
            key={column.key} 
            style={{ width: column.width }} 
            className="flex items-center justify-center px-1"
          >
            <Text className="text-sm text-white">{item[column.key]}</Text>
          </View>
        ))}
      </View>
    )
  }

  const renderTotalRow = () => {
    if (!playerData?.total) {
      return null;
    }
    return (
      <View className="flex flex-row flex-wap py-3 bg-gray-900 border-t-2 border-gray-400 items-center">
        <View style={{ width: columns[0].width }} className="flex items-center justify-center px-1"></View>
        <View style={{ width: columns[1].width }} className="flex items-center justify-center px-1"></View>
        
        <View style={{ width: columns[2].width }} className="flex items-start justify-center px-1">
          <Text className="text-sm font-bold text-white">Total</Text>
        </View>
        
        <View style={{ width: columns[3].width }} className="flex items-center justify-center px-1"></View>
        <View style={{ width: columns[4].width }} className="flex items-center justify-center px-1"></View>

        {columns.slice(5).map((column) => (
          <View 
            key={column.key} 
            style={{ width: column.width }} 
            className="flex items-center justify-center px-1"
          >
            <Text className="text-sm font-bold text-white">
              {playerData.total[column.key] || ''}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className='bg-white rounded-xl overflow-hidden mx-5 my-5 shadow-lg 'style={{ alignSelf: 'flex-start' }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {renderTableHeader()}
          <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={true}>
            {playerData?.seasons?.map((item, index) => renderRow(item, index))}
            {renderTotalRow()}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  )
}

export default StatsCard

