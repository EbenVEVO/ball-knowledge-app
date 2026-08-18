import { View, Text, Image, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const getResult = (fixture, teamId) => {
  const isHome = fixture.home_team_id === teamId
  const teamScore = isHome ? fixture.home_score : fixture.away_score
  const opponentScore = isHome ? fixture.away_score : fixture.home_score

  if (teamScore > opponentScore) return 'W'
  if (teamScore < opponentScore) return 'L'
  return 'D'
}

const getResultColor = (result) => {
  if (result === 'W') return '#22c55e'
  if (result === 'L') return '#ef4444'
  return '#6b7280'
}

const getOpponent = (fixture, teamId) =>
  fixture.home_team_id === teamId ? fixture.away_team : fixture.home_team

const getScore = (fixture, teamId) => {
  const isHome = fixture.home_team_id === teamId
  const teamScore = isHome ? fixture.home_score : fixture.away_score
  const opponentScore = isHome ? fixture.away_score : fixture.home_score
  return `${teamScore} - ${opponentScore}`
}

const FormItem = ({ fixture, teamId }) => {
  const result = getResult(fixture, teamId)
  const color = getResultColor(result)
  const opponent = getOpponent(fixture, teamId)
  const score = getScore(fixture, teamId)

  return (
    <View style={styles.formItem}>
      <Image
        source={{ uri: opponent?.logo }}
        style={styles.opponentLogo}
        resizeMode="contain"
      />
      <View style={[styles.scoreBadge, { backgroundColor: color }]}>
        <Text style={styles.scoreText}>{score}</Text>
      </View>
    </View>
  )
}

export const TeamForm = ({ club }) => {
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (!club?.id) return

    const fetchForm = async () => {
      const { data, error } = await supabase
        .from('fixtures')
        .select(`*,
          home_team:home_team_id(club_name, logo, id),
          away_team:away_team_id(club_name, logo, id),
          competition:league_id(name, id, logo)`)
        .or(`home_team_id.eq.${club.id},away_team_id.eq.${club.id}`)
        .eq('match_status', 'Match Finished')
        .order('date_time_utc', { ascending: false })
        .limit(5)

      if (!error) setForm(data)
    }

    fetchForm()
  }, [club?.id])

  if (!form) return null

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Team Form</Text>
      <View style={styles.row}>
        {form.map((fixture) => (
          <FormItem
            key={fixture.id}
            fixture={fixture}
            teamId={club.id}
          />
        ))}
      </View>
    </View>
  )
}

export default TeamForm

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Supreme',

    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formItem: {
    alignItems: 'center',
    gap: 6,
  },
  opponentLogo: {
    width: 40,
    height: 40,
  },
  scoreBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: 58,
    alignItems: 'center',
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 12,
        fontFamily: 'Supreme',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})