import { StyleSheet, Text, View, Platform, Image } from 'react-native'
import React from 'react'

export const PlayerInfo = ({player,  club}) => {
     let colors = ['#655085', '#FFFFFF']
  if (club?.colors) {
    colors = club?.colors
    console.log(colors)
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
  const calcAge = (date) => {
    var today = new Date();
    var birthDate = new Date(date);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
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
const splitPosition = (position) => {
  let splitPos = []
  if (position.includes('-')) {
    splitPos = position.split('-')
  }
  else if (position.includes(' ')) {
    splitPos = position.split(' ')
  }
  else if (position === 'Goalkeeper') {
    return 'GK'
  }
  else {
    return position
  }
  return splitPos[0][0]+splitPos[1][0]
}

const abbreviateValue = (value) => {
  if (value >= 1000000) {
    return (value/1000000).toFixed(1) + "M"
  }
  else if (value >= 1000) {
    return (value/1000).toFixed(1) + "K"
  }
  else {
    return value.toFixed(1)
  }
}
  return (
    <View 
    style={{backgroundColor : darkenColor(colors[0]), flex:1}}
    className =' rounded-xl w-full'>
        <View className=' flex flex-col   gap-5 px-5' style={{padding:30, }}>
          <View className='flex flex-row justify-center' >
              {player?.positions.length > 0 && <View className='flex flex-col items-center px-5' style={{justifyContent:'flex-start',  width: '33%' }}   >

                  <Text style = {{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2), flexShrink:1}}className='text-lg text-white font-supremeBold '>{splitPosition(player?.positions[0]) }</Text>
                  <Text  style = {{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}} className='text-sm text-gray-200 font-supreme text-center'>Position</Text>
              </View>}
              <View className='flex flex-col items-center px-5 '  style={{justifyContent:'flex-start',  width: '33%'}}>

                  <Text numberOfLines={1} style = {{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2), flexShrink:1}}className='text-lg text-white font-supremeBold'>{`€${player?.market_values ? abbreviateValue(player?.market_values.at(-1).market_value_in_eur) : '0'}` }</Text>
                  <Text style = {{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}className='text-sm text-gray-200 font-supreme text-center'>Value</Text>
              </View>
              <View className='flex flex-col items-center px-5' style={{justifyContent:'flex-start',  width: '33%' }} >
                  <Text style = {{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}} className='text-lg text-white font-supremeBold '>{calcAge(player?.DOB) } years</Text>
                  <Text style = {{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}className='text-sm text-gray-200 font-supreme text-center'>{player?.DOB}</Text>

              </View>
            </View>
            <View className='flex flex-row justify-center'>
                <View className='flex flex-col items-center  px-5' style={{justifyContent:'flex-start',  width: '33%' }} >
                    <Text style = {{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}className='text-lg text-white font-supremeBold uppercase'>{player?.footed}</Text>
                    <Text style = {{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}className='text-sm text-gray-200 font-supreme text-center'>Preferred Foot</Text>
                </View>
                <View className='flex flex-col items-center px-5 '  style={{justifyContent:'flex-start',  width: '33%' }} >
                    <Text style = {{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}className='text-lg text-white font-supremeBold'>{player?.height}</Text>
                    <Text style = {{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}className='text-sm text-gray-200 font-supreme text-center'>Height</Text>
                </View>
                <View className='flex flex-col items-center px-5 ' style={{justifyContent:'flex-start',  width: '33%' }}  >
                    <View className='flex flex-row items-center gap-2'>
                      <Image source={{uri: player?.country.flag_url}} style={{ width: 20, height: 20, borderRadius: 10 }} resizeMethod='contain'/>
                    <Text style = {{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}className='text-lg text-white font-supremeBold'>{player?.nationality}</Text>
                    </View>
                    <Text style = {{color: lightenColor(colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1], 0.2)}}className='text-sm text-gray-200 font-supreme text-center'>Nationality</Text>
                </View>
            </View>
        
    </View>
    </View>
  )
}

export default PlayerInfo

const styles = StyleSheet.create({


    
})