import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, ActivityIndicator } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase';
import { isFixtureLive, isFixtureFinished, formatScore, formatPenaltyScore } from '@/lib/matchStatus';
import { Link } from 'expo-router'
import { FlashList } from '@shopify/flash-list'

const CLUB_NAME_FONT_SIZE = Platform.select({ web: 20, default: 13 })
const SCORE_FONT_SIZE = Platform.select({ web: 18, default: 14 })
const DATE_FONT_SIZE = Platform.select({ web: 14, default: 11 })
// Mobile shows only the most recent finished fixture on first render (plus all
// upcoming) - older fixtures are fetched in batches via the "Load More" button.
const INITIAL_PAST_LIMIT = 1
const LOAD_MORE_PAST_LIMIT = 10

// Renders the FT score with the penalty shootout result (if any) on its own
// line underneath, rather than appended inline.
const ScoreText = ({ item, fontSize, style }) => {
    const penaltyScore = formatPenaltyScore(item)
    return (
        <View style={{ alignItems: 'center' }}>
            <Text className='font-supremeBold' style={[{ fontSize }, style]} numberOfLines={1}>{formatScore(item)}</Text>
            {penaltyScore && (
                <Text className='font-supremeBold' style={[{ fontSize: fontSize - 4 }, style]} numberOfLines={1}>{penaltyScore}</Text>
            )}
        </View>
    )
}

