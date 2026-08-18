import { View, Text, FlatList, Pressable } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Feather from '@expo/vector-icons/Feather'
import { fetchCollectionsForUser } from '@/lib/collections'
import { useAuth } from '../../../contexts/AuthContext'
import CollectionPreviewCard from '../../../components/ui/CollectionPreviewCard'
import CollectionCreationModal from '../../../components/ui/CollectionCreationModal'
import TopNavBar from '@/components/navigation/TopNavBar'

const PURPLE = "#A477C7";

export default function CollectionHome(){
    const {session, profile} = useAuth()
    const [userCollections, setUserCollections] = useState()
    const [createModalVisible, setCreateModalVisible] = useState(false)

    const fetchUserCollections = useCallback(async () => {
        if (!session?.user.id) return
        const {data, error} = await fetchCollectionsForUser(session.user.id)
        if(!error) setUserCollections(data)
    }, [session?.user.id])

    useEffect(()=>{
        fetchUserCollections()
    }, [fetchUserCollections])

    const renderCollection = ({item}) => (
        <CollectionPreviewCard collection={item} authorUsername={profile?.username} href={`./${item.slug}`} />
    )

    return(
        <View style={{ flex: 1 }}>
        <TopNavBar title="Collections" />
        <View style={{ padding: 16, flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text className='font-supremeBold text-2xl'>
                    {profile?.username}'s Collections
                </Text>
                <Pressable
                    onPress={() => setCreateModalVisible(true)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: PURPLE, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
                >
                    <Feather name="plus" size={16} color="white" />
                    <Text style={{ fontFamily: 'SupremeExtraBold', color: 'white', fontSize: 13 }}>New Collection</Text>
                </Pressable>
            </View>
            <FlatList
                data={userCollections}
                renderItem={renderCollection}
                keyExtractor={(item) => String(item.id)}
                ListEmptyComponent={()=>(
                    <View><Text className='font-supreme text-gray-400'>No Collections</Text></View>
                )}
            />
            <CollectionCreationModal
                isVisible={createModalVisible}
                onClose={() => setCreateModalVisible(false)}
                onSaved={fetchUserCollections}
            />
        </View>
        </View>
    )
}
