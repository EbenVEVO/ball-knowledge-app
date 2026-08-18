import { AuthContext } from "@/contexts/AuthContext";
import { supabase } from '../lib/supabase';
import { reregisterIfPermitted } from '../lib/pushNotifications';
import { Session } from "@supabase/supabase-js";
import { PropsWithChildren, useEffect, useState } from "react";
import { Platform } from "react-native";

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | undefined | null>()
  const [profile, setProfile] = useState<any>()
  const [preferences, setPreferences] = useState<any>()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true)
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error) {
        console.error('Error fetching session:', error)
      }
      setSession(session)
    }
    fetchSession()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoading(true)
      setSession(session)
      if (Platform.OS !== 'web' && session) reregisterIfPermitted()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (session === undefined) return
    setProfile(undefined)
    const fetchPreferences = async () =>{
      const {data, error} = await supabase.from('users_preferences').select(`*`).eq('user_id', session?.user.id).single()
      if(error){
        console.log(error)
      }
      else{
        setPreferences(data)
      }
    }
    const fetchProfile = async () => {
      if (!session) {
        setProfile(null)
        setIsLoading(false)
        return
      }
      const {data, error} =  await supabase.from('users_profiles').select('*').eq('user_id', session.user.id).single()
      if (error) {
        console.log(error)
        setProfile(null)
      }
      else{
        setProfile(data)
        fetchPreferences()
      }
      setIsLoading(false)
    }
    fetchProfile()

  }, [session])
  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        preferences,
        profile,
        isLoggedIn: session != undefined,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}