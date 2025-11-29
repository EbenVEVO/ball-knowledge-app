import { StyleSheet, Text, View, TextInput, TouchableOpacity , Image } from 'react-native'
import React, { useState } from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '../../lib/supabase';
import { Link, router } from 'expo-router';

export const Search = () => {
    const [focused, setFocused] = useState(false);
    const [input, setInput] = useState('');
    const [results, setResults] = useState([]);
    const [hovered, setHovered] = useState(null);
   



  const fetchResults = async (text) => {
    setResults([])
   if (text.length > 3) {
     console.log(text)
      const {data, error} = await supabase.rpc('search_club_or_player', {search_term: text})
      if(error) console.log(error)
      const clubs = data.clubs.map((club) => ({...club, type: 'club'}))
      const players = data.players.map((player) => ({...player, type: 'player'}))
      console.log([...clubs, ...players])
      setResults([...clubs, ...players])
   }
  }

  const handleSubmit = async () => {
       if (results.length > 0) {
         results[0].type == 'club' ? router.push(`/club/${results[0].id}`) : router.push(`/player/${results[0].id}`)
       }
       else {
         router.push(`/query/${input}`)
       }
  }
  return (
    <View className='relative z-10 flex-1' style={{zIndex:999}}>
    
    <View className='rounded-full p-2 px-4  bg-white flex  flex-row justify-between items-center' style={{borderColor: focused ? '#A477C7' : 'grey', borderWidth: focused ? 1 : 1,}}>
      <TextInput
        className='w-full'
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{outlineStyle: 'none', paddingLeft: 10}}
        placeholderTextColor='grey'
        value={input}
        placeholder='Search a query on players, stats, or clubs'
        onChangeText={(text) => {
          setInput(text)
          fetchResults(text)
        }}
        onSubmitEditing={handleSubmit}
      >

        
      </TextInput>
      <FontAwesome name="search" size={20} color="#A477C7"  />
    </View>
    {results.length > 0 &&    <View className='rounded-xl p-2 w-full bg-white flex flex-col absolute shadow-lg 'style={{top: 50, zIndex: 10}}>
          {results.map((result, index) => {
            return(
              <Link asChild  href={{pathname: result.type == 'club' ? '/club/[id]' : '/player/[id]', params:{id:result.id}}}>
              <TouchableOpacity
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                onPress={()=>{
                  setInput('')
                  setResults([])
                }}
                style={{backgroundColor: hovered === index && '#e4e4e4ff'}}
                
              > 
                {result.type == 'club' ?
              <View className='flex flex-row items-center gap-10 p-2'>
                  
                  <Text className='text-xs font-supreme uppercase' style={{color: 'gray', width:50}}>{result.type}</Text>
                  <View className='flex flex-row items-center '>
                  <Image source={{ uri: result.logo }} style={{width: 35, height: 35}} resizeMode='contain' />
                  <Text className='text-sm font-supreme'>{result.club_name}</Text>
                  </View>
              </View>
              :
              <View className='flex flex-row items-center gap-10 p-2'>
                <Text className='text-xs font-supreme uppercase' style={{color: 'gray', width:50}}>{result.type}</Text>
                  <View className='flex flex-row items-center '>
                  <Image source={{ uri: result.photo }} style={{width: 35, height: 35}} resizeMode='contain' className='rounded-full' />
                  <Text className='text-sm font-supreme'>{result.transfermarkt_name}</Text>
                  </View>
              </View>
              }
            </TouchableOpacity>
            </Link>
            )
          })}
    </View>}
    </View>
  )
}

export default Search

const styles = StyleSheet.create({})