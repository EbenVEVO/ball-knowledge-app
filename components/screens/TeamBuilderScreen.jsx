import { View, Text, ScrollView, Image, Pressable, useWindowDimensions } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'
import { TextInput as GHTextInput } from 'react-native-gesture-handler'
import Ionicons from '@expo/vector-icons/Ionicons'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import VerticalField from '@/components/ui/VerticalField'
import TeamBuilderSlot from '@/components/ui/TeamBuilderSlot'
import PlayerSearchPicker from '@/components/ui/PlayerSearchPicker'
import PopupSelectMenu from '@/components/ui/PopupSelectMenu'
import SaveLineupModal from '@/components/ui/SaveLineupModal'
import ExportLineupModal from '@/components/ui/ExportLineupModal'
import SavedLineupsPanel from '@/components/ui/SavedLineupsPanel'
import { getSlotStyle } from '@/constants/pitchPositions'
import { normalizeLineupPlayers, lineupFormationMap, fetchClubLastLineup } from '@/lib/lineups'

const PURPLE = '#A477C7'
const PITCH_ASPECT = 1000 / 600 // VerticalField's native aspect ratio

// Line groupings used to re-home players to the closest equivalent role when the
// formation changes, so switching formations doesn't clear the lineup.
const ROLE_LINE = {
  GK: 0,
  LB: 1, LCB: 1, CB: 1, RCB: 1, RB: 1,
  LM: 2, LCM: 2, CDM: 2, CM: 2, RCM: 2, RM: 2,
  LAM: 3, CAM: 3, RAM: 3,
  LW: 4, LS: 4, ST: 4, RS: 4, RW: 4,
}

// Remaps existing slot players onto a new set of slot keys, preserving as many
// players as possible: exact role match first, then same line, then any leftover slot.
const remapSlotsToFormation = (oldSlotKeys, oldSlots, newSlotKeys) => {
  const filled = oldSlotKeys
    .map((role, idx) => (oldSlots[idx] ? { role, player: oldSlots[idx] } : null))
    .filter(Boolean)
  const used = new Array(filled.length).fill(false)
  const newSlots = new Array(newSlotKeys.length).fill(undefined)

  const assign = (matches) => {
    newSlotKeys.forEach((role, newIdx) => {
      if (newSlots[newIdx]) return
      const matchIdx = filled.findIndex((f, i) => !used[i] && matches(f, role))
      if (matchIdx !== -1) {
        newSlots[newIdx] = filled[matchIdx].player
        used[matchIdx] = true
      }
    })
  }

  assign((f, role) => f.role === role)
  assign((f, role) => ROLE_LINE[f.role] === ROLE_LINE[role])
  assign(() => true)

  return newSlots
}

