import { StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { useState, useEffect } from 'react'
import OTPInput from '../ui/OTPInput'
import { verifyOTPSignUp, sendOTPSignUp, sendSignInOTP, verifyOTPSignIn } from '../../auth/authfunctions';
import * as yup from 'yup'
import 'yup-phone-lite'
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';


export default function OTPVerification ({signUp, data}) {
    const {session , profile} = useAuth()

    const [phoneNumber, setPhoneNumber] = useState('');
    const [numberSubmitted, setNumberSubmitted] = useState(false)
    const [token, setToken] = useState(Array(6).fill(''))
    const [errorMessage, setErrorMessage] = useState('')

    const router = useRouter()
    const handleNumberSubmit = async (phone)=>{
        setPhoneNumber(phone)
        if (!signUp) {
            const req = await sendSignInOTP(phone)
            if(req.success){
                 setNumberSubmitted(true)
                 setErrorMessage('')
            }
            else{
             if(req.message === 'Signups not allowed for otp'){
                 setPhoneNumber('')
                 setErrorMessage('This number is not registered with Welth')
        
             }
             else{
                 setPhoneNumber('')
                 setErrorMessage('There was an error processing your OTP request')
             }
            }
        }
        else{
            setNumberSubmitted(true)
            sendOTPSignUp(phone)
        }
    }
    

    const phoneSchema = yup.object().shape({
        phoneNumber: yup.string().phone().required('Phone number is required')
    })

    useEffect(()=>{
            const runVerification = async () =>{
                if (signUp){
                  const verification =  await verifyOTPSignUp(phoneNumber, token.join(''), {
                    username: data.username
                  })

                  if(verification.success){
                    console.log(verification)
                    router.push(`/profile/${verification.user.user_metadata.display_name}`)
                    }
                    else{
                        console.log(verification.message)
                        setToken(['', '', '', '', '', ''])
                        setErrorMessage(verification.message)
                     }
                }
                else{
                    const verification =  await verifyOTPSignIn(phoneNumber, token.join(''))
                    if(verification.success){
                      console.log(verification)
                      router.push(`/profile/${verification.user.user_metadata.display_name}`)
                      }
                      else{
                          console.log(verification.message)
                          setToken(['', '', '', '', '', ''])
                          setErrorMessage(verification.message)
                       }
                }
            }

            if(!token.includes("")){
                console.log('running verification')
                runVerification()
            }
        },[token])
  return (
    <View style={{ flex: 1 }}>
    {!numberSubmitted ?
    <View >
          <Text>Enter Phone Number</Text>
          <Formik
            initialValues={{ phoneNumber: '' }}
            validationSchema={phoneSchema}
            onSubmit={(values) => handleNumberSubmit(values.phoneNumber)}
          >
            {({errors, isValid, handleChange, handleBlur, handleSubmit, values }) => (
               <>
               <TextInput
                    placeholder='Phone Number'
                    value={values.phoneNumber}
                    onChangeText={handleChange('phoneNumber')}
                    keyboardType='phone-pad'
                    onBlur={handleBlur('phoneNumber')}
                    style={{ borderWidth: 1, borderColor: 'black' }} />
                {errors.phoneNumber && <Text>{errors.phoneNumber}</Text>}
                <TouchableOpacity
                onPress={handleSubmit}
                disabled={!isValid}
                >
                    <Text>Next</Text>
                </TouchableOpacity>
                              </>
          )}
          </Formik>
         
      </View>
      :
      <View>
            <Text> Enter OTP sent to {phoneNumber}</Text>
            <OTPInput tokenLength={6} handleSubmit={setToken} />
            {errorMessage && <Text>{errorMessage}</Text>}
        </View>}
    </View>
  )
}


