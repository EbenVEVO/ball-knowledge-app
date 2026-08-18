import Feather from '@expo/vector-icons/Feather'
import { FlashList } from '@shopify/flash-list'
import { Link } from 'expo-router'
import { useEffect, useState } from 'react'
import { Image, ImageBackground, Platform, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import EditProfileModal from '@/components/screens/EditProfileModal'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import SavedQuery from '../ui/SavedQuery'
import CollectionPreviewCard from '../ui/CollectionPreviewCard'
import { fetchCollectionsForUser } from '@/lib/collections'


export default function ProfileScreen({ id }) {
  const { session } = useAuth()
  const [profile, setProfile] = useState(null)
  const [isOwnProfile, setIsOwnProfile] = useState()
  const [following, setFollowing] = useState()
  const [isVisible, setIsVisible] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [commentHistory, setCommentHistory] = useState(null)
  const [savedQueries, setSavedQueries] = useState()
  const [queriesOpen, setQueriesOpen] = useState(false)
  const [queriesShownCount, setQueriesShownCount] = useState(3)
  const [collections, setCollections] = useState()
  const [collectionsOpen, setCollectionsOpen] = useState(false)
  const [collectionsShownCount, setCollectionsShownCount] = useState(3)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return
      const { data, error } = await supabase.from('users_profiles').select('*').eq('username', id).single()
      if (error) { console.log(error); return }
      setProfile(data)
      setIsOwnProfile(session?.user.id === data.user_id)
    }
    if (id) fetchProfile()
  }, [id])

  useEffect(()=>{
    const fetchSavedQueries = async ()=>{
      if (!profile?.user_id) return
      const {data, error} = await supabase.from('users_saved_queries').select(`*`)
      .eq('user_id', profile.user_id)
      if(data) setSavedQueries(data)
    }
    fetchSavedQueries()
  },[profile])

  useEffect(()=>{
    const fetchCollections = async ()=>{
      if (!profile?.user_id) return
      const {data, error} = await fetchCollectionsForUser(profile.user_id)
      if(!error) setCollections(data)
    }
    fetchCollections()
  },[profile])

  useEffect(() => {
    const fetchFollowing = async () => {
      if (!profile) return
      const { data: players } = await supabase.from('users_followed_players').select(`*, player:player_id (transfermarkt_name, photo)`).eq('user_id', profile.user_id)
      const { data: clubs } = await supabase.from('users_followed_teams').select(`*, team:team_id(club_name, logo)`).eq('user_id', profile.user_id)
      const { data: competitions } = await supabase.from('users_followed_competitions').select(`*, competition: followed_competition(name, logo)`).eq('user_id', profile.user_id)

      let list = []
      players?.forEach(p => list.push({ name: p.player.transfermarkt_name, photo: p.player.photo, type: 'player', id: p.player_id }))
      clubs?.forEach(c => list.push({ name: c.team.club_name, photo: c.team.logo, type: 'club', id: c.team_id }))
      competitions?.forEach(c => list.push({ name: c.competition.name, photo: c.competition.logo, type: 'competition', id: c.followed_competition }))
      setFollowing(list)
    }
    fetchFollowing()
  }, [profile])

  useEffect(() => {
    const fetchCommentHistory = async () => {
      if (!profile?.user_id) return
      const [{ data: playerComments }, { data: matchComments }] = await Promise.all([
        supabase.from('social_player_comments')
          .select('id, comment, created_at, post_id, stats:post_id(player_id, player:player_id(photo))')
          .eq('user_id', profile.user_id)
          .order('created_at', { ascending: false }),
        supabase.from('social_match_comments')
          .select('id, comment, created_at, post_id, fixture:post_id(home_team:home_team_id(logo))')
          .eq('user_id', profile.user_id)
          .order('created_at', { ascending: false }),
      ])
      const merged = [
        ...(playerComments || []).map(c => ({ ...c, type: 'player' })),
        ...(matchComments || []).map(c => ({ ...c, type: 'match' })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setCommentHistory(merged)
    }
    fetchCommentHistory()
  }, [profile])

  const deleteQuery = async(query) =>{
    const {error} = await supabase.from('users_saved_queries').delete()
      .eq('id', query.id )
    if(!error) setSavedQueries(savedQuery => savedQuery.filter(q=> q.id !== query.id))
  }

  const COLUMNS = 4
  const ROW_LIMIT = 4

  const renderItem = ({ item }) => (
    <View style={{ flex: 1, height: 120 }}>
      <Link asChild href={`/${item.type}/${item.id}`}>
        <TouchableOpacity className='items-center gap-2'>
          <Image source={{ uri: item.photo }} style={{ width: 80, height: 80 }} className='rounded-full' resizeMode='cover' />
          <Text className='text-center font-supreme' numberOfLines={3}>{item.name}</Text>
        </TouchableOpacity>
      </Link>
    </View>
  )

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return `${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const s = 1000, m = s * 60, h = m * 60, d = h * 24
    if (diff / s < 60) return `${parseInt(diff / s)}s`
    if (diff / m < 60) return `${parseInt(diff / m)}m`
    if (diff / h < 24) return `${parseInt(diff / h)}h`
    if (diff / d < 7) return `${parseInt(diff / d)}d`
    return `${date.getMonth() + 1}-${date.getDate()}`
  }

  const displayedCount = following ? (showAll ? following.length : Math.min(following.length, COLUMNS * ROW_LIMIT)) : 0
  const listHeight = Math.ceil(displayedCount / COLUMNS) * 120

  const renderQuery = ({ item }) => (
    <SavedQuery query={item} deleteQuery={deleteQuery}/>
  )

  if (!profile && isOwnProfile === undefined) return (<Text>loading</Text>)
  return (
    <View style={{ flex:Platform.OS !== 'web' && 1 }}>
      <ScrollView>
        <View style={{ height: 200, width: '100%', position: 'relative' }}>
          <ImageBackground
            source={profile?.banner_image ? { uri: profile?.banner_image } : require('@/assets/images/profilebanner.png')}
            style={{ height: 200, width: '100%', borderTopLeftRadius: 25 }}
            resizeMode='cover'
          />
        </View>
        <View className='p-5'>
          <View className="flex bg-white rounded-2xl shadow-lg p-2 px-5" style={{ marginTop: -60 }}>
            <View className='flex flex-col gap-2'>
              <View className='flex flex-row gap-3 items-center'>
                <Image className='rounded-full' source={require('@/assets/images/sancho.jpg')} style={{ width: 110, height: 110, borderColor: 'white', borderWidth: 2 }} resizeMode='cover' resizeMethod='scale' />
                <View className='flex flex-row items-center gap-1'>
                  <Text className='font-supreme'>@</Text>
                  <Text className='text-4xl font-supreme'>{profile?.username}</Text>
                </View>
              </View>
              {isOwnProfile &&
                <TouchableOpacity onPress={() => setIsVisible(true)} className='px-5 p-2 rounded-full flex flex-row gap-2 items-center justify-center' style={{ backgroundColor: "#A477C7" }}>
                  <Text className='text-white font-supreme text-lg text-center'>Edit Profile</Text>
                  <Feather name="edit-3" size={20} color="white" />
                </TouchableOpacity>
              }
              {profile?.bio ? <Text className='text-lg font-supreme'>{profile?.bio}</Text> : <Text className='text-lg font-supreme'>No bio yet.</Text>}
              <Text className="font-supreme text-sm">Joined {formatDate(profile?.created_at)}</Text>
            </View>
          </View>
        </View>
        <View className='flex gap-10 p-5'>
          <View className='flex gap-5'>
            <View className='flex flex-row justify-between items-center'>
              <Text className="font-supremeBold text-2xl">Following</Text>
              {profile?.username && following?.length > 0 && (
                <Link href={`/following-map/${profile.username}`} asChild>
                  <TouchableOpacity className='px-4 py-2 rounded-full' style={{ backgroundColor: '#A477C7' }}>
                    <Text className='font-supremeBold text-sm' style={{ color: 'white' }}>Following Map</Text>
                  </TouchableOpacity>
                </Link>
              )}
            </View>
            <View className='p-2'>
              {!following ? <Text className="font-supreme">No following</Text> : <>
                <View style={{ height: listHeight }}>
                  <FlashList
                    data={showAll ? following : following.slice(0, COLUMNS * ROW_LIMIT)}
                    numColumns={COLUMNS}
                    estimatedItemSize={120}
                    scrollEnabled={false}
                    renderItem={renderItem}
                  />
                </View>
                {following.length > COLUMNS * ROW_LIMIT && (
                  <TouchableOpacity onPress={() => setShowAll(prev => !prev)} className='items-center py-3'>
                    <Text className='font-supremeBold text-base' style={{ color: '#A477C7' }}>
                      {showAll ? 'Show Less' : `Show More (${following.length - COLUMNS * ROW_LIMIT} more)`}
                    </Text>
                  </TouchableOpacity>
                )}
              </>}
            </View>
          </View>
  
          <View className='flex gap-5'>
            <TouchableOpacity onPress={() => setQueriesOpen(prev => !prev)} className='flex flex-row justify-between items-center'>
              <Text className="font-supremeBold text-2xl">Saved Queries</Text>
              <Feather name={queriesOpen ? 'chevron-up' : 'chevron-down'} size={24} color="black" />
            </TouchableOpacity>
            {queriesOpen && (
              <View className='flex gap-4'>
                {!savedQueries || savedQueries.length === 0 ? (
                  <Text className="font-supreme text-gray-400">No saved queries yet.</Text>
                ) : (
                  <>
                    {savedQueries.slice(0, queriesShownCount).map((item, idx) => (
                      <View className='p-2' key={idx}>{renderQuery({ item })}</View>
                    ))}
                    {savedQueries.length > queriesShownCount && (
                      <TouchableOpacity onPress={() => setQueriesShownCount(prev => prev + 3)} className='items-center py-3'>
                        <Text className='font-supremeBold text-base' style={{ color: '#A477C7' }}>
                          Show More ({savedQueries.length - queriesShownCount} more)
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            )}
          </View>
          
          <View className='flex gap-5'>
            <TouchableOpacity onPress={() => setCollectionsOpen(prev => !prev)} className='flex flex-row justify-between items-center'>
              <Text className="font-supremeBold text-2xl">Collections</Text>
              <Feather name={collectionsOpen ? 'chevron-up' : 'chevron-down'} size={24} color="black" />
            </TouchableOpacity>
            {collectionsOpen && (
              <View className='flex gap-4'>
                {!collections || collections.length === 0 ? (
                  <Text className="font-supreme text-gray-400">No collections yet.</Text>
                ) : (
                  <>
                    {collections.slice(0, collectionsShownCount).map((item) => (
                      <CollectionPreviewCard key={item.id} collection={item} authorUsername={profile?.username} href={`/(tabs)/(collections)/${item.slug}`} />
                    ))}
                    {collections.length > collectionsShownCount && (
                      <TouchableOpacity onPress={() => setCollectionsShownCount(prev => prev + 3)} className='items-center py-3'>
                        <Text className='font-supremeBold text-base' style={{ color: '#A477C7' }}>
                          Show More ({collections.length - collectionsShownCount} more)
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            )}
          </View>

          <View className='flex gap-5 pb-10'>
            <Text className="font-supremeBold text-2xl">Comment History</Text>
            {!commentHistory ? (
              <Text className="font-supreme text-gray-400">Loading...</Text>
            ) : commentHistory.length === 0 ? (
              <Text className="font-supreme text-gray-400">No comments yet.</Text>
            ) : (
              commentHistory.map(item => {
                const image = item.type === 'player' ? item.stats?.player?.photo : item.fixture?.home_team?.logo
                const href = item.type === 'player' ? `/player/${item.stats?.player_id}` : `/fixture/${item.post_id}`
                return (
                  <Link key={`${item.type}-${item.id}`} asChild href={href}>
                    <TouchableOpacity className='flex flex-row gap-3 p-3 rounded-xl bg-white items-center' style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
                      {image
                        ? <Image source={{ uri: image }} style={{ width: 48, height: 48 }} className='rounded-full' resizeMode='cover' />
                        : <View style={{ width: 48, height: 48 }} className='rounded-full bg-gray-100' />
                      }
                      <View className='flex-1 gap-1'>
                        <Text className='font-supreme text-base'>{item.comment}</Text>
                        <View className='flex flex-row gap-3 items-center'>
                          <View className='px-2 rounded-full' style={{ backgroundColor: item.type === 'match' ? '#E8F4FD' : '#F0E8FD' }}>
                            <Text className='font-supremeBold text-xs' style={{ color: item.type === 'match' ? '#2196F3' : '#A477C7' }}>
                              {item.type === 'match' ? 'Match' : 'Player'}
                            </Text>
                          </View>
                          <Text className='font-supreme text-xs text-gray-400'>{formatTime(item.created_at)}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Link>
                )
              })
            )}
          </View>
        </View>
        <EditProfileModal isVisible={isVisible} onClose={() => setIsVisible(false)} />
      </ScrollView>
    </View>
  )
}
