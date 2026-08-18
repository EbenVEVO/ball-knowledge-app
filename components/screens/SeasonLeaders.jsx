import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const SeasonLeaders = ({home, away}) => {
    useEffect(()=>{
        const fetchStats = async () =>{
            const {data} = await supabase.from('player_stats').select('goals.sum()')
            .eq('team_id', home.id)
        }
    })
  return (
    <View>
      <Text>Season Leaders</Text>
    </View>
  )
}

export default SeasonLeaders