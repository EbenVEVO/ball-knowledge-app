import { View, Text, Modal as RNModal, TouchableWithoutFeedback, TextInput, StyleSheet, ImageBackground, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function EditProfileModal ({isVisible, onClose}) {

    const {profile, session} = useAuth()
    const [username, setUsername] = useState('')
    const [bio, setBio] = useState('')

    useEffect(()=>{
        setUsername(profile?.username)
        if (profile?.bio){
            setBio(profile?.bio)
        }
        
    },[profile])

    if(!profile)return(<Text>Loading...</Text>)
  return (
    <View>
        <RNModal visible={isVisible} onRequestClose={onClose} transparent>
            <TouchableWithoutFeedback onPress={onClose}>
            <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}>      
            <TouchableWithoutFeedback onPress={(e)=>e.stopPropagation()}>
            <View style={styles.container}>
            <View style={{height:200, width:'100%', position:'relative'}} >
            <ImageBackground
              source={profile?.banner_image ? {uri:  profile?.banner_image} : require('../../assets/images/profilebanner.png')}
              style={{height:200, width:'100%', borderRadius: 25, }}
              resizeMode='cover'
                />
                <TouchableOpacity className='rounded-full h-10 w-10 absolute justify-center items-center top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2' style={{backgroundColor:"grey", opacity:0.7}}>
                    <MaterialIcons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>
            <View className="flex flex-col  gap-5 p-5" >
            <Text>Profile Picture</Text>
            <View className='flex flex-row gap-5 items-center'>
            <Image
                className='rounded-full' source={{uri: profile.profile_pic}} 
                style={{width: 100, height: 100, borderColor:'white', borderWidth:2}}
                resizeMode='cover'
                resizeMethod='scale'
                />
            <TouchableOpacity className="rounded-full h-10 px-5 items-center justify-center " style={{backgroundColor:"#A477C7"}}>
                <Text className="text-lg text-white font-supreme">Change</Text>
            </TouchableOpacity>
            </View>
            </View>  
      <View>
        <View className = 'flex flex-col gap-2 p-5'>
            <Text>Username</Text>
            <View className='flex flex-row rounded-lg items-center' style={{borderWidth:1}}>
                <TextInput
                    className='p-3 flex-1' 
                    value={username}
                />
                <TouchableOpacity className='px-3 rounded-lg flex-end justify-center items-center h-3/4 mr-2' style={{backgroundColor:'grey', }}>
                    <Text>Change</Text>
                </TouchableOpacity>
            </View>
        </View>
        <View className = 'flex flex-col gap-2 p-5'>
            <Text>Bio</Text>
            <View className='flex flex-row rounded-lg items-center' style={{borderWidth:1}}>
                <TextInput
                    className='p-3 flex-1' 
                    value={bio && bio}
                    numberOfLines={2}
                    placeholder='Enter a bio here'
                />
               
            </View>
        </View>
      </View>
      </View>
      </TouchableWithoutFeedback>
      </View>
      </TouchableWithoutFeedback>
      </RNModal>
    </View>
  )
}

const styles = StyleSheet.create({

    container:{


        width: '40%',
        height: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        }
})
