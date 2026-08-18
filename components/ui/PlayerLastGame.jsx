import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link } from 'expo-router'
import { supabase } from '../../lib/supabase'
import FontAwesome from '@expo/vector-icons/FontAwesome'

const TWITTER_EMOJI_BASE = "https://cdn.jsdelivr.net/npm/emoji-datasource-twitter/img/twitter/64/"

const getRatingColor = (rating) => {
  if (rating > 8.9) return '#12CCFF'
  if (rating > 6.9) return '#00F70C'
  if (rating > 5.9) return '#FF9C00'
  return 'red'
}

const getResult = (lastGame) => {
  const isHome = lastGame?.fixture.home_team.id === lastGame?.team_id
  const home = lastGame?.fixture.home_score
  const away = lastGame?.fixture.away_score
  if (isHome) return home > away ? 'W' : home < away ? 'L' : 'D'
  return away > home ? 'W' : away < home ? 'L' : 'D'
}

// ── Stat primitives ───────────────────────────────────────────────────────────
const StatItem = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value ?? 0}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
)

const StatSection = ({ title, children }) => (
  <View style={styles.statSection}>
    <Text style={styles.statSectionTitle}>{title}</Text>
    <View style={styles.statRow}>
      {children}
    </View>
  </View>
)

// ─────────────────────────────────────────────────────────────────────────────
export const PlayerLastGame = ({ player }) => {
  const [lastGame, setLastGame] = useState(null)
  const [topReactions, setTopReactions] = useState([])
  const [reactionCount, setReactionCount] = useState(0)

  useEffect(() => {
    if (!player) return

    const fetchLastGame = async () => {
      const { data, error } = await supabase
        .from('player_stats')
        .select(`*,
          fixture: fixture_id (
            date_time_utc,
            home_team: home_team_id (club_name, logo, id),
            away_team: away_team_id (club_name, logo, id),
            league: league_id (name, logo),
            home_score, away_score
          )`)
        .eq('player_id', player.id)
        .order('fixture(date_time_utc)', { ascending: false })
        .limit(1)

      if (!error && data[0]) {
        setLastGame(data[0])
        fetchReactions(data[0].id)
      }
    }

    const fetchReactions = async (id) => {
      const { data, count } = await supabase
        .from('social_player_reactions')
        .select('*', { count: 'exact' })
        .eq('post_id', id)

      if (data) {
        setReactionCount(count)
        const grouped = data.reduce((acc, val) => {
          const key = val.emoji.unified
          if (!acc[key]) acc[key] = { emoji: val.emoji, count: 0 }
          acc[key].count++
          return acc
        }, {})

        const top = Object.values(grouped)
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)

        setTopReactions(top)
      }
    }

    fetchLastGame()
  }, [player?.id])

  if (!lastGame) return null

  const s = lastGame // shorthand
  const result = getResult(lastGame)
  const opponent = lastGame.fixture.home_team.id !== lastGame.team_id
    ? lastGame.fixture.home_team
    : lastGame.fixture.away_team

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

    const passAccuracyPct = parseFloat(((s.pass_accuracy || 0) / (s.passes || 1)) * 100).toFixed(2)
    
  const pct = (num, den) =>
    den > 0 ? `${((num / den) * 100).toFixed(0)}%` : '0%'

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <Link href={{ pathname: '/fixture/[id]', params: { id: lastGame.fixture_id } }}>
        <Text style={styles.title}>Latest Performance</Text>
      </Link>

      {/* ── Player + match info ── */}
      <View style={styles.playerRow}>
        <Image source={{ uri: player?.photo }} style={styles.playerPhoto} />
        <View style={{ flex: 1 }}>
          <Text style={styles.playerName}>{player?.transfermarkt_name}</Text>
          <View style={styles.matchMeta}>
            <Image source={{ uri: lastGame.fixture.league.logo }} style={styles.leagueLogo} resizeMode="contain" />
            <Text style={styles.metaText}>{formatDate(lastGame.fixture.date_time_utc)}</Text>
            <Image source={{ uri: opponent.logo }} style={styles.leagueLogo} resizeMode="contain" />
            <Text style={styles.metaText}>vs {opponent.club_name}</Text>
            <View style={[styles.resultBadge, { backgroundColor: result === 'W' ? '#22c55e' : result === 'L' ? '#ef4444' : '#6b7280' }]}>
              <Text style={styles.resultText}>
                {result} {lastGame.fixture.home_score}-{lastGame.fixture.away_score}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Reactions + comments ── */}
      <View style={styles.reactRow}>
        <View style={styles.reactEmojis}>
          {topReactions.map((r, i) => (
            <Image key={i} source={{ uri: `${TWITTER_EMOJI_BASE}${r.emoji.image}` }} style={styles.emoji} />
          ))}
          <Text style={styles.reactionCount}>{reactionCount}</Text>
        </View>
        <View style={styles.reactEmojis}>
          <FontAwesome name="comment" size={18} color="#A477C7" />
          <Text style={styles.metaText}>{s.comment_count ?? 0}</Text>
        </View>
      </View>

      <View style={styles.divider} />

     {/* ── Row 1: Rating, Minutes, Goals, Assists, Shots ── */}
      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(s.rating) }]}>
            <Text style={styles.ratingText}>{parseFloat(s.rating).toFixed(1)}</Text>
          </View>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <StatItem label="Minutes"  value={s.minutes ?? 0} />
        <StatItem label="Goals"    value={s.goals ?? 0} />
        <StatItem label="Assists"  value={s.assist ?? 0} />
        <StatItem label="Shots"    value={`${s.shots_on_goal ?? 0}/${s.shots ?? 0}`} />
      </View>
 
      {/* ── Row 2: Pass%, Dribbles, Key Passes, Duels ── */}
      <View style={styles.statRow}>
        <StatItem label="Pass %"     value={`${s.pass_accuracy ?? 0}/${s.passes ?? 0} `} />
        <StatItem label="Dribbles"   value={`${s.dribbles_successful ?? 0}/${s.dribbles_attempted ?? 0}`} />
        <StatItem label="Key Passes" value={s.key_passes ?? 0} />
        <StatItem label="Duels W-L"  value={`${s.duels_won ?? 0}-${(s.duels ?? 0) - (s.duels_won ?? 0)}`} />
      </View>
      </View>
  )
}

