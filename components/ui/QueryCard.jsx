import { View, Text, Image, Platform, StyleSheet } from 'react-native'
import React from 'react'

export const QueryCard = ({colors}) => {
  
  return (
    <View
    style={[{backgroundColor:colors[0]}, styles.queryContainer]}
    className = {` flex flex-col items-center justify-center pt-5 rounded-xl pt-10 px-10  mx-auto my-5`}
        
     >
        <View>
          <Text 
          style={[ styles.queryText, {color:colors[1]}]}
          className={`  p-2 mb-5 text-center font-supremeBold`} >Lionel Messi won his first Ballon D’or at 22 in 2009</Text>
        </View>
        <View>
            <Image source={{uri:'https://images.fotmob.com/image_resources/playerimages/30981.png'}}
             style={styles.queryImage}
            />
        </View>
      
    </View>
  )
}

const styles = StyleSheet.create({
  queryContainer: {
    width: Platform.select({
      ios:'100%',
      android:'100%',
      web:'75%',
    }),
    borderRadius: Platform.select({
      ios:0,
      android:0,
      
    })
  },
  queryText: {
    fontSize: Platform.select({
      ios: 25,
      android: 20,
      web: 36,
    })
  },
  queryImage: {
    width: Platform.select({
      ios: 150,
      android: 150,
      web: 300,
      default: 150,
    }),
    height: Platform.select({
      ios: 150,
      android: 150,
      web: 300,
      
    })
  }


})
export default QueryCard

