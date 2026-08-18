import {
  Modal as RNModal,
  TouchableWithoutFeedback,
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
} from 'react-native'
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import Toast from 'react-native-toast-message'
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import Ionicons from '@expo/vector-icons/Ionicons'
import { nanoid } from 'nanoid/non-secure'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const PURPLE = '#A477C7'

const VISIBILITY_OPTIONS = [
  { label: 'Private', value: 'private' },
  { label: 'Public', value: 'public' },
]

function SegmentedControl({ options, selected, onSelect }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: '#f0ecfc', borderRadius: 20, padding: 3 }}>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          onPress={() => onSelect(opt.value)}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 18,
            alignItems: 'center',
            backgroundColor: selected === opt.value ? PURPLE : 'transparent',
          }}
        >
          <Text
            style={{
              fontFamily: 'SupremeExtraBold',
              fontSize: 13,
              color: selected === opt.value ? '#fff' : '#6b5fa0',
            }}
          >
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

// Save-the-current-lineup modal - name it, describe it, choose public/private, write to
// users_lineups + users_lineup_players. Mirrors CollectionCreationModal's save-with-child-rows
// shape (parent insert -> child insert -> manual rollback of the parent on child failure).
export default function SaveLineupModal({ visible, onClose, slotKeys, slots, formationId, onSaved }) {
  const { session } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState('private')
  const [saving, setSaving] = useState(false)
  const bottomSheetRef = useRef(null)
  const snapPoints = useMemo(() => ['60%'], [])

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
      setTitle('')
      setDescription('')
      setVisibility('private')
      setSaving(false)
    }
  }, [visible])

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} onPress={onClose} />
    ),
    [onClose]
  )

  const saveLineup = async () => {
    if (saving || !title.trim() || !session?.user?.id) return
    setSaving(true)

    const { data: lineup, error } = await supabase
      .from('users_lineups')
      .insert({
        user_id: session.user.id,
        title: title.trim(),
        formation_id: formationId,
        visibility,
        slug: nanoid(8),
        description: description.trim() || null,
      })
      .select()
      .single()

    if (error || !lineup) {
      Toast.show({ type: 'error', text1: 'Could not save lineup', text2: error?.message })
      setSaving(false)
      return
    }

    const players = slots.map((player, i) => ({
      lineup_id: lineup.id,
      player_id: player.player_id,
      slot_key: slotKeys[i],
      highlited: !!player.highlighted,
    }))

    const { error: playersError } = await supabase.from('users_lineup_players').insert(players)
    if (playersError) {
      await supabase.from('users_lineups').delete().eq('id', lineup.id)
      Toast.show({ type: 'error', text1: 'Could not save lineup', text2: playersError.message })
      setSaving(false)
      return
    }

    setSaving(false)
    Toast.show({ type: 'success', text1: 'Lineup saved' })
    onSaved?.(lineup)
    onClose()
  }

  const content = (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20, paddingBottom: 12 }}>
        <Text style={{ fontFamily: 'SupremeExtraBold', fontSize: 18, color: '#1a1430', flex: 1 }} numberOfLines={1}>
          Save Lineup
        </Text>
        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={22} color="#1a1430" />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20, gap: 16 }}>
        <View>
          <Text style={{ fontFamily: 'Supreme', color: '#888', fontSize: 12, marginBottom: 4 }}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Lineup title..."
            placeholderTextColor="#bbb"
            style={{ fontFamily: 'SupremeExtraBold', fontSize: 22, color: '#1a1430', paddingVertical: 4, outlineStyle: 'none' }}
          />
        </View>

        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontFamily: 'Supreme', color: '#888', fontSize: 12 }}>Description</Text>
            <Text style={{ fontFamily: 'Supreme', color: '#bbb', fontSize: 11 }}>{description.length}/150</Text>
          </View>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add a description..."
            placeholderTextColor="#bbb"
            multiline
            maxLength={150}
            style={{
              fontFamily: 'Supreme',
              fontSize: 14,
              color: '#1a1430',
              minHeight: 60,
              textAlignVertical: 'top',
              borderWidth: 1.5,
              borderColor: '#e0d8f0',
              borderRadius: 14,
              padding: 12,
              outlineStyle: 'none',
            }}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: 'Supreme', color: '#888', fontSize: 12 }}>Visibility</Text>
          <SegmentedControl options={VISIBILITY_OPTIONS} selected={visibility} onSelect={setVisibility} />
          <Text style={{ fontFamily: 'Supreme', color: '#aaa', fontSize: 11 }}>
            {visibility === 'public'
              ? 'Anyone with the link can view this lineup.'
              : 'Only you can see this lineup.'}
          </Text>
        </View>
      </View>

      <View style={{ padding: 16, marginTop: 'auto' }}>
        <Pressable
          onPress={saveLineup}
          disabled={saving || !title.trim()}
          style={{
            backgroundColor: PURPLE,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
            opacity: saving || !title.trim() ? 0.5 : 1,
          }}
        >
          <Text style={{ fontFamily: 'SupremeExtraBold', color: 'white', fontSize: 15 }}>
            {saving ? 'Saving...' : 'Save Lineup'}
          </Text>
        </Pressable>
      </View>
    </View>
  )

  if (Platform.OS === 'web') {
    return (
      <RNModal visible={visible} onRequestClose={onClose} transparent>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={{ width: '50%', height: '70%', backgroundColor: 'white', borderRadius: 14, overflow: 'hidden' }}>
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
