import { supabase } from '../lib/supabase'
import {createAvatar} from '@dicebear/core'
import {initials} from '@dicebear/collection'


export async function verifyOTPSignUp(phonenumber,token, signUpData) {
    const {data, error} = await supabase.auth.verifyOtp({
        phone: phonenumber,
        token: token,
        type:'sms'
    })

    if (error) {
        console.log(error)
        return {
          success: false,
          message: error.message
        }
    }
 
    const pfpurl = `https://api.dicebear.com/7.x/initials/png?seed=${signUpData.username[0]}&backgroundColor=c0aede&radius=50&size=200`

    const response = await fetch(pfpurl)
    const blob = await response.blob()

    const filepath = `${data.user.id}/${data.user.id}.png`
    const {data: storageData, error: storageError} = await supabase.storage.from('profile_pics').upload(filepath, blob, {cacheControl: '3600', upsert: true})
    const {data: {publicUrl}} = supabase.storage.from('profile_pics').getPublicUrl(filepath)
    if (storageError) {
        console.log(storageError)
        return {
          success: false,
          message: storageError.message
        }
    }
    const {data: usernameUpdate, error: usernameUpdateError} = await supabase.auth.updateUser({
        data: {
            display_name: signUpData.username
        }
    })
    if (usernameUpdateError) {
        console.log(usernameUpdateError)
        return {
          success: false,
          message: usernameUpdateError.message
        }
    }
    const {data: insertData, error: insertError} = await supabase.from('users_profiles').insert({...signUpData, user_id: data.user.id, profile_pic: publicUrl })
    if (insertError) {
        console.log(insertError)
        return {
          success: false,
          message: insertError.message
        }
    }
    console.log(insertData)
    return{

        success: true,
        user: usernameUpdate.user,
        session: usernameUpdate.session
    }
}

export async function sendSignInOTP(phone){

  const {data, error} = await supabase.auth.signInWithOtp({
    phone: phone,
    options:{
      shouldCreateUser: false
    }
  })
  if (error){
    console.log(error.message)
    return {
      success: false,
      message: error.message
    }
  }
  else{
    return{
      success:true,
      data: data
    }
  }
}  
export async function sendOTPSignUp(phone){
    const {data, error} = await supabase.auth.signInWithOtp({
      phone: phone
    })
    console.log(data)
}  
export async function verifyOTPSignIn(phonenumber,token) {
  const {data, error} = await supabase.auth.verifyOtp({
      phone: phonenumber,
      token: token,
      type:'sms' })
    if (error) {
        return {
          success: false,
          message: error.message
        }
    }
    return{
        success: true,
        user: data.user,
        session: data.session
    }
 
}
export async function logout() {
  await supabase.auth.signOut()
}