import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import { Animated, FlatList, Image, Pressable, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';

import { useAuth } from '../../contexts/AuthContext';

const Comment = ({comment, isNew, backgroundColor, setReplyingTo, reply_comment, reply_comment_name, type}) => {
    const [loading, setLoading] = useState()
    const [replies, setReplies] = useState([])
    const [liked, setLiked] = useState(false)
    const {profile , session} = useAuth()

    const table = type === 'match' ? 'social_match_comment_likes' : 'social_player_comment_likes'
    const replyTable = type === 'match' ? 'social_match_comments' : 'social_player_comments'

    const handleLike= async (comment_id)=>{
      if(!session)return
        if(!liked){
          const {data, error} = await supabase.from(table).insert(
            {
              comment_id: comment_id,
              user_id: session.user.id
            }
          )
          if(!error){
            setLiked(true)
            comment.like_count = comment.like_count + 1
          }
          else{
            console.log(error)
          }


        }
        else{
          const {error} = await supabase.from(table).delete().eq('user_id', session.user.id).eq('comment_id', comment_id)
          if(!error){
            setLiked(false)
            comment.like_count = comment.like_count-1
          }
          else{
            console.log(error.message)
          }
        }
    }

    useEffect(()=>{
      const checkLiked = async ()=>{
        const {data,error} = await supabase.from(table).select(`*`)
        .eq('user_id', session.user.id).eq('comment_id', comment.id).single()
      
        if(data){
          setLiked(true)
        }
        else setLiked(false)
      }

      if (session) checkLiked()
      
    },[comment])

    
    const fetchReplies = async () =>{
        const { data, error} = await supabase.from(replyTable).select(`*, user: user_id(username, profile_pic)`)
        .eq('post_id', comment.post_id).eq('root_id', comment.root_id).not('parent_id','is', null)
        .order('created_at', {ascending:true})
  
        if(error){
          console.log(error)
          return
        }
  
        return data
        
      }
      const renderReply =({item: reply}) =>{
        if(!reply) return
        
        const isReply = replies.find(findReply => findReply.id === reply.parent_id)
        return(
    
        <Comment 
        reply_comment={true}
        reply_comment_name={isReply ? isReply.user.username : undefined}
        comment={reply}
        setReplyingTo={setReplyingTo}
        type={type}
        />
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
            return `${date.getMonth()}-${date.getDate()}`
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
          <View className="gap-2 flex-1">
            <View className= 'flex flex-row w-full gap-1 items-center ' >
              <Text className='font-supremeBold '>{comment.user?.username}</Text>
              {reply_comment_name &&
              <>
              <Feather name="arrow-right" size={15} color="black" />
              <Text> {reply_comment_name}</Text>
              </>
              }
            </View>
            <Text className='font-supreme'>{comment.comment}</Text>
            <View className='flex flex-row gap-5 items-center w-full' >
            <Text >{formatTime(comment.created_at)}</Text>
            <Pressable
              onPress={()=> setReplyingTo(comment)}
            >
              <Text>Reply</Text>
            </Pressable>
            <Entypo name="dots-three-horizontal" size={15} color="gray" />
            <View className='items-center' style={{flex:1, flexDirection:'row', gap: 5}}>
              <Pressable
                onPress={()=>handleLike(comment.id)}
              >
              {liked? 
              <FontAwesome name="heart" size={15} color="#A477C7" /> : 
              <FontAwesome name="heart-o" size={15} color="black" />}
              </Pressable>
              {comment.like_count > 0 &&
              <Text> {comment.like_count}</Text>
              }
            </View>
            </View>
            {(comment.reply_count > 0 && replies.length===0 && !reply_comment)&&
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