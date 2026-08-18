import {
  Modal as RNModal,
  TouchableWithoutFeedback,
  View,
  Text,
  Image,
  Pressable,
  Platform,
  Switch,
} from 'react-native'
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { TextInput as GHTextInput } from 'react-native-gesture-handler'
import { FlashList } from '@shopify/flash-list'
import Ionicons from '@expo/vector-icons/Ionicons'
import { supabase } from '@/lib/supabase'

const PURPLE = '#A477C7'

function PlayerRow({ player, isHighlighted, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        padding: 10,
        margin: 6,
        borderRadius: 14,
        backgroundColor: 'rgba(164, 119, 199, 0.12)',
      }}
    >
      <Image source={{ uri: player.photo }} style={{ width: 60, height: 60, borderRadius: 30 }} resizeMode="cover" />
      <Text
        style={{
          fontFamily: 'Supreme',
          fontSize: 12,
          textAlign: 'center',
          marginTop: 6,
          color: isHighlighted ? PURPLE : 'black',
        }}
        numberOfLines={2}
      >
        {player.transfermarkt_name}
      </Text>
      {player.club != null && (
        <View className = 'flex flex-row gap-2'>
        <Image source={player.club.logo} style={{width:25, height:25}} resizeMethod='contain'/>
        <Text
          style={{ fontFamily: 'Supreme', fontSize: 10, color: '#888', textAlign: 'center', marginTop: 2 }}
          numberOfLines={1}
        >
          {player.club.name}
        </Text>
        </View>
      )}
    </Pressable>
  )
}

// Player search modal (web) / bottom sheet (native), mirroring CollectionCreationModal.jsx's
// player-search step: same search RPC, same 2-column result grid.
export default function PlayerSearchPicker({ visible, onClose, onSelectPlayer, title = 'Search for a player' }) {
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [highlightedPlayer, setHighlightedPlayer] = useState(null)
  const [highlightInLineup, setHighlightInLineup] = useState(false)
  const bottomSheetRef = useRef(null)
  const snapPoints = useMemo(() => ['80%'], [])

  useEffect(() => {
    if (Platform.OS === 'web') return
    if (visible) {
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [visible])

  useEffect(() => {
    if (!visible) {
      setSearchText('')
      setSearchResults([])
      setHighlightedPlayer(null)
      setHighlightInLineup(false)
    }
  }, [visible])

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} onPress={onClose} />
    ),
    [onClose]
  )

  const searchPlayers = async (text) => {
    setSearchText(text)
    setSearchResults([])
    if (text.length > 3) {
      const { data, error } = await supabase.rpc('search_players', { search_term: text })
      if (!error && data) {
        setSearchResults(data.results ?? [])
      }
      else{
        console.log(error)
      }
    }
  }

  const toggleHighlight = (player) => {
    setHighlightedPlayer((prev) => (prev?.id === player.id ? null : player))
  }

  const confirmSelection = (player) => {
    onSelectPlayer({ ...player, highlighted: highlightInLineup })
    onClose()
  }

  const content = (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20, paddingBottom: 12 }}>
        <Text style={{ fontFamily: 'SupremeExtraBold', fontSize: 18, color: '#1a1430', flex: 1 }} numberOfLines={1}>
          {title}
        </Text>
        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={22} color="#1a1430" />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: '#e0d6f5',
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <Ionicons name="search" size={18} color={PURPLE} />
          <GHTextInput
            placeholder="Search players..."
            placeholderTextColor="#9b8ec4"
            style={{ flex: 1, outlineStyle: 'none' }}
            value={searchText}
            onChangeText={searchPlayers}
          />
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {searchText.length > 3 ? (
          <FlashList
            data={searchResults}
            numColumns={2}
            estimatedItemSize={140}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 30 }}
            renderItem={({ item }) => (
              <PlayerRow
                player={item}
                isHighlighted={highlightedPlayer?.id === item.id}
                onPress={() => toggleHighlight(item)}
              />
            )}
          />
        ) : (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ fontFamily: 'Supreme', color: '#aaa', fontSize: 14 }}>
              Search for a player to add
            </Text>
          </View>
        )}
      </View>

      {highlightedPlayer && (
        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#f0ecfc' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontFamily: 'Supreme', fontSize: 14, color: '#1a1430' }}>
              Highlight name in lineup
            </Text>
            <Switch
              value={highlightInLineup}
              onValueChange={setHighlightInLineup}
              trackColor={{ false: '#e0d6f5', true: PURPLE }}
              thumbColor="white"
            />
          </View>
          <Pressable
            onPress={() => confirmSelection(highlightedPlayer)}
            style={{ backgroundColor: PURPLE, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
          >
            <Text style={{ fontFamily: 'SupremeExtraBold', color: 'white', fontSize: 15 }} numberOfLines={1}>
              Add {highlightedPlayer.transfermarkt_name}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  )

  if (Platform.OS === 'web') {
    return (
      <RNModal visible={visible} onRequestClose={onClose} transparent>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={{ width: '50%', height: '80%', backgroundColor: 'white', borderRadius: 14, overflow: 'hidden' }}>
                {content}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </RNModal>
    )
  }

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDismissOnClose
      enableDynamicSizing={false}
      onDismiss={onClose}
      backgroundStyle={{ borderRadius: 20 }}
      stackBehavior="switch"
      backdropComponent={renderBackdrop}
    >
      <BottomSheetScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {content}
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
}
