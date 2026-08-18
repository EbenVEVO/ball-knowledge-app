import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import Fontisto from '@expo/vector-icons/Fontisto';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase';

const formatSeason = (s) => `${s}/${String(parseInt(s) + 1).slice(-2)}`

const getRatingColor = (r) => {
    if (r == null) return null
    const n = parseFloat(r)
    if (n >= 7.0) return '#22c55e'
    if (n >= 6.5) return '#f97316'
    return '#ef4444'
}

const PlayerSeasons = ({ player }) => {
    const [seasons, setSeasons] = useState([])
    const [expandedKeys, setExpandedKeys] = useState(new Set())

    const toggleKey = (key) => {
        setExpandedKeys(prev => {
            const next = new Set(prev)
            next.has(key) ? next.delete(key) : next.add(key)
            return next
        })
    }

    useEffect(() => {
        const fetchSeasons = async () => {
            const { data, error } = await supabase
                .from('player_seasons')
                .select(`*`)
                .eq('player_id', player.id)
                .order('season', { ascending: false })
            
            
            if (error) { console.log(error); return }

            const filtered = data.filter(row => row.league_id !== null)

            // team_id/league_id aren't foreign keys on player_seasons, so some rows
            // reference clubs/competitions that were never ingested. Look up which ids
            // actually exist and only use their logo when they do.
            const teamIds = [...new Set(filtered.map(r => r.team_id).filter(Boolean))]
            const leagueIds = [...new Set(filtered.map(r => r.league_id).filter(Boolean))]

            const [{ data: clubs }, { data: competitions }] = await Promise.all([
                teamIds.length ? supabase.from('clubs').select('id, logo').in('id', teamIds) : Promise.resolve({ data: [] }),
                leagueIds.length ? supabase.from('competitions').select('id, logo').in('id', leagueIds) : Promise.resolve({ data: [] }),
            ])
            const clubLogoById = Object.fromEntries((clubs ?? []).map(c => [c.id, c.logo]))
            const competitionLogoById = Object.fromEntries((competitions ?? []).map(c => [c.id, c.logo]))

            const grouped = filtered.reduce((acc, row) => {
                const key = `${row.season}_${row.team_id}`
                if (!acc[key]) acc[key] = {
                    key,
                    season: row.season,
                    team_id: row.team_id,
                    team_name: row.team_name,
                    team_logo: clubLogoById[row.team_id] ?? null,
                    competitions: [],
                }
                acc[key].competitions.push({
                    league_id: row.league_id,
                    league_name: row.league_name,
                    league_logo: competitionLogoById[row.league_id] ?? null,
                    appearances: row.appearances ?? 0,
                    lineups: row.lineups ?? 0,
                    goals: row.goals ?? 0,
                    assists: row.assists ?? 0,
                    rating: row.rating,
                })
                return acc
            }, {})

            Object.values(grouped).forEach(g => {
                g.totalApps    = g.competitions.reduce((s, r) => s + r.appearances, 0)
                g.totalLineups = g.competitions.reduce((s, r) => s + r.lineups, 0)
                g.totalGoals   = g.competitions.reduce((s, r) => s + r.goals, 0)
                g.totalAssists = g.competitions.reduce((s, r) => s + r.assists, 0)
                const rated = g.competitions.filter(r => r.rating != null)
                g.avgRating = rated.length
                    ? (rated.reduce((s, r) => s + parseFloat(r.rating), 0) / rated.length).toFixed(2)
                    : null
            })
            setSeasons(Object.values(grouped).filter(g => g.totalApps > 0))
        }
        if (player) fetchSeasons()
    }, [player])

    const renderHeader = () => (
        <View style={styles.headerRow}>
            <View style={{ flex: 3 }} />
            <View style={styles.statCols}>
                <Fontisto name="stopwatch" size={16} color="#9ca3af" style={styles.colIcon} />
                <MaterialIcons name="sports-soccer" size={18} color="#9ca3af" style={styles.colIcon} />
                <FontAwesome name="magic" size={16} color="#9ca3af" style={styles.colIcon} />
                <AntDesign name="star" size={17} color="#9ca3af" style={styles.colIcon} />
            </View>
            <View style={{ width: 16 }} />
        </View>
    )

    const renderRating = (rating, style) => {
        const color = getRatingColor(rating)
        if (!color) return <Text style={[styles.statText, style]}>-</Text>
        return (
            <View style={[styles.ratingBadge, { backgroundColor: color }, style]}>
                <Text style={styles.ratingText}>{parseFloat(rating).toFixed(2)}</Text>
            </View>
        )
    }

    const renderGroup = ({ item: group }) => {
        const expanded = expandedKeys.has(group.key)
        return (
            <View>
                <TouchableOpacity style={styles.groupRow} onPress={() => toggleKey(group.key)} activeOpacity={0.7}>
                    <View style={styles.teamInfo}>
                        {group.team_logo ? (
                            <Image source={{ uri: group.team_logo }} style={styles.teamLogo} resizeMode="contain" />
                        ) : (
                            <View style={[styles.teamLogo, styles.logoFallback]}>
                                <MaterialIcons name="shield" size={16} color="#6b7280" />
                            </View>
                        )}
                        <View>
                            <Text style={styles.teamName} numberOfLines={1  }>{group.team_name ?? 'Unknown'}</Text>
                            <Text style={styles.seasonLabel}>{formatSeason(group.season)}</Text>
                        </View>
                    </View>
                    <View style={styles.statCols}>
                        <Text style={styles.statText}>
                            {group.totalApps}
                            <Text style={styles.startsText}>({group.totalLineups})</Text>
                        </Text>
                        <Text style={styles.statText}>{group.totalGoals}</Text>
                        <Text style={styles.statText}>{group.totalAssists}</Text>
                        <View style={[styles.ratingCell]}>
                            {renderRating(group.avgRating)}
                        </View>
                    </View>
                    <AntDesign name={expanded ? 'up' : 'down'} size={12} color="#9ca3af" style={{ marginLeft: 4 }} />
                </TouchableOpacity>

                {expanded && group.competitions.filter(c => c.appearances > 0).map((comp, i) => (
                    <View key={`${group.key}_${comp.league_id}_${i}`} style={styles.subRow}>
                        <View style={styles.compInfo}>
                            {comp.league_logo ? (
                                <Image source={{ uri: comp.league_logo }} style={styles.compLogo} resizeMode="contain" />
                            ) : (
                                <View style={[styles.compLogo, styles.logoFallback]}>
                                    <AntDesign name="trophy" size={12} color="#6b7280" />
                                </View>
                            )}
                            <Text style={styles.compName} numberOfLines={1}>{comp.league_name ?? 'Unknown'}</Text>
                        </View>
                        <View style={styles.statCols}>
                            <Text style={styles.statText}>
                                {comp.appearances}
                                <Text style={styles.startsText}>({comp.lineups})</Text>
                            </Text>
                            <Text style={styles.statText}>{comp.goals}</Text>
                            <Text style={styles.statText}>{comp.assists}</Text>
                            <View style={styles.ratingCell}>
                                {renderRating(comp.rating)}
                            </View>
                        </View>
                    </View>
                ))}

                <View style={styles.divider} />
            </View>
        )
    }

    if (!seasons.length) return null

    return (
    <View className='bg-white rounded-xl'>
        <FlatList
            scrollEnabled={false}
            data={seasons}
            keyExtractor={item => item.key}
            ListHeaderComponent={renderHeader}
            renderItem={renderGroup}
        />
    </View>
    )
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    statCols: {
        flex: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    colIcon: {
        flex: 1,
        textAlign: 'center',
    },
    groupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    teamInfo: {
        flex: 3,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    teamLogo: {
        width: 28,
        height: 28,
    },
    logoFallback: {
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
    },
    teamName: {
        fontSize: 13,
        fontWeight: '700',
    },
    seasonLabel: {
        color: '#9ca3af',
        fontSize: 11,
        marginTop: 1,
    },
    statText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 13,
    },
    startsText: {
        fontSize: 11,
    },
    ratingCell: {
        flex: 1,
        alignItems: 'center',
    },
    ratingBadge: {
        borderRadius: 12,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    ratingText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    subRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        paddingLeft: 48,
    },
    compInfo: {
        flex: 3,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    compLogo: {
        width: 20,
        height: 20,
    },
    compName: {
        fontSize: 12,
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#2d3139',
    },
})

export default PlayerSeasons
