import { StyleSheet, Text, View, Image, TouchableOpacity, ImageBackground } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useState } from 'react'
import {Link } from 'expo-router'
import { useAuth } from '../../contexts/AuthContext'
import Feather from '@expo/vector-icons/Feather'; 
import React, { useEffect } from 'react'
import { FlashList } from '@shopify/flash-list'
import EditProfileModal from '../../components/screens/EditProfileModal'

export default function ProfileScreen() {
  const {id} = useLocalSearchParams()
  const {session} = useAuth()
  const [profile, setProfile] = useState(null)
  const [isOwnProfile, setIsOwnProfile] = useState()
  const [following, setFollowing] = useState()
  const [isVisible, setIsVisible] = useState('')
  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return
      const {data, error} =  await supabase.from('users_profiles').select('*').eq('username', id).single()
      
      if (error) {
        console.log(error)
        return(
          <Text>{error.message}</Text>

        )
      }
      else{
        console.log(data, 'feth profile')
        setProfile(data)
        if (session?.user.id === data.user_id){
          console.log('own profile')
          setIsOwnProfile(true)}

        else{
          console.log('reg prof')
          setIsOwnProfile(false)
        }
      }
     
    }
    
    if(id){
       fetchProfile()
      }
    console.log(id)
  }, [id])

  useEffect(()=>{
    const fetchFollowing = async () => {
         
          if (!profile) return
          
          console.log(profile, 'infetch')
          const {data: players, error: playersError} =  await supabase.from('users_followed_players').select(`*,
             player:player_id (transfermarkt_name, photo)
            `).eq('user_id', profile.user_id)
          const {data: clubs, error: clubsError} =  await supabase.from('users_followed_teams').select(`*,
            team:team_id(club_name, logo)
            `).eq('user_id', profile.user_id)
          if (playersError) console.log(playersError)
          if (clubsError) console.log(clubsError)
            console.log(clubs)
            console.log(players)
          
          let following = []
          
          players.forEach((player)=>{
            following.push({name: player.player.transfermarkt_name, photo: player.player.photo, type: 'player', id: player.player_id})
          })
          clubs.forEach((club)=>{
            following.push({name: club.team.club_name, photo: club.team.logo, type: 'club', id: club.team_id})
          })
          console.log(following)
          setFollowing(following)
        }
    fetchFollowing()

  }, [profile])

  const renderItem = ({item}) =>(
    <View
    style={{height: '100%', width: 120}}
    >
      <Link asChild href={`/${item.type}/${item.id}`}>
        <TouchableOpacity className=' items-center gap-2'>
          <Image source={{uri: item.photo}} style={{width: 80, height: 80}} className='rounded-full' resizeMode='cover'/>
          <Text className='text-center font-supreme'>{item.name}</Text>
        </TouchableOpacity>
      </Link>
    </View>
  )
  const formatDate = (timestamp) =>{
      const date = new Date(timestamp)
      
      const month = date.toLocaleString('default', {month:'long'})
      const day = date.getDate()
      const year = date.getFullYear()

      return `${month} ${day}, ${year}`
  }
  if (!profile && isOwnProfile === undefined) return( <Text>loading</Text>)
  return (
    
    <View className='flex p-2'>

      <View style={{height:200, width:'100%', position:'relative'}} >
      <ImageBackground
          source={profile?.banner_image ? {uri:  profile?.banner_image} : require('../../assets/images/profilebanner.png')}
          style={{height:200, width:'100%', borderTopLeftRadius: 25, }}
          resizeMode='cover'
        />
      </View>
      <View className="flex flex-row items-center gap-5 p-5" style={{marginTop:-30}}>
     
        <Image
         className='rounded-full' source={{uri: profile.profile_pic}} 
         style={{width: 200, height: 200, borderColor:'white', borderWidth:2}}
         resizeMode='cover'
         resizeMethod='scale'
         />
      <View className='flex flex-col gap-2'>
        <Text className='text-4xl font-supreme '>{profile?.username}</Text>
        {isOwnProfile && 
        <TouchableOpacity 
        onPress={()=>setIsVisible(true)}
        className='px-5 p-2 rounded-full flex flex-row gap-2 items-center justify-center' style={{backgroundColor:"#A477C7"}}>
          <Text className='text-white font-supreme text-lg text-center'>Edit Profile</Text>
          <Feather name="edit-3" size={20} color="white" />
        </TouchableOpacity>}
        {profile?.bio ? <Text className='text-xl font-supreme'>{profile?.bio}</Text>: <Text className='text-2xl font-supreme'>No bio yet.</Text>}
        <Text className="font-supreme">Joined {formatDate(profile?.created_at)}</Text>
      </View>
      </View>
      <View className='flex gap-10'>
      <View className='flex gap-5' >
        <Text className="font-supremeBold text-2xl">Following</Text>
        <View  style={{height:100}}>
          {!following ? <Text className="font-supreme">No following</Text>:
            <FlashList
            data={following}
            contentContainerStyle={{gap: 0}}
            renderItem={renderItem}
            horizontal={true}
            />}
            
        </View>
      </View>
      <View className='flex gap-5'>
          <Text className="font-supremeBold text-2xl">Stats </Text>
      </View>
      <View className='flex gap-5'>
          <Text className="font-supremeBold text-2xl">Collections </Text>
      </View>
      <View className='flex gap-5' >
        <Text className="font-supremeBold text-2xl">Comment History</Text>
      </View>
      </View>
      <EditProfileModal isVisible={isVisible} onClose={()=>setIsVisible(false)} />
    </View>
  )
}


