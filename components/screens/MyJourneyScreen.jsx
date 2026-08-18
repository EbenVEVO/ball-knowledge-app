import { useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Share } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '@/contexts/AuthContext'
import SignInPrompt from '@/components/ui/SignInPrompt'
import CareerJerseyPreview from '@/components/ui/CareerJerseyPreview'
import CareerFieldSelect from '@/components/ui/CareerFieldSelect'
import CareerLadderTable from '@/components/ui/CareerLadderTable'
import CareerPortalCard from '@/components/ui/CareerPortalCard'
import CareerCompleteSummary from '@/components/ui/CareerCompleteSummary'
import { fetchCareerNationalities, fetchCareerPositions, startCareer, rollNextSeason } from '@/lib/games'

const PURPLE = '#A477C7'
const STORAGE_PREFIX = 'my-journey:'

const ACADEMY_BLURB = "A few clubs are offering you a place in their youth academy. Choose where your career starts."
const DEFAULT_TRANSFER_BLURB = 'Clubs are interested in signing you. Choose your next move.'

const titleCase = (s) =>
  (s || '')
    .replace(/_/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())

export default function MyJourneyScreen() {
  const { session } = useAuth()
  const userId = session?.user?.id

  const [screen, setScreen] = useState('loading') // loading | intro | setup | career | complete

  // Setup (My Pro) form — local only, start_career has no params for name/number.
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [nationality, setNationality] = useState(null)
  const [position, setPosition] = useState(null)
  const [nationalities, setNationalities] = useState([])
  const [positions, setPositions] = useState([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  // Career loop
  const [careerState, setCareerState] = useState(null) // { position, nationality, age, reputation, seasons }
  const [clubsById, setClubsById] = useState({}) // club_id -> { name, logo } — built from prompt options as they arrive
  const clubsByIdRef = useRef({})
  const [viewMode, setViewMode] = useState(null) // 'narrative' | 'choice' | null
  const [pendingEvent, setPendingEvent] = useState(null) // { type, description }
  const [pendingPrompt, setPendingPrompt] = useState(null) // { type, options }
  const [pendingComplete, setPendingComplete] = useState(false)
  const [selectedClubId, setSelectedClubId] = useState(null)
  const [isRolling, setIsRolling] = useState(false)

  // Resume an in-progress career from AsyncStorage, or fall back to the intro screen.
  useEffect(() => {
    if (!userId) return
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_PREFIX + userId)
        if (raw) {
          const saved = JSON.parse(raw)
          setName(saved.name || '')
          setNumber(saved.number || '')
          setCareerState(saved.careerState || null)
          clubsByIdRef.current = saved.clubsById || {}
          setClubsById(saved.clubsById || {})
          setPendingEvent(saved.pendingEvent || null)
          setPendingPrompt(saved.pendingPrompt || null)
          setPendingComplete(!!saved.pendingComplete)
          setViewMode(saved.viewMode || null)
          setScreen(saved.screen || 'intro')
          return
        }
      } catch (e) {
        console.log('my-journey resume error', e)
      }
      setScreen('intro')
    })()
  }, [userId])

  useEffect(() => {
    if (screen !== 'setup' || nationalities.length || positions.length) return
    (async () => {
      setIsLoadingOptions(true)
      const [natRes, posRes] = await Promise.all([fetchCareerNationalities(), fetchCareerPositions()])
      if (!natRes.error) {
        const unique = Array.from(new Set((natRes.data || []).map((r) => r.country).filter(Boolean))).sort()
        setNationalities(unique)
      } else {
        console.log('fetchCareerNationalities error', natRes.error)
      }
      if (!posRes.error) {
        setPositions((posRes.data || []).map((r) => r.position).filter(Boolean))
      } else {
        console.log('fetchCareerPositions error', posRes.error)
      }
      setIsLoadingOptions(false)
    })()
  }, [screen])

  const persistProgress = async (payload) => {
    if (!userId) return
    try {
      await AsyncStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(payload))
    } catch (e) {
      console.log('my-journey persist error', e)
    }
  }

  const cacheClubs = (options) => {
    const next = { ...clubsByIdRef.current }
    ;(options || []).forEach((o) => { next[o.club_id] = { name: o.name, logo: o.logo } })
    clubsByIdRef.current = next
    setClubsById(next)
    return next
  }

  // Shared by start_career and roll_next_season responses — decides what to show next and
  // silently rolls another season when a response has neither a narrative beat nor a choice.
  const processResponse = async (data) => {
    const { state, event, next_prompt, career_complete } = data
    const mergedClubs = cacheClubs(next_prompt?.options)
    setCareerState(state)
    setSelectedClubId(null)

    const hasEvent = !!event?.description
    const hasPrompt = !!next_prompt

    if (hasEvent) {
      setPendingEvent(event)
      setPendingPrompt(next_prompt || null)
      setPendingComplete(!!career_complete)
      setViewMode('narrative')
      setScreen('career')
      await persistProgress({
        screen: 'career', name, number, careerState: state, clubsById: mergedClubs,
        pendingEvent: event, pendingPrompt: next_prompt || null, pendingComplete: !!career_complete, viewMode: 'narrative',
      })
      return
    }

    if (hasPrompt) {
      setPendingEvent(null)
      setPendingPrompt(next_prompt)
      setPendingComplete(!!career_complete)
      setViewMode('choice')
      setScreen('career')
      await persistProgress({
        screen: 'career', name, number, careerState: state, clubsById: mergedClubs,
        pendingEvent: null, pendingPrompt: next_prompt, pendingComplete: !!career_complete, viewMode: 'choice',
      })
      return
    }

    if (career_complete) {
      setPendingEvent(null)
      setPendingPrompt(null)
      setViewMode(null)
      setScreen('complete')
      await persistProgress({ screen: 'complete', name, number, careerState: state, clubsById: mergedClubs })
      return
    }

    // Nothing to show this step (quiet season, no window) — roll straight into the next one.
    const { data: nextData, error } = await rollNextSeason(state, null)
    if (error) {
      console.log('roll_next_season error', error)
      return
    }
    await processResponse(nextData)
  }

  const handleStartCareer = async () => {
    if (!position || !nationality || isStarting) return
    setIsStarting(true)
    try {
      const { data, error } = await startCareer(position, nationality)
      if (error) {
        console.log('start_career error', error)
        return
      }
      await processResponse(data)
    } finally {
      setIsStarting(false)
    }
  }

  const handleNarrativeContinue = async () => {
    if (isRolling) return
    if (pendingPrompt) {
      setViewMode('choice')
      await persistProgress({
        screen: 'career', name, number, careerState, clubsById: clubsByIdRef.current,
        pendingEvent, pendingPrompt, pendingComplete, viewMode: 'choice',
      })
      return
    }
    if (pendingComplete) {
      setPendingEvent(null)
      setScreen('complete')
      await persistProgress({ screen: 'complete', name, number, careerState, clubsById: clubsByIdRef.current })
      return
    }
    setIsRolling(true)
    try {
      setPendingEvent(null)
      const { data, error } = await rollNextSeason(careerState, null)
      if (error) {
        console.log('roll_next_season error', error)
        return
      }
      await processResponse(data)
    } finally {
      setIsRolling(false)
    }
  }

  const handleChoiceContinue = async () => {
    if (!selectedClubId || isRolling) return
    setIsRolling(true)
    try {
      const { data, error } = await rollNextSeason(careerState, { club_id: selectedClubId })
      if (error) {
        console.log('roll_next_season error', error)
        return
      }
      await processResponse(data)
    } finally {
      setIsRolling(false)
    }
  }

  const handleStartNewCareer = async () => {
    if (userId) {
      try { await AsyncStorage.removeItem(STORAGE_PREFIX + userId) } catch (e) { console.log('my-journey clear error', e) }
    }
    setName('')
    setNumber('')
    setNationality(null)
    setPosition(null)
    setCareerState(null)
    clubsByIdRef.current = {}
    setClubsById({})
    setPendingEvent(null)
    setPendingPrompt(null)
    setPendingComplete(false)
    setViewMode(null)
    setScreen('intro')
  }

  const handleShare = () => {
    const seasons = careerState?.seasons || []
    const goals = seasons.reduce((t, s) => t + (s.gls || 0), 0)
    const assists = seasons.reduce((t, s) => t + (s.ast || 0), 0)
    Share.share({ message: `I just finished my career on My Journey: ${goals} goals, ${assists} assists across ${seasons.length} seasons. ⚽` })
  }

  if (!userId) {
    return <SignInPrompt message="Sign in to start your career." />
  }

  if (screen === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={PURPLE} />
      </View>
    )
  }

  if (screen === 'intro') {
    return (
      <View style={{ flex: 1, padding: 24 }}>
        <Text className='font-supremeExtraBold' style={{ fontSize: 32 }}>My Journey</Text>
        <Text className='font-supreme' style={{ fontSize: 15, color: '#555', marginTop: 12, lineHeight: 22 }}>
          Do you have what it takes to be part of football folklore? Win trophies, make transfers, and live out a full career.
        </Text>
        <Pressable
          onPress={() => setScreen('setup')}
          style={{ backgroundColor: PURPLE, borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginTop: 40 }}
        >
          <Text className='font-supremeBold' style={{ color: 'white', fontSize: 16 }}>Start Career</Text>
        </Pressable>
      </View>
    )
  }

  if (screen === 'setup') {
    const canContinue = !!position && !!nationality && !isStarting
    return (
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        <Text className='font-supremeExtraBold' style={{ fontSize: 28 }}>My Pro</Text>

        <View style={{ alignItems: 'center', marginVertical: 24 }}>
          <CareerJerseyPreview name={name} number={number} />
        </View>

        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text className='font-supreme' style={{ fontSize: 14, marginBottom: 6 }}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              maxLength={20}
              style={{ borderWidth: 1.5, borderColor: '#DBDBDB', borderRadius: 999, paddingHorizontal: 20, paddingVertical: 14, fontSize: 16, fontFamily: 'SupremeBold' }}
            />
          </View>
          <View style={{ width: 100 }}>
            <Text className='font-supreme' style={{ fontSize: 14, marginBottom: 6 }}>Number</Text>
            <TextInput
              value={number}
              onChangeText={(t) => setNumber(t.replace(/[^0-9]/g, '').slice(0, 2))}
              placeholder="10"
              keyboardType="number-pad"
              style={{ borderWidth: 1.5, borderColor: '#DBDBDB', borderRadius: 999, paddingHorizontal: 20, paddingVertical: 14, fontSize: 16, fontFamily: 'SupremeBold', textAlign: 'center' }}
            />
          </View>
        </View>

        <View style={{ gap: 20 }}>
          <CareerFieldSelect
            label="Nationality"
            value={nationality}
            options={nationalities}
            onChange={setNationality}
            placeholder={isLoadingOptions ? 'Loading…' : 'Select nationality'}
            disabled={isLoadingOptions}
            emptyText="No nationalities available yet"
          />
          <CareerFieldSelect
            label="Position"
            value={position}
            options={positions}
            onChange={setPosition}
            placeholder={isLoadingOptions ? 'Loading…' : 'Select position'}
            disabled={isLoadingOptions}
            emptyText="No positions available yet"
          />
        </View>

        <Pressable
          onPress={handleStartCareer}
          disabled={!canContinue}
          style={{ backgroundColor: PURPLE, borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginTop: 32, opacity: canContinue ? 1 : 0.5 }}
        >
          {isStarting ? <ActivityIndicator color="white" /> : (
            <Text className='font-supremeBold' style={{ color: 'white', fontSize: 16 }}>Continue</Text>
          )}
        </Pressable>
      </ScrollView>
    )
  }

  const seasons = careerState?.seasons || []

  if (screen === 'career') {
    const lastSeason = seasons[seasons.length - 1]
    const wonTrophy = viewMode === 'narrative' && (lastSeason?.trophies?.length || 0) > 0

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <CareerLadderTable seasons={seasons} currentAge={careerState?.age} clubsById={clubsById} />

        <View style={{ paddingHorizontal: 16 }}>
          {viewMode === 'narrative' && (
            <CareerPortalCard
              mode="narrative"
              title={wonTrophy ? '🏆 TROPHY WON' : 'SCENARIO'}
              description={pendingEvent?.description}
              onContinue={handleNarrativeContinue}
              continueDisabled={isRolling}
            />
          )}

          {viewMode === 'choice' && (
            <CareerPortalCard
              mode="choice"
              title={pendingPrompt?.type === 'academy' ? 'Join an academy' : (titleCase(pendingEvent?.type) || 'Transfer offer')}
              description={pendingPrompt?.type === 'academy' ? ACADEMY_BLURB : (pendingEvent?.description || DEFAULT_TRANSFER_BLURB)}
              options={pendingPrompt?.options || []}
              selectedClubId={selectedClubId}
              onSelectClub={setSelectedClubId}
              onContinue={handleChoiceContinue}
              continueDisabled={!selectedClubId || isRolling}
            />
          )}
        </View>
      </ScrollView>
    )
  }

  // screen === 'complete'
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
      <CareerLadderTable seasons={seasons} currentAge={careerState?.age} clubsById={clubsById} />
      <View style={{ paddingHorizontal: 16 }}>
        <CareerCompleteSummary seasons={seasons} onShare={handleShare} />
        <Pressable onPress={handleStartNewCareer} style={{ alignItems: 'center', marginTop: 20 }}>
          <Text className='font-supreme' style={{ color: '#999', fontSize: 13, textDecorationLine: 'underline' }}>Start New Career</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}
