import { Platform } from 'react-native'
import { supabase } from './supabase'

// Toggles the current user's upvote on a public collection via the
// toggle_collection_upvote RPC (throws server-side if the collection isn't public)
export const toggleCollectionUpvote = async (collectionId) => {
  return supabase.rpc('toggle_collection_upvote', { p_collection_id: collectionId })
}

// Whether the given user has already upvoted this collection
export const fetchCollectionUpvoteStatus = async (collectionId, userId) => {
  return supabase
    .from('users_collection_upvotes')
    .select('user_id')
    .eq('collection_id', collectionId)
    .eq('user_id', userId)
    .maybeSingle()
}

// Shared fetch used by every screen that renders a list of a user's collections
export const fetchCollectionsForUser = async (userId) => {
  return supabase
    .from('users_collections')
    .select(`
      id, title, slug, description,
      users_collections_items (
        id, position, colors, hero,
        saved_query:query_id ( colors, hero ),
        player_stats:player_stats_id (
          rating,
          team:clubs!team_id ( colors ),
          player:player_id ( photo )
        )
      )
    `)
    .eq('user_id', userId)
    .order('position', { foreignTable: 'users_collections_items' })
}

// Placeholder domain until a real deployed web domain exists
export const WEB_BASE_URL = 'https://ballknowledge.app' // replace with your deployed domain

// Shareable link for a collection - uses the live origin on web, the placeholder domain on native
export const buildCollectionShareUrl = (slug) => {
  const path = `/collections/${slug}`
  return Platform.OS === 'web' ? window.location.origin + path : WEB_BASE_URL + path
}

// A collection's owner profile (username + avatar), for byline display
export const fetchCollectionAuthor = async (userId) => {
  return supabase
    .from('users_profiles')
    .select('user_id, username, profile_pic')
    .eq('user_id', userId)
    .single()
}
