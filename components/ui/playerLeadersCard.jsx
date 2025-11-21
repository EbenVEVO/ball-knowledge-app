import { View, Text, Image} from 'react-native'
import React from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';


export const PlayerLeadersCard = () => {

  const players = [
    {
      name: 'Messi',
      statValue: '28',
      photo: 'https://images.fotmob.com/image_resources/playerimages/30981.png',
    },
    {
      name: 'Ronaldo',
      statValue: '25',
      photo: 'https://images.fotmob.com/image_resources/playerimages/30893.png',
    },
    {
        name:"Sancho",
        statValue:"21",
        photo:"https://images.fotmob.com/image_resources/playerimages/846381.png"
    }
  ]  
  return (
    <View className='flex flex-col bg-blue-400 rounded-2xl justify-center gap-5 px-3 ' style={{alignSelf:"flex-start"}}>
        <View className='flex flex-row justify-between pt-4 px-5 items-center '>
            <Text className='text-2xl text-white font-supreme'>{'Assists Leaders'}</Text>
            <AntDesign name="right" size={24} color="white" />      </View>
      <View className='flex flex-col items-center justify-center '>
      <View className='flex flex-row '>

      {players.map((player, index) => (
        <View key={index} className='flex flex-col items-center justify-center gap-3 ' >
            {index === 0 ? <MaterialCommunityIcons name='crown' size={40} color='gold' /> : <View className='h-[40px]'></View>}
           <Text className='text-2xl text-center text-white font-supreme'>{player.name}</Text>
           <Text className='text-xl text-center text-gray-200 font-supreme'>{player.statValue}</Text>
           <Image source={{uri:player.photo}} style={{ width: 150, height: 150, marginLeft: -0}}/>
        </View>
      ))}
      </View>
   
    </View>
    </View>
  )
}

export default PlayerLeadersCard