export default PlayerLastGame

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginVertical: 8,
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 15,
    fontFamily:'Supreme',
    fontWeight: '700',
    marginBottom: 12,
  },

  // Player row
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  playerPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  playerName: {
    fontSize: 14,
        fontFamily:'Supreme',

    fontWeight: '700',
    marginBottom: 4,
  },
  matchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
        fontFamily:'Supreme',

    color: '#4b5563',
  },
  leagueLogo: {
    width: 16,
    height: 16,
  },
  resultBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  resultText: {
    color: '#fff',
        fontFamily:'Supreme',

    fontSize: 11,
    fontWeight: '700',
  },

  // Reactions
  reactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 10,
  },
  reactEmojis: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emoji: {
    width: 18,
    height: 18,
  },
  reactionCount: {
    fontSize: 13,
        fontFamily:'Supreme',

    fontWeight: '700',
    marginLeft: 4,
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10,
  },

  // Rating
  ratingBadge: {
    alignSelf: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  ratingText: {
    color: '#fff',
        fontFamily:'Supreme',

    fontSize: 14,
    fontWeight: '700',
  },

  // Stat sections
  statSection: {
    marginBottom: 12,
  },
  statSectionTitle: {
    fontSize: 12,
        fontFamily:'Supreme',

    fontWeight: '700',
    color: '#A477C7',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  statItem: {
    width: '20%',
    paddingVertical: 6,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 14,
        fontFamily:'Supreme',
        paddingHorizontal: 12,
    paddingVertical: 4,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
        fontFamily:'Supreme',

    textTransform: 'uppercase',
    textAlign: 'center',
    color: '#6b7280',
  },
})