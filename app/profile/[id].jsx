import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useState } from 'react'
import {Link } from 'expo-router'
import { useAuth } from '../../contexts/AuthContext'
import React, { useEffect } from 'react'
import { FlashList } from '@shopify/flash-list'

export default function ProfileScreen() {
  const {id} = useLocalSearchParams()
  const {session} = useAuth()
  const [profile, setProfile] = useState(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [following, setFollowing] = useState([])
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
        console.log(data)
        setProfile(data)
        if (session?.user.id === data.user_id) setIsOwnProfile(true)
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
    style={{height: 80, width: 80, justifyContent: 'center', alignItems: 'center'}}
    >
      <Link asChild href={`/${item.type}/${item.id}`}>
        <TouchableOpacity>
          <Image source={{uri: item.photo}} style={{width: 60, height: 60}} className='rounded-full'/>
          <Text className='text-center'>{item.name}</Text>
        </TouchableOpacity>
      </Link>
    </View>
  )

  if (!profile) return( <Text>loading</Text>)
  return (
    
    <View className='flex p-10'>
      <View className="flex flex-row items-center gap-5">
        <Image source={{uri: profile.profile_pic}} style={{width: 200, height: 200}}/>
      <View className='flex flex-col gap-5'>
        <Text className='text-4xl font-supreme '>{profile?.username}</Text>
        {profile?.bio ? <Text className='text-xl font-supreme'>{profile?.bio}</Text>: <Text className='text-2xl font-supreme'>No bio yet.</Text>}
      </View>
      </View>
      <View className='flex gap-5' >
        <Text>Following</Text>
        <View >
          {!following ? <Text>No following</Text>:
            <FlashList
            data={following}
            renderItem={renderItem}
            estimatedItemSize={100}
            numRows={1}
            horizontal={true}
            />}
        </View>
      </View>
    </View>
  )
}


