import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, FlatList, Animated, Pressable} from 'react-native'
import React, { useCallback, useEffect, useState, useRef  } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';
import UserCommentInput from '../ui/UserCommentInput';
import AntDesign from '@expo/vector-icons/AntDesign';
import { comment } from 'postcss';
import Comment from '../ui/Comment';

export default function Comments({post_id, type}) {
    const {session, profile} = useAuth()
    const [userComment, setUserComment]= useState('')
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [pendingComments, setPendingComments] = useState(new Set())
    const [newCommentsCount, setNewCommentsCount] = useState(0)
    const [visibleComments, setVisibleComments] = useState(new Set())
    const [newCommentIds, setNewCommentIds] = useState(new Set())
    const [replyingTo, setReplyingTo] = useState()
    const flatListRef = useRef(null)
    const timeoutRefs = useRef({})
    const fadeAnims = useRef({})

    const table = type === 'match' ? 'social_match_comments' : 'social_player_comments'

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
    const sendComment = async () =>{
        const commentData = {
          comment: userComment,
          post_id: post_id,
          user_id: profile?.user_id
        }
        if(replyingTo) commentData.parent_id = replyingTo.id
        console.log('insert', commentData, 'into', table)
        const {data, error}= await supabase.from(table).insert(commentData)
        if(error){
          console.log(error)
        }
        else{
          setUserComment('')
          setReplyingTo()
        }
    }

    const scrollToNewComments = ()=>{
      flatListRef.current.scrollToIndex({index: 0, animated: true})
    }

   

    useEffect(()=>{
      const fetchComments = async ()=>{
        const {data, error} = await supabase.from(table).select(`*,
          user: user_id(profile_pic, username)
        `).eq('post_id', post_id)
        .is('parent_id',null)
        .order('created_at', {ascending: false })
        if(error){
          console.log(error)
        }
        else{
          console.log(data)
          setComments(data)
          setLoading(false)

        }
      }
      if(!post_id)return
      
      fetchComments()

      console.log('new sub')

      const channel = supabase
      .channel(`comments-${post_id}`)
      .on('postgres_changes', { event: '*',
       schema: 'public', 
       table: table,
      filter: `post_id=eq.${post_id}`
      }, async (payload) => {
        console.log('Realtime event received:', payload)

        if(payload.eventType === 'INSERT'){
          const {data:newComment} = await supabase.from(table).
          select(`*, user:user_id(username, profile_pic)`)
          .eq('id', payload.new.id)
          .single()

          if(newComment){
            if (!newComment.parent_id){
              setComments(prev => [ newComment, ...prev ])
              setPendingComments(prev => new Set(prev).add(newComment.id))
              setNewCommentsCount(prev => prev + 1)
            }
            else {
              console.log('increment Reply')
              setComments(prev => prev.map(comment => 
                comment.id === newComment.root_id 
                  ? { ...comment, reply_count: (comment.reply_count || 0) + 1 }
                  : comment
              ))
              console.log(comments)
                
            }
             
          }


        }
      })
      .subscribe()

      return () => {
        console.log('Unsubscribing from comments channel')
        supabase.removeChannel(channel)
      }
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
      <Comment
        comment={comment}
        isNew={isNew}
        backgroundColor={backgroundColor}
        setReplyingTo={setReplyingTo}
        type={type}
      />
  )}
  
  if (loading)return <Text>Loading...</Text>
  return (
    <>
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
       viewabilityConfig={visibilityConfig}
       />
      </View>

        {session && (
          <UserCommentInput
          setUserComment={setUserComment}
          userComment={userComment}
          onSubmit={sendComment}
          profile = {profile}
          replyingTo = {replyingTo}
          setReplyingTo={setReplyingTo} />
        )}
   </>
  )
}

