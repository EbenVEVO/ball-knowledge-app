import { View, Text, Pressable, ActivityIndicator, Image, TextInput, ScrollView } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchTodaysXIPuzzle, startXIAttempt, submitXIGuess, fetchXIAttemptGuesses, requestXIHint, giveUpXIAttempt } from '@/lib/games'
import { XIPitch } from '@/components/ui/XIPitch'
import SignInPrompt from '@/components/ui/SignInPrompt'

const PURPLE = "#A477C7";

const TERMINAL_MESSAGES = {
  completed: "Nice! You found the full XI",
  failed: "Out of guesses — here's the starting XI",
  abandoned: "You gave up — here's the starting XI",
}

const formatFixtureDate = (date) => {
  const d = new Date(date)
  const day = d.getDate()
  const suffix = (day % 10 === 1 && day !== 11) ? 'st'
    : (day % 10 === 2 && day !== 12) ? 'nd'
    : (day % 10 === 3 && day !== 13) ? 'rd'
    : 'th'
  const month = d.toLocaleDateString('en-US', { month: 'long' })
  return `${month} ${day}${suffix}, ${d.getFullYear()}`
}

// Shared between the picker branch (solid PURPLE card, white text) and the gameplay branch (plain
// background, dark text).
const FixtureInfoHeader = ({ pool, variant = 'light' }) => {
  const textColor = variant === 'dark' ? 'white' : '#111'
  const subColor = variant === 'dark' ? 'white' : '#666'
  const hasPenalties = pool.home_penalty != null && pool.away_penalty != null

  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Text style={{ fontFamily: 'SupremeExtraBold', color: textColor, fontSize: 22, textAlign: 'center' }}>{pool.title}</Text>
      <Text style={{ fontFamily: 'Supreme', color: subColor, fontSize: 13 }}>{formatFixtureDate(pool.match_date)}</Text>
      <Text style={{ fontFamily: 'SupremeBold', color: textColor, fontSize: 18, textAlign: 'center' }}>
        {`${pool.home.name} ${pool.score.home} - ${pool.score.away} ${pool.away.name}`}
      </Text>
      {pool.competition && (
        <Text style={{ fontFamily: 'Supreme', color: subColor, fontSize: 13 }}>{pool.competition}</Text>
      )}
      {hasPenalties && (
        <Text style={{ fontFamily: 'SupremeBold', color: subColor, fontSize: 13 }}>
          {`PEN (${pool.home_penalty}-${pool.away_penalty})`}
        </Text>
      )}
    </View>
  )
}

