import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { fetchTodaysXIPuzzle } from '@/lib/games'

const PURPLE = '#A477C7'
const GREEN = '#22c55e'
const RED = '#ef4444'

const SideStatus = ({ label, done }) => (
  <View className='flex flex-row items-center' style={{ gap: 8 }}>
    <FontAwesome name={done ? 'check-circle' : 'times-circle'} size={18} color={done ? GREEN : RED} />
    <Text className='font-supremeBold' style={{ fontSize: 14 }}>{label}</Text>
  </View>
)

const TheXICtaCard = () => {
  const [status, setStatus] = useState('loading')
  const [pool, setPool] = useState(null)

  useEffect(() => {
    let cancelled = false

    const loadPool = async () => {
      const { data, error } = await fetchTodaysXIPuzzle()
      if (cancelled) return
      if (error || !data) {
        setStatus('empty')
        return
      }
      setPool(data)
      setStatus('ready')
    }

    loadPool().catch(() => { if (!cancelled) setStatus('empty') })

    return () => { cancelled = true }
  }, [])

  if (status === 'empty') return null

  if (status === 'loading') {
    return (
      <View className='rounded-xl bg-white p-4' style={{ borderColor: '#e0e0e0', borderWidth: 1, alignItems: 'center', justifyContent: 'center', minHeight: 100 }}>
        <ActivityIndicator color={PURPLE} />
      </View>
    )
  }

  const homeDone = pool.home?.attempt?.status === 'completed'
  const awayDone = pool.away?.attempt?.status === 'completed'
  const allDone = homeDone && awayDone

  return (
    <View className='rounded-xl bg-white p-4' style={{ borderColor: '#e0e0e0', borderWidth: 1, gap: 12 }}>
      <Text className='font-supremeBold' style={{ fontSize: 16 }}>
        {allDone ? "You've completed today's XI!" : "You haven't completed today's XI"}
      </Text>

      <View className='flex flex-row' style={{ gap: 20 }}>
        <SideStatus label='Home' done={homeDone} />
        <SideStatus label='Away' done={awayDone} />
      </View>

      <Link href='/games/thexi' asChild>
        <Pressable style={{ backgroundColor: PURPLE, borderRadius: 24, paddingVertical: 12, alignItems: 'center' }}>
          <Text className='font-supremeExtraBold' style={{ color: 'white', fontSize: 15, letterSpacing: 0.5 }}>Go to The XI</Text>
        </Pressable>
      </Link>
    </View>
  )
}

export default TheXICtaCard
