import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, ScrollView } from 'react-native'
import { supabase } from '@/lib/supabase'
import CompetitionProfile from '../../../../components/CompetitionProfile'

export default function CompetitionPage() {
    const {id} = useLocalSearchParams()
    const [competition, setCompetiton] = useState(null)
    const [season, setSeason] = useState(null)
    const [seasons, setSeasons] = useState(null)

    useEffect(()=>{
        const fetchData = async ()=>{
            const {data: competitionData, error} = await supabase.from('competitions').select(`*`).eq('id', id).single()
            if(!error){ setCompetiton(competitionData) }
            else{ console.log(error) }

            const {data: seasonsData, error: seasonsError} = await supabase.from('seasons').select(`*`).eq('competition_id', id).order('season', {ascending: false})
            if(!seasonsError && seasonsData?.length){
                setSeasons(seasonsData)
                setSeason(seasonsData.find(s => s.current) ?? seasonsData[0])
            }
            else{ console.log(seasonsError) }
        }
        if(id) fetchData()
    },[id])


    if(!competition || !season || !seasons) return( <Text>loading</Text>)

  return (
    <ScrollView style={{flex:1}} contentContainerStyle={{flexGrow:1}}>
        <CompetitionProfile competition={competition} season={season} seasons={seasons} setSeason={setSeason}/>
        </ScrollView>
  )
}
