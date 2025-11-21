import { View, Text ,ScrollView, Image, Pressable} from 'react-native'
import React from 'react'

export const VideoCard = () => {

   const videos =[
    {
      title: "Lionel Messi 2008/09 👑 Ballon d'Or Level: Dribbling Skills, Goals, & Passes",
      url: 'https://www.youtube.com/watch?v=sF6Ax_dVk6k&t=34s&ab_channel=Neymagichd',
      thumbnail: 'https://i.ytimg.com/vi/sF6Ax_dVk6k/hqdefault.jpg',
    },
    {
        title: "Barcelona x Manchester United | 2-0 | extended highlights and Goals | UCL final 2009",
        url: "https://www.youtube.com/watch?v=XcoUZKayYPE",
        thumbnail: "https://i.ytimg.com/vi/XcoUZKayYPE/hqdefault.jpg",
    },
    {
        title: 'Lionel Messi vs Real Madrid (Home) 2008-09 English Commentary HD 1080i',
        url: 'https://www.youtube.com/watch?v=avSsfeyJ1u4',
        thumbnail: 'https://i.ytimg.com/vi/avSsfeyJ1u4/hqdefault.jpg',
    },
    {
        url:'https://www.youtube.com/watch?v=eVjl8L80jfs&ab_channel=RaheemComps',
        title: 'Crazy Messi Brace vs Sevilla (Away) 2008-09 English Commentary',
        thumbnail: 'https://i.ytimg.com/vi/eVjl8L80jfs/hqdefault.jpg',
    }

]
  return (
    <View className='flex flex-col bg-white shadow-2xl rounded-2xl justify-center gap-5 px-10 w-full'>
      <Text className='text-4xl font-bold text-black p-5'>Related Videos</Text>

      <ScrollView horizontal >
        <View className='gap-20 flex flex-row'>
        {videos.map((video, index) => (
          <Pressable key={index} className='flex flex-col items-center justify-center  p-3'
            
          >
              <Image source={{uri:video.thumbnail}} style={{ aspectRatio: 16 / 9,  width: 400}} className='rounded-xl'/>
              <Text className='text-lg tracking-tight text-center text-black w-[400px]  p-2'>{video.title}</Text>
          </Pressable>
        ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default VideoCard