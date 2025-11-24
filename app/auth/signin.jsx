import { View, Text } from 'react-native'
import React from 'react'
import OTPVerification from '../../components/screens/OTPVerification'
import { useRouter } from 'expo-router'

export default function SignIn(){

    const router = useRouter()
  return (
    <View className=' absolute top-1/2 left-1/2 ' style={{ transform: [{ translateX: '50%' }, { translateY: '50%', borderWidth: 2, borderColor: 'black' }] }}>
        <Text>Welcome Back To Ball Knowledge</Text>
      <OTPVerification
        signUp={false}
      />
      <Text>Don't have an account? <Text style={{color:'blue'}} onPress={() => {router.push('/auth/signup')}}>Sign Up</Text></Text>
    </View>
  )
}

 