import { View, Text, Image, Platform, ScrollView } from 'react-native'
import React, { use, useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import {QueryStatTable} from '../../components/ui/QueryStatTable'
import { Link, useLocalSearchParams } from 'expo-router'
import { set } from 'lodash'

export default function QueryPage() {
    const {question} = useLocalSearchParams()
    const [blankedSentence, setBlankedSentence] = useState(null)
    const [answer, setAnswer] = useState(null)
    const [answerSentence, setAnswerSentence] = useState(null)
    const [queryType, setQueryType] = useState(null)
    const [highlightedStat, setHighlightedStat] = useState(null)
    const decodedQuestion = decodeURIComponent(question)
    const answerFetched = useRef(false)

    useEffect(() => { 
         const generateQuery = async () => {
            await fetch(`http://127.0.0.1:8000/query/${decodedQuestion}`)
            .then(res =>{ 
            if (!res.ok){
                throw new Error('Network response was not ok');
            }
            return res.json()})
        .then(async data => {
            console.log(data)
            setBlankedSentence(data.split('~~')[1])
            await searchQuery(data)
        }
        
        )
        .catch(err => console.log(err, 'error'))
        }
        const searchQuery = async (query) => {
            const splitQuery = query.split('~~')[0]
            console.log(splitQuery, 'query passed')
             const {data, error} = await supabase.rpc('run_query', {query: splitQuery})
             if(!error) {
                 console.log(data)
                 setAnswer(data)
                    const params = JSON.stringify({
                        blankedSentence: query.split('~~')[1],
                        answerData: data 
                       
                    })
                    const getAnswerSentence = async (params) => {
                        try{
                        console.log(params)
                        const response =await fetch(`http://127.0.0.1:8000/answer/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: params
                        })
                        if (!response.ok){
                            console.log(response.text())
                            throw new Error('Network response was not ok');
                        }
                        const data = await response.json()
                        
                        console.log(data)
                        console.log('sentence', data.split('~~')[0])
                        setAnswerSentence(data.split('~~')[0])
                        console.log('type', data.split('~~')[1])
                        setQueryType(data.split('~~')[1].trim())
                        console.log('stat', data.split('~~')[2])
                        setHighlightedStat(data.split('~~')[2].trim())
                        answerFetched.current = true
                    }
                    catch(err){
                        console.log(err)
                    }
                    }
                    await getAnswerSentence(params)

             }        
             else {
                 console.log(error)
             }
        }
       
        if (!question) return
        if (answerFetched.current) return
        else{
           answerFetched.current = true  
           generateQuery()
        }
        
       
      
    }, [question])

   const distinctPlayers = (players) => {
       const key = 'player_id'
       const unique = [...new Map(players.map(item => [item[key], item])).values()];
       return unique
   }
   


    if (!answerSentence) return <Text>Loading...</Text>

   if(Platform.OS == 'web') {
       return(
        <div style={{ 
            height: '100%',
            overflowY: 'auto',
            width: '100%',
            margin: 'auto',
            padding: '20px'
        }}>      

      {queryType == 'singlePlayer'
      &&
      <View className='flex flex-row bg-white rounded-xl p-5' style={{backgroundColor: answer[0].player_club_colors ? answer[0].player_club_colors[0] : 'white'}}>
        <View className='flex flex-col items-center'>
            <Image source={{uri: answer[0].photo}} style={{ width: 80, height: 80 }} resizeMode='contain' className='rounded-full'/>
            <Link href={`/player/${answer[0].id}`} >
            <Text className='font-supremeBold text-lg underline'>{answer[0].transfermarkt_name}</Text>
            </Link>
        </View>
        <View className='flex flex-col items-center justify-center  w-full '>
        <Text className='font-supremeBold text-xl'>{answerSentence}</Text>
        </View>
        
    </View>
      
      
      }
      {queryType == 'multiplePlayersList'
      &&
      
      <View className='flex flex-col bg-white rounded-xl p-5' style={{backgroundColor: answer[0].player_club_colors ? answer[0].player_club_colors[0] : 'white'}}>
        
        <View className='flex flex-col items-center justify-center  w-full '>
        <Text className='font-supremeBold text-xl'  style = {{color: answer[0].player_club_colors[0] !== '#FFFFFF'? 'white':answer[0].player_club_colors[1]}}>{answerSentence}</Text>
        </View>
        <View className='flex flex-row justify-center gap-10 p-5'>
        {distinctPlayers(answer).splice(0, 3).map((player, index) => (
            <View className='flex flex-col items-center gap-2'>
            <Image source={{uri: player.photo}} style={{ width: 120, height: 120 }} resizeMode='contain' className='rounded-full'/>
            <Link href={`/player/${player.id}`} >
            <Text className='font-supremeBold text-lg underline'  style = {{color: answer[0].player_club_colors[0] !== '#FFFFFF'? 'white':answer[0].player_club_colors[1]}}>{player.transfermarkt_name}</Text>
            </Link>
            </View>
        ))}
        </View>
      </View>
      
      }
      <QueryStatTable
      stats={answer.splice(0,19)}
      queryType={queryType}
      highlightedStat={highlightedStat}
      />

        </div>
       )
   }
  return (
    <View className='p-5'>
      <Text>QueryPage</Text>
      <Text>{answerSentence}</Text>
      {queryType == 'singlePlayer'
      &&
      <View className='flex flex-row bg-white rounded-xl p-5' style={{backgroundColor: answer[0].player_club_colors ? answer[0].player_club_colors[0] : 'white'}}>
        <View className='flex flex-col items-center'>
            <Image source={{uri: answer[0].photo}} style={{ width: 80, height: 80 }} resizeMode='contain' className='rounded-full'/>
            <Link href={`/player/${answer[0].id}`} >
            <Text className='font-supremeBold text-lg underline'>{answer[0].transfermarkt_name}</Text>
            </Link>
        </View>
        <View className='flex flex-col items-center justify-center  w-full '>
        <Text className='font-supremeBold text-xl'>{answerSentence}</Text>
        </View>
        
    </View>
      
      
      }
      {queryType == 'multiplePlayersList'
      &&
      
      <View className='flex flex-col bg-white rounded-xl p-5' style={{backgroundColor: answer[0].player_club_colors ? answer[0].player_club_colors[0] : 'white'}}>
        
        <View className='flex flex-col items-center justify-center  w-full '>
        <Text className='font-supremeBold text-xl'  style = {{color: answer[0].player_club_colors[0] !== '#FFFFFF'? 'white':answer[0].player_club_colors[1]}}>{answerSentence}</Text>
        </View>
        <View className='flex flex-row justify-center gap-10 p-5'>
        {distinctPlayers(answer).splice(0, 3).map((player, index) => (
            <View className='flex flex-col items-center gap-2'>
            <Image source={{uri: player.photo}} style={{ width: 120, height: 120 }} resizeMode='contain' className='rounded-full'/>
            <Link href={`/player/${player.id}`} >
            <Text className='font-supremeBold text-lg underline'  style = {{color: answer[0].colors[0] !== '#FFFFFF'? 'white':answer[0].colors[1]}}>{player.transfermarkt_name}</Text>
            </Link>
            </View>
        ))}
        </View>
      </View>
      
      }
      <QueryStatTable
      stats={answer}
      queryType={queryType}
      highlightedStat={highlightedStat}
      />
    </View>
  )
}