import { View, Text, Image, Platform } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

export const ClubCard = ({club}) => {
        let colors = ['#655085', '#FFFFFF']
  if (club?.colors) {
    colors = club?.colors
  }
      function lightenColor(hex, percent) {
  // strip the leading #
  hex = hex.replace(/^#/, '');
  
  // parse r,g,b
  let r = parseInt(hex.substring(0,2), 16);
  let g = parseInt(hex.substring(2,4), 16);
  let b = parseInt(hex.substring(4,6), 16);

  // increase each channel
  r = Math.min(255, Math.floor(r + (255 - r) * percent));
  g = Math.min(255, Math.floor(g + (255 - g) * percent));
  b = Math.min(255, Math.floor(b + (255 - b) * percent));

  // convert back to hex
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}
const darkenColor = (hex, percent = .2) => {
  if (!hex) return "#000000"; 
  hex = hex.replace("#", "");

  let r = parseInt(hex.substring(0,2), 16);
  let g = parseInt(hex.substring(2,4), 16);
  let b = parseInt(hex.substring(4,6), 16);

  r = Math.max(0, r - (r * percent ));
  g = Math.max(0, g - (g * percent ));
  b = Math.max(0, b - (b * percent ));

  return `rgb(${r}, ${g}, ${b})`;
};
  return (
    <View className='flex flex-col  rounded-2xl  gap-5  w-full' style={{ backgroundColor: darkenColor(colors[0]), flex:1, justifyContent: 'center', alignItems: 'center'}}>
      <Text className='text-4xl  text-center p-5 font-supremeBold'
      style={{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}
      >Current Club</Text>
     
        <Link className=' flex flex-col p-3 ' href={{pathname: '/club/[id]', params:{id: club?.id}}} style={{}}>
              <View style={{flexDirection:'column',justifyContent: 'center', alignItems: 'center', gap: 10}}> 
            <Image source={{uri:club?.logo}}
            style={{ width: 100, height: 100 }}
            resizeMode='contain'
            />
            <Text className='text-xl text-center font-supreme'
            style={{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}
            >{club?.club_name}</Text>  </View>
          </Link>
     
     
    </View>
  )
}

export default ClubCard