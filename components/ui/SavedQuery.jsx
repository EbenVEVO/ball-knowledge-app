import { View, Text, TouchableOpacity, Image, Platform, Pressable, Animated, Share } from 'react-native'
import React, { useRef, useState } from 'react'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ShareModal from './ShareModal';
import * as Sharing from 'expo-sharing'
import ViewShot from 'react-native-view-shot';
import { useAuth } from '../../contexts/AuthContext';

const SavedQuery = ({query, deleteQuery}) => {
    const { profile } = useAuth()
    const [shareModalVisible, setShareModalVisible] = useState(false)
    const [queryMenuOpen, setQueryMenuOpen] = useState(null)
    const [showShareMenu, setShowShareMenu] = useState(false)
    const [loading, setLoading] = useState(false)
    const menuAnim = useRef(new Animated.Value(0)).current
    const snapshotRef = useRef()

    const openShareMenu = () => {
        setShowShareMenu(true)
        Animated.spring(menuAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 80,
            friction: 8,
        }).start()
    }

    const closeShareMenu = () => {
        Animated.timing(menuAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => setShowShareMenu(false))
    }

    const shareImage = async () => {
        closeShareMenu()
        setLoading(true)
        try {
            const uri = await snapshotRef.current.capture()
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, { mimeType: 'image/png' })
            }
        } finally {
            setLoading(false)
        }
    }

    const shareLink = async () => {
        closeShareMenu()
        try {
            await Share.share({ url: query.share_url, message: query.share_url })
        } catch (e) {
            console.log(e)
        }
    }

    const shareQuery = () => {
        if (Platform.OS === 'web') {
            setShareModalVisible(true)
        } else {
            if(showShareMenu)closeShareMenu(false)
            else openShareMenu()
        }
    }
    const ExportCard = () => (
        <View style={{ backgroundColor: query.colors[0], width: 1080, height: 1920, justifyContent: 'center' }}>
            <View style={{ alignItems: 'center', gap: 32, paddingHorizontal: 80 }}>
                <Image source={{ uri: query.hero.photo }} resizeMode='contain' style={{ width: 400, height: 400, borderRadius: 200 }} />
                <Text className='font-SupremeBold' style={{ fontSize: 72, textAlign: 'center', color: query.colors[1] }}>{query.answer}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', borderTopWidth: 1, borderTopColor: query.colors[1], padding: 40, position: 'absolute', bottom: 0 }}>
                <Text className='font-supreme' style={{ fontSize: 36, color: query.colors[1] }}>Ball Knowledge</Text>
                <Text className='font-supreme' style={{ fontSize: 36, color: query.colors[1] }}>@{profile?.username}</Text>
            </View>
        </View>
    )

    const card = (
      <><View className='rounded-xl relative' style={{ backgroundColor: query.colors[0] }}>
            <View className='p-5 mt-10 gap-3 items-center'>
                <Image source={{ uri: query.hero.photo }} resizeMode='contain' style={{ width: 75, height: 75 }} className='rounded-full' />
                <Text className='text-xl font-supremeBold text-center' style={{ color: query.colors[1] }}>{query.answer}</Text>
            </View>

            {showShareMenu && (
                <Pressable
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}
                    onPress={closeShareMenu}
                />
            )}

            <View className=' absolute right-5 top-5 flex-row gap-5 items-center' style={{ zIndex: 100 }}>
                <Pressable onPress={shareQuery}>
                    <View style={{ backgroundColor: query.colors[1] }} className='rounded-full p-2 px-4 items-center'>
                        <Ionicons name="share-outline" size={24} color={query.colors[0]} />
                    </View>
                </Pressable>
                {Platform.OS === 'web' && (
                    <Pressable onPress={() => setQueryMenuOpen(q => query.id === q ? null : query.id)}>
                        <Entypo name="dots-three-horizontal" size={24} color={query.colors[1]} />
                    </Pressable>
                )}
                {Platform.OS === 'web' && queryMenuOpen === query.id && (
                    <View className='bg-white gap-2 rounded-xl px-4 py-4 absolute top-14 right-0' style={{ zIndex: 10 }}>
                        <TouchableOpacity>
                            <Text>Re-search Query</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteQuery(query)}>
                            <Text>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {showShareMenu && (
                <Animated.View style={{
                    position: 'absolute',
                    right: 12,
                    top: 70,
                    zIndex: 100,
                    backgroundColor: 'white',
                    borderRadius: 14,
                    paddingVertical: 6,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.18,
                    shadowRadius: 12,
                    elevation: 10,
                    minWidth: 150,
                    opacity: menuAnim,
                    transform: [
                        { scale: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
                        { translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) },
                    ],
                }}>
                    <TouchableOpacity onPress={shareImage} activeOpacity={0.7}
                        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 10 }}>
                        <Ionicons name="image-outline" size={20} color="#333" />
                        <Text style={{ fontSize: 15, color: '#333', fontWeight: '500' }}>Image</Text>
                    </TouchableOpacity>
                    <View style={{ height: 1, backgroundColor: '#f0f0f0', marginHorizontal: 12 }} />
                    <TouchableOpacity onPress={shareLink} activeOpacity={0.7}
                        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 10 }}>
                        <Ionicons name="link-outline" size={20} color="#333" />
                        <Text style={{ fontSize: 15, color: '#333', fontWeight: '500' }}>Link</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
        <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
            <ViewShot ref={snapshotRef} options={{ format: 'png', quality: 1, width: 1080, height: 1920 }}>
                <ExportCard />
            </ViewShot>
        </View>
        <ShareModal isVisible={shareModalVisible} onClose={!shareModalVisible} link={query.share_url} title="Share this search" /></>
    )
    if (Platform.OS !== 'web') {
      return (
        <Swipeable
              renderRightActions={() => (
                  <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity style={{ justifyContent: 'center', paddingHorizontal: 10 }}>
                          <MaterialCommunityIcons name="refresh" size={24} color="#A477C7" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteQuery(item)} style={{ justifyContent: 'center', paddingHorizontal: 10 }}>
                          <Ionicons name="trash-outline" size={24} color="#A477C7" />
                      </TouchableOpacity>
                  </View>
              )}
          >
              {card}
          </Swipeable>
      )
    }

    return card
}

export default SavedQuery