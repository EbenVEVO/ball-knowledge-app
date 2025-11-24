import { StyleSheet, Text, Touchable, View, TouchableOpacity } from 'react-native'
import React, { use } from 'react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext';
import { CreateAccount } from '../../components/screens/CreateAccount';
import OTPVerification from '../../components/screens/OTPVerification';
import { useRouter } from 'expo-router';

export default function SignUp () {

    const [username, setUsername] = useState('');
    const router = useRouter()
    const {session, profile} = useAuth()

    if(session) {
        router.replace(`/profile/${profile?.username}`)
    }
  return (
    <View className=' absolute top-1/2 left-1/2 ' style={{ transform: [{ translateX: '50%' }, { translateY: '50%', borderWidth: 2, borderColor: 'black' }] }}>
    
 {!username ?   
          <View >
              <CreateAccount
                  setUsername={setUsername} />
                <Text>Already have an account? <Text style={{color:'blue'}} onPress={() => {router.push('/auth/signin')}}>Sign In</Text></Text>
            </View>
      : 
      <View>
        <TouchableOpacity onPress={() => setUsername('')}>
            <Text>Back</Text>
        </TouchableOpacity>
              <OTPVerification
                  signUp={true}
                  data={{ username: username }} />
        </View>}
          
    </View>
  )
}

