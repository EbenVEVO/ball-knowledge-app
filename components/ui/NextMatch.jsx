import { View, Text, Image, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Link } from 'expo-router'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


export const NextMatch = ({ club }) => {
  const [nextMatch, setNextMatch] = useState(null)

  useEffect(() => {
    if (!club?.id) return

    const getNextMatch = async () => {
      const { data, error } = await supabase
        .from('fixtures')
        .select(`*,
          home_team:home_team_id(club_name, logo, id),
          away_team:away_team_id(club_name, logo, id),
          competition:league_id(name, id, logo)`)
        .or(`home_team_id.eq.${club.id},away_team_id.eq.${club.id}`)
        .eq('match_status', 'Not Started')
        .order('date_time_utc', { ascending: true })
        .limit(1)
        .single()

      if (!error) setNextMatch(data)
    }

    getNextMatch()
  }, [club?.id])

  const formatDate = (date) => {
    const options = { weekday: 'short', day: 'numeric', month: 'short' }
    return new Date(date).toLocaleDateString('en-US', options)
  }

  const formatTime = (date) => {
    const options = { hour: 'numeric', minute: '2-digit', hour12: true }
    return new Date(date).toLocaleTimeString('en-US', options)
  }

  if (!nextMatch) return null

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Next Match</Text>

      {/* Competition pill */}
      <View style={styles.competitionPill}>
        <Link href={{ pathname: '/competition/[id]', params: { id: nextMatch.competition.id } }}>
          <View style={styles.competitionInner}>
            <Image
              source={{ uri: nextMatch.competition.logo }}
              style={styles.competitionLogo}
              resizeMode="contain"
            />
            <Text style={styles.competitionName}>{nextMatch.competition.name}</Text>
          </View>
        </Link>
      </View>

      {/* Match row */}
      <View style={styles.matchRow}>

        {/* Home team */}
        <Link href={{ pathname: '/club/[id]', params: { id: nextMatch.home_team_id } }} style={styles.teamLink}>
          <View style={styles.teamLeft}>
            <Image
              source={{ uri: nextMatch.home_team.logo }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
            <Text numberOfLines={2} style={styles.teamName}>
              {nextMatch.home_team.club_name}
            </Text>
          </View>
        </Link>

        {/* Date / time */}
        <View style={styles.dateBlock}>
          <Text style={styles.dateText}>{formatDate(nextMatch.date_time_utc)}</Text>
          <Text style={styles.timeText}>{formatTime(nextMatch.date_time_utc)}</Text>
        </View>

        {/* Away team */}
        <Link href={{ pathname: '/club/[id]', params: { id: nextMatch.away_team.id } }} style={styles.teamLink}>
          <View style={styles.teamRight}>
            <Text numberOfLines={2} style={[styles.teamName, { textAlign: 'right' }]}>
              {nextMatch.away_team.club_name}
            </Text>
            <Image
              source={{ uri: nextMatch.away_team.logo }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          </View>
        </Link>

      </View>

      {/* Stadium */}
      {nextMatch.stadium_name && (
        <View className = 'flex flex-row gap-3 items-center justify-center'>
          <MaterialIcons name="stadium" size={20} color="black" />
          <Text style={styles.stadium}> {nextMatch.stadium_name}</Text>
        </View>
      )}
    </View>
  )
}

export default NextMatch

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: 'Supreme',

  },

  // Competition pill
  competitionPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8e8e8',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  competitionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  competitionLogo: {
    width: 14,
    height: 14,
  },
  competitionName: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Match row
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  teamLink: {
    flex: 1,
  },
  teamLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teamRight: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  teamLogo: {
    width: 50,
    height: 50,
  },
  teamName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    fontFamily:'Supreme'
  },

  dateBlock: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Supreme',
    textAlign: 'center',
  },
  timeText: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'Supreme',
    marginTop: 2,
  },

  // Stadium
  stadium: {
    fontSize: 12,
    fontFamily: 'Supreme',
    color: '#6b7280',
    textAlign: 'center',
  },
})