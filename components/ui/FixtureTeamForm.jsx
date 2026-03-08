import { View, Text, Image, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase';

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

const getOpponent = (fixture, teamId) => {
  return fixture.home_team_id === teamId ? fixture.away_team : fixture.home_team
}

const getScore = (fixture, teamId) => {
  const isHome = fixture.home_team_id === teamId
  const teamScore = isHome ? fixture.home_score : fixture.away_score
  const opponentScore = isHome ? fixture.away_score : fixture.home_score
  return `${teamScore} - ${opponentScore}`
}

// logoSide: 'left' for home team, 'right' for away team
const FormItem = ({ fixture, teamId, logoSide = 'right' }) => {
  const result = getResult(fixture, teamId)
  const color = getResultColor(result)
  const opponent = getOpponent(fixture, teamId)
  const score = getScore(fixture, teamId)

  return (
    <View style={styles.formItem}>
      {logoSide === 'left' && (
        <Image
          source={{ uri: opponent?.logo }}
          style={styles.opponentLogo}
          resizeMode="contain"
        />
      )}
      <View style={[styles.scoreBadge, { backgroundColor: color }]}>
        <Text style={styles.scoreText}>{score}</Text>
      </View>
      {logoSide === 'right' && (
        <Image
          source={{ uri: opponent?.logo }}
          style={styles.opponentLogo}
          resizeMode="contain"
        />
      )}
    </View>
  )
}

const FixtureTeamForm = ({ home, away }) => {
  const [homeForm, setHomeForm] = useState(null)
  const [awayForm, setAwayForm] = useState(null)

  useEffect(() => {
    const fetchForm = async (teamId, setter) => {
      const { data, error } = await supabase
        .from('fixtures')
        .select(`*,
          home_team:home_team_id(club_name, logo, id),
          away_team:away_team_id(club_name, logo, id),
          competition:league_id(name, id, logo)`)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .eq('match_status', 'Match Finished')
        .order('date_time_utc', { ascending: false })
        .limit(5)

      if (!error) setter(data)
    }

    fetchForm(home.id, setHomeForm)
    fetchForm(away.id, setAwayForm)
  }, [home, away])

  if (!homeForm || !awayForm) return null

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Team Form</Text>
      <View style={styles.row}>

        {/* Home Team Form — logo on the LEFT of each score */}
        <View style={styles.column}>
          {[...homeForm].map((fixture) => (
            <FormItem
              key={fixture.id}
              fixture={fixture}
              teamId={home.id}
              logoSide="left"
            />
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Away Team Form — logo on the RIGHT of each score */}
        <View style={styles.column}>
          {[...awayForm].map((fixture) => (
            <FormItem
              key={fixture.id}
              fixture={fixture}
              teamId={away.id}
              logoSide="right"
            />
          ))}
        </View>

      </View>
    </View>
  )
}

export default FixtureTeamForm

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
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  formItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  opponentLogo: {
    width: 28,
    height: 28,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#e5e7eb',
    marginHorizontal: 10,
  },
})