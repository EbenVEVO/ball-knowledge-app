import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { supabase } from '../../lib/supabase'

const usernameSchema = Yup.object({
  username: Yup.string()
    .min(3, 'At least 3 characters')
    .max(20, 'At most 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and underscores only')
    .matches(/^\S+$/, 'No spaces allowed')
    .required('Username is required')
    .test('username-taken', 'Username is already taken please choose another', async (value) => {
      if (!value || value.length < 3) return true
      const { data } = await supabase
        .from('users_profiles')
        .select('username')
        .eq('username', value)
        .maybeSingle()
      return !data
    }),
})

const UsernameStep = ({ onSubmit, onNext, setErrorMessage }) => {
  const formik = useFormik({
    initialValues: { username: '' },
    validationSchema: usernameSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      onSubmit?.(values.username)
      onNext()
    },
  })

useEffect(()=>{
    if(formik.errors.username){
        console.log('setting')
        setErrorMessage(formik.errors.username)
    }
},[formik.errors])
  const isValid = formik.isValid && formik.dirty

  return (
    <View style={{flex:1}}>
        <View style={{
                        alignSelf: 'flex-start',
                        borderRadius: 20,
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                        marginBottom: 24,
                    }}>
            <Text style={{
                fontSize: 40,
                color: '#2d1f5e',
                marginBottom: 12,
                fontFamily: 'SupremeExtraBold',
            }}>Pick a username</Text>

            <Text style={{
                fontSize: 18,
                color: '#5a4a8a',
                lineHeight: 22,
                fontFamily: 'Supreme',
            }}>
               This is how the community will know you. You can change it later.
            </Text>

            <View className='mb-10'>
                <View>
                    <Text>Username</Text>
                    <View style={{    
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#fff",
                        borderRadius: 14,
                        borderWidth: 1.5,
                        borderColor: "#e0d8f0",
                        paddingHorizontal: 14,
                        height: 58,
                        marginBottom: 10,}}>
                    <Text className='text-2xl font-supreme p-2'>@</Text>
                    <TextInput
                        style={{
                            flex: 1,fontSize: 20,fontWeight: "700",color: "#1a1430",letterSpacing: 0.5,fontFamily:'Supreme'
                        }}
                        placeholder='footy_fan'
                        value={formik.values.username}
                        onChangeText={formik.handleChange('username')}
                        onBlur={formik.handleBlur('username')}
                        autoCapitalize='none'
                        autoCorrect={false}
                    /></View>
                    {formik.touched.username && formik.errors.username ? (
                        <Text style={styles.errorText}>{formik.errors.username}</Text>
                    ) : (
                        <Text style={styles.hintText}>3–20 characters. Letters, numbers and underscores.</Text>
                    )}
                    <TouchableOpacity
                        style={isValid ? styles.continueBtn : styles.continueBtnDisabled}
                        onPress={formik.handleSubmit}
                        activeOpacity={0.85}
                        disabled={!isValid}
                    >
                    <Text style={styles.continueBtnText}>Continue →</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </View>
    </View>
  )
}

export default UsernameStep

const styles = StyleSheet.create({
     continueBtn: {
    backgroundColor: '#A477C7',
    borderRadius: 14,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: '#A477C7',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  continueBtnDisabled: {
    backgroundColor: "gray",
    borderRadius: 14,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 13,
    marginTop: 4,
    fontFamily: 'Supreme',
  },
  hintText: {
    color: '#5a4a8a',
    fontSize: 13,
    marginTop: 4,
    fontFamily: 'Supreme',
  },
})
