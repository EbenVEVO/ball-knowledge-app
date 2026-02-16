import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase';
import { Link } from 'expo-router'
import { FlashList } from '@shopify/flash-list'

export const LeagueFixtures = ({ season }) => {

    const FIXTURES_PER_PAGE = 10
    const [fixtures, setFixtures] = useState([])
    const [anchorDate, setAnchorDate] = useState(null)
    const [page, setPage] = useState(0)

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
        // Fetch Upcoming
        const { data: upcomingfixtures, error } = await supabase.from('fixtures').select(`*,
        home_team:home_team_id (club_name,logo, id),
        away_team:away_team_id (club_name,logo, id),
        competition:league_id (name, id, logo)
        `
        )
            .eq('season_id', season.id) // CHANGED: Filter by Season ID
            .eq('match_status', 'Not Started')
            .order('date_time_utc', { ascending: true })
            .limit(20) // Limit mobile initial load to prevent massive payload

        // Fetch Last few finished (to show recent context)
        const { data: donefixtures, error2 } = await supabase.from('fixtures').select(`*,
        home_team:home_team_id (club_name,logo, id),
        away_team:away_team_id (club_name,logo, id),
        competition:league_id (name, id, logo)
        `
        )
            .eq('season_id', season.id) // CHANGED: Filter by Season ID
            .eq('match_status', 'Match Finished')
            .order('date_time_utc', { ascending: false })
            .limit(3) // Show last 3 finished games

        if (error || error2) console.log(error || error2);

        const safeUpcoming = upcomingfixtures || [];
        const safeDone = donefixtures || [];

        // No need for "getResult" processing in a league view (neutral perspective)
        const processedUpcoming = safeUpcoming.map(fixture => ({
            ...fixture,
            score: '-',
        }))

        const processedDone = safeDone.map(fixture => ({
            ...fixture,
            score: fixture.home_score + ' - ' + fixture.away_score,
        }))

        setFixtures([...processedDone.reverse(), ...processedUpcoming])
    }

    const loadInitialFixuresWeb = async () => {

        // 1. Find the Anchor (The latest finished match in this season)
        const { data: anchorFixtures, error } = await supabase.from('fixtures').select(`date_time_utc`)
            .eq('season_id', season.id)
            .eq('match_status', 'Match Finished')
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
            score: fixture.match_status === 'Match Finished' 
                ? fixture.home_score + ' - ' + fixture.away_score 
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
            score: fixture.match_status === 'Match Finished' 
                ? fixture.home_score + ' - ' + fixture.away_score 
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

    const renderFixture = ({ item, index }) => {
        return (
            <Link href={{ pathname: '/fixture/[id]', params: { id: item.id } }} asChild>
                <TouchableOpacity>
                    <View className='flex flex-col p-5 px-5' >
                        <View className='flex flex-row items-center justify-between w-full '>
                            <Text className='text-sm font-supreme'>{formatDate(item?.date_time_utc)}</Text>
                            <View className='flex flex-row items-center gap-2'>
                                {item.competition?.logo && 
                                    <Image source={{ uri: item.competition.logo }} style={{ width: 15, height: 15 }} resizeMode='contain' />
                                }
                                <Text className='text-sm font-supreme'>{item.competition?.name || 'League'}</Text>
                            </View>
                        </View>

                        <View className='flex flex-row items-center justify-center gap-5'>
                            <View className='flex flex-row items-center gap-2 p-2' style={[styles.teamNameContainer, { justifyContent: 'flex-end' }]}>
                                <Text className='font-supreme text-right text-xl' >{item.home_team.club_name}</Text>
                                <Image source={{ uri: item.home_team.logo }} style={styles.clublogo} resizeMode='contain' />
                            </View>
                            
                            {item.match_status == 'Match Finished' ?
                                <View className='p-1 px-3 rounded-md justify-center bg-gray-100 border border-gray-200'>
                                    <Text className='text-lg text-black font-supremeBold'>{`${item.home_score} - ${item.away_score}`}</Text>
                                </View>
                                :
                                <View className='p-2 px-5 justify-center' >
                                    <Text className='text-lg text-black font-supremeBold'>{formatTime(item.date_time_utc)}</Text>
                                </View>
                            }
                            
                            <View className='flex flex-row items-center gap-2 p-2' style={[styles.teamNameContainer, { justifyContent: 'flex-start' }]}>
                                <Image source={{ uri: item.away_team.logo }} style={styles.clublogo} resizeMode='contain' />
                                <Text className='font-supreme text-left text-xl' >{item.away_team.club_name}</Text>
                            </View>
                        </View>
                    </View>
                    <View className='h-[1px] w-full bg-gray-100' />
                </TouchableOpacity>
            </Link>
        )
    }

    return (
        <View className='flex flex-col items-center justify-center rounded-xl bg-white' style={{ height: '100%' }} >
            <View className='flex flex-row items-center justify-between w-full p-5 px-10'>
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
                    data={fixtures}
                    estimatedItemSize={100}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    renderItem={renderFixture} 
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    teamNameContainer: {
        width: Platform.select({
            ios: 120,
            android: 120,
            web: 200,
        })
    },
    clublogo: {
        width: Platform.select({
            ios: 30,
            android: 30,
            web: 40,
        }),
        height: Platform.select({
            ios: 30,
            android: 30,
            web: 40,
        }),
    }
})

export default LeagueFixtures