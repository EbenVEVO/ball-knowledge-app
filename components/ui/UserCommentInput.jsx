import { View, Text, TextInput, TouchableOpacity, Image, Pressable } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';

const UserCommentInput = ({onSubmit, userComment, setUserComment, profile, replyingTo, setReplyingTo}) => {
  return (
    <>
   
      <View className='flex flex-row items-center gap-3 p-2  '>
              <Image source={{ uri: profile?.profile_pic }} className='rounded-full' style={{ width: 35, height: 35 }} />
            <View className={`flex flex-col justify-center ${replyingTo ? 'rounded-xl': 'rounded-full'}  flex-1`} style={{ borderWidth: 1 }}>
              {replyingTo && 
                     <View className = 'p-2 rounded-t-xl flex flex-row justify-between items-center' style={{backgroundColor: '#D9D9D9',}}>
                    <Text> Replying to {replyingTo?.user.username}</Text>
                    <Pressable
                        onPress={()=>setReplyingTo()}
                    >
                        <AntDesign name="close" size={20} color="black" />
                    </Pressable>
                     </View>
                    }          
             <View className='flex flex-row items-center p-2 justify-center'>
              <TextInput
                  placeholder='Comment...'
                  value={userComment}
                      onChangeText={setUserComment}
                      className='flex-1 flex w-full  '
                      style={{ outlineStyle: 'none' }} />
                  <TouchableOpacity
                      disabled={userComment.length === 0 ? true : false}
                      onPress={onSubmit}
                  >
                      <Ionicons name="send" size={24} color="black" />
                  </TouchableOpacity>
              </View>
          </View>
          </View>
          </>
  )
}

export default UserCommentInput