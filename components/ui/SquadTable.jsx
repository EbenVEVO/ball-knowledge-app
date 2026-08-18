import { StyleSheet, Text, TouchableOpacity, View, ScrollView, FlatList,Image, useWindowDimensions } from 'react-native'
import React, { use } from 'react'
import _, { get } from 'lodash'
import { useState, useEffect, useMemo } from 'react'
import {Ionicons} from '@expo/vector-icons'
import { supabase } from '../../lib/supabase';
import { Link } from 'expo-router'

// Proportional share of the table each column gets, and the minimum pixel
// width it can shrink to before the table starts scrolling horizontally.
const COLUMN_WEIGHTS = { name: 0.26, position: 0.12, nationality: 0.15, age: 0.08, number: 0.09, height: 0.09, marketValue: 0.21 }
const COLUMN_MIN_WIDTHS = { name: 160, position: 80, nationality: 100, age: 50, number: 55, height: 55, marketValue: 90 }
const MIN_TABLE_CONTENT_WIDTH = Object.values(COLUMN_MIN_WIDTHS).reduce((a, b) => a + b, 0)

export const SquadTable = ({club}) => {
    const [players, setPlayers] = useState();
    const { width: windowWidth } = useWindowDimensions();

    const [direction , setDirection] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);

  const columnWidths = useMemo(() => {
    const contentWidth = Math.max(windowWidth - 40, MIN_TABLE_CONTENT_WIDTH);
    return Object.fromEntries(
      Object.keys(COLUMN_WEIGHTS).map((key) => [
        key,
        Math.max(Math.round(COLUMN_WEIGHTS[key] * contentWidth), COLUMN_MIN_WIDTHS[key]),
      ])
    );
  }, [windowWidth]);
   const normalizePlayerData = (player) => {
  const keyMapping = {
    'value': 'market_value_in_eur',
  };

  const normalizeObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(item => normalizeObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const normalized = {};
      Object.entries(obj).forEach(([key, value]) => {
        const newKey = keyMapping[key] || key;
        normalized[newKey] = normalizeObject(value);
      });
      return normalized;
    }
    
    return obj;
  };

  return normalizeObject(player);
};
  useEffect(() => {
      const fetchPlayers = async () => {
        const { data: squad, error} = await supabase.from('players').select(`*, country:country_code(flag_url)`).eq('current_club', club.id)
        if (!error){
        const newSquad =normalizePlayerData(squad)
          setPlayers(squad)
        }
      }
      fetchPlayers()
  },[])
  const getAge = (date) => {
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const shortenValue = (value) => {
    if (value > 1000000000) {
      return (value / 1000000000).toFixed(1) + "B";
    } else if (value > 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    } else if (value > 1000) {
      return (value / 1000).toFixed(1) + "K";
    } else {
      return value;
    }
  }

  const renderHeader = () =>{
        return(
            <><View className='flex flex-row   items-center  p-5 px-10 gap-5'>
                <View style={{ width: columnWidths.name }}>
                    <TouchableOpacity onPress={() => handleSort("name")}>
                        <Text className=' font-supremeBold'> Name </Text>
                    </TouchableOpacity>
                    {selectedColumn === "name" ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center align-center justify-center' style={{ width: columnWidths.position }}>
                    <TouchableOpacity onPress={() => handleSort("position")}>
                        <Text className='text-center font-supremeBold'> Position </Text>
                    </TouchableOpacity>
                    {selectedColumn === "position" ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center align-center justify-center' style={{ width: columnWidths.nationality }}>
                    <TouchableOpacity onPress={() => handleSort("nationality")}>
                        <Text className='text-center font-supremeBold'>Nationality</Text>
                    </TouchableOpacity>
                    {selectedColumn === "nationality" ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center align-center justify-center' style={{ width: columnWidths.age }}>
                    <TouchableOpacity onPress={() => handleSort("DOB")}>
                        <Text className='text-center font-supremeBold'>Age</Text>
                    </TouchableOpacity>
                    {selectedColumn === "DOB" ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center align-center justify-center' style={{ width: columnWidths.number }}>
                    <TouchableOpacity onPress={() => handleSort("number")}>
                        <Text className='text-center font-supremeBold'>Shirt #</Text>
                    </TouchableOpacity>
                    {selectedColumn === "number" ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>

                <View className='flex flex-row items-center align-center justify-center' style={{ width: columnWidths.height }}>
                    <TouchableOpacity onPress={() => handleSort("height")}>
                        <Text className='text-center font-supremeBold'>Height</Text>
                    </TouchableOpacity>
                    {selectedColumn === "height" ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>

                <View className='flex flex-row items-center align-center justify-center' style={{ width: columnWidths.marketValue }}>
                    <TouchableOpacity onPress={() => handleSort("marketValue")}>
                        <Text className='text-center font-supremeBold'>Market Value</Text>
                    </TouchableOpacity>
                    {selectedColumn === "marketValue" ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>

            </View><View className='border-b border-gray-300  w-full' /></>
            
        )
  }

  const renderRow = (item, index) =>{
    return(
        <><View className='flex flex-row items-center  p-3 px-10 gap-5'>
            <View className='flex flex-row items-center align-center gap-2' style={{ width: columnWidths.name }}>
                <Image source={{ uri: item.photo }} className='rounded-full' style={{ width: 40, height: 40 }} resizeMode='contain' />
                <Link href={{pathname: '/player/[id]', params:{id: item.id}}} className='text-center font-supreme'>{item.transfermarkt_name} </Link>
            </View>
            <Text className='text-center font-supreme' style={{ width: columnWidths.position }}> {item.positions?.[0]} </Text>
            <View className='flex flex-row items-center gap-2 ' style={{ width: columnWidths.nationality }}>
                {item.country?.flag_url ? <Image source={{ uri: item.country.flag_url }} resizeMode="contain" style={{ width: 20, height: 20, borderRadius: 10 }} /> : null}
                <Text className='text-center font-supreme'> {item.nationality} </Text>
            </View>
            <Text className='text-center font-supreme' style={{ width: columnWidths.age }}> {getAge(item.DOB)} </Text>
            <Text className='text-center font-supreme' style={{ width: columnWidths.number }}> {item.squad_number} </Text>
            <Text className='text-center font-supreme' style={{ width: columnWidths.height }}> {item.height} </Text>
            <Text className='text-center font-supreme' style={{ width: columnWidths.marketValue }}> € {item?.market_values?.length ? shortenValue(item.market_values.slice(-1)[0].market_value_in_eur) : '0'} </Text>
        </View><View className='border-b border-gray-300  w-full' /></>
        
    )
  }

   const handleSort = (column) =>{
        const newDirection = direction === 'desc' ? 'asc' : 'desc'
        if (column === 'DOB')   {
            const sorted = _.orderBy(players, [
                (item) => {
                    return getAge(item.DOB)
                }
            ], [newDirection])
            setPlayers(sorted)
        }
        else{
        const sorted = _.orderBy(players, [column], [newDirection])
        setPlayers(sorted)
        }
        setDirection(newDirection)
        setSelectedColumn(column)
    }

  return (
    <View className= 'p-5 w-full'>
      
        <ScrollView horizontal>
            <FlatList scrollEnabled={false} className='bg-white rounded-xl p' data={players} renderItem={({item, index}) => renderRow(item, index)} ListHeaderComponent={renderHeader}  stickyHeaderIndices={[0,1,2]} nestedScrollEnabled />
        </ScrollView>
    </View>
  )
}

export default SquadTable

const styles = StyleSheet.create({})