import { View, Text, Image, StyleSheet, Platform, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import _ from 'lodash'
import { supabase } from '../../lib/supabase'

const SUM_KEYS = ['goals', 'assists', 'dribbles_successful', 'tackles', 'blocks', 'interceptions', 'passes', 'minutes', 'appearances']
const RATING_SHRINKAGE_APPEARANCES = 10
const MAX_PLAYERS = 10
const DEFAULT_VISIBLE = 3

const CATEGORIES = [
    { key: 'goals', label: 'Top scorer', format: (v) => v },
    { key: 'assists', label: 'Assists', format: (v) => v },
    { key: 'goals_assists', label: 'Goals + Assists', format: (v) => v },
    { key: 'rating', label: 'Rating', format: (v) => v?.toFixed(2) },
    { key: 'minutes', label: 'Minutes played', format: (v) => `${v}'` },
    { key: 'dribbles_successful', label: 'Dribbles', format: (v) => v },
    { key: 'passes', label: 'Passes', format: (v) => v },
    { key: 'tackles', label: 'Tackles', format: (v) => v },
    { key: 'interceptions', label: 'Interceptions', format: (v) => v },
    { key: 'blocks', label: 'Blocks', format: (v) => v },
]

// Unpaginated selects are capped at Supabase's default page size (1000 rows) -
// page through with .range() so a squad-heavy competition isn't truncated.
const PLAYER_SEASONS_PAGE_SIZE = 1000

const fetchAllPlayerSeasons = async (competitionId, season) => {
    const rows = []
    let from = 0
    while (true) {
        const { data, error } = await supabase.from('player_seasons')
            .select(`*, player:player_id(id, name, transfermarkt_name, photo)`)
            .eq('season', String(season))
            .eq('league_id', competitionId)
            .range(from, from + PLAYER_SEASONS_PAGE_SIZE - 1)

        if (error) return { data: null, error }
        rows.push(...(data ?? []))
        if (!data || data.length < PLAYER_SEASONS_PAGE_SIZE) return { data: rows, error: null }
        from += PLAYER_SEASONS_PAGE_SIZE
    }
}

const DEFAULT_PILL_COLOR = '#655085'

const isWhiteHex = (hex) => !!hex && ['#fff', '#ffffff'].includes(hex.trim().toLowerCase())

const pillColor = (team) => {
    const [primary, secondary] = team?.colors ?? []
    if (!primary) return DEFAULT_PILL_COLOR
    if (isWhiteHex(primary)) return secondary ?? DEFAULT_PILL_COLOR
    return primary
}

const playerName = (player) => {
    if (player?.transfermarkt_name) return player.transfermarkt_name
    const parts = player?.name?.trim().split(/\s+/) ?? []
    if (parts.length > 2) return `${parts[0]} ${parts[parts.length - 1]}`
    return player?.name
}

const aggregateByPlayer = (rows) => {
    const byPlayer = {}
    for (const row of rows) {
        const pid = row.player_id
        if (!byPlayer[pid]) {
            byPlayer[pid] = { player_id: pid, player: row.player, team_name: row.team_name, team_id: row.team_id, _ratingWeighted: 0, _ratingMinutes: 0 }
            for (const k of SUM_KEYS) byPlayer[pid][k] = 0
        }
        const p = byPlayer[pid]
        for (const k of SUM_KEYS) p[k] += row[k] ?? 0
        if (row.player) p.player = row.player
        if (row.team_name) p.team_name = row.team_name
        if (row.team_id) p.team_id = row.team_id

        const rating = parseFloat(row.rating)
        const minutes = row.minutes ?? 0
        if (!isNaN(rating) && minutes > 0) {
            p._ratingWeighted += rating * minutes
            p._ratingMinutes += minutes
        }
    }
    return Object.values(byPlayer).map(p => ({
        ...p,
        rating: p._ratingMinutes > 0 ? p._ratingWeighted / p._ratingMinutes : null,
        goals_assists: (p.goals ?? 0) + (p.assists ?? 0),
    }))
}

const LeaderboardCard = ({ category, expanded, onToggle }) => {
    const visiblePlayers = expanded ? category.players : category.players.slice(0, DEFAULT_VISIBLE)

    return (
        <View style={[styles.card, Platform.OS !== 'web' && styles.cardNative]}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{category.label}</Text>
                {category.players.length > DEFAULT_VISIBLE && (
                    <TouchableOpacity onPress={onToggle} hitSlop={8} style={styles.chevronButton}>
                        <AntDesign name={expanded ? 'up' : 'down'} size={14} color="#9ca3af" />
                    </TouchableOpacity>
                )}
            </View>
            {category.players.length === 0 && <Text style={styles.emptyText}>No data</Text>}
            {visiblePlayers.map((p, i) => (
                <Link key={p.player_id} href={{ pathname: '/player/[id]', params: { id: p.player_id } }}>
                    <View style={styles.row}>
                        <Text style={styles.rank}>{i + 1}</Text>
                        <Image source={{ uri: p.player?.photo }} style={styles.photo} resizeMode='cover' />
                        <View style={{ flex: 1 }}>
                            <Text numberOfLines={1} style={styles.name}>{playerName(p.player)}</Text>
                            <View style={styles.teamInfo}>
                                {p.team?.logo ? (
                                    <Image source={{ uri: p.team.logo }} style={styles.teamBadge} resizeMode='contain' />
                                ) : null}
                                <Text numberOfLines={1} style={styles.team}>{p.team?.club_name}</Text>
                            </View>
                        </View>
                        <View style={[styles.valuePill, { backgroundColor: pillColor(p.team) }]}>
                            <Text style={styles.valuePillText}>{category.format(p[category.key])}</Text>
                        </View>
                    </View>
                </Link>
            ))}
        </View>
    )
}

const CompetitionTopStats = ({ competition, season }) => {
    const [leaderboards, setLeaderboards] = useState(null)
    const [expandedKeys, setExpandedKeys] = useState(new Set())

    const toggleKey = (key) => {
        setExpandedKeys(prev => {
            const next = new Set(prev)
            next.has(key) ? next.delete(key) : next.add(key)
            return next
        })
    }

    useEffect(() => {
        if (!competition?.id || !season?.season) return
        const fetchStats = async () => {
            const { data, error } = await fetchAllPlayerSeasons(competition.id, season.season)

            if (error) { console.log(error); setLeaderboards([]); return }
            if (!data?.length) { setLeaderboards([]); return }

            const aggregated = aggregateByPlayer(data)

            const teamIds = [...new Set(aggregated.map(p => p.team_id).filter(Boolean))]
            const { data: clubs } = teamIds.length
                ? await supabase.from('clubs').select('id, club_name, logo, colors').in('id', teamIds)
                : { data: [] }
            const clubsById = Object.fromEntries((clubs ?? []).map(c => [c.id, c]))

            const normalized = aggregated.map(p => ({
                ...p,
                team: clubsById[p.team_id] ?? (p.team_name ? { club_name: p.team_name, logo: null } : null),
            }))

            setLeaderboards(CATEGORIES.map(cat => {
                if (cat.key === 'rating') {
                    const pool = normalized.filter(p => p.rating != null && p.minutes > 0)
                    const avgRating = pool.length ? _.meanBy(pool, 'rating') : 0
                    // Shrink low-appearance ratings toward the league average so a single
                    // standout game can't outrank a season of consistently good performances.
                    const ranked = _.orderBy(pool, [p => {
                        const weight = p.appearances / (p.appearances + RATING_SHRINKAGE_APPEARANCES)
                        return weight * p.rating + (1 - weight) * avgRating
                    }], ['desc'])
                    return { ...cat, players: ranked.slice(0, MAX_PLAYERS) }
                }
                return { ...cat, players: _.orderBy(normalized, [cat.key], ['desc']).slice(0, MAX_PLAYERS) }
            }))
        }
        fetchStats()
    }, [competition?.id, season?.id])

    if (leaderboards === null) return null

    if (leaderboards.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text className='font-supreme text-gray-500'>No player stats available for this season</Text>
            </View>
        )
    }

    return (
        <View style={[styles.grid, Platform.OS === 'web' ? styles.gridWeb : styles.gridNative]}>
            {leaderboards.map(cat => (
                <LeaderboardCard
                    key={cat.key}
                    category={cat}
                    expanded={expandedKeys.has(cat.key)}
                    onToggle={() => toggleKey(cat.key)}
                />
            ))}
        </View>
    )
}

