import { AuthContext } from "@/contexts/AuthContext";
import { supabase } from '../lib/supabase';
import { Session } from "@supabase/supabase-js";
import { PropsWithChildren, useEffect, useState } from "react";

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | undefined | null>()
  const [profile, setProfile] = useState<any>()
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
      console.log('Session:', session)
      setSession(session)
      setIsLoading(false)
    }
    fetchSession()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', { event: _event, session })
      setSession(session)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      const {data, error} =  await supabase.from('users_profiles').select('*').eq('user_id', session?.user.id).single()
      if (error) {
        console.log(error)
      }
      else{
        console.log(data)
        setProfile(data)
      }
    }
    fetchProfile()
  }, [session])
  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        profile,
        isLoggedIn: session != undefined,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}