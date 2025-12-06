import { View, Text, Animated, Pressable, Image, FlatList } from 'react-native'
import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';

const Comment = ({comment, isNew, backgroundColor, setReplyingTo}) => {
    const [loading, setLoading] = useState()
    const [replies, setReplies] = useState([])

    const fetchReplies = async () =>{
        const { data, error} = await supabase.from('social_player_comments').select(`*, user: user_id(username, profile_pic)`)
        .eq('player_performance_id', comment.player_performance_id).eq('root_id', comment.root_id).not('parent_id','is', null)
        .order('created_at', {ascending:false})
  
        if(error){
          console.log(error)
          return
        }
  
        return data
        
      }
      const renderReply =({item: reply}) =>{
        if(!reply)return
        return(
    
          <View className='flex flex-row items-center gap-2 p-3 '>
            <Image source={{uri: reply.user?.profile_pic}} style={{width:40, height:40}}/>
              <View className="gap-2">
              <View className= 'flex flex-row w-full gap-1 items-center ' >
                  <Text className='font-supremeBold '>{reply.user?.username}</Text>
                  {replies.find(findReply => findReply.id === reply.parent_id)&&
                    <>
                    <Feather name="arrow-right" size={10} color="black" />
                    <Text className='font-supreme'>{replies.find(parent_reply => parent_reply.id === reply.parent_id).user.username}  </Text>
                    </>
                    }
                  <Entypo name="dot-single" size={15} color="gray" />
                  <Text >{formatTime(reply.created_at)}</Text>
                </View>
                <Text className='font-supreme'>{reply.comment}</Text>
                <Pressable
                  onPress={()=> setReplyingTo(reply)}
                >
                  <Text>Reply</Text>
                  </Pressable>
            </View>
          </View>
        )
      }

    const formatTime = (timestamp) =>{
        const date = new Date(timestamp)
        const now = new Date()

        const timeDifference = now - date
        
        const seconds = 1000

        const minutes = seconds * 60

        const hours = minutes * 60

        const days = hours * 24

        if(timeDifference/seconds < 60){
            return `${parseInt(timeDifference/seconds)}s`
        }
        else if (timeDifference/minutes < 60){
            return `${parseInt(timeDifference/minutes)}m`
        }
        else if(timeDifference/ hours < 24){
            return`${parseInt(timeDifference/hours)}h`
        }
        else if(timeDifference/ days < 7){
            return `${parseInt(timeDifference/days)}d`
        }
        else{
            return `${date.getMonth} - ${date.getDate}`
        }

    }
  return (
    <Animated.View 
      style={{
        backgroundColor,
        borderWidth: isNew ? 1 : 0,
        borderColor: isNew ? 'white' : 'transparent',
      }}
    >
      <View className='flex flex-row items-center gap-2 p-3 ' >
          <Image source={{uri: comment.user?.profile_pic}} style={{width:40, height:40}}/>
          <View className="gap-2">
            <View className= 'flex flex-row w-full gap-1 items-center ' >
              <Text className='font-supremeBold '>{comment.user?.username}</Text>
              <Entypo name="dot-single" size={15} color="gray" />
              <Text >{formatTime(comment.created_at)}</Text>
            </View>
            <Text className='font-supreme'>{comment.comment}</Text>
            <Pressable
              onPress={()=> setReplyingTo(comment)}
            >
              <Text>Reply</Text>
            </Pressable>
            {(comment.reply_count > 0 && replies.length===0 )&&
              <Pressable
              onPress={async ()=>{
                console.log('entering fetch')
                setLoading(true)
                const data = await fetchReplies(comment.id)
                if (data){ 
                  setReplies(data)
                  console.log(data)
                  setLoading(false)
                }
              }}
              >
                 <Text>View {comment.reply_count} replies</Text>
            </Pressable>}
        </View>
    </View>
            {loading && <Text>Loading Replies...</Text>}
            {replies.length > 0 &&
            <View className='p-3 ml-10'>
              <FlatList
                data={replies}
                renderItem={renderReply}
                keyExtractor={item => item.id}
                ListEmptyComponent={<Text>No replies</Text>}
              />
              
              <Pressable
                onPress={()=>setReplies([])}
              >
                <Text>Hide replies</Text>
              </Pressable>
              </View>
            }
          
    </Animated.View>
  )
}

export default Comment