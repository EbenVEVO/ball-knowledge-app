import { View, Text, Image } from 'react-native'
import Entypo from '@expo/vector-icons/Entypo';
import React from 'react'

export const TrophyCard = () => {
   const data = [
    {
        competition: 'Premier League',
        team: { name: 'Liverpool', image: 'https://images.fotmob.com/image_resources/logo/teamlogo/8650.png' } ,
        season: '24/25',
   },
   {
        competition: 'FA Cup',
        team: { name: 'Liverpool', image: 'https://images.fotmob.com/image_resources/logo/teamlogo/8650.png' },
        season: '21/22',
   },
    {
       competition: 'Champions League',
       team: { name: 'Liverpool', image: 'https://images.fotmob.com/image_resources/logo/teamlogo/8650.png' },
        season: '18/19',
       
   },
   {
       competition: 'Premier League',
       team:  { name: 'Chelsea', image: 'https://images.fotmob.com/image_resources/logo/teamlogo/8455.png'},
        season: '13/14',
       
   },
] 

const trophiesSeperated = data.reduce((acc, curr) => {
    if (!acc[curr.team.name]) {
        acc[curr.team.name] = [];
    }
    acc[curr.team.name].push(curr);
    return acc;
},{})

  return (
    <View className= 'rounded-xl bg-white shadow-2xl p-5 w-full'>
    <View className='flex flex-row  items-center gap-5 '>
      <Text className='text-2xl font-supremeBold'>{`Team Trophies (${data.length})`}</Text>
      </View>
      <View className='flex gap-5 p-5 '>
                {Object.entries(trophiesSeperated).map(([team, trophies]) => (
                    <View className='flex flex-col  rounded-xl' style={{borderColor: '#E5E7EB', borderWidth: 1}}>
                        <View className='flex flex-row bg-gray-100 gap-5 px-5 py-2  items-center ' style={{borderTopLeftRadius: 12, borderTopRightRadius: 8}}>
                            <Image source={{ uri: trophies[0].team.image }} style={{ width: 30, height: 30 }} />
                            <View className='flex flex-col items-center justify-center ' >
                            <Text className='text-sm font-supreme'>{`${team} (England)`}</Text>
                            <Text className='text-sm font-supreme'>{trophies.length} Trophies</Text>
                            </View>
                        </View>
                        <View className='flex flex-col    ' >
                            
                            {trophies.map((trophy, index) => (
                                <>
                                <View className='flex flex-row items-center px-5 p-2' key={index} >
                                    <Text className='text-sm font-supreme'>{trophy.competition}</Text>
                                    <Entypo name="dot-single" size={24} color="black" />
                                    <Text className='text-sm font-supreme'>{trophy.season}</Text>
                                    
                                </View>
                               {index !== trophies.length - 1 &&    <View className='border-b border-gray-300  w-full' />}</>
                            ))}
                        
                        </View>
                    </View>
                )              
                )}
                
      </View>
    </View>
  )
}

export default TrophyCard