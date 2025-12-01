import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, FlatList, Animated, Pressable} from 'react-native'
import React, { useCallback, useEffect, useState, useRef  } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';


export default function Comments({post_id}) {
    const {session, profile} = useAuth()
    const [userComment, setUserComment]= useState('')
    const [comments, setComments] = useState([])
    const [pendingComments, setPendingComments] = useState(new Set())
    const [newCommentsCount, setNewCommentsCount] = useState(0)
    const [visibleComments, setVisibleComments] = useState(new Set())
    const [newCommentIds, setNewCommentIds] = useState(new Set())
    const [replyingTo, setReplyingTo] = useState()
    const flatListRef = useRef(null)
    const timeoutRefs = useRef({})
    const fadeAnims = useRef({})

    const onViewableItemsChanged = useCallback(({viewableItems}) => {
        const currentlyVisible = new Set(viewableItems.map(item => item.item.id))
        setVisibleComments(currentlyVisible)

        setPendingComments(prev =>{
          const stillPending = new Set()

          prev.forEach(id => {
            if(currentlyVisible.has(id)){
              activateHighlight(id)
              console.log('visible', id)
              setNewCommentsCount(prev => Math.max(0, prev - 1))

            }
            else{
              stillPending.add(id)
            }
          })
          return stillPending
        })
    },[])

    const visibilityConfig = useRef({
        itemVisiblePercentThreshold: 10
    }).current
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
      flatListRef.current.scrollToIndex({index: 0, animated: true})
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
          console.log(data)
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
            setComments(prev => [ newComments, ...prev ])
            setPendingComments(prev => new Set(prev).add(newComments.id))
            setNewCommentsCount(prev => prev + 1)
             
          }


        }
      })
      .subscribe()

    
    }, [post_id])

  const activateHighlight = (commentId) =>{
    setNewCommentIds(prev => new Set(prev).add(commentId))
    fadeAnims.current[commentId] = new Animated.Value(1)

    timeoutRefs.current[commentId] = setTimeout(() => {
      Animated.timing(fadeAnims.current[commentId], {
        toValue: 0,
        duration: 2000,
        useNativeDriver: false
      }).start(() => {
        clearHighlight(commentId)
      })
    })
  }

  const clearHighlight = (commentId) => {
    setNewCommentIds(prev =>{
      const newSet = new Set(prev)
      newSet.delete(commentId)
      return newSet
    })
    if (timeoutRefs.current[commentId]) {
      clearTimeout(timeoutRefs.current[commentId])
      delete timeoutRefs.current[commentId]
    }
    if(fadeAnims.current[commentId]){
      delete fadeAnims.current[commentId]
    }
  }

  const renderComments = ({item: comment}) =>{ 
    if(!comment)return
    const isNew= newCommentIds.has(comment?.id)
    const fadeAnim = fadeAnims.current[comment?.id]

    const backgroundColor = isNew && fadeAnim? fadeAnim.interpolate({
      inputRange:[0, 1], outputRange: ['#A477C7', 'white']
    }):
    'transparent'
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
            <View className= 'flex flex-row justify-between'>
              <Text className='font-supremeBold '>{comment.user?.username}</Text>
              <Text >{comment.created_at}</Text>
            </View>
            <Text className='font-supreme'>{comment.comment}</Text>
            <Pressable
              onPress={()=> setReplyingTo(comment.id)}
            >
              <Text>Reply</Text>
            </Pressable>
          </View>
        </View>
    </Animated.View>
  )}
  return (
    <View className='flex-1 px-5 mb-5 relative'>
      <Text>Comments</Text>
      {newCommentsCount > 0 && <View className='absolute z-10 top-5 left-1/2 -translate-x-1/2'>
          <TouchableOpacity className='p-4  rounded-full'style={{backgroundColor: '#A477C7'}}
          onPress={scrollToNewComments}
          >
            <Text className='text-white font-supreme'>{newCommentsCount} New Comments</Text>
          </TouchableOpacity>
        </View>}
     
       <FlatList
       ref={flatListRef}
       data={comments}
       renderItem={renderComments}
       keyExtractor={(item) => item.id}
       onViewableItemsChanged={onViewableItemsChanged}
       ListEmptyComponent={<Text>Loading...</Text>}
       viewabilityConfig={visibilityConfig}
       />

        {session &&(
            {replyingTo && <View>}
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
          </View> )
        }
      </View>
   
  )
}

