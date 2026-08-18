import { View, Text, Image, StyleSheet, Platform, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import { supabase } from '../../lib/supabase'

const MAX_CLUBS = 10
const DEFAULT_VISIBLE = 5
// Unpaginated selects are capped at Supabase's default page size (1000 rows) -
// page through with .range() so a fixture/standings-heavy season isn't truncated.
const PAGE_SIZE = 1000
// team_stats is scoped by fixture_id, not team_id here - an unscoped team_id
// filter risks paging past this season's rows for clubs with a long match
// history across other seasons/competitions (see memory on team_stats).
const POSSESSION_CHUNK_SIZE = 300

// goals_conceded ranks ascending (fewest is "best") - every other category
// ranks descending. Mirrors ball-knowledge-poller/build_leaderboards.py.
const CATEGORIES = [
    { key: 'goals', label: 'Goals', format: (v) => v, desc: true },
    { key: 'goals_conceded', label: 'Goals Conceded', format: (v) => v, desc: false },
    { key: 'goal_diff', label: 'Goal Difference', format: (v) => (v > 0 ? `+${v}` : v), desc: true },
    { key: 'possession', label: 'Possession Average', format: (v) => (v != null ? `${v.toFixed(1)}%` : '-'), desc: true },
    { key: 'clean_sheets', label: 'Clean Sheets', format: (v) => v, desc: true },
]

const fetchAll = async (table, applyFilters) => {
    const rows = []
    let from = 0
    while (true) {
        const { data, error } = await applyFilters(supabase.from(table)).range(from, from + PAGE_SIZE - 1)
        if (error) return { data: null, error }
        rows.push(...(data ?? []))
        if (!data || data.length < PAGE_SIZE) return { data: rows, error: null }
        from += PAGE_SIZE
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

const LeaderboardCard = ({ category, expanded, onToggle }) => {
    const visibleClubs = expanded ? category.clubs : category.clubs.slice(0, DEFAULT_VISIBLE)

    return (
        <View style={[styles.card, Platform.OS !== 'web' && styles.cardNative]}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{category.label}</Text>
                {category.clubs.length > DEFAULT_VISIBLE && (
                    <TouchableOpacity onPress={onToggle} hitSlop={8} style={styles.chevronButton}>
                        <AntDesign name={expanded ? 'up' : 'down'} size={14} color="#9ca3af" />
                    </TouchableOpacity>
                )}
            </View>
            {category.clubs.length === 0 && <Text style={styles.emptyText}>No data</Text>}
            {visibleClubs.map((c, i) => (
                <Link key={c.club_id} href={{ pathname: '/club/[id]', params: { id: c.club_id } }}>
                    <View style={styles.row}>
                        <Text style={styles.rank}>{i + 1}</Text>
                        <Image source={{ uri: c.team?.logo }} style={styles.teamBadge} resizeMode='contain' />
                        <View style={{ flex: 1 }}>
                            <Text numberOfLines={1} style={styles.name}>{c.team?.club_name}</Text>
                        </View>
                        <View style={[styles.valuePill, { backgroundColor: pillColor(c.team) }]}>
                            <Text style={styles.valuePillText}>{category.format(c[category.key])}</Text>
                        </View>
                    </View>
                </Link>
            ))}
        </View>
    )
}

const CompetitionTeamLeaders = ({ competition, season }) => {
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
        if (!competition?.id || !season?.id) return
        const fetchStats = async () => {
            const { data: fixtures, error: fixturesError } = await fetchAll('fixtures', q =>
                q.select('id, home_team_id, away_team_id, home_score, away_score')
                    .eq('season_id', season.id)
                    .like('match_status', 'Match Finished%')
            )
            if (fixturesError) { console.log(fixturesError); setLeaderboards([]); return }
            if (!fixtures?.length) { setLeaderboards([]); return }

            // league_standings covers a normal table but goes stale for cup
            // knockout rounds, so non-league competitions sum goals directly
            // off fixtures instead (mirrors CLUB_GOALS_SOURCE in
            // build_leaderboards.py, used there for Champions League).
            const goalsByClub = {}
            if (competition.type === 'League') {
                const { data: standings, error: standingsError } = await fetchAll('league_standings', q =>
                    q.select('club_id, goals_for, goals_against').eq('season_id', season.id)
                )
                if (standingsError) { console.log(standingsError); setLeaderboards([]); return }
                for (const s of standings ?? []) {
                    goalsByClub[s.club_id] = { goals: s.goals_for, goals_conceded: s.goals_against }
                }
            } else {
                for (const f of fixtures) {
                    if (f.home_score == null || f.away_score == null) continue
                    const home = (goalsByClub[f.home_team_id] ??= { goals: 0, goals_conceded: 0 })
                    const away = (goalsByClub[f.away_team_id] ??= { goals: 0, goals_conceded: 0 })
                    home.goals += f.home_score
                    home.goals_conceded += f.away_score
                    away.goals += f.away_score
                    away.goals_conceded += f.home_score
                }
            }
            if (!Object.keys(goalsByClub).length) { setLeaderboards([]); return }

            const cleanSheets = {}
            for (const f of fixtures) {
                if (f.away_score === 0) cleanSheets[f.home_team_id] = (cleanSheets[f.home_team_id] ?? 0) + 1
                if (f.home_score === 0) cleanSheets[f.away_team_id] = (cleanSheets[f.away_team_id] ?? 0) + 1
            }

            const fixtureIds = fixtures.map(f => f.id)
            const possessionRows = []
            for (let i = 0; i < fixtureIds.length; i += POSSESSION_CHUNK_SIZE) {
                const chunk = fixtureIds.slice(i, i + POSSESSION_CHUNK_SIZE)
                const { data } = await supabase.from('team_stats')
                    .select('fixture_id, team_id, value')
                    .eq('type', 'Ball Possession')
                    .in('fixture_id', chunk)
                possessionRows.push(...(data ?? []))
            }

            const possessionAgg = {}
            for (const row of possessionRows) {
                const raw = String(row.value ?? '')
                if (!raw.includes('%')) continue // untracked possession is stored as raw 0, not a real reading
                const pct = parseFloat(raw.replace('%', ''))
                if (isNaN(pct)) continue
                const agg = (possessionAgg[row.team_id] ??= { sum: 0, count: 0 })
                agg.sum += pct
                agg.count += 1
            }

            const clubIds = Object.keys(goalsByClub).map(Number)
            const { data: clubs } = clubIds.length
                ? await supabase.from('clubs').select('id, club_name, logo, colors').in('id', clubIds)
                : { data: [] }
            const clubsById = Object.fromEntries((clubs ?? []).map(c => [c.id, c]))

            const clubStats = clubIds.map(id => {
                const g = goalsByClub[id]
                const poss = possessionAgg[id]
                return {
                    club_id: id,
                    team: clubsById[id] ?? null,
                    goals: g.goals,
                    goals_conceded: g.goals_conceded,
                    goal_diff: g.goals - g.goals_conceded,
                    clean_sheets: cleanSheets[id] ?? 0,
                    possession: poss ? poss.sum / poss.count : null,
                }
            })

            setLeaderboards(CATEGORIES.map(cat => {
                const pool = clubStats.filter(c => c[cat.key] != null)
                const ranked = [...pool].sort((a, b) => cat.desc ? b[cat.key] - a[cat.key] : a[cat.key] - b[cat.key])
                return { ...cat, clubs: ranked.slice(0, MAX_CLUBS) }
            }))
        }
        fetchStats()
    }, [competition?.id, season?.id])

    if (leaderboards === null) return null

    if (leaderboards.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text className='font-supreme text-gray-500'>No team stats available for this season</Text>
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

export default CompetitionTeamLeaders

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
    teamBadge: {
        width: 30,
        height: 30,
    },
    name: {
        fontFamily: 'supreme',
        fontSize: 13,
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
