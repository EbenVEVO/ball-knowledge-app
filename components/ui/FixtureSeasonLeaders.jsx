import { View, Text, Image, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const playerName = (player) => {
  if (player?.transfermarkt_name) return player.transfermarkt_name
  const parts = player?.name?.trim().split(/\s+/) ?? []
  if (parts.length > 2) return `${parts[0]} ${parts[parts.length - 1]}`
  return player?.name
}

const StatRow = ({ homeLeader, awayLeader, homeValue, awayValue, label, homeColor, awayColor }) => {
  const homeWins = (homeValue ?? -1) > (awayValue ?? -1)
  const awayWins = (awayValue ?? -1) > (homeValue ?? -1)

  return (
    <View style={styles.row}>
      {/* Home side */}
      <View style={styles.homeSide}>
        <View style={styles.playerGroup}>
          <Image
            source={{ uri: homeLeader?.player?.photo }}
            style={styles.playerPhoto}
          />
          <Text style={styles.playerName} numberOfLines={2}>
            {playerName(homeLeader?.player)}
          </Text>
        </View>
        <View style={[homeWins ? styles.statCircle : styles.statPlain, homeWins && { backgroundColor: homeColor[0] === '#FFFFFF' ? homeColor[1] : homeColor[0] }]}>
          <Text style={[styles.statText, homeWins && {color:homeColor[0] === '#FFFFFF' ? homeColor[0] : homeColor[1] }]}>
            {homeValue ?? '-'}
          </Text>
        </View>
      </View>

      {/* Center label */}
      <Text style={styles.label}>{label}</Text>

      {/* Away side */}
      <View style={styles.awaySide}>
        <View style={[awayWins ? styles.statCircle : styles.statPlain, awayWins && { backgroundColor: awayColor[0] === '#FFFFFF' ? awayColor[1] :awayColor[0] }]}>
          <Text style={[styles.statText, awayWins && {color:homeColor[0] === '#FFFFFF' ? homeColor[0] : homeColor[1]}]}>
            {awayValue ?? '-'}
          </Text>
        </View>
        <View style={styles.playerGroupRight}>
          <Image
            source={{ uri: awayLeader?.player?.photo }}
            style={styles.playerPhoto}
          />
          <Text style={styles.playerName} numberOfLines={2}>
            {playerName(awayLeader?.player)}
          </Text>
        </View>
      </View>
    </View>
  )
}

const FixtureSeasonLeaders = ({ fixture, home, away }) => {
  const [homeRatingLeader, setHomeRatingLeader] = useState()
  const [homeGoalsLeader, setHomeGoalsLeader] = useState()
  const [homeAssistsLeader, setHomeAssistsLeader] = useState()
  const [homeKeyPassesLeader, setHomeKeyPassesLeader] = useState()
  const [homeDribblesLeader, setHomeDribblesLeader] = useState()

  const [awayRatingLeader, setAwayRatingLeader] = useState()
  const [awayGoalsLeader, setAwayGoalsLeader] = useState()
  const [awayAssistsLeader, setAwayAssistsLeader] = useState()
  const [awayKeyPassesLeader, setAwayKeyPassesLeader] = useState()
  const [awayDribblesLeader, setAwayDribblesLeader] = useState()

  const fetchLeaders = async (teamId, setters) => {
    const { data } = await supabase
      .from('player_seasons')
      .select(`*, player: player_id(photo, transfermarkt_name, name)`)
      .eq('team_id', teamId)
      .eq('season_id', fixture?.season_id)
    if (data && data.length) {
      setters.rating(data.reduce((top, item) => item.avg_rating > top.avg_rating ? item : top))
      setters.goals(data.reduce((top, item) => item.goals > top.goals ? item : top))
      setters.assists(data.reduce((top, item) => item.assists > top.assists ? item : top))
      setters.kp(data.reduce((top, item) => item.key_passes > top.key_passes ? item : top))
      setters.dribbles(data.reduce((top, item) => item.dribbles_successful > top.dribbles_successful ? item : top))
    }
  }

  useEffect(() => {
    fetchLeaders(home?.id, {
      rating: setHomeRatingLeader,
      goals: setHomeGoalsLeader,
      assists: setHomeAssistsLeader,
      kp: setHomeKeyPassesLeader,
      dribbles: setHomeDribblesLeader,
    })
    fetchLeaders(away?.id, {
      rating: setAwayRatingLeader,
      goals: setAwayGoalsLeader,
      assists: setAwayAssistsLeader,
      kp: setAwayKeyPassesLeader,
      dribbles: setAwayDribblesLeader,
    })
  }, [home, away])

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.teamLabel}>
          <Image source={{ uri: home?.logo }} style={styles.teamBadge} resizeMode="contain" />
          <Text style={styles.teamName}>{home?.short_name || home?.name}</Text>
        </View>
        <Text style={styles.title}>Season Leaders</Text>
        <View style={[styles.teamLabel, styles.teamLabelRight]}>
          <Text style={styles.teamName}>{away?.short_name || away?.name}</Text>
          <Image source={{ uri: away?.logo }} style={styles.teamBadge} resizeMode="contain" />
        </View>
      </View>

      <StatRow
        homeLeader={homeRatingLeader}
        awayLeader={awayRatingLeader}
        homeValue={homeRatingLeader?.avg_rating != null ? parseFloat(homeRatingLeader.avg_rating).toFixed(2) : null}
        awayValue={awayRatingLeader?.avg_rating != null ? parseFloat(awayRatingLeader.avg_rating).toFixed(2) : null}
        label="Rating"
        homeColor={home?.colors}
        awayColor={away?.colors}
      />
      <StatRow
        homeLeader={homeGoalsLeader}
        awayLeader={awayGoalsLeader}
        homeValue={homeGoalsLeader?.goals}
        awayValue={awayGoalsLeader?.goals}
        label="Goals"
        homeColor={home?.colors}
        awayColor={away?.colors}
      />
      <StatRow
        homeLeader={homeAssistsLeader}
        awayLeader={awayAssistsLeader}
        homeValue={homeAssistsLeader?.assists}
        awayValue={awayAssistsLeader?.assists}
        label="Assists"
        homeColor={home?.colors}
        awayColor={away?.colors}
      />
      <StatRow
        homeLeader={homeKeyPassesLeader}
        awayLeader={awayKeyPassesLeader}
        homeValue={homeKeyPassesLeader?.key_passes}
        awayValue={awayKeyPassesLeader?.key_passes}
        label="Key Passes"
        homeColor={home?.colors}
        awayColor={away?.colors}
      />
      <StatRow
        homeLeader={homeDribblesLeader}
        awayLeader={awayDribblesLeader}
        homeValue={homeDribblesLeader?.dribbles_successful}
        awayValue={awayDribblesLeader?.dribbles_successful}
        label="Dribbles Complete"
        homeColor={home?.colors}
        awayColor={away?.colors}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  teamLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  teamLabelRight: {
    justifyContent: 'flex-end',
  },
  teamBadge: {
    width: 22,
    height: 22,
  },
  teamName: {
    fontWeight: '700',
    fontSize: 13,
  },
  title: {
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  homeSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  awaySide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  playerGroup: {
    alignItems: 'center',
    width: 48,
  },
  playerGroupRight: {
    alignItems: 'center',
    width: 48,
  },
  playerPhoto: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e5e7eb',
  },
  playerName: {
    fontSize: 9,
    color: '#9ca3af',
    marginTop: 2,
    textAlign: 'center',
    width: 48,
  },
  statCircle: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: 36,
    alignItems: 'center',
  },
  statPlain: {
    minWidth: 36,
    alignItems: 'center',
  },
  statText: {
    fontWeight: '700',
    fontSize: 15,
    color: '#111827',
  },

  label: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    width: 96,
  },
})

export default FixtureSeasonLeaders
