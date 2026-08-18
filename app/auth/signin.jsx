import { View, Text } from 'react-native'
import React from 'react'
import OTPVerification from '../../components/screens/OTPVerification'
import { useRouter } from 'expo-router'

export default function SignIn(){

    const router = useRouter()
  return (
    <View className='flex-1 items-center justify-center p-6'>
        <Text>Welcome Back To Ball Knowledge</Text>
      <OTPVerification
        signUp={false}
      />
      <Text>Don't have an account? <Text style={{color:'blue'}} onPress={() => {router.push('/auth/signup')}}>Sign Up</Text></Text>
    </View>
  )
}

 