import { View, Text, Image, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const formatSeason = (s) => `${s}/${parseInt(s) + 1}`

const getRatingColor = (r) => {
    if (r == null) return null
    const n = parseFloat(r)
    if (n >= 7.0) return '#22c55e'
    if (n >= 6.5) return '#f97316'
    return '#ef4444'
}

const StatItem = ({ value, label }) => (
    <View style={styles.statItem}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
)

const CardStatItem = ({ value, color, label }) => (
    <View style={styles.statItem}>
        <View style={styles.cardRow}>
            <View style={[styles.cardSwatch, { backgroundColor: color }]} />
            <Text style={styles.statValue}>{value}</Text>
        </View>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
)

export const PlayerCurrentSeason = ({ player }) => {
    const [campaign, setCampaign] = useState(null)

    useEffect(() => {
        if (!player?.id) return

        const fetchCampaign = async () => {
            const { data, error } = await supabase
                .from('player_seasons')
                .select('league_id, league_name, season, appearances, lineups, minutes, goals, assists, rating, yellow_cards, red_cards')
                .eq('player_id', player.id)
                .not('league_id', 'is', null)
                .order('season', { ascending: false })

            if (error || !data?.length) return

            const leagueIds = [...new Set(data.map(r => r.league_id))]
            const { data: competitions } = await supabase
                .from('competitions')
                .select('id, logo, type')
                .in('id', leagueIds)

            const competitionById = Object.fromEntries((competitions ?? []).map(c => [c.id, c]))

            // Prefer the domestic league over cups/continental competitions,
            // but fall back to any competition if the player has no league rows.
            const leagueRows = data.filter(r => competitionById[r.league_id]?.type === 'League')
            const pool = leagueRows.length ? leagueRows : data

            const maxSeason = Math.max(...pool.map(r => parseInt(r.season)))
            const candidates = pool.filter(r => parseInt(r.season) === maxSeason)
            const best = candidates.sort((a, b) => (b.appearances ?? 0) - (a.appearances ?? 0))[0]

            setCampaign({
                ...best,
                league_logo: competitionById[best.league_id]?.logo ?? null,
            })
        }

        fetchCampaign()
    }, [player?.id])

    if (!campaign) return null

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {campaign.league_logo ? (
                    <Image source={{ uri: campaign.league_logo }} style={styles.leagueLogo} resizeMode="contain" />
                ) : null}
                <Text style={styles.title}>{campaign.league_name} {formatSeason(campaign.season)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statRow}>
                <StatItem value={campaign.goals ?? 0} label="Goals" />
                <StatItem value={campaign.assists ?? 0} label="Assists" />
                <StatItem value={campaign.lineups ?? 0} label="Started" />
                <StatItem value={campaign.appearances ?? 0} label="Matches" />
            </View>

            <View style={styles.statRow}>
                <StatItem value={campaign.minutes ?? 0} label="Minutes played" />
                <View style={styles.statItem}>
                    {campaign.rating != null ? (
                        <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(campaign.rating) }]}>
                            <Text style={styles.ratingText}>{parseFloat(campaign.rating).toFixed(2)}</Text>
                        </View>
                    ) : (
                        <Text style={styles.statValue}>-</Text>
                    )}
                    <Text style={styles.statLabel}>Rating</Text>
                </View>
                <CardStatItem value={campaign.yellow_cards ?? 0} color="#FCFF36" label="Yellow cards" />
                <CardStatItem value={campaign.red_cards ?? 0} color="#ef4444" label="Red cards" />
            </View>
        </View>
    )
}

export default PlayerCurrentSeason

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        alignSelf: 'stretch',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingBottom: 12,
    },
    leagueLogo: {
        width: 22,
        height: 22,
    },
    title: {
        fontFamily: 'SupremeBold',
        fontSize: 16,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
    },
    statRow: {
        flexDirection: 'row',
        paddingTop: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    statValue: {
        fontFamily: 'SupremeBold',
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        fontFamily: 'Supreme',
        fontSize: 12,
        color: '#6b7280',
    },
    ratingBadge: {
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    ratingText: {
        fontFamily: 'SupremeBold',
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardSwatch: {
        width: 11,
        height: 15,
        borderRadius: 2,
    },
})
