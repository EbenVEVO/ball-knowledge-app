import { supabase } from './supabase'

// Upserts the current user's Expo push token via the register_push_token RPC
// (security definer, keyed on auth.uid() - re-associates the token on conflict)
export const registerPushToken = async (token, platform) => {
  return supabase.rpc('register_push_token', { p_token: token, p_platform: platform })
}
