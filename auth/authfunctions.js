import { supabase } from '../lib/supabase'
import {createAvatar} from '@dicebear/core'
import {initials} from '@dicebear/collection'

export async function completeSignUp(form, session) {
    const pfpurl = `https://api.dicebear.com/7.x/initials/png?seed=${form.username[0]}&backgroundColor=c0aede&radius=50&size=200`
    console.log(pfpurl)
    const response = await fetch(pfpurl)
    const blob = await response.blob()

    const filepath = `${session.user.id}/${session.user.id}.png`
    const {data: storageData, error: storageError} = await supabase.storage.from('profile_pics').upload(filepath, blob, {cacheControl: '3600', upsert: true, contentType: 'image/png'})
    const {data: {publicUrl}} = supabase.storage.from('profile_pics').getPublicUrl(filepath)
    if (storageError) {
        console.log(storageError, 'PFP ERROR')
        return {
          success: false,
          message: storageError.message
        }
    }
    const {error: insertError} = await supabase.from('users_profiles').insert({username:form.username, user_id: session.user.id, profile_pic: publicUrl })
    if (insertError) {
        console.log(insertError, 'INSERT ERROR')
        return {
          success: false,
          message: insertError.message
        }
    }

    const player_rows = form.favorite_players.map(p => ({user_id: session.user.id, player_id: p.id}))
    await supabase.from('users_followed_players').insert(player_rows)

    const club_rows = form.favorite_clubs.map(c => ({user_id: session.user.id, team_id: c.id}))
    await supabase.from('users_followed_teams').insert(club_rows)

    const competition_rows = form.favorite_competitions.map(c => ({user_id: session.user.id, followed_competition: c.id}))
    await supabase.from('users_followed_competitions').insert(competition_rows)

    const {data: usernameUpdate, error: usernameUpdateError} = await supabase.auth.updateUser({
        data: {
            display_name: form.username
        }
    })
    if(usernameUpdateError){
      console.log(usernameUpdateError, 'USERNAME ERROR')
      return{
        success: false,
        message: usernameUpdateError.message
      }
    }

    return{
        success: true,
        user: usernameUpdate.user,
        session: usernameUpdate.session
    }
}

export async function sendOTP(phone){

  const {data, error} = await supabase.auth.signInWithOtp({
    phone: phone,
    options:{
      shouldCreateUser: true
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

export async function verifyOTP(phonenumber,token) {
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