export default CompetitionTopStats

const styles = StyleSheet.create({
    grid: {
        padding: 16,
        gap: 16,
    },
    gridWeb: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridNative: {
        flexDirection: 'column',
    },
    card: {
        flexGrow: 1,
        flexBasis: 280,
        minWidth: 260,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 14,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardNative: {
        flexBasis: 'auto',
        minWidth: undefined,
        width: '100%',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    cardTitle: {
        fontFamily: 'supremeBold',
        fontSize: 15,
    },
    chevronButton: {
        padding: 4,
    },
    emptyText: {
        fontFamily: 'supreme',
        color: '#9ca3af',
        fontSize: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 6,
    },
    rank: {
        width: 16,
        fontFamily: 'supremeBold',
        fontSize: 12,
        color: '#9ca3af',
    },
    photo: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#e5e7eb',
    },
    name: {
        fontFamily: 'supreme',
        fontSize: 13,
    },
    teamInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    teamBadge: {
        width: 16,
        height: 16,
    },
    team: {
        fontFamily: 'supreme',
        fontSize: 10,
        color: '#9ca3af',
    },
    valuePill: {
        backgroundColor: '#655085',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        minWidth: 34,
        alignItems: 'center',
    },
    valuePillText: {
        color: '#fff',
        fontFamily: 'supremeBold',
        fontSize: 13,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
