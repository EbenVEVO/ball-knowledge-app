import { StyleSheet, Text, View, ScrollView, Image, FlatList, TouchableOpacity } from 'react-native'
import React from 'react'
import { useState } from 'react'
import {Ionicons} from '@expo/vector-icons'
import _ from 'lodash'

export const GameLog = () => {
  const [matches, setMatches]  =  useState([
    {
      id: 1,
      name: "Eden Hazard",
      photo:'https://media.api-sports.io/football/players/2296.png',
      date: "11/11/2012",
      club: "Chelsea",
      club_photo: "https://media.api-sports.io/football/teams/49.png",
      opponent: "Liverpool",
      venue: "vs", // home
      minutes: 90,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      shots: null,
      shotsOnTarget: null
    },
    {
      id: 2,
      name: "Eden Hazard",
            photo:'https://media.api-sports.io/football/players/2296.png',

      date: "4/21/2013",
      club: "Chelsea",
            club_photo: "https://media.api-sports.io/football/teams/49.png",

      opponent: "Liverpool",
      venue: "@", // away
      minutes: 78,
      goals: 1,
      assists: 0,
      yellowCards: 1,
      redCards: 0,
      shots: null,
      shotsOnTarget: null
    },
    {
      id: 3,
      name: "Eden Hazard",
            photo:'https://media.api-sports.io/football/players/2296.png',

      date: "12/29/2013",
      club: "Chelsea",
            club_photo: "https://media.api-sports.io/football/teams/49.png",

      opponent: "Liverpool",
      venue: "vs",
      minutes: 90,
      goals: 1,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      shots: null,
      shotsOnTarget: null
    },
    {
      id: 4,
      name: "Eden Hazard",
            photo:'https://media.api-sports.io/football/players/2296.png',

      date: "11/8/2014",
      club: "Chelsea",
            club_photo: "https://media.api-sports.io/football/teams/49.png",

      opponent: "Liverpool",
      venue: "@",
      minutes: 90,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      shots: 5,
      shotsOnTarget: 1
    },
    {
      id: 5,
      name: "Eden Hazard",
            photo:'https://media.api-sports.io/football/players/2296.png',

      date: "5/10/2015",
      club: "Chelsea",
            club_photo: "https://media.api-sports.io/football/teams/49.png",

      opponent: "Liverpool",
      venue: "vs",
      minutes: 90,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      shots: 0,
      shotsOnTarget: 0
    },
    {
      id: 6,
      name: "Eden Hazard",
            photo:'https://media.api-sports.io/football/players/2296.png',

      date: "10/31/2015",
      club: "Chelsea",
            club_photo: "https://media.api-sports.io/football/teams/49.png",

      opponent: "Liverpool",
      venue: "vs",
      minutes: 59,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      shots: 0,
      shotsOnTarget: 0
    },
    {
      id: 7,
      name: "Eden Hazard",
            photo:'https://media.api-sports.io/football/players/2296.png',

      date: "5/11/2016",
      club: "Chelsea",
            club_photo: "https://media.api-sports.io/football/teams/49.png",

      opponent: "Liverpool",
      venue: "@",
      minutes: 90,
      goals: 1,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      shots: 3,
      shotsOnTarget: 3
    },
    {
      id: 8,
      name: "Eden Hazard",
            photo:'https://media.api-sports.io/football/players/2296.png',

      date: "9/16/2016",
      club: "Chelsea",
            club_photo: "https://media.api-sports.io/football/teams/49.png",

      opponent: "Liverpool",
      venue: "vs",
      minutes: 90,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      shots: 0,
      shotsOnTarget: 0
    },
    {
      id: 9,
      name: "Eden Hazard",
            photo:'https://media.api-sports.io/football/players/2296.png',

      date: "1/31/2017",
      club: "Chelsea",
            club_photo: "https://media.api-sports.io/football/teams/49.png",

      opponent: "Liverpool",
      venue: "@",
      minutes: 72,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      shots: 0,
      shotsOnTarget: 0
    },
    {
      id: 10,
      name: "Eden Hazard",
            photo:'https://media.api-sports.io/football/players/2296.png',

      date: "11/25/2017",
      club: "Chelsea",
            club_photo: "https://media.api-sports.io/football/teams/49.png",

      opponent: "Liverpool",
      venue: "@",
      minutes: 90,
      goals: 0,
      assists: 1,
      yellowCards: 0,
      redCards: 0,
      shots: 1,
      shotsOnTarget: 1
    },
    {
      id: 11,
      name: "Eden Hazard",
            photo:'https://media.api-sports.io/football/players/2296.png',

      date: "5/6/2018",
      club: "Chelsea",
            club_photo: "https://media.api-sports.io/football/teams/49.png",

      opponent: "Liverpool",
      venue: "vs",
      minutes: 86,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      shots: 2,
      shotsOnTarget: 1
    },
    {
      id: 12,
      name: "Eden Hazard",
            photo:'https://media.api-sports.io/football/players/2296.png',

      date: "9/29/2018",
      club: "Chelsea",
            club_photo: "https://media.api-sports.io/football/teams/49.png",

      opponent: "Liverpool",
      venue: "vs",
      minutes: 90,
      goals: 1,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      shots: 2,
      shotsOnTarget: 2
    },
    {
      id: 13,
      name: "Eden Hazard",
            photo:'https://media.api-sports.io/football/players/2296.png',

      date: "4/14/2019",
      club: "Chelsea",
            club_photo: "https://media.api-sports.io/football/teams/49.png",

      opponent: "Liverpool",
      venue: "@",
      minutes: 90,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      shots: 3,
      shotsOnTarget: 2
    }
  ])

  const [direction , setDirection] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
    const renderHeader = () =>{
        return(
            <>
            <View className='flex flex-row   items-center  p-3 gap-2'>
                <View  style={{width: 20}}></View>
                <View className='flex flex-row items-center align-center justify-center' style={{width: 130}}>
                    <TouchableOpacity onPress={() => handleSort("name")}>
                        <Text className='text-center font-supremeBold' > Name </Text> 
                    </TouchableOpacity>
                    {selectedColumn === "name" ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                    
                </View>
                <View className='flex flex-row items-center align-center justify-center' style={{width: 100}}>
                <TouchableOpacity onPress={() => handleSort("date")}>
                    <Text className='text-center font-supremeBold' > DATE </Text>
                </TouchableOpacity>
                {selectedColumn === "date" ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center align-center justify-center' style={{width: 100}}>
                <TouchableOpacity onPress={() => handleSort("club")}>
                    <Text className='text-center font-supremeBold' >CLUB</Text>
                </TouchableOpacity>
                {selectedColumn === "club" ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View style={{width: 20}}></View>
                <View className='flex flex-row items-center align-center justify-center' style={{width: 100}}>
                <TouchableOpacity onPress={() => handleSort("opponent")}>
                    <Text className='text-center font-supremeBold' > OPP</Text>
                </TouchableOpacity>
                {selectedColumn === "opponent" ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center align-center justify-center' style={{width: 40}}>
                <TouchableOpacity onPress={() => handleSort("minutes")}>
                    <Text className='text-center font-supremeBold'>MIN</Text>
                </TouchableOpacity>
                {selectedColumn === "minutes" ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center align-center justify-center' style={{width: 40}}>
                <TouchableOpacity onPress={() => handleSort("goals")}>
                    <Text className='text-center font-supremeBold'>G</Text>
                </TouchableOpacity>
                {selectedColumn === "goals" ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
                <View className='flex flex-row items-center align-center justify-center' style={{width: 40}}>
                <TouchableOpacity onPress={() => handleSort("assists")}>
                    <Text className='text-center font-supremeBold' >A</Text>
                </TouchableOpacity>
                {selectedColumn === "assists" ? <Ionicons name={direction === "asc" ? "arrow-up" : "arrow-down"} size={10} color="black" /> : null}
                </View>
            </View>
            <View className='border-b border-gray-300  w-full' />
            </>
        )
    }
    const renderRow = (item, index) =>  {
        return(
            <>
            <View className='flex flex-row items-center p-3 gap-2'>
                <View  style={{width: 20}}>
                    <Text>{index + 1}</Text>
                </View>
                <View className='flex flex-row items-center gap-1' style={{width: 130, position: 'sticky'}} >
                    <Image source={{uri: item.photo}}  style={{width: 30, height: 30}} className=' rounded-full' />
                    <Text className='text-center font-supremeBold' > {item.name} </Text>

                </View>
                <Text className='text-center font-supremeBold' style={{width: 100}}> {item.date} </Text>
                <View className='flex flex-row items-center ' style={{width: 100}}>
                    <Image source={{uri: item.club_photo}}  style={{width: 20, height: 20}} className=' rounded-full' />
                    <Text className='text-center font-supremeBold' > {item.club} </Text>
                </View>
                <Text className='text-center font-supremeBold' style={{width: 20}}> {item.venue} </Text>
                <Text className='text-center font-supremeBold' style={{width: 100}}> {item.opponent} </Text>
                <Text className='text-center font-supremeBold' style={{width: 40}}> {item.minutes} </Text>
                <Text className='text-center font-supremeBold' style={{width: 40}}> {item.goals} </Text>
                <Text className='text-center font-supremeBold' style={{width: 40}}> {item.assists} </Text>
            </View>
            <View className='border-b border-gray-300  w-full' />
            </>
        )
    }

    const handleSort = (column) =>{
        const newDirection = direction === 'desc' ? 'asc' : 'desc'
        if (column === 'date') {
            const sorted = _.orderBy(matches, [
                (item) => {
                    const [month, day, year] = item.date.split('/')
                    return new Date(year, month - 1, day)
                }
            ], [newDirection])
            setMatches(sorted)
        } else {
            const sorted = _.orderBy(matches, [column], [newDirection])
            setMatches(sorted)
        }
        setDirection(newDirection)
        setSelectedColumn(column)
    }
  return (
    <View className='p-5 w-full'>
      <Text>Game Log</Text>

        <ScrollView horizontal>
            <FlatList scrollEnabled={false} className='bg-white rounded-xl p' data={matches} renderItem={({item, index}) => renderRow(item, index)} ListHeaderComponent={renderHeader}  stickyHeaderIndices={[0,1,2]} nestedScrollEnabled />
        </ScrollView>
    </View>
  )
}

export default GameLog

const styles = StyleSheet.create({})