export default function TheXIScreen() {
  const { session } = useAuth()
  const userId = session?.user?.id

  const [poolStatus, setPoolStatus] = useState('loading')
  const [pool, setPool] = useState(null)
  const [teamSide, setTeamSide] = useState('home')
  const [difficulty, setDifficulty] = useState('hard')
  const [attempt, setAttempt] = useState(null)
  const [isResolvingAttempt, setIsResolvingAttempt] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [guessText, setGuessText] = useState('')
  const [isSubmittingGuess, setIsSubmittingGuess] = useState(false)
  const [guessLog, setGuessLog] = useState([])
  const [hintsOpenForSlot, setHintsOpenForSlot] = useState(false)
  const [isFetchingHint, setIsFetchingHint] = useState(false)
  const [revealedHints, setRevealedHints] = useState({}) // { [grid]: { 1?: hintObj, 2?: hintObj } }
  const [isGivingUp, setIsGivingUp] = useState(false)

  useEffect(() => {
    const loadPool = async () => {
      const { data, error } = await fetchTodaysXIPuzzle()
      if (error) {
        console.log(error, 'error')
        setPoolStatus('error')
        return
      }
      if (!data) {
        console.log('empty')
        setPoolStatus('empty')
        return
      }
      console.log(data, 'todayPuzzle')
      setPool(data)
      setPoolStatus('ready')
    }
    loadPool()
  }, [])

  const handlePlayXI = async () => {
    if (!userId || !pool) return
    setIsResolvingAttempt(true)
    setSelectedSlot(null)
    setGuessLog([])
    setHintsOpenForSlot(false)
    setRevealedHints({})

    const { data, error } = await startXIAttempt(pool.pool_id, teamSide, difficulty)
    if (error) {
      console.log('Failed to start xi_attempt', error)
      setIsResolvingAttempt(false)
      return
    }
    console.log(data, 'attempt')
    setAttempt(data)

    const { data: guesses, error: guessesError } = await fetchXIAttemptGuesses(data.attempt_id)
    if (guessesError) {
      console.log('Failed to fetch xi_attempt guesses', guessesError)
    } else if (Array.isArray(guesses)) {
      setGuessLog(guesses.filter((g) => g.result !== 'hit').map((g) => ({ text: g.text, result: g.result })))
    }

    setIsResolvingAttempt(false)
  }

  const handleSubmitGuess = async () => {
    if (!attempt || !selectedSlot || !guessText.trim()) return
    setIsSubmittingGuess(true)

    const { data, error } = await submitXIGuess(attempt.attempt_id, selectedSlot, guessText.trim())
    console.log('xi_submit_slot_guess result', { data, error })

    if (error) {
      setIsSubmittingGuess(false)
      return
    }

    setAttempt((prev) => ({
      ...prev,
      filled_slots: data.result === 'hit' && data.player
        ? [...prev.filled_slots, data.player]
        : prev.filled_slots,
      correct_count: data.correct_count,
      miss_count: data.miss_count,
      status: data.status,
      reveal: data.reveal ?? prev.reveal,
    }))
    if (data.result !== 'hit') {
      setGuessLog((prev) => [...prev, { text: guessText.trim(), result: data.result }])
    }
    setSelectedSlot(null)
    setGuessText('')
    setIsSubmittingGuess(false)
  }

  const handleUseHint = async (hintLevel) => {
    if (!attempt || !selectedSlot) return
    setIsFetchingHint(true)

    const { data, error } = await requestXIHint(attempt.attempt_id, selectedSlot)
    console.log('xi_use_slot_hint result', { data, error })

    if (error) {
      setIsFetchingHint(false)
      return
    }

    setAttempt((prev) => ({ ...prev, miss_count: data.miss_count, status: data.status, reveal: data.reveal ?? prev.reveal }))
    setRevealedHints((prev) => ({
      ...prev,
      [data.grid]: { ...prev[data.grid], [data.hint_level]: data.hint },
    }))
    setIsFetchingHint(false)
  }

  const handleGiveUp = async () => {
    if (!attempt) return
    setIsGivingUp(true)

    const { data, error } = await giveUpXIAttempt(attempt.attempt_id)
    console.log('xi_give_up_attempt result', { data, error })

    if (error) {
      setIsGivingUp(false)
      return
    }

    setAttempt((prev) => ({ ...prev, status: data.status, reveal: data.reveal }))
    setIsGivingUp(false)
  }

  // Syncs the picker's cached per-side attempt snapshot before leaving the board, so the lobby
  // shows an up to date Completed/Failed/Abandoned button instead of stale pre-session state.
  const handleReturnToLobby = () => {
    if (attempt) {
      setPool((prev) => prev && ({
        ...prev,
        [teamSide]: {
          ...prev[teamSide],
          attempt: {
            attempt_id: attempt.attempt_id,
            status: attempt.status,
            correct_count: attempt.correct_count,
            miss_count: attempt.miss_count,
          },
        },
      }))
    }
    setAttempt(null)
    setSelectedSlot(null)
    setGuessText('')
    setGuessLog([])
    setHintsOpenForSlot(false)
    setRevealedHints({})
  }

  const side = pool?.[teamSide]
  const sideAttempt = pool?.[teamSide]?.attempt

  return (
    <View style={{ padding: 16, flex: 1 }}>
      <Text className='font-supremeBold text-2xl'>The XI</Text>

      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16 }}>
        {!userId ? (
          <SignInPrompt message="Sign in to play today's game." />
        ) : poolStatus === 'loading' ? (
          <ActivityIndicator color={PURPLE} />
        ) : poolStatus === 'error' ? (
          <Text className='font-supreme text-gray-400'>Something went wrong loading today&apos;s game</Text>
        ) : poolStatus === 'empty' ? (
          <Text className='font-supreme text-gray-400'>No game available today</Text>
        ) : attempt ? (
          <View style={{ width: '100%', maxWidth: 380, alignItems: 'center', gap: 8 }}>
            <Pressable onPress={handleReturnToLobby} style={{ alignSelf: 'flex-start' }}>
              <Text style={{ fontFamily: 'SupremeBold', color: PURPLE, fontSize: 13 }}>{'← Lobby'}</Text>
            </Pressable>

            <FixtureInfoHeader pool={pool} />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image source={{ uri: side.crest }} resizeMode='contain' style={{ width: 30, height: 30, borderRadius: 2 }} resizeMode='cover' />
              <Text style={{ fontFamily: 'SupremeExtraBold', fontSize: 18 }}>{side.name} XI</Text>
            </View>
            <Text style={{ fontFamily: 'Supreme', fontSize: 13, color: '#666' }}>{side.formation}</Text>

            {attempt.status === 'in_progress' && (
              <>
                {attempt.difficulty === 'hard' && (
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {Array.from({ length: pool.miss_cap ?? 0 }).map((_, i) => (
                      <FontAwesome
                        key={i}
                        name={i < (pool.miss_cap - attempt.miss_count) ? 'heart' : 'heart-o'}
                        size={18}
                        color={PURPLE}
                      />
                    ))}
                  </View>
                )}
                <Pressable
                  disabled={isGivingUp}
                  onPress={handleGiveUp}
                  style={{ borderWidth: 1, borderColor: PURPLE, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14, opacity: isGivingUp ? 0.5 : 1 }}
                >
                  {isGivingUp ? (
                    <ActivityIndicator color={PURPLE} size='small' />
                  ) : (
                    <Text style={{ fontFamily: 'SupremeBold', color: PURPLE, fontSize: 13 }}>Give Up</Text>
                  )}
                </Pressable>
              </>
            )}
            {attempt.status !== 'in_progress' && (
              <Text style={{ fontFamily: 'Supreme', color: '#666', fontSize: 13 }}>{TERMINAL_MESSAGES[attempt.status]}</Text>
            )}

            {selectedSlot && (
              <View style={{ width: '100%', gap: 8, marginTop: 8 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    value={guessText}
                    onChangeText={setGuessText}
                    placeholder='Guess a player...'
                    style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontFamily: 'Supreme' }}
                  />
                  <Pressable
                    disabled={isSubmittingGuess || !guessText.trim()}
                    onPress={handleSubmitGuess}
                    style={{ backgroundColor: PURPLE, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', opacity: isSubmittingGuess || !guessText.trim() ? 0.5 : 1 }}
                  >
                    {isSubmittingGuess ? (
                      <ActivityIndicator color='white' size='small' />
                    ) : (
                      <Text style={{ fontFamily: 'SupremeBold', color: 'white' }}>Guess</Text>
                    )}
                  </Pressable>
                </View>

                {!hintsOpenForSlot && (
                  <Pressable
                    onPress={() => setHintsOpenForSlot(true)}
                    style={{ alignSelf: 'flex-start', borderWidth: 1, borderColor: PURPLE, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14 }}
                  >
                    <Text style={{ fontFamily: 'SupremeBold', color: PURPLE, fontSize: 13 }}>Hints</Text>
                  </Pressable>
                )}

                {hintsOpenForSlot && (
                  <View style={{ borderWidth: 1, borderColor: PURPLE, borderRadius: 12, padding: 12, gap: 8 }}>
                    {[1, 2].map((level) => {
                      const revealed = revealedHints[selectedSlot]?.[level]
                      return (
                        <View key={level}>
                          {revealed ? (
                            <Text style={{ fontFamily: 'Supreme', color: '#333', fontSize: 13 }}>
                              {level === 1
                                ? `Starts with '${revealed.first_letter}' — ${revealed.nationality}`
                                : (revealed.previous_teams?.length ? `Previous clubs: ${revealed.previous_teams.join(', ')}` : 'No previous clubs on record')}
                            </Text>
                          ) : (
                            <Pressable
                              disabled={isFetchingHint}
                              onPress={() => handleUseHint(level)}
                              style={{ backgroundColor: PURPLE, borderRadius: 999, paddingVertical: 8, alignItems: 'center', opacity: isFetchingHint ? 0.5 : 1 }}
                            >
                              {isFetchingHint ? (
                                <ActivityIndicator color='white' size='small' />
                              ) : (
                                <Text style={{ fontFamily: 'SupremeBold', color: 'white', fontSize: 13 }}>{`Hint ${level}`}</Text>
                              )}
                            </Pressable>
                          )}
                        </View>
                      )
                    })}
                  </View>
                )}
              </View>
            )}
            <XIPitch
              formation={side.formation}
              filledSlots={attempt.reveal ?? attempt.filled_slots}
              slotHints={attempt.slot_hints}
              difficulty={attempt.difficulty}
              selectedSlot={attempt.status === 'in_progress' ? selectedSlot : null}
              onSelectSlot={attempt.status === 'in_progress' ? (grid) => {
                setSelectedSlot(grid)

                setHintsOpenForSlot(grid === selectedSlot ? hintsOpenForSlot : Boolean(revealedHints[grid]))
              } : undefined}
            >
              {attempt.status === 'in_progress' && guessLog.length > 0 && (
                <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {guessLog.map((guess, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: guess.result === 'wrong_slot' ? '#eab308' : '#ef4444',
                        borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
                      }}
                    >
                      <Text style={{ fontFamily: 'SupremeBold', color: 'white', fontSize: 12 }}>{guess.text}</Text>
                    </View>
                  ))}
                </View>
              )}
            </XIPitch>

          </View>
        ) : (
          <View style={{ backgroundColor: PURPLE, borderRadius: 24, padding: 24, alignItems: 'center', gap: 8, width: '100%', maxWidth: 380 }}>
            <FixtureInfoHeader pool={pool} variant="dark" />

            <Text style={{ fontFamily: 'SupremeBold', color: 'white', fontSize: 16, marginTop: 12 }}>Choose side to attempt</Text>

            <View style={{ flexDirection: 'row', gap: 24, marginTop: 8 }}>
              <Image resizeMode='contain' source={{ uri: pool.home.crest }} style={{ width: 75, height: 75, borderRadius: 4 }} resizeMode='cover' />
              <Image resizeMode='contain' source={{ uri: pool.away.crest }} style={{ width: 75, height: 75, borderRadius: 4 }} resizeMode='cover' />
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Pressable
                onPress={() => setTeamSide('home')}
                style={{
                  backgroundColor: teamSide === 'home' ? 'white' : 'transparent',
                  borderWidth: 1, borderColor: 'white',
                  borderRadius: 12, paddingVertical: 10, paddingHorizontal: 24,
                }}
              >
                <Text style={{ fontFamily: 'SupremeBold', color: teamSide === 'home' ? PURPLE : 'white' }}>Home</Text>
              </Pressable>
              <Pressable
                onPress={() => setTeamSide('away')}
                style={{
                  backgroundColor: teamSide === 'away' ? 'white' : 'transparent',
                  borderWidth: 1, borderColor: 'white',
                  borderRadius: 12, paddingVertical: 10, paddingHorizontal: 24,
                }}
              >
                <Text style={{ fontFamily: 'SupremeBold', color: teamSide === 'away' ? PURPLE : 'white' }}>Away</Text>
              </Pressable>
            </View>

            {sideAttempt ? (
              <Pressable
                onPress={handlePlayXI}
                disabled={isResolvingAttempt}
                style={{ backgroundColor: 'white', borderRadius: 999, paddingVertical: 14, width: '100%', alignItems: 'center', marginTop: 20 }}
              >
                {isResolvingAttempt ? (
                  <ActivityIndicator color={PURPLE} />
                ) : (
                  <Text style={{ fontFamily: 'SupremeBold', color: PURPLE, fontSize: 18 }}>
                    {sideAttempt.status === 'in_progress'
                      ? 'Continue'
                      : sideAttempt.status.charAt(0).toUpperCase() + sideAttempt.status.slice(1)}
                  </Text>
                )}
              </Pressable>
            ) : (
              <>
                <Text style={{ fontFamily: 'SupremeBold', color: 'white', fontSize: 16, marginTop: 12 }}>Choose difficulty</Text>

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <Pressable
                    onPress={() => setDifficulty('easy')}
                    style={{
                      backgroundColor: difficulty === 'easy' ? 'white' : 'transparent',
                      borderWidth: 1, borderColor: 'white',
                      borderRadius: 12, paddingVertical: 10, paddingHorizontal: 24,
                    }}
                  >
                    <Text style={{ fontFamily: 'SupremeBold', color: difficulty === 'easy' ? PURPLE : 'white' }}>Easy</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setDifficulty('hard')}
                    style={{
                      backgroundColor: difficulty === 'hard' ? 'white' : 'transparent',
                      borderWidth: 1, borderColor: 'white',
                      borderRadius: 12, paddingVertical: 10, paddingHorizontal: 24,
                    }}
                  >
                    <Text style={{ fontFamily: 'SupremeBold', color: difficulty === 'hard' ? PURPLE : 'white' }}>Hard</Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={handlePlayXI}
                  disabled={isResolvingAttempt}
                  style={{ backgroundColor: 'white', borderRadius: 999, paddingVertical: 14, width: '100%', alignItems: 'center', marginTop: 20 }}
                >
                  {isResolvingAttempt ? (
                    <ActivityIndicator color={PURPLE} />
                  ) : (
                    <Text style={{ fontFamily: 'SupremeBold', color: PURPLE, fontSize: 18 }}>Play XI</Text>
                  )}
                </Pressable>
              </>
            )}

            <Text style={{ fontFamily: 'Supreme', color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 12 }}>Next game tomorrow</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
