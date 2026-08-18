import { View, Text, ScrollView, Image, StyleSheet, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Tabs } from 'react-native-collapsible-tab-view'
import { Link } from 'expo-router'
import { supabase } from '../../lib/supabase'

const CARD_WIDTH = 200
const CARD_HEIGHT = 84
const CARD_VGAP = 20
const COLUMN_GAP = 48
const UNIT0 = CARD_HEIGHT + CARD_VGAP

const formatKickoff = (date) => {
    const options = { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }
    return new Date(date).toLocaleString('en-US', options)
}

const TeamRow = ({ team, score, showScore }) => (
    <View style={styles.teamRow}>
        {team?.logo
            ? <Image source={{ uri: team.logo }} style={styles.logo} resizeMode='contain' />
            : <View style={[styles.logo, styles.logoPlaceholder]} />}
        <Text numberOfLines={1} style={styles.teamName}>{team?.club_name ?? 'TBD'}</Text>
        {showScore && <Text style={styles.score}>{score ?? '-'}</Text>}
    </View>
)

const MatchCard = ({ fixture }) => {
    const finished = fixture.match_status === 'Match Finished'
    return (
        <Link href={{ pathname: '/fixture/[id]', params: { id: fixture.id } }}>
            <View style={styles.card}>
                <TeamRow team={fixture.home_team} score={fixture.home_score} showScore={finished} />
                <TeamRow team={fixture.away_team} score={fixture.away_score} showScore={finished} />
                {!finished && <Text numberOfLines={1} style={styles.kickoff}>{formatKickoff(fixture.date_time_utc)}</Text>}
            </View>
        </Link>
    )
}

const renderConnectors = (round, nextRound, roundIndex) => {
    if (!nextRound || round.fixtures.length !== nextRound.fixtures.length * 2) return null
    const unit = UNIT0 * Math.pow(2, roundIndex)
    const nextUnit = UNIT0 * Math.pow(2, roundIndex + 1)
    const lines = []
    for (let i = 0; i < nextRound.fixtures.length; i++) {
        const yTop = unit * (2 * i + 0.5)
        const yBottom = unit * (2 * i + 1 + 0.5)
        const yNext = nextUnit * (i + 0.5)
        const key = `${round.name}_${i}`
        lines.push(
            <View key={`${key}_top`} style={[styles.hLine, { top: yTop, left: 0, width: COLUMN_GAP / 2 }]} />,
            <View key={`${key}_bottom`} style={[styles.hLine, { top: yBottom, left: 0, width: COLUMN_GAP / 2 }]} />,
            <View key={`${key}_vert`} style={[styles.vLine, { left: COLUMN_GAP / 2, top: Math.min(yTop, yBottom), height: Math.abs(yBottom - yTop) }]} />,
            <View key={`${key}_next`} style={[styles.hLine, { top: yNext, left: COLUMN_GAP / 2, width: COLUMN_GAP / 2 }]} />
        )
    }
    return lines
}

const CompetitionKnockout = ({ competition, season }) => {
    const [rounds, setRounds] = useState(null)

    useEffect(() => {
        if (!competition?.id || !season?.id) return
        const fetchKnockoutFixtures = async () => {
            const { data, error } = await supabase.from('fixtures').select(`*,
                home_team:home_team_id (club_name, logo, id),
                away_team:away_team_id (club_name, logo, id)
            `)
                .eq('league_id', competition.id)
                .eq('season_id', season.id)

            if (error) { console.log(error); setRounds([]); return }

            const knockoutFixtures = (data ?? []).filter(f => f.round && !/group|regular season/i.test(f.round))
            if (!knockoutFixtures.length) { setRounds([]); return }

            const byRound = knockoutFixtures.reduce((acc, fixture) => {
                if (!acc[fixture.round]) acc[fixture.round] = []
                acc[fixture.round].push(fixture)
                return acc
            }, {})

            const orderedRounds = Object.entries(byRound)
                .map(([name, fixtures]) => ({
                    name,
                    fixtures: fixtures.slice().sort((a, b) => new Date(a.date_time_utc) - new Date(b.date_time_utc)),
                    earliest: Math.min(...fixtures.map(f => new Date(f.date_time_utc).getTime())),
                }))
                .sort((a, b) => a.earliest - b.earliest)

            setRounds(orderedRounds)
        }
        fetchKnockoutFixtures()
    }, [competition?.id, season?.id])

    if (rounds === null) return null

    if (rounds.length === 0) {
        const emptyState = (
            <View style={styles.emptyContainer}>
                <Text className='font-supreme text-gray-500'>Knockout stage not yet determined</Text>
            </View>
        )
        return Platform.OS === 'web' ? emptyState : <Tabs.ScrollView>{emptyState}</Tabs.ScrollView>
    }

    const baseCount = rounds[0].fixtures.length
    const columnHeight = UNIT0 * baseCount

    const bracket = (
        <ScrollView horizontal showsHorizontalScrollIndicator={Platform.OS === 'web'} contentContainerStyle={{ padding: 20 }}>
            <View>
                <View style={{ flexDirection: 'row' }}>
                    {rounds.map((round, r) => (
                        <React.Fragment key={`${round.name}_header`}>
                            <View style={{ width: CARD_WIDTH }}>
                                <Text numberOfLines={1} className='font-supremeBold text-center'>{round.name}</Text>
                            </View>
                            {r < rounds.length - 1 && <View style={{ width: COLUMN_GAP }} />}
                        </React.Fragment>
                    ))}
                </View>
                <View style={{ flexDirection: 'row', marginTop: 12 }}>
                    {rounds.map((round, r) => {
                        const unit = UNIT0 * Math.pow(2, r)
                        return (
                            <React.Fragment key={`${round.name}_body`}>
                                <View style={{ width: CARD_WIDTH, height: columnHeight }}>
                                    {round.fixtures.map((fixture, i) => (
                                        <View key={fixture.id} style={{ position: 'absolute', top: unit * (i + 0.5) - CARD_HEIGHT / 2, width: CARD_WIDTH }}>
                                            <MatchCard fixture={fixture} />
                                        </View>
                                    ))}
                                </View>
                                {r < rounds.length - 1 && (
                                    <View style={{ width: COLUMN_GAP, height: columnHeight }}>
                                        {renderConnectors(round, rounds[r + 1], r)}
                                    </View>
                                )}
                            </React.Fragment>
                        )
                    })}
                </View>
            </View>
        </ScrollView>
    )

    return Platform.OS === 'web' ? bracket : <Tabs.ScrollView>{bracket}</Tabs.ScrollView>
}

export default CompetitionKnockout

const styles = StyleSheet.create({
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        height: CARD_HEIGHT,
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DBDBDB',
        padding: 8,
        justifyContent: 'center',
        gap: 6,
    },
    teamRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    logo: {
        width: 18,
        height: 18,
    },
    logoPlaceholder: {
        borderRadius: 9,
        backgroundColor: '#E5E5E5',
    },
    teamName: {
        flex: 1,
        fontSize: 12,
        fontFamily: 'supreme',
    },
    score: {
        fontSize: 13,
        fontFamily: 'supremeBold',
        minWidth: 16,
        textAlign: 'right',
    },
    kickoff: {
        fontSize: 10,
        color: '#9ca3af',
        fontFamily: 'supreme',
        textAlign: 'center',
    },
    hLine: {
        position: 'absolute',
        height: 1,
        backgroundColor: '#D1D5DB',
    },
    vLine: {
        position: 'absolute',
        width: 1,
        backgroundColor: '#D1D5DB',
    },
})
