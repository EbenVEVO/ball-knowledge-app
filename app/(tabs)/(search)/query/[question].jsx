import { useLocalSearchParams } from 'expo-router'
import { useState, useEffect } from 'react'
import { Platform, ScrollView, Text, View } from 'react-native'
import QueryResults from '@/components/screens/QueryResults'

export default function QueryPage() {
    const {question} = useLocalSearchParams()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)

    //const CLOUD_RUN_URL = 'https://ball-knowledge-query-1063242162475.northamerica-northeast1.run.app'
    const CLOUD_RUN_URL = 'http://127.0.0.1:8080'

    useEffect(() => {
        const fetchAnswer = async () => {
            try {
              const res = await fetch(`${CLOUD_RUN_URL}/search/${encodeURIComponent(question)}`)
              const json = await res.json()
              console.log(json)
              setData(json)
            } catch (err) {
              console.log(err.message)
            } finally {
              setLoading(false)
            }
        }
        fetchAnswer()
    }, [question])

    if (loading) return <Text>Loading...</Text>

    return (
        <ScrollView className={`${Platform.OS === 'web' && 'p-5'}`} contentContainerStyle={{ gap: 20 }}>
          <QueryResults question={question} data={data}/>
        </ScrollView>
    )
}