export default function TeamBuilderScreen() {
  const { session } = useAuth()
  const requireAuth = useRequireAuth()

  const [formations, setFormations] = useState([])
  const [slotKeys, setSlotKeys] = useState([])
  const [slots, setSlots] = useState([])
  const [formationLabel, setFormationLabel] = useState('')
  const [selectedFormationId, setSelectedFormationId] = useState(null)

  const [activeSlotIndex, setActiveSlotIndex] = useState(null)
  const [openPopupKey, setOpenPopupKey] = useState(null) // 'formation' | 'club' | null

  const [followedClubs, setFollowedClubs] = useState([])
  const [clubSearchText, setClubSearchText] = useState('')
  const [clubSearchResults, setClubSearchResults] = useState([])
  const [fillingClub, setFillingClub] = useState(false)

  const [pitchWidth, setPitchWidth] = useState(340)
  const { width: windowWidth } = useWindowDimensions()
  const isSmallScreen = windowWidth < 400

  const [saveModalVisible, setSaveModalVisible] = useState(false)
  const [exportModalVisible, setExportModalVisible] = useState(false)

  const [savedLineups, setSavedLineups] = useState([])

  const isLineupComplete = slotKeys.length > 0 && slots.every(Boolean)

  useEffect(() => {
    const fetchFormations = async () => {
      const { data, error } = await supabase.from('formations').select('id, name, slot_keys').order('id')
      if (!error && data?.length) {
        setFormations(data)
        const initial = data.find((f) => f.name === '4-3-3') ?? data[0]
        setSlotKeys(initial.slot_keys)
        setSlots(new Array(initial.slot_keys.length).fill(undefined))
        setFormationLabel(initial.name)
        setSelectedFormationId(initial.id)
      }
    }
    fetchFormations()
  }, [])

  useEffect(() => {
    const fetchFollowedClubs = async () => {
      if (!session?.user?.id) {
        setFollowedClubs([])
        return
      }
      const { data, error } = await supabase
        .from('users_followed_teams')
        .select('*, team:team_id(club_name, logo)')
        .eq('user_id', session.user.id)
      if (!error && data) {
        setFollowedClubs(
          data
            .filter((row) => row.team)
            .map((row) => ({ id: row.team_id, club_name: row.team.club_name, logo: row.team.logo }))
        )
      }
    }
    fetchFollowedClubs()
  }, [session?.user?.id])

  const fetchSavedLineups = useCallback(async () => {
    if (!session?.user?.id) {
      setSavedLineups([])
      return
    }
    const { data, error } = await supabase
      .from('users_lineups')
      .select(`
        id, title, slug, formation_id,
        formation:formation_id ( id, name, slot_keys ),
        users_lineup_players ( slot_key, highlited, player:player_id ( id, transfermarkt_name, photo ) )
      `)
      .eq('user_id', session.user.id)
      .order('id', { ascending: false })
    if (!error && data) setSavedLineups(data)
    else if (error) console.log(error)
  }, [session?.user?.id])

  useEffect(() => {
    fetchSavedLineups()
  }, [fetchSavedLineups])

  const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout
    setPitchWidth(Math.min(width - 40, 420))
  }

  const closePopup = () => setOpenPopupKey(null)

  const warnIncomplete = () =>
    Toast.show({ type: 'error', text1: 'Lineup incomplete', text2: 'Fill every position before continuing.' })

  const handlePressSave = () => {
    if (!isLineupComplete) {
      warnIncomplete()
      return
    }
    requireAuth(() => setSaveModalVisible(true))
  }

  const handlePressExport = () => {
    if (!isLineupComplete) {
      warnIncomplete()
      return
    }
    setExportModalVisible(true)
  }

  const handleManualFill = (player) => {
    if (activeSlotIndex === null) return
    setSlots((prev) => {
      const next = [...prev]
      next[activeSlotIndex] = {
        player_id: player.id,
        name: player.transfermarkt_name,
        photo: player.photo,
        highlighted: player.highlighted,
      }
      return next
    })
  }

  const handleSelectFormation = (formation) => {
    setSlots((prevSlots) => remapSlotsToFormation(slotKeys, prevSlots, formation.slot_keys))
    setSlotKeys(formation.slot_keys)
    setFormationLabel(formation.name)
    setSelectedFormationId(formation.id)
  }

  const searchClubs = async (text) => {
    setClubSearchText(text)
    setClubSearchResults([])
    if (text.length > 3) {
      const { data, error } = await supabase.rpc('search_club_player_or_competition', { search_term: text })
      if (!error && data) {
        setClubSearchResults(data.clubs ?? [])
      }
    }
  }

  const handleFillWithClub = async (club) => {
    if (fillingClub) return
    setFillingClub(true)

    const { data, error } = await fetchClubLastLineup(club.id)
    if (error || !data) {
      Toast.show({ type: 'error', text1: 'Lineup not available', text2: `No recent lineup found for ${club.club_name}.` })
      setFillingClub(false)
      return
    }

    const normalized = normalizeLineupPlayers(data.startingLineup)
    if (normalized.some((p) => !p.player_id)) {
      Toast.show({ type: 'error', text1: 'Lineup not available', text2: `${club.club_name}'s last lineup is incomplete.` })
      setFillingClub(false)
      return
    }

    const posMap = lineupFormationMap(data.startingLineup)
    const rowNumbers = Object.keys(posMap).map(Number).sort((a, b) => a - b)
    const newSlotKeys = rowNumbers.flatMap((row) => posMap[row] ?? [])
    const newSlots = new Array(newSlotKeys.length).fill(undefined)

    normalized.forEach((player) => {
      if (!player.grid) return
      const [row, col] = player.grid.split(':').map(Number)
      const role = posMap[row]?.[col - 1]
      if (!role) return
      const slotIndex = newSlotKeys.findIndex((key, idx) => key === role && newSlots[idx] === undefined)
      if (slotIndex === -1) return
      const stats = data.playerStats.find((s) => s.player_id === player.player_id)
      newSlots[slotIndex] = {
        player_id: player.player_id,
        name: player.player_name,
        number: player.number,
        photo: stats?.player?.photo,
      }
    })

    const newFormationLabel = rowNumbers.slice(1).map((row) => (posMap[row] ?? []).length).join('-')

    setSlotKeys(newSlotKeys)
    setSlots(newSlots)
    setFormationLabel(newFormationLabel || club.club_name)
    setSelectedFormationId(null)
    setFillingClub(false)
  }

  // Fills slots from a saved users_lineups row. Builds slotKeys/slots directly from each
  // saved users_lineup_players row's own slot_key rather than the joined formation's
  // slot_keys - a lineup saved via "Fill with Club" has formation_id: null (no matching
  // formations row), so relying on the join would silently produce zero slots for those.
  // getSlotStyle positions a slot purely by its role string, so array order doesn't matter.
  const handleFillWithSavedLineup = (lineup) => {
    const rows = (lineup.users_lineup_players ?? []).filter((row) => row.player && row.slot_key)
    if (!rows.length) {
      Toast.show({ type: 'error', text1: 'Lineup is empty', text2: 'This saved lineup has no players.' })
      return
    }

    setSlotKeys(rows.map((row) => row.slot_key))
    setSlots(rows.map((row) => ({
      player_id: row.player.id,
      name: row.player.transfermarkt_name,
      photo: row.player.photo,
      highlighted: row.highlited,
    })))
    setFormationLabel(lineup.formation?.name ?? lineup.title)
    setSelectedFormationId(lineup.formation_id ?? null)
  }

  const pitchHeight = pitchWidth * PITCH_ASPECT

  return (
    <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center', paddingBottom: 60 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: isSmallScreen ? 8 : 12,
          backgroundColor: PURPLE,
          borderRadius: 28,
          paddingHorizontal: isSmallScreen ? 14 : 20,
          paddingVertical: isSmallScreen ? 8 : 10,
          marginBottom: 24,
        }}
      >
        <Image
          source={require('../../assets/images/logo-dark.png')}
          style={{ height: isSmallScreen ? 40 : 70, width: isSmallScreen ? 155 : 272 }}
          resizeMode="contain"
        />
        <Text
          className={isSmallScreen ? 'text-xl' : 'text-3xl'}
          style={{ fontFamily: 'SupremeExtraBold', color: 'white' }}
        >
          Team Builder
        </Text>
      </View>

      <View onLayout={handleLayout} style={{ width: '100%', alignItems: 'center' }}>
        <VerticalField width={pitchWidth} height={pitchHeight}>
          {slotKeys.map((role, index) => (
            <TeamBuilderSlot
              key={`${role}-${index}`}
              role={role}
              player={slots[index]}
              style={getSlotStyle(role)}
              onPress={() => setActiveSlotIndex(index)}
            />
          ))}
        </VerticalField>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
        <PopupSelectMenu
          visible={openPopupKey === 'formation'}
          onRequestOpen={() => setOpenPopupKey('formation')}
          onRequestClose={closePopup}
          triggerLabel={formationLabel || 'Formation'}
          data={formations}
          keyExtractor={(f) => String(f.id)}
          renderOption={(f) => (
            <Text
              style={{
                fontFamily: f.id === selectedFormationId ? 'SupremeExtraBold' : 'Supreme',
                fontSize: 14,
                color: f.id === selectedFormationId ? PURPLE : '#1a1430',
              }}
            >
              {f.name}
            </Text>
          )}
          onSelect={handleSelectFormation}
          emptyText="No formations available"
        />

        <PopupSelectMenu
          visible={openPopupKey === 'club'}
          onRequestOpen={() => setOpenPopupKey('club')}
          onRequestClose={closePopup}
          triggerLabel="Fill with Club"
          data={clubSearchText.length > 3 ? clubSearchResults : followedClubs}
          keyExtractor={(c) => String(c.id)}
          renderOption={(c) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {c.logo ? <Image source={{ uri: c.logo }} style={{ width: 22, height: 22 }} resizeMode="contain" /> : null}
              <Text style={{ fontFamily: 'Supreme', fontSize: 14, color: '#1a1430' }} numberOfLines={1}>
                {c.club_name}
              </Text>
            </View>
          )}
          onSelect={handleFillWithClub}
          emptyText="Search for a club"
          renderHeader={() => (
            <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0ecfc' }}>
              <GHTextInput
                placeholder="Search for club..."
                placeholderTextColor="#9b8ec4"
                style={{
                  borderWidth: 1,
                  borderColor: '#e0d6f5',
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  outlineStyle: 'none',
                }}
                value={clubSearchText}
                onChangeText={searchClubs}
              />
            </View>
          )}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <Pressable
          onPress={handlePressSave}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: PURPLE,
            borderRadius: 24,
            paddingHorizontal: 18,
            paddingVertical: 10,
            opacity: isLineupComplete ? 1 : 0.5,
          }}
        >
          <Ionicons name="save-outline" size={16} color="white" />
          <Text style={{ fontFamily: 'SupremeExtraBold', color: 'white', fontSize: 14 }}>Save</Text>
        </Pressable>

        <Pressable
          onPress={handlePressExport}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: PURPLE,
            borderRadius: 24,
            paddingHorizontal: 18,
            paddingVertical: 10,
            opacity: isLineupComplete ? 1 : 0.5,
          }}
        >
          <Ionicons name="share-outline" size={16} color="white" />
          <Text style={{ fontFamily: 'SupremeExtraBold', color: 'white', fontSize: 14 }}>Export</Text>
        </Pressable>
      </View>

      {session &&
        <SavedLineupsPanel
          lineups={savedLineups}
          onSelect={handleFillWithSavedLineup}
          style={{ width: '100%', maxWidth: 420, marginTop: 24 }}
        />}

      <PlayerSearchPicker
        visible={activeSlotIndex !== null}
        title={activeSlotIndex !== null ? `Add ${slotKeys[activeSlotIndex]}` : undefined}
        onClose={() => setActiveSlotIndex(null)}
        onSelectPlayer={handleManualFill}
      />

      <SaveLineupModal
        visible={saveModalVisible}
        onClose={() => setSaveModalVisible(false)}
        slotKeys={slotKeys}
        slots={slots}
        formationId={selectedFormationId}
        onSaved={fetchSavedLineups}
      />

      <ExportLineupModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        slotKeys={slotKeys}
        slots={slots}
        formationLabel={formationLabel}
      />
    </ScrollView>
  )
}
