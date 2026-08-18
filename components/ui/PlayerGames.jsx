import { View, Text, Platform, Image, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Pressable, Modal, ScrollView, StyleSheet } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import { Tabs } from 'react-native-collapsible-tab-view'
import { supabase } from '../../lib/supabase'
import Fontisto from '@expo/vector-icons/Fontisto';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FontAwesome } from '@expo/vector-icons';
import { CleanSheetIcon } from './CleanSheetIcon'

const MATCHES_PER_PAGE = 15
const EMPTY_FILTERS = { result: null, minGoals: null, minAssists: null, minRating: null, currentSeasonOnly: false, leagueIds: [], seasonYears: [], clubIds: [] }

export const PlayerGames = ({player, setIsVisible, setPlayerStats, setPlayerInfo}) => {
    const [allMatches, setAllMatches] = useState([])
    const [hovered, setHovered] = useState(null)
    const [page, setPage] = useState(0)
    const [displayLimit, setDisplayLimit] = useState(MATCHES_PER_PAGE)
    const [isLoading, setIsLoading] = useState(false)
    const [opponentFilter, setOpponentFilter] = useState('')
    const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS)
    const [pendingFilters, setPendingFilters] = useState({ ...EMPTY_FILTERS, minGoals: '', minAssists: '', minRating: '' })
    const [filterVisible, setFilterVisible] = useState(false)
    const [openPopup, setOpenPopup] = useState(false)

    useEffect(() => {
        setOpponentFilter('')
        setActiveFilters(EMPTY_FILTERS)
        setPage(0)
        setDisplayLimit(MATCHES_PER_PAGE)
        setOpenPopup(false)
        if (player?.id) fetchAllMatches()
    }, [player?.id])

    // Fallback used when a match's fixture_lineups data doesn't include this player (missing/incomplete
    // historical data) — without this, playerInfo would be null and the player modal would silently fail to open.
    const fallbackPlayerInfo = { id: player.id, player_id: player.id, name: player.transfermarkt_name, player_name: player.transfermarkt_name, number: null }

    const mergeLineupData = (data, lineupPlayers) => {
        return data.map(match => {
            const lineup = (lineupPlayers ?? []).filter(l => l.fixture_id === match.fixture_id)
            const playerInLineup = lineup.find(l => {
                const inStarting = l.starting_lineup?.find(p => p.player?.id === player.id)
                const inSubs = l.substitutes?.find(p => p.player?.id === player.id)
                return inStarting || inSubs
            })
            if (!playerInLineup) { match.playerInfo = fallbackPlayerInfo; return match }
            const combined = [...(playerInLineup.substitutes ?? []), ...(playerInLineup.starting_lineup ?? [])]
            match.playerInfo = combined.find(p => p.player?.id === player.id)?.player ?? fallbackPlayerInfo
            return match
        })
    }

    // Fetch ALL games for the player once — filters below are then all client-side
    const fetchAllMatches = async () => {
        setIsLoading(true)

        const { data, error } = await supabase.from('player_stats').select(`*,
            team:clubs!team_id(club_name, logo, colors),
            player: player_id (photo, nationality, DOB, country_code, flag: country_code(flag_url)),
            fixture: fixture_id
                    (date_time_utc,
                    home_team: home_team_id (club_name, logo, id),
                    away_team: away_team_id (club_name, logo, id),
                    league: league_id (name, logo),
                    season: season_id (id, season, current),
                    home_score, away_score)
        `).eq('player_id', player?.id)
            .order('fixture(date_time_utc)', { ascending: false })

        if (!error && data) {
            const fixture_ids = data.map(m => m.fixture_id)
            const { data: lineupPlayers } = await supabase.from('fixture_lineups').select('*').in('fixture_id', fixture_ids)
            setAllMatches(mergeLineupData(data, lineupPlayers))
        } else if (error) {
            console.log(error)
        }
        setIsLoading(false)
    }

    // Derive filter options from the full loaded dataset
    const availableLeagues = useMemo(() => {
        const seen = new Set()
        const res = []
        allMatches.forEach(g => {
            const l = g.fixture?.league
            if (l?.name && !seen.has(l.name)) { seen.add(l.name); res.push({ name: l.name, logo: l.logo }) }
        })
        return res
    }, [allMatches])

    // Dedupe by the season's year, not its DB id — the same year has a separate
    // season row per competition, so id-based dedup fragmented one season into
    // several checkboxes that each only covered one competition's games.
    const availableSeasons = useMemo(() => {
        const seen = new Map()
        allMatches.forEach(g => {
            const s = g.fixture?.season
            if (s?.season == null) return
            const existing = seen.get(s.season)
            if (!existing) seen.set(s.season, { year: s.season, label: `${s.season}/${s.season + 1}`, current: !!s.current })
            else if (s.current) existing.current = true
        })
        return Array.from(seen.values()).sort((a, b) => b.year - a.year)
    }, [allMatches])

    const availableClubs = useMemo(() => {
        const seen = new Map()
        allMatches.forEach(g => {
            const t = g.team
            if (g.team_id != null && !seen.has(g.team_id)) seen.set(g.team_id, { id: g.team_id, name: t?.club_name, logo: t?.logo })
        })
        return Array.from(seen.values())
    }, [allMatches])

    // All filtering happens client-side over the complete dataset
    const filteredMatches = useMemo(() => allMatches.filter(item => {
        if (opponentFilter) {
            const isHome = item.fixture.home_team.id === item.team_id
            const opp = isHome ? item.fixture.away_team.club_name : item.fixture.home_team.club_name
            if (!opp.toLowerCase().includes(opponentFilter.toLowerCase())) return false
        }
        if (activeFilters.result) {
            const isHome = item.fixture.home_team.id === item.team_id
            const ps = isHome ? item.fixture.home_score : item.fixture.away_score
            const os = isHome ? item.fixture.away_score : item.fixture.home_score
            const result = ps > os ? 'W' : ps < os ? 'L' : 'D'
            if (result !== activeFilters.result) return false
        }
        if (activeFilters.minGoals != null && (item.goals ?? 0) < activeFilters.minGoals) return false
        if (activeFilters.minAssists != null && (item.assists ?? 0) < activeFilters.minAssists) return false
        if (activeFilters.minRating != null && (item.rating == null || item.rating < activeFilters.minRating)) return false
        if (activeFilters.currentSeasonOnly && !item.fixture?.season?.current) return false
        if (activeFilters.leagueIds.length > 0 && !activeFilters.leagueIds.includes(item.fixture?.league?.name)) return false
        if (activeFilters.seasonYears.length > 0 && !activeFilters.seasonYears.includes(item.fixture?.season?.season)) return false
        if (activeFilters.clubIds.length > 0 && !activeFilters.clubIds.includes(item.team_id)) return false
        return true
    }), [allMatches, opponentFilter, activeFilters])

    // Reset pagination whenever the filtered set changes
    useEffect(() => {
        setPage(0)
        setDisplayLimit(MATCHES_PER_PAGE)
    }, [opponentFilter, activeFilters])

    const anyFilterActive = !!(activeFilters.result || activeFilters.minGoals != null || activeFilters.minAssists != null
        || activeFilters.minRating != null || activeFilters.currentSeasonOnly
        || activeFilters.leagueIds.length > 0 || activeFilters.seasonYears.length > 0 || activeFilters.clubIds.length > 0)

    const activeFilterCount = [
        activeFilters.result, activeFilters.minGoals, activeFilters.minAssists,
        activeFilters.minRating, activeFilters.currentSeasonOnly || null,
        activeFilters.leagueIds.length > 0 ? true : null,
        activeFilters.seasonYears.length > 0 ? true : null,
        activeFilters.clubIds.length > 0 ? true : null,
    ].filter(Boolean).length

    const clearAllFilters = () => setActiveFilters(EMPTY_FILTERS)

    const openFilterSheet = () => {
        setPendingFilters({
            result: activeFilters.result,
            minGoals: activeFilters.minGoals != null ? String(activeFilters.minGoals) : '',
            minAssists: activeFilters.minAssists != null ? String(activeFilters.minAssists) : '',
            minRating: activeFilters.minRating != null ? String(activeFilters.minRating) : '',
            currentSeasonOnly: activeFilters.currentSeasonOnly,
            leagueIds: activeFilters.leagueIds,
            seasonYears: activeFilters.seasonYears,
            clubIds: activeFilters.clubIds,
        })
        setFilterVisible(true)
    }

    const applyPendingFilters = () => {
        setActiveFilters({
            result: pendingFilters.result,
            minGoals: pendingFilters.minGoals !== '' ? parseInt(pendingFilters.minGoals, 10) : null,
            minAssists: pendingFilters.minAssists !== '' ? parseInt(pendingFilters.minAssists, 10) : null,
            minRating: pendingFilters.minRating !== '' ? parseInt(pendingFilters.minRating, 10) : null,
            currentSeasonOnly: pendingFilters.currentSeasonOnly,
            leagueIds: pendingFilters.leagueIds,
            seasonYears: pendingFilters.seasonYears,
            clubIds: pendingFilters.clubIds,
        })
        setFilterVisible(false)
    }

    const resetPendingFilters = () => {
        setPendingFilters({ ...EMPTY_FILTERS, minGoals: '', minAssists: '', minRating: '' })
        clearAllFilters()
        setFilterVisible(false)
    }

    const handleLoadMore = () => {
        if (!isLoading && displayLimit < filteredMatches.length) setDisplayLimit(d => d + MATCHES_PER_PAGE)
    }

    const formatDate = (date) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
    };

    const formatDateMobile = (date) => {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
    };

    const getRatingColor = (rating) => {
        if (!rating) return '#ccc';
        if (rating >= 9) return '#12CCFF';
        if (rating >= 7) return '#4CAF50';
        if (rating >= 6) return '#FF9800';
        return '#f44336';
    };

    // true = clean sheet, false = conceded, null = not applicable (didn't play / not keeper that match / goals_conceded unknown)
    const getCleanSheetStatus = (item) => {
        if (item.position !== 'G' || !item.minutes) return null
        if (item.goals_conceded == null) return null
        return item.goals_conceded === 0
    }

    // Table-wide, web only: renderHeader has ONE shared label per column, so we can't mix
    // per-row column meaning — decide once whether this player's whole table is GK-mode.
    // Prefer the player's own listed position; fall back to a majority vote over loaded
    // matches with a known position only (excludes rows with missing position data so a
    // historical gap there can't dilute the ratio).
    const isGoalkeeper = useMemo(() => {
        if (player?.positions?.length) return player.positions[0] === 'Goalkeeper'
        const positioned = allMatches.filter(m => m.position != null)
        if (positioned.length === 0) return false
        return positioned.filter(m => m.position === 'G').length / positioned.length > 0.5
    }, [player?.positions, allMatches])

    const renderHeader = () => (
        <View className='flex flex-row w-full items-center p-3 gap-2'>
            <View style={{flex: 2}} />
            <View className='flex flex-row items-center gap-2' style={{flex: 1}}>
                <Fontisto name="stopwatch" size={20} color="black" style={{flex: 1, textAlign: 'center'}}/>
                {isGoalkeeper ? (
                    <Ionicons name="hand-left" size={20} color="black" style={{flex: 1, textAlign: 'center'}} />
                ) : (
                    <MaterialIcons name='sports-soccer' size={20} style={{flex: 1, textAlign: 'center'}}/>
                )}
                {isGoalkeeper ? (
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <CleanSheetIcon size={30} color="black" />
                    </View>
                ) : (
                    <FontAwesome name="magic" size={20} color="black" style={{flex: 1, textAlign: 'center'}} />
                )}
                <View style={{flex: 1, alignItems: 'center'}}>
                    <View style={{width: 12, height: 15, backgroundColor: '#ffea2cff', borderRadius: 2}} />
                </View>
                <View style={{flex: 1, alignItems: 'center'}}>
                    <View style={{width: 12, height: 15, backgroundColor: 'red', borderRadius: 2}}/>
                </View>
                <AntDesign name="star" size={20} color="black" style={{flex: 1, textAlign: 'center'}}/>
            </View>
        </View>
    )

    const renderMatch = ({item, index}) => {
        const getResult = () => {
            const isHome = item.fixture.home_team.id === item.team_id;
            if (isHome) {
                return item.fixture.home_score > item.fixture.away_score ? 'W'
                    : item.fixture.home_score < item.fixture.away_score ? 'L' : 'D';
            } else {
                return item.fixture.home_score < item.fixture.away_score ? 'W'
                    : item.fixture.home_score > item.fixture.away_score ? 'L' : 'D';
            }
        }
        const cleanSheet = getCleanSheetStatus(item)
        return (
            <TouchableOpacity className='flex flex-row w-full items-center p-3 gap-2'
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                style={{backgroundColor: hovered === index && '#e4e4e4ff'}}
                onPress={() => {
                    setIsVisible(true)
                    setPlayerInfo(item.playerInfo)
                    setPlayerStats(item)
                }}
            >
                <View className='flex flex-row w-full items-center'>
                    <View className='flex flex-row items-center gap-2' style={{flex: 2}}>
                        <View className='flex flex-row items-center gap-2' style={{flex: 1}}>
                            <Image source={{ uri: item.fixture.league.logo }} style={{width: 20, height: 20}} resizeMode='contain' />
                            <Text className='text-xs font-supreme'>{formatDate(item.fixture.date_time_utc)}</Text>
                        </View>
                        <View className='flex flex-row items-center gap-2' style={{flex: 1}}>
                            <Image source={{ uri: item.team_id === item.fixture.home_team.id ? item.fixture.away_team.logo : item.fixture.home_team.logo }} style={{ width: 25, height: 25 }} resizeMode='contain' />
                            <Text className='font-supreme'>{item.team_id === item.fixture.home_team.id ? 'VS ' + item.fixture.away_team.club_name : '@ ' + item.fixture.home_team.club_name}</Text>
                        </View>
                        <View className='flex flex-row items-center gap-2' style={{flex: 1}}>
                            <Text className='font-supremeBold text-center'>{getResult()} {item.fixture.home_score}-{item.fixture.away_score}</Text>
                        </View>
                    </View>
                    <View className='flex flex-row items-center gap-2' style={{flex: 1}}>
                        <Text style={{flex: 1, textAlign: 'center'}} className='font-supreme'>{item.minutes === null ? '0' : item.minutes}</Text>
                        {isGoalkeeper ? (
                            <Text style={{flex: 1, textAlign: 'center'}} className='font-supreme'>
                                {item.position === 'G' && item.saves != null ? item.saves : '-'}
                            </Text>
                        ) : (
                            <Text style={{flex: 1, textAlign: 'center'}} className='font-supreme'>{item.goals === null ? '0' : item.goals}</Text>
                        )}
                        {isGoalkeeper ? (
                            <View style={{flex: 1, alignItems: 'center'}}>
                                {cleanSheet === true ? (
                                    <AntDesign name="check" size={16} color="#4CAF50" />
                                ) : cleanSheet === false ? (
                                    <AntDesign name="close" size={16} color="#f44336" />
                                ) : (
                                    <Text className='font-supreme'>-</Text>
                                )}
                            </View>
                        ) : (
                            <Text style={{flex: 1, textAlign: 'center'}} className='font-supreme'>{item.assists === null ? '0' : item.assists}</Text>
                        )}
                        <Text style={{flex: 1, textAlign: 'center'}} className='font-supreme'>{item.yellow_cards === null ? '0' : item.yellow_cards}</Text>
                        <Text style={{flex: 1, textAlign: 'center'}} className='font-supreme'>{item.red_cards === null ? '0' : item.red_cards}</Text>
                        <View style={{flex: 1, alignItems: 'center'}}>
                            <View style={{ backgroundColor: getRatingColor(item.rating), borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, minWidth: 46, alignItems: 'center' }}>
                                <Text className='font-supremeBold text-white'>{item.rating === null ? '-' : item.rating}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    const renderMobileMatch = ({item}) => {
        const isHome = item.fixture.home_team.id === item.team_id;
        const opponent = isHome ? item.fixture.away_team : item.fixture.home_team;
        const playerTeamScore = isHome ? item.fixture.home_score : item.fixture.away_score;
        const opponentScore = isHome ? item.fixture.away_score : item.fixture.home_score;

        return (
            <TouchableOpacity
                onPress={() => {
                    setIsVisible(true);
                    setPlayerInfo(item.playerInfo);
                    setPlayerStats(item);
                }}
                style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                }}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
                    <Text style={{ color: '#888'}} className='font-supreme'>
                        {formatDateMobile(item.fixture.date_time_utc)}
                    </Text>
                    <View style={{ backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}>
                        <Image source={{uri: item.fixture.league.logo}} style={{width: 30, height: 30}}/>
                    </View>
                </View>

                <View style={{ height: 1, backgroundColor: '#f0f0f0', marginHorizontal: 16 }} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Image source={{ uri: opponent.logo }} style={{ width: 40, height: 40 }} resizeMode='contain' />
                        <View>
                            <Text className='font-supremeBold'>{opponent.club_name}</Text>
                            <Text style={{ fontSize: 13, color: '#444', marginTop: 3 }}>
                                <Text style={{ fontWeight: '700' }}>{playerTeamScore}</Text>
                                {' - '}
                                {opponentScore}
                            </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {getCleanSheetStatus(item) === true && (
                            <CleanSheetIcon size={30} color="#333" />
                        )}
                        {Array.from({ length: item.goals || 0 }).map((_, i) => (
                            <MaterialIcons key={`g-${i}`} name='sports-soccer' size={18} color='#333' />
                        ))}
                        {Array.from({ length: item.assists || 0 }).map((_, i) => (
                            <FontAwesome key={`a-${i}`} name="magic" size={15} color='#333' />
                        ))}
                        {item.minutes != null && (
                            <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                                <Text className='font-supreme'>{item.minutes}'</Text>
                            </View>
                        )}
                        {item.rating != null && (
                            <View style={{ backgroundColor: getRatingColor(item.rating), borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, minWidth: 46, alignItems: 'center' }}>
                                <Text className='font-supremeBold text-white'>{item.rating}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    const renderMobileFooter = () => {
        if (isLoading) return <ActivityIndicator style={{ padding: 16 }} />
        if (displayLimit >= filteredMatches.length) return (
            <Text style={{ textAlign: 'center', color: '#aaa', padding: 16 }} className='font-supreme'>
                No more matches
            </Text>
        )
        return (
            <TouchableOpacity
                onPress={handleLoadMore}
                style={{
                    margin: 12,
                    padding: 14,
                    backgroundColor: 'white',
                    borderRadius: 12,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06,
                    shadowRadius: 4,
                    elevation: 2,
                }}
            >
                <Text className='font-supremeBold'>Load More</Text>
            </TouchableOpacity>
        )
    }

    const searchInput = (
        <TextInput
            placeholder="Search by opponent..."
            value={opponentFilter}
            onChangeText={setOpponentFilter}
            style={{
                margin: Platform.OS === 'web' ? 12 : 12,
                padding: 10,
                paddingHorizontal: 14,
                borderRadius: 10,
                backgroundColor: '#f5f5f5',
                fontSize: 14,
                fontFamily: 'supreme',
                borderWidth: 1,
                borderColor: '#e0e0e0',
            }}
            clearButtonMode='while-editing'
        />
    )

    // ── Shared filter option widgets ────────────────────────────────────────────
    const ThresholdRow = ({ label, value, options, onChange }) => (
        <View style={{ marginBottom: 14 }}>
            <Text style={styles.filterSectionLabel}>{label}</Text>
            <View style={{ flexDirection: 'row', gap: 5 }}>
                {options.map((n) => (
                    <Pressable
                        key={String(n)}
                        onPress={() => onChange((value ?? null) === n ? null : n)}
                        style={[styles.filterOption, (value ?? null) === n && styles.filterOptionActive]}
                    >
                        <Text style={(value ?? null) === n ? styles.filterOptionTextActive : styles.filterOptionText}>
                            {n === null ? 'Any' : `${n}+`}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    )

    const LeagueCheckboxes = ({ leagueIds, onToggle }) => availableLeagues.length === 0 ? null : (
        <View style={{ marginBottom: 14 }}>
            <Text style={styles.filterSectionLabel}>Competition</Text>
            {availableLeagues.map((l) => {
                const active = leagueIds.includes(l.name)
                return (
                    <Pressable key={l.name} onPress={() => onToggle(l.name)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
                        <View style={[styles.checkbox, active && styles.checkboxActive]}>
                            {active && <AntDesign name="check" size={9} color="white" />}
                        </View>
                        {l.logo && <Image source={{ uri: l.logo }} style={{ width: 15, height: 15 }} resizeMode="contain" />}
                        <Text style={{ fontFamily: 'supreme', fontSize: 13, color: '#1a1430', flex: 1 }} numberOfLines={1}>{l.name}</Text>
                    </Pressable>
                )
            })}
        </View>
    )

    const SeasonCheckboxes = ({ seasonYears, onToggle }) => availableSeasons.length === 0 ? null : (
        <View style={{ marginBottom: 14 }}>
            <Text style={styles.filterSectionLabel}>Season</Text>
            {availableSeasons.slice(0, 8).map((s) => {
                const active = seasonYears.includes(s.year)
                return (
                    <Pressable key={s.year} onPress={() => onToggle(s.year)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
                        <View style={[styles.checkbox, active && styles.checkboxActive]}>
                            {active && <AntDesign name="check" size={9} color="white" />}
                        </View>
                        <Text style={{ fontFamily: 'supreme', fontSize: 13, color: '#1a1430', flex: 1 }}>{s.label}</Text>
                        {s.current && (
                            <View style={{ backgroundColor: '#eee', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                                <Text style={{ fontFamily: 'supremeBold', fontSize: 9, color: 'black' }}>NOW</Text>
                            </View>
                        )}
                    </Pressable>
                )
            })}
        </View>
    )

    const ClubCheckboxes = ({ clubIds, onToggle }) => availableClubs.length === 0 ? null : (
        <View style={{ marginBottom: 14 }}>
            <Text style={styles.filterSectionLabel}>Club</Text>
            {availableClubs.map((c) => {
                const active = clubIds.includes(c.id)
                return (
                    <Pressable key={c.id} onPress={() => onToggle(c.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
                        <View style={[styles.checkbox, active && styles.checkboxActive]}>
                            {active && <AntDesign name="check" size={9} color="white" />}
                        </View>
                        {c.logo && <Image source={{ uri: c.logo }} style={{ width: 15, height: 15 }} resizeMode="contain" />}
                        <Text style={{ fontFamily: 'supreme', fontSize: 13, color: '#1a1430', flex: 1 }} numberOfLines={1}>{c.name}</Text>
                    </Pressable>
                )
            })}
        </View>
    )

    const ResultRow = ({ value, onChange }) => (
        <View style={{ marginBottom: 14 }}>
            <Text style={styles.filterSectionLabel}>Result</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
                {['W', 'D', 'L'].map((r) => (
                    <Pressable
                        key={r}
                        onPress={() => onChange(value === r ? null : r)}
                        style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: value === r ? 'black' : '#f0f0f0' }}
                    >
                        <Text style={{ fontFamily: 'supremeBold', color: value === r ? 'white' : '#555', fontSize: 15 }}>{r}</Text>
                    </Pressable>
                ))}
            </View>
        </View>
    )

    const CurrentSeasonToggle = ({ value, onChange }) => (
        <Pressable onPress={() => onChange(!value)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, marginBottom: 6 }}>
            <View style={[styles.checkbox, value && styles.checkboxActive]}>
                {value && <AntDesign name="check" size={9} color="white" />}
            </View>
            <Text style={{ fontFamily: 'supreme', fontSize: 13, color: '#1a1430' }}>Current season only</Text>
        </Pressable>
    )

    // ── Web filter popup (instant-apply) ────────────────────────────────────────
    const webFilterButton = (
        <View style={{ position: 'relative', zIndex: openPopup ? 1000 : 1 }}>
            <Pressable
                onPress={() => setOpenPopup((p) => !p)}
                style={[styles.filterMainBtn, (openPopup || anyFilterActive) && styles.filterMainBtnActive]}
            >
                <Ionicons name="filter" size={14} color="white" />
                <Text style={styles.filterMainBtnText}>Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</Text>
                <AntDesign name={openPopup ? 'up' : 'down'} size={10} color="white" style={{ marginLeft: 2 }} />
            </Pressable>

            {openPopup && (
                <View style={styles.filterPopup}>
                    <Text style={{ fontFamily: 'supremeBold', fontSize: 15, color: '#1a1430', marginBottom: 14, paddingHorizontal: 16, paddingTop: 16 }}>Filter</Text>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                        <ResultRow value={activeFilters.result} onChange={(v) => setActiveFilters((f) => ({ ...f, result: v }))} />
                        <LeagueCheckboxes leagueIds={activeFilters.leagueIds} onToggle={(name) => setActiveFilters((f) => ({ ...f, leagueIds: f.leagueIds.includes(name) ? f.leagueIds.filter((n) => n !== name) : [...f.leagueIds, name] }))} />
                        <ClubCheckboxes clubIds={activeFilters.clubIds} onToggle={(id) => setActiveFilters((f) => ({ ...f, clubIds: f.clubIds.includes(id) ? f.clubIds.filter((i) => i !== id) : [...f.clubIds, id] }))} />
                        <ThresholdRow label="Goals" value={activeFilters.minGoals} options={[null, 1, 2, 3]} onChange={(v) => setActiveFilters((f) => ({ ...f, minGoals: v }))} />
                        <ThresholdRow label="Assists" value={activeFilters.minAssists} options={[null, 1, 2, 3]} onChange={(v) => setActiveFilters((f) => ({ ...f, minAssists: v }))} />
                        <SeasonCheckboxes seasonYears={activeFilters.seasonYears} onToggle={(year) => setActiveFilters((f) => ({ ...f, seasonYears: f.seasonYears.includes(year) ? f.seasonYears.filter((y) => y !== year) : [...f.seasonYears, year] }))} />
                        <CurrentSeasonToggle value={activeFilters.currentSeasonOnly} onChange={(v) => setActiveFilters((f) => ({ ...f, currentSeasonOnly: v }))} />
                        <View style={{ marginBottom: 6 }}>
                            <ThresholdRow label="Stat Value (Rating)" value={activeFilters.minRating} options={[null, 6, 7, 8, 9]} onChange={(v) => setActiveFilters((f) => ({ ...f, minRating: v }))} />
                        </View>
                        {anyFilterActive && (
                            <Pressable onPress={() => { clearAllFilters(); setOpenPopup(false); }}
                                style={{ marginTop: 6, paddingVertical: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0' }}>
                                <Text style={{ fontFamily: 'supremeBold', color: '#888', fontSize: 12 }}>Reset All</Text>
                            </Pressable>
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    )

    const quickChips = [
        { key: 'goals1', label: '1+ Goals', active: activeFilters.minGoals === 1, onPress: () => setActiveFilters((f) => ({ ...f, minGoals: f.minGoals === 1 ? null : 1 })) },
        { key: 'season', label: 'Current Season', active: activeFilters.currentSeasonOnly, onPress: () => setActiveFilters((f) => ({ ...f, currentSeasonOnly: !f.currentSeasonOnly })) },
        { key: 'assists1', label: '1+ Assists', active: activeFilters.minAssists === 1, onPress: () => setActiveFilters((f) => ({ ...f, minAssists: f.minAssists === 1 ? null : 1 })) },
        { key: 'win', label: 'Win', active: activeFilters.result === 'W', onPress: () => setActiveFilters((f) => ({ ...f, result: f.result === 'W' ? null : 'W' })) },
        { key: 'rating8', label: '8+ Rating', active: activeFilters.minRating === 8, onPress: () => setActiveFilters((f) => ({ ...f, minRating: f.minRating === 8 ? null : 8 })) },
    ]

    const webFilterRow = (
        <View style={{ paddingHorizontal: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap', zIndex: openPopup ? 1000 : 1 }}>
            {webFilterButton}
            {quickChips.map((chip) => (
                <Pressable key={chip.key} onPress={chip.onPress} style={[styles.filterChip, chip.active && styles.filterChipActive]}>
                    <Text style={[styles.filterChipText, chip.active && styles.filterChipTextActive]}>{chip.label}</Text>
                </Pressable>
            ))}
        </View>
    )

    // ── Mobile filter sheet (pending + Apply) ───────────────────────────────────
    const mobileFilterButton = (
        <View style={{ paddingHorizontal: 12, marginBottom: 8 }}>
            <Pressable
                onPress={openFilterSheet}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', borderWidth: 1.5, borderColor: anyFilterActive ? 'black' : '#ddd', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
            >
                <Ionicons name="filter" size={16} color={anyFilterActive ? 'black' : '#555'} />
                <Text style={{ fontFamily: 'supremeBold', color: anyFilterActive ? 'black' : '#555', fontSize: 13 }}>
                    Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                </Text>
            </Pressable>
        </View>
    )

    const mobileFilterSheet = (
        <Modal transparent visible={filterVisible} animationType="slide" onRequestClose={() => setFilterVisible(false)}>
            <Pressable style={styles.mobileOverlay} onPress={() => setFilterVisible(false)}>
                <Pressable style={styles.mobileSheet} onPress={(e) => e.stopPropagation?.()}>
                    <Text style={{ fontFamily: 'supremeBold', fontSize: 18, color: '#1a1430', padding: 20, paddingBottom: 10 }}>Filter Matches</Text>
                    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                        <ResultRow value={pendingFilters.result} onChange={(v) => setPendingFilters((f) => ({ ...f, result: v }))} />
                        <LeagueCheckboxes leagueIds={pendingFilters.leagueIds} onToggle={(name) => setPendingFilters((f) => ({ ...f, leagueIds: f.leagueIds.includes(name) ? f.leagueIds.filter((n) => n !== name) : [...f.leagueIds, name] }))} />
                        <ClubCheckboxes clubIds={pendingFilters.clubIds} onToggle={(id) => setPendingFilters((f) => ({ ...f, clubIds: f.clubIds.includes(id) ? f.clubIds.filter((i) => i !== id) : [...f.clubIds, id] }))} />
                        <ThresholdRow label="Goals" value={pendingFilters.minGoals !== '' ? parseInt(pendingFilters.minGoals, 10) : null} options={[null, 1, 2, 3]} onChange={(v) => setPendingFilters((f) => ({ ...f, minGoals: v === null ? '' : String(v) }))} />
                        <ThresholdRow label="Assists" value={pendingFilters.minAssists !== '' ? parseInt(pendingFilters.minAssists, 10) : null} options={[null, 1, 2, 3]} onChange={(v) => setPendingFilters((f) => ({ ...f, minAssists: v === null ? '' : String(v) }))} />
                        <SeasonCheckboxes seasonYears={pendingFilters.seasonYears} onToggle={(year) => setPendingFilters((f) => ({ ...f, seasonYears: f.seasonYears.includes(year) ? f.seasonYears.filter((y) => y !== year) : [...f.seasonYears, year] }))} />
                        <CurrentSeasonToggle value={pendingFilters.currentSeasonOnly} onChange={(v) => setPendingFilters((f) => ({ ...f, currentSeasonOnly: v }))} />
                        <ThresholdRow label="Stat Value (Rating)" value={pendingFilters.minRating !== '' ? parseInt(pendingFilters.minRating, 10) : null} options={[null, 6, 7, 8, 9]} onChange={(v) => setPendingFilters((f) => ({ ...f, minRating: v === null ? '' : String(v) }))} />

                        <Pressable onPress={applyPendingFilters} style={{ backgroundColor: 'black', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 6, marginBottom: 10 }}>
                            <Text style={{ fontFamily: 'supremeBold', color: 'white', fontSize: 16 }}>Apply</Text>
                        </Pressable>
                        <Pressable onPress={resetPendingFilters} style={{ borderWidth: 1.5, borderColor: '#ddd', borderRadius: 14, padding: 14, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'supremeBold', color: '#888', fontSize: 15 }}>Reset</Text>
                        </Pressable>
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    )

    const webPageMatches = filteredMatches.slice(page * MATCHES_PER_PAGE, (page + 1) * MATCHES_PER_PAGE)

    return (
        Platform.OS === 'web' ?
            <View className='rounded-2xl bg-white shadow-xl w-full' style={{flex: 1}}>
                {searchInput}
                {webFilterRow}
                {isLoading && allMatches.length === 0 ? (
                    <ActivityIndicator style={{ padding: 32 }} />
                ) : webPageMatches.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: '#aaa', padding: 32 }} className='font-supreme'>
                        {opponentFilter || anyFilterActive ? 'No matches found' : 'No matches'}
                    </Text>
                ) : (
                    <FlatList
                        ListHeaderComponent={renderHeader}
                        data={webPageMatches}
                        renderItem={renderMatch}
                        keyExtractor={(item) => item.fixture_id?.toString()}
                    />
                )}
                <View className='flex flex-row items-center justify-between w-full p-5 px-10'>
                    <TouchableOpacity
                        className='flex flex-row items-center gap-5'
                        onPress={() => { if (page > 0) setPage(page - 1) }}
                        disabled={page === 0}
                    >
                        <View style={{backgroundColor: page === 0 ? '#f3f1f1ff' : '#D1D1D1', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center'}}>
                            <AntDesign name="left" size={15} color="black" />
                        </View>
                        <Text className='font-supremeBold uppercase text-lg' style={{color: page === 0 ? '#b9b5b5ff' : 'black'}}>Previous</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className='flex flex-row items-center gap-5'
                        onPress={() => setPage(page + 1)}
                        disabled={(page + 1) * MATCHES_PER_PAGE >= filteredMatches.length}
                    >
                        <Text className='font-supremeBold uppercase text-lg' style={{color: (page + 1) * MATCHES_PER_PAGE >= filteredMatches.length ? '#b9b5b5ff' : 'black'}}>Next</Text>
                        <View style={{backgroundColor: (page + 1) * MATCHES_PER_PAGE >= filteredMatches.length ? '#f3f1f1ff' : '#D1D1D1', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center'}}>
                            <AntDesign name="right" size={15} color="black" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        :
            <>
                <Tabs.FlatList
                    data={filteredMatches.slice(0, displayLimit)}
                    renderItem={renderMobileMatch}
                    keyExtractor={(item) => item.fixture_id?.toString()}
                    contentContainerStyle={{ padding: 12, gap: 12 }}
                    ListHeaderComponent={
                        <View>
                            {searchInput}
                            {mobileFilterButton}
                        </View>
                    }
                    ListEmptyComponent={
                        !isLoading && (
                            <Text style={{ textAlign: 'center', color: '#aaa', padding: 32 }} className='font-supreme'>
                                {opponentFilter || anyFilterActive ? 'No matches found' : 'No matches'}
                            </Text>
                        )
                    }
                    ListFooterComponent={renderMobileFooter}
                />
                {mobileFilterSheet}
            </>
    )
}

export default PlayerGames

const styles = StyleSheet.create({
    filterMainBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    filterMainBtnActive: {
        backgroundColor: 'black',
    },
    filterMainBtnText: {
        fontFamily: 'supremeBold',
        fontSize: 13,
        color: 'white',
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 7,
        backgroundColor: 'white',
    },
    filterChipActive: {
        borderColor: 'black',
        backgroundColor: '#f0f0f0',
    },
    filterChipText: {
        fontFamily: 'supremeBold',
        fontSize: 12,
        color: '#555',
    },
    filterChipTextActive: {
        color: 'black',
    },
    filterPopup: {
        position: 'absolute',
        top: 42,
        left: 0,
        zIndex: 1000,
        backgroundColor: 'white',
        borderRadius: 14,
        width: 260,
        maxHeight: 420,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.14,
        shadowRadius: 16,
        elevation: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    filterSectionLabel: {
        fontFamily: 'supremeBold',
        fontSize: 11,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    filterOption: {
        flex: 1,
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    filterOptionActive: {
        backgroundColor: 'black',
    },
    filterOptionText: {
        fontFamily: 'supremeBold',
        fontSize: 12,
        color: '#555',
    },
    filterOptionTextActive: {
        fontFamily: 'supremeBold',
        fontSize: 12,
        color: 'white',
    },
    checkbox: {
        width: 17,
        height: 17,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: '#ddd',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        borderColor: 'black',
        backgroundColor: 'black',
    },
    mobileOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    mobileSheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '85%',
    },
})
