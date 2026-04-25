import { View, Text, Image, Platform, ScrollView } from 'react-native'
import React, { use, useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import {QueryStatTable} from '../../components/ui/QueryStatTable'
import { Link, useLocalSearchParams } from 'expo-router'
import { set } from 'lodash'
import { isNonNullChain } from 'typescript'
import QueryAnswer from '../../components/ui/QueryAnswer'

export default function QueryPage() {
    const {question} = useLocalSearchParams()
    const [blankedSentence, setBlankedSentence] = useState(null)
    const [loading,setLoading] = useState(true)
    const [data,setData] = useState(null)
    const [answer, setAnswer] = useState(null)
    const [answerSentence, setAnswerSentence] = useState(null)
    const [queryType, setQueryType] = useState(null)
    const [highlightedStat, setHighlightedStat] = useState(null)


    //const CLOUD_RUN_URL = 'https://ball-knowledge-query-1063242162475.northamerica-northeast1.run.app'

    //for testing locally
    const CLOUD_RUN_URL = 'http://127.0.0.1:8080/'
    useEffect(() => { 
        
        const fetchAnswer = async () => {
            try {
              const res = await fetch(
                `${CLOUD_RUN_URL}/search/${encodeURIComponent(question)}`
              );
              const json = await res.json();
              console.log(json)
              setData(json);
            } catch (err) {
              console.log(err.message);
            } finally {
              setLoading(false);
            }
          };
      
          fetchAnswer();
      
    }, [question])

    if (loading) return <Text>Loading...</Text>

   
  return (
    <View className='p-5 gap-5'>
      <QueryAnswer data={data}/>
      <QueryStatTable results={data?.results} highlightedStat={data?.highlighted_stat}/>
    </View>
  )
}