export const LeagueFixtures = ({ season }) => {

    const FIXTURES_PER_PAGE = 10
    const [fixtures, setFixtures] = useState([])
    const [anchorDate, setAnchorDate] = useState(null)
    const [page, setPage] = useState(0)
    const [loadingMorePast, setLoadingMorePast] = useState(false)
    const [hasMorePast, setHasMorePast] = useState(true)
    const pastOffsetRef = useRef(0)

    useEffect(() => {
        if (!season?.id) return; // Guard clause if season isn't loaded yet

        if (Platform.OS === 'web') {
            loadFixtures()
        }
        else {
            loadInitialFixuresMobile()
        }

    }, [page, season])

    const loadInitialFixuresMobile = async () => {
        pastOffsetRef.current = 0
        setHasMorePast(true)

        // Fetch ALL Upcoming
        const { data: upcomingfixtures, error } = await supabase.from('fixtures').select(`*,
        home_team:home_team_id (club_name,logo, id),
        away_team:away_team_id (club_name,logo, id),
        competition:league_id (name, id, logo)
        `
        )
            .eq('season_id', season.id) // CHANGED: Filter by Season ID
            .eq('match_status', 'Not Started')
            .order('date_time_utc', { ascending: true })

        // Fetch most recent finished games (older ones load on scroll up)
        const { data: donefixtures, error2 } = await supabase.from('fixtures').select(`*,
        home_team:home_team_id (club_name,logo, id),
        away_team:away_team_id (club_name,logo, id),
        competition:league_id (name, id, logo)
        `
        )
            .eq('season_id', season.id) // CHANGED: Filter by Season ID
            .ilike('match_status', 'Match Finished%')
            .order('date_time_utc', { ascending: false })
            .limit(INITIAL_PAST_LIMIT)

        if (error || error2) console.log(error || error2);

        const safeUpcoming = upcomingfixtures || [];
        const safeDone = donefixtures || [];

        pastOffsetRef.current = safeDone.length
        setHasMorePast(safeDone.length === INITIAL_PAST_LIMIT)

        // No need for "getResult" processing in a league view (neutral perspective)
        const processedUpcoming = safeUpcoming.map(fixture => ({
            ...fixture,
            score: '-',
        }))

        const processedDone = safeDone.map(fixture => ({
            ...fixture,
            score: formatScore(fixture),
        }))

        setFixtures([...processedDone.reverse(), ...processedUpcoming])
    }

    const loadMorePastFixturesMobile = async () => {
        if (!season?.id || loadingMorePast || !hasMorePast) return

        setLoadingMorePast(true)

        const { data: moreFixtures, error } = await supabase.from('fixtures').select(`*,
        home_team:home_team_id (club_name,logo, id),
        away_team:away_team_id (club_name,logo, id),
        competition:league_id (name, id, logo)
        `
        )
            .eq('season_id', season.id)
            .ilike('match_status', 'Match Finished%')
            .order('date_time_utc', { ascending: false })
            .range(pastOffsetRef.current, pastOffsetRef.current + LOAD_MORE_PAST_LIMIT - 1)

        if (error) console.log(error)

        const safeMore = moreFixtures || []
        pastOffsetRef.current += safeMore.length
        setHasMorePast(safeMore.length === LOAD_MORE_PAST_LIMIT)

        const processedMore = safeMore.map(fixture => ({
            ...fixture,
            score: formatScore(fixture),
        })).reverse()

        setFixtures(prev => [...processedMore, ...prev])
        setLoadingMorePast(false)
    }

    const loadInitialFixuresWeb = async () => {

        // 1. Find the Anchor (The latest finished match in this season)
        const { data: anchorFixtures, error } = await supabase.from('fixtures').select(`date_time_utc`)
            .eq('season_id', season.id)
            .ilike('match_status', 'Match Finished%')
            .order('date_time_utc', { ascending: false })
            .limit(1)
        console.log(anchorFixtures, '79')
        if (error) console.log(error, 'error 80')

        if (!anchorFixtures || anchorFixtures.length === 0) {
            setAnchorDate(new Date(0).toISOString())
            const { data: firstFixtures } = await supabase.from('fixtures').select(`*,
                home_team:home_team_id (club_name,logo, id),
                away_team:away_team_id (club_name,logo, id),
                competition:league_id (name, id, logo)
            `)
                .eq('season_id', season.id) 
                .order('date_time_utc', { ascending: true })
                .range(0, FIXTURES_PER_PAGE - 1);
            
            setFixtures(firstFixtures || []);
            return
        }

        const anchor = anchorFixtures[0].date_time_utc
        console.log(anchor,'anchor')
        setAnchorDate(anchor)

        let { data: fixtures, error2 } = await supabase.from('fixtures').select(`*,
          home_team:home_team_id (club_name,logo, id),
          away_team:away_team_id (club_name,logo, id),
          competition:league_id (name, id, logo)
          `
        )
            .eq('season_id', season.id)
            .gt('date_time_utc', anchor)
            .order('date_time_utc', { ascending: true })
            .range(page * FIXTURES_PER_PAGE, (page + 1) * FIXTURES_PER_PAGE - 1)

        if(!fixtures || fixtures.length === 0){
            const {data: pastFixtures, error: pastFixturesError} = await supabase.from('fixtures').select(`*,
            home_team:home_team_id (club_name,logo, id),
            away_team:away_team_id (club_name,logo, id),
            competition:league_id (name, id, logo)
            `
          )
              .eq('season_id', season.id)
              .lte('date_time_utc', anchor)
              .order('date_time_utc', { ascending: false })
              .range(0, FIXTURES_PER_PAGE - 1)

            if (pastFixtures || pastFixtures.length > 0){
                fixtures = pastFixtures
            }
        }
        console.log(fixtures, 'fixtures')
        const processedFixtures = fixtures?.map(fixture => ({
            ...fixture,
            score: isFixtureFinished(fixture.match_status)
                ? formatScore(fixture)
                : '-',
        }))
        setFixtures(processedFixtures || [])
    }

    const loadFixtures = async () => {
        let query = supabase.from('fixtures').select(`*,
          home_team:home_team_id (club_name,logo, id),
          away_team:away_team_id (club_name,logo, id),
          competition:league_id (name, id, logo)
          `
        )
        
        if (page === 0) {
            loadInitialFixuresWeb()
            return
        }
        else if (page < 0) {
            query = query
                .eq('season_id', season.id)
                .lt('date_time_utc', anchorDate)
                .order('date_time_utc', { ascending: false })
                .range((-page - 1) * FIXTURES_PER_PAGE, (-(page) + 1) * FIXTURES_PER_PAGE - 1)
        }
        else if (page > 0) {
            // Going forward (Upcoming games)
            query = query
                .eq('season_id', season.id)
                .gt('date_time_utc', anchorDate)
                .order('date_time_utc', { ascending: true })
                .range(page * FIXTURES_PER_PAGE, (page + 1) * FIXTURES_PER_PAGE - 1)
        }

        const { data: data, error } = await query

        if (!data || data.length === 0){
            if(page > 0) setPage(page-1)
            if(page < 0) setPage(page+1)
             return
        }
        
        const processedFixtures = data.map(fixture => ({
            ...fixture,
            score: isFixtureFinished(fixture.match_status)
                ? formatScore(fixture)
                : '-',
        }))

        // If we are looking at past games, we fetched them DESC (newest first), 
        // but we likely want to render them ASC or keep DESC depending on preference.
        // Usually, past lists are top=recent.
        // The original code reversed everything.
        setFixtures(page < 0 ? processedFixtures : processedFixtures)
    }

    const formatDate = (date) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
    };
    
    const formatTime = (date) => {
        const options = { hour: 'numeric', minute: '2-digit', hour12: true };
        return new Date(date).toLocaleTimeString('en-US', options);
    }

    const groupedFixtures = useMemo(() => {
        const groups = []
        const indexByRound = new Map()

        fixtures.forEach((fixture) => {
            const roundKey = fixture.round || 'Fixtures'
            if (!indexByRound.has(roundKey)) {
                indexByRound.set(roundKey, groups.length)
                groups.push({ round: roundKey, fixtures: [] })
            }
            groups[indexByRound.get(roundKey)].fixtures.push(fixture)
        })

        return groups
    }, [fixtures])

    const renderFixtureRow = (item) => {
        return (
            <Link key={item.id} href={{ pathname: '/fixture/[id]', params: { id: item.id } }} asChild>
                <TouchableOpacity>
                    <View className='flex flex-col p-5 px-5' >
                        <View className='flex flex-row items-center justify-between w-full '>
                            <Text className='font-supreme' style={{ fontSize: DATE_FONT_SIZE }}>{formatDate(item?.date_time_utc)}</Text>
                            <View className='flex flex-row items-center gap-2'>
                                {item.competition?.logo &&
                                    <Image source={{ uri: item.competition.logo }} style={{ width: 15, height: 15 }} resizeMode='contain' />
                                }
                                <Text className='font-supreme' style={{ fontSize: DATE_FONT_SIZE }}>{item.competition?.name || 'League'}</Text>
                            </View>
                        </View>

                        {isFixtureLive(item.match_status) ? (
                            <View className='flex flex-row items-center w-full'>
                                 <View style={{ minWidth: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#ef4444' }}/>
                                    <Text style={{ fontFamily: 'SupremeBold', fontSize: 14, color: '#ef4444' }}>
                                        {item.match_status === 'Halftime' ? 'HT' : `${item.minute ?? ''}'`}
                                    </Text>
                                </View>

                                <View className='flex-1 flex flex-row items-center justify-center gap-1'>
                                    <View className='flex flex-row items-center gap-2 py-2' style={[styles.teamNameContainer, { justifyContent: 'flex-end' }]}>
                                        <Text className='font-supreme text-right' numberOfLines={1} style={{ fontSize: CLUB_NAME_FONT_SIZE}} >{item.home_team.club_name}</Text>
                                        <Image source={{ uri: item.home_team.logo }} style={styles.clublogo} resizeMode='contain' />
                                    </View>

                                    <View style={{ flexShrink: 0 }}>
                                        <ScoreText item={item} fontSize={SCORE_FONT_SIZE - 4} style={{ color: 'black' }} />
                                    </View>

                                    <View className='flex flex-row items-center gap-2 py-2' style={[styles.teamNameContainer, { justifyContent: 'flex-start' }]}>
                                        <Image source={{ uri: item.away_team.logo }} style={styles.clublogo} resizeMode='contain' />
                                        <Text className='font-supreme text-left' numberOfLines={1} style={{ fontSize: CLUB_NAME_FONT_SIZE}} >{item.away_team.club_name}</Text>
                                    </View>
                                </View>

                                <View style={{ width: 40 }} />
                            </View>
                        ) : (
                            <View className='flex flex-row items-center w-full justify-center gap-1'>
                                <View className='flex flex-row items-center gap-2 py-2' style={[styles.teamNameContainer, { justifyContent: 'flex-end' }]}>
                                    <Text className='font-supreme text-right' numberOfLines={1} style={{ fontSize: CLUB_NAME_FONT_SIZE}} >{item.home_team.club_name}</Text>
                                    <Image source={{ uri: item.home_team.logo }} style={styles.clublogo} resizeMode='contain' />
                                </View>

                                {isFixtureFinished(item.match_status) ?
                                    <View className='rounded-md justify-center bg-gray-100 border border-gray-200 p-2'>
                                        <ScoreText item={item} fontSize={SCORE_FONT_SIZE - 4} style={{ color: 'black' }} />
                                    </View>
                                    :
                                    <View className='justify-center' >
                                        <Text className='text-black font-supremeBold' style={{ fontSize: SCORE_FONT_SIZE - 4 }}>{formatTime(item.date_time_utc)}</Text>
                                    </View>
                                }

                                <View className='flex flex-row items-center gap-2 py-2' style={[styles.teamNameContainer, { justifyContent: 'flex-start' }]}>
                                    <Image source={{ uri: item.away_team.logo }} style={styles.clublogo} resizeMode='contain' />
                                    <Text className='font-supreme text-left' numberOfLines={1} style={{ fontSize: CLUB_NAME_FONT_SIZE}} >{item.away_team.club_name}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Link>
        )
    }

    const renderLoadMorePast = () => {
        if (loadingMorePast) return (
            <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color="#000" />
            </View>
        )
        if (!hasMorePast) return null
        return (
            <TouchableOpacity
                onPress={loadMorePastFixturesMobile}
                style={{
                    marginHorizontal: 20,
                    marginBottom: 16,
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

    const renderRoundGroup = ({ item, index }) => {
        return (
            <View
                className='rounded-2xl bg-white overflow-hidden mx-5'
                style={[styles.roundCard, index === 0 && { marginTop: 5 }]}
            >
                <View className='px-5 pt-4 pb-1'>
                    <Text className='font-supremeBold text-gray-500' style={{ fontSize: Platform.select({ web: 16, default: 13 }) }}>{item.round}</Text>
                </View>
                {item.fixtures.map((fixture, fixtureIndex) => (
                    <View key={fixture.id}>
                        {renderFixtureRow(fixture)}
                        {fixtureIndex < item.fixtures.length - 1 && <View className='h-[1px] w-full bg-gray-100' />}
                    </View>
                ))}
            </View>
        )
    }

    return (
        <View className='flex flex-col items-center justify-center rounded-xl bg-white' style={{ height: '100%' }} >
            <View className='flex flex-row items-center justify-between w-full p-5 '>
                {Platform.OS == 'web' ? (
                    <TouchableOpacity 
                    onPress={() => setPage(page - 1)}
                    >
                        <View className='rounded-full justify-center items-center' style={{ backgroundColor: '#D1D1D1', width: 30, height: 30 }}>
                            <AntDesign name="left" size={15} color="black" />
                        </View>
                    </TouchableOpacity>
                ) : <View style={{width: 30}} />} 
                
                <Text className='text-2xl font-supreme'>Fixtures</Text>
                
                {Platform.OS == 'web' ? (
                    <TouchableOpacity onPress={() => setPage(page + 1)}>
                        <View className='rounded-full justify-center items-center' style={{ backgroundColor: '#D1D1D1', width: 30, height: 30 }}>
                            <AntDesign name="right" size={15} color="black" />
                        </View>
                    </TouchableOpacity>
                ) : <View style={{width: 30}} />}
            </View>

            <View className='flex flex-col w-full' style={{ flex: 1 }}>
                <FlashList
                    data={groupedFixtures}
                    estimatedItemSize={220}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
                    ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                    keyExtractor={(item, index) => item.round?.toString() || index.toString()}
                    renderItem={renderRoundGroup}
                    ListHeaderComponent={Platform.OS !== 'web' ? renderLoadMorePast : null}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    roundCard: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    teamNameContainer: {
        width: Platform.select({
            ios: 90,
            android: 90,
            web: 200,
        })
    },
    clublogo: {
        width: Platform.select({
            ios: 22,
            android: 22,
            web: 40,
        }),
        height: Platform.select({
            ios: 22,
            android: 22,
            web: 40,
        }),
    }
})

export default LeagueFixtures