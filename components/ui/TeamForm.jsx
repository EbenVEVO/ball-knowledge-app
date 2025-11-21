import { StyleSheet, Text, View, Image, TouchableOpacity, Platform } from 'react-native'
import {supabase} from '../../lib/supabase'

import React, { useEffect, useState } from 'react'

export const TeamForm = ({club}) => {
    let colors = ['#655085', '#FFFFFF']
  if (club?.colors) {
    colors = club.colors
  }
    const [form, setForm] = useState([])
const [fixtures, setFixtures] = useState([])
useEffect(() => {

    const getForm = async ()=>{
        const {data: fixtures, error} = await supabase.from('fixtures').select('*')
        .or(`home_team_id.eq.${club.id},away_team_id.eq.${club.id}`)
        .eq('match_status', 'Match Finished')
        .order('date_time_utc', { ascending: false })
        .limit(5)

        setFixtures(fixtures)
    
    const getClubLogos = async () => {
            const club_id = club.id;
            const logoPromises = fixtures.map(async (fixture) => {
                const targetTeamId = fixture.home_team_id !== club_id 
                    ? fixture.home_team_id 
                    : fixture.away_team_id;
                
                const { data: logo, error } = await supabase
                    .from('clubs')
                    .select('logo')
                    .eq('id', targetTeamId)
                    .single();
                
                if (error) {
                    console.error('Error fetching logo:', error);
                    return null;
                }
                
                return logo?.logo;
            });
            
            return Promise.all(logoPromises);
        };

    const getScores = () =>{
        const scores = []
        fixtures.forEach((fixture) => {
            scores.push(`${fixture.home_score} - ${fixture.away_score}`)
        })
        return scores
    }

    const getResults = () =>{
        const results = []
        fixtures.forEach((fixture) => {
            if(fixture.home_team_id == club.id){
                results.push(fixture.home_score > fixture.away_score ? 'W' : fixture.home_score < fixture.away_score ? 'L' : 'D')
            }
            else{
                results.push(fixture.home_score < fixture.away_score ? 'W' : fixture.home_score > fixture.away_score ? 'L' : 'D')
            }
        })
        return results
    }


    const logos = await getClubLogos()

        const scores = getScores()
        
        const results = getResults()


        const newForm = []
        for (let i = 0; i < fixtures.length; i++) {
            newForm.push({
                logo: logos[i],
                score: scores[i],
                result: results[i]
            })
        }
        setForm(newForm)
    }
    if(club){
        getForm()

        
    }
}, [club?.id])



const getResultColor = (result) => {
    if (result === 'W') {
        return 'green'
    } else if (result === 'L') {
        return 'red'
    } else {
        return 'gray'
    }
}
  return (
    <View className="flex flex-col p-5 bg-white justify-center rounded-xl shadow-xl  " style={{flexWrap: 'wrap'}}>
      <Text className="text-2xl font-supremeBold" style={{color: colors[0]}}>Team Form</Text>
        <View className="flex flex-row gap-5 justify-center p-5">
            {form.map((item, index) => (
                <TouchableOpacity>
                <View key={index} className="flex flex-col items-center justify-center gap-5"> 
                <View  className= 'p-2  rounded-full' style={[{backgroundColor: getResultColor(item.result)}, styles.score]}>
                    <Text className='text-center font-supreme text-white text-lg'>{item.score}</Text>
                    </View>
                    
                    <Image source={{ uri:item.logo }} style={styles.clubimage} resizeMode="contain" />
                    
                </View>
                </TouchableOpacity>
            ))}
        </View>
    </View>
  )
}

export default TeamForm

const styles = StyleSheet.create({

    clubimage: {
        width: Platform.select({
            ios: 40,
            android: 40,
            web: 60,
            default: 60
        }),
        height: Platform.select({
            ios: 40,
            android: 40,
            web: 60,
            default: 60
        })
    },
    score: {
        width: Platform.select({
            ios: 60,
            android: 60,
            web: 80,
        })
        
    }




})