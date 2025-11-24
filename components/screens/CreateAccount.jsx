import { StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { useState } from 'react'
import { supabase } from '../../lib/supabase';
import * as yup from 'yup';
import { Formik } from 'formik';

export const CreateAccount = ({setUsername}) => {
    const usernameSchema = yup.object().shape({
        username: yup.string().required('Username is required')
        .min(4, 'Username must be at least 4 characters long')
        .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    })

    const [error, setError] = useState('');


    const checkUsernameExists = (username) => {
        const {data, error} = supabase.from('users').select('*').eq('username', username).single();
        if (error) {
            console.log(error);
        }
        else{
            if (data) {
                return true
            }
            else{
                return false
            }
        }
    }
    const submitUsername = (username) => {
        const exists = checkUsernameExists(username);
        if (exists) {
            setError('Username already exists');
            return;
        }
        else{
            setUsername(username);
            setError('');
        }
    }
  return (
    <View>
      <Text>Sign Up for Ball Knowledge</Text>
      <Text>The Receipts Are Here! Sign up for Ball Knowledge for years of knowledge about your favorite teams and players in football.</Text>
      <Text>Ask any footy question - get instant answers! Know Your Football</Text>
      <Text>Follow your favorite teams, players, and leagues</Text>
      <Text>Save queries and build collections of epic player performances</Text>
      <Text>Join the community settling debates with real data</Text>
    <Formik
        initialValues={{ username: '' }}
        validationSchema={usernameSchema}
        onSubmit={(values) => submitUsername(values.username)}
      >
        {({isValid, handleChange, handleBlur, handleSubmit, values, errors }) => (
          <>
          <View>
             <TextInput
                 className='h-10 p-2 rounded-lg'
                 style={{ borderWidth: 1, borderColor: 'black' }}
                 placeholder='Enter a username'
                 value={values.username}
                 onChangeText={handleChange('username')}
                 onBlur={handleBlur('username')} />
             {errors.username && <Text className='text-red-500'>{errors.username}</Text>}
             {error && <Text className='text-red-500'>{error}</Text>}
            </View>
            <TouchableOpacity
                style={{ backgroundColor: '#A477C7' }}
                className='rounded-xl p-5 w-full'
                disabled={!isValid}
                onPress={handleSubmit}
            >
              <Text className='text-center text-white text-xl'>Join Ball Knowledge</Text>
            </TouchableOpacity>
            </> 
        )}
    </Formik>
    </View>
  )
}

const styles = StyleSheet.create({})