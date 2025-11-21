import { StyleSheet, Text, TouchableOpacity, View, Platform, Pressable, Image, ScrollView, SafeAreaView, SafeAreaProvider } from 'react-native'
import React from 'react'
import Feather from '@expo/vector-icons/Feather';
import {TopBar} from './navigation/TopBar'
import GameLog from './ui/GameLog';
import { useWindowDimensions } from 'react-native';


export const TeamProfile = ({club}) => {
  const { height } = useWindowDimensions();
  let colors = ['#655085', '#FFFFFF']
  if (club.colors) {
    colors = club.colors
  }

  return ( 


    <View style={[styles.container, {backgroundColor: colors[0]}]} 
    className='flex flex-col pt-5  '   
    >
      <View style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0,0,0,0.2)' // 30% black
              }} />
      <View
        className='gap-5 flex flex-col p-10 '
        >   
          
            <View className='flex flex-row items-center gap-5'>
           
            <Image 
            source={{ uri: club.logo }}
            style={{ width: 120, height: 120}}
            resizeMode='contain'
            /> 
            <View className='flex flex-col gap-2 justify-between'>
            <Text 
            style = {[styles.clubname, {color: colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1]}]}
            className=' font-supremeBold'
            >{club.club_name}</Text>
            <View className='flex flex-row items-center justify-center gap-2'>
            <Text 
            style = {{color: colors.length == 3 ? colors[1] == '#FFFFFF'? colors[1]:colors[2]: colors[1]}}
            className='text-xl text-center font-supremeBold'
            >{club.country}</Text>
            <Image resizeMode='contain' source={{uri: 'https://flagcdn.com/48x36/gb-eng.png'}}
            style={{ width: 20, height: 20}}    
            />
            </View>
            
           </View> 
                
            </View>
            
            <Pressable 
            className='absolute top-1 right-3'
            >
              <Feather name="share" size={20} color="blue" className='px-5 p-2 bg-white rounded-full' />
            </Pressable>
           
        </View> 
              
        <TopBar
          club={club}
        />   

    </View>
  )
}

export default TeamProfile

const styles = StyleSheet.create({

    teamprofile:{
      width: Platform.select({ios:'100%', android:'100%', web:'60%', default:'100%'}),
      overflow: 'auto'
    },

     container: {
        borderRadius: Platform.select({
            ios:0,
            android:0,
            web:12,
            default:0,
        }),
        width: Platform.select({
            ios:'100%',
            android:'100%',
            web:'60%',
            default:'100%',
        }),
        minHeight: Platform.select({
            ios:'100%',
            android:'100%',
            web:'auto',
            default:'100%',
        }),
        margin: 'auto'

        

    },

    clubname:{
     fontSize: Platform.select({
         ios: 24,
         android: 24,
         web: 36,
     })
    }
})