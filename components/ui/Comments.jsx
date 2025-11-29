import { View, Text, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';


export default function Comments({post_id}) {
    const {session, profile} = useAuth()
    const [userComment, setUserComment]= useState('')
    const [comments, setComments] = useState()

    const sendComment = async (commentData) =>{
        const {data, error}= await supabase.from('social_player_comments').insert(commentData)
        if(error){
          console.log(error)
        }
        else{
          setUserComment('')
        }
    }

    const scrollToNewComments = ()=>{
      
    }

    useEffect(()=>{
      const fetchComments = async ()=>{
        const {data, error} = await supabase.from('social_player_comments').select(`*,
          user: user_id(profile_pic, username)
        `).eq('player_performance_id', post_id).order('created_at', {ascending: false })
        if(error){
          console.log(error)
        }
        else{
          setComments(data)
        }
      }
      if(!post_id)return
      
      fetchComments()

      console.log('new sub')

      const channel = supabase
      .channel(`comments-${post_id}`)
      .on('postgres_changes', { event: '*',
       schema: 'public', 
       table: 'social_player_comments',
        filter: `player_performance_id=eq.${post_id}`
      }, async (payload) => {
        console.log('Change received!', payload)

        if(payload.eventType === 'INSERT'){
          const {data:newComments} = await supabase.from('social_player_comments').
          select(`*, user:user_id(username, profile_pic)`)
          .eq('id', payload.new.id).single()

          if(newComments){
            setComments(prev => [...prev, newComments ])
          }


        }
      })
      .subscribe()

    
    }, [post_id])


  return (
    <View className='flex-1 px-5 mb-5 relative'>
      <Text>Comments</Text>
      <View className='absolute z-10 top-5 left-1/2 -translate-x-1/2'>
          <TouchableOpacity className='p-4  rounded-full'style={{backgroundColor: '#A477C7'}}>
            <Text className='text-white font-supreme'> New Comments</Text>
          </TouchableOpacity>
        </View>
      <ScrollView className=''>
       {!comments ? <Text>Loading...</Text>:
       comments.map((comment)=>(
        <View className="flex flex-row p-3 gap-3">
          <Image source={{uri: comment.user?.profile_pic}} style={{width:40, height:40}}/>
          <View className="gap-2">
            <View className= 'flex flex-row justify-between'>
              <Text className='font-supremeBold '>{comment.user?.username}</Text>
              <Text >{comment.created_at}</Text>
            </View>
            <Text className='font-supreme'>{comment.comment}</Text>
            <Text>Reply</Text>
          </View>
        </View>
       ))
       
       }
      </ScrollView>

    
        {session &&
              <View className ='flex flex-row items-center gap-3 '>
            <Image source={{ uri: profile?.profile_pic }} className='rounded-full' style={{width:35, height:35}}/>
            <View className='flex flex-row rounded-full items-center p-3 flex-1' style={{borderWidth: 1}}>
                <TextInput
                  placeholder='Comment...'
                  value={userComment}
                  onChangeText={setUserComment}
                  className='flex-1 flex w-full  '
                  style={{outlineStyle: 'none'}}
         
                />
                <TouchableOpacity
                disabled={userComment.length ===0 ? true:false}
                  onPress={()=>sendComment({
                    comment: userComment,
                    player_performance_id: post_id,
                    user_id: profile?.user_id

                  })}
                >
                <Ionicons name="send" size={24} color="black" />                
                </TouchableOpacity>
            </View>
          </View> 
        }
      </View>
   
  )
}

