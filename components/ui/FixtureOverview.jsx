import { StyleSheet, Text, View, Platform, Image} from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


import React from 'react'
import { Link } from 'expo-router';

export const FixtureOverview = ({fixture}) => {
    console.log(fixture)
    const formatDate = (date) => {
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      return new Date(date).toLocaleDateString('en-US', options);
    };
     const formatTime = (date) => {
  const options = { hour: 'numeric', minute: '2-digit' , hour12: true};
  return new Date(date).toLocaleTimeString('en-US', options);
 }

    const goalEvents = fixture?.events.filter(e => e.event_type === 'Goal')

    const groupGoalsByPlayer = (goals) => {
      const grouped = {};
      goals.forEach(goal => {
        const key = `${goal.player_name}_${goal.event_details}`; // Separate normal and own goals
        if (!grouped[key]) {
          grouped[key] = {
            player_name: goal.player_name,
            event_details: goal.event_details,
            times: []
          };
        }
        const timeString = goal.time_elapsed + (goal.time_extra ? `+${goal.time_extra}` : '');
        grouped[key].times.push(timeString);
      });
      
      // Sort by first goal time
      return Object.values(grouped).sort((a, b) => {
        const timeA = parseInt(a.times[0]);
        const timeB = parseInt(b.times[0]);
        return timeA - timeB;
      });
    };

    const awayGoals = groupGoalsByPlayer(goalEvents.filter(e => e.team_id === fixture.away_team_id));
    const homeGoals = groupGoalsByPlayer(goalEvents.filter(e => e.team_id === fixture.home_team_id));

    const awayRedCards = fixture?.events.filter(e => e.event_details === 'Red Card' && e.team_id === fixture.away_team_id)
    const homeRedCards = fixture?.events.filter(e => e.event_details === 'Red Card' && e.team_id === fixture.home_team_id)
  return (
    <View 
    style={[styles.container]}
    className='flex flex-col bg-white ' >
        <View
        className=' p-5 gap-5 flex flex-row items-center justify-center '
        >   
        <View className='flex flex-row items-center gap-2'>
            <AntDesign name="calendar" size={15} color="black" />
           <Text className='font-supreme'>{formatDate(fixture?.date_time_utc)}, {formatTime(fixture?.date_time_utc)}</Text>
        </View>
        <View className='flex flex-row items-center gap-2'>
            <MaterialIcons name="stadium" size={20} color="black" />
            <Text className='font-supreme'>{fixture?.stadium_name}</Text>
        </View>
        <Link href={{pathname: '/competition/[id]', params:{id: fixture?.competition.id}}}>
        <View className='flex flex-row items-center gap-2'>
            
            <Image source={{ uri: fixture?.competition.logo }} style={{width: 15, height: 15}} resizeMode='contain' />
            <Text className='font-supreme'>{fixture?.round}</Text>
        </View>
        </Link>
        </View>
        <View className='border-b border-gray-300  w-full' />
        
            <View className='flex flex-row items-center gap-10 p-10 h-full 'style={{flex: 1}}>
                <View className='flex flex-col items-center gap-10  'style={{flex: 1}} >
                    <Link href={{pathname: '/club/[id]', params:{id: fixture?.home_team.id}}}>
                    <View className='flex flex-row items-center gap-5'>
                        <Image source={{ uri: fixture?.home_team.logo }} style={{width: 100, height: 100}} resizeMode='contain' />
                        <Text className='font-supreme text-4xl text-center'>{fixture?.home_team.club_name}</Text>      
                    </View>  
                    </Link>  
                    <View className='flex flex-col  gap-1 ' style={{minHeight: 150, flex: 1}} >
                        {homeGoals.map((goalGroup, index) => (
                            <View key={index} className='flex flex-row items-center  gap-2' >
                                <MaterialIcons name="sports-soccer" size={14} color="black" />
                                <Text className='font-supreme text-sm'>
                                  {goalGroup.player_name} {goalGroup.times.join(', ')}' 
                                  {goalGroup.event_details === 'Own Goal' ? ' (OG)' : ''}
                                </Text>
                            </View>
                        ))}
                        {homeRedCards.map((card, index) => (
                            <View key={index} className='flex flex-row items-center gap-2' >
                                <View style={{width: 12, height: 15, backgroundColor: 'red', borderRadius: 2}}/>
                                <Text className='font-supreme text-sm'>{card.player_name} {card.time_elapsed} {card.time_extra === null ? '' : '+' + card.time_extra}'</Text>
                            </View>
                        ))}

                    </View>
                </View>
           
            <View className='flex flex-col items-center gap-5' style={{flex: 1}}>
                <Text className='font-supremeBold text-4xl'>{fixture?.home_score} - {fixture?.away_score}</Text>
                <Text className='font-supreme text-sm ' style={{color:'gray'}}>{fixture?.match_status}</Text>
            </View>
            
            <View className='flex flex-col items-center gap-10 ' style={{flex: 1}}> 
            <Link href={{pathname: '/club/[id]', params:{id: fixture?.away_team.id}}}>
            <View className='flex flex-row items-center gap-5'>

                <Text className='font-supreme text-4xl text-center'>{fixture?.away_team.club_name}</Text>
                <Image source={{ uri: fixture?.away_team.logo }} style={{width: 100, height: 100}} resizeMode='contain' />
            </View>
            </Link>
            <View className='flex flex-col  gap-1' style={{minHeight: 150}}>
                       {awayGoals.map((goalGroup, index) => (
                            <View key={index} className='flex flex-row items-center  gap-2' >
                                <MaterialIcons name="sports-soccer" size={14} color="black" />
                                <Text className='font-supreme text-sm'>
                                  {goalGroup.player_name} {goalGroup.times.join(', ')}' 
                                  {goalGroup.event_details === 'Own Goal' ? ' (OG)' : ''}
                                </Text>
                            </View>
                        ))}
                        {awayRedCards.map((card, index) => (
                            <View key={index} className='flex flex-row items-center gap-2' >
                                <View style={{width: 12, height: 15, backgroundColor: 'red', borderRadius: 2}}/>
                                <Text className='font-supreme text-sm'>{card.player_name} {card.time_elapsed} {card.time_extra === null ? '' : '+' + card.time_extra}'</Text>
                            </View>
                        ))}
                </View>
            </View>
            

        </View>
        
    </View>
  )
}

export default FixtureOverview

const styles = StyleSheet.create({
    container: {
        borderRadius: Platform.select({
            ios:0,
            android:0,
            web:12,
            default:0,
        }),
        
    }})