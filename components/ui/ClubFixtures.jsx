import { View, Text, TouchableOpacity, Image, Platform, FlatList, ScrollView, ActivityIndicator } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import React, { use, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase';
import { isFixtureLive, isFixtureFinished, formatScore, formatPenaltyScore, getClubResult } from '@/lib/matchStatus';
import {Link} from 'expo-router'
import {FlashList} from '@shopify/flash-list'
import { Tabs } from 'react-native-collapsible-tab-view'

// Web renders outside a Tabs.Container (no collapsible header there), so only
// the mobile list registers as the collapsible header's scrollable.
const FixturesList = Platform.OS === 'web' ? FlashList : Tabs.FlashList

// Mobile shows only the most recent finished fixture on first render (plus all
// upcoming) - older fixtures are fetched in batches via the "Load More" button.
// Fixed independently of `perPage` (which some screens override, e.g. the
// TeamOverview widget) so "Load More" always pulls a full batch of 10.
const INITIAL_PAST_LIMIT = 1
const LOAD_MORE_PAST_LIMIT = 10

const getResultColor = (result) => {
  if (result === 'W') return 'green'
  if (result === 'L') return 'red'
  return 'gray'
}

// Renders the FT score with the penalty shootout result (if any) on its own
// line underneath, rather than appended inline.
const ScoreText = ({ item, fontSize, color }) => {
  const penaltyScore = formatPenaltyScore(item)
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontFamily: 'SupremeBold', fontSize, color }} numberOfLines={1}>{formatScore(item)}</Text>
      {penaltyScore && (
        <Text style={{ fontFamily: 'SupremeBold', fontSize: fontSize - 4, color }} numberOfLines={1}>{penaltyScore}</Text>
      )}
    </View>
  )
}

const FixtureRow = ({ item, formatDate, formatTime }) => {
  const [rowWidth, setRowWidth] = useState(0)

  const logoSize = rowWidth ? Math.max(22, Math.min(48, rowWidth * 0.075)) : Platform.select({ web: 40, default: 30 })
  const teamWidth = rowWidth ? Math.max(80, (rowWidth - 40 - 140) / 2) : Platform.select({ web: 200, default: 140 })
  const fontSize = rowWidth ? Math.max(11, Math.min(20, rowWidth * 0.038)) : 18
  const resultFontSize = rowWidth ? Math.max(10, Math.min(16, rowWidth * 0.030)) : 14

  const homeTeamView = (
    <View className='flex flex-row items-center gap-2' style={{ width: teamWidth, justifyContent: 'flex-end' }}>
      <Text style={{ fontFamily: 'Supreme', fontSize, textAlign: 'right' }} numberOfLines={2} adjustsFontSizeToFit>
        {item.home_team.club_name}
      </Text>
      <Image source={{ uri: item.home_team.logo }} style={{ width: logoSize, height: logoSize }} resizeMode='contain' />
    </View>
  )

  const awayTeamView = (
    <View className='flex flex-row items-center gap-2 p-2' style={{ width: teamWidth, justifyContent: 'flex-start' }}>
      <Image source={{ uri: item.away_team.logo }} style={{ width: logoSize, height: logoSize }} resizeMode='contain' />
      <Text style={{ fontFamily: 'Supreme', fontSize, textAlign: 'center' }} numberOfLines={2} adjustsFontSizeToFit>
        {item.away_team.club_name}
      </Text>
    </View>
  )

  return (
    <Link href={{ pathname: '/fixture/[id]', params: { id: item.id } }}>
      <View className='flex flex-col p-5 px-5' onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}>
        <View className='flex flex-row items-center justify-between w-full'>
          <Text className='text-sm font-supreme'>{formatDate(item?.date_time_utc)}</Text>
          <View className='flex flex-row items-center gap-2'>
            <Image source={{ uri: item.competition.logo }} style={{ width: 15, height: 15 }} resizeMode='contain' />
            <Text className='text-sm font-supreme'>{item.competition.name}</Text>
          </View>
        </View>

        {isFixtureLive(item.match_status) ? (
          Platform.OS === 'web' ? (
            <View className='flex flex-row items-center w-full'>
              <View style={{ minWidth: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#ef4444' }}/>
                <Text style={{ fontFamily: 'SupremeBold', fontSize: 18, color: '#ef4444' }}>
                  {item.match_status === 'Halftime' ? 'HT' : `${item.minute ?? ''}'`}
                </Text>
              </View>

              <View className='flex-1 flex flex-row items-center justify-center gap-5'>
                {homeTeamView}
                <View style={{ flexShrink: 0 }}>
                  <ScoreText item={item} fontSize={resultFontSize} color='black' />
                </View>
                {awayTeamView}
              </View>

              <View style={{ width: 56 }} />
            </View>
          ) : (
            // Mobile: no room for a side column, so the live badge stacks
            // directly above the score instead of sitting beside the row.
            <View className='flex flex-row items-center justify-center w-full gap-5'>
              {homeTeamView}
              <View style={{ alignItems: 'center', flexShrink: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' }}/>
                  <Text style={{ fontFamily: 'SupremeBold', fontSize: 12, color: '#ef4444' }}>
                    {item.match_status === 'Halftime' ? 'HT' : `${item.minute ?? ''}'`}
                  </Text>
                </View>
                <ScoreText item={item} fontSize={resultFontSize} color='black' />
              </View>
              {awayTeamView}
            </View>
          )
        ) : (
          <View className='flex flex-row items-center justify-center gap-5'>
            {homeTeamView}

            {isFixtureFinished(item.match_status) ? (
              <View className='p-2 px-5 rounded-full justify-center' style={{ backgroundColor: getResultColor(item.result) }}>
                <ScoreText item={item} fontSize={resultFontSize} color='white' />
              </View>
            ) : (
              <View className='p-2 px-1 justify-center'>
                <Text style={{ fontFamily: 'SupremeBold', fontSize: resultFontSize, color: 'black' }}>{formatTime(item.date_time_utc)}</Text>
              </View>
            )}

            {awayTeamView}
          </View>
        )}
      </View>
    </Link>
  )
}

export const ClubFixtures = ({club, perPage = 10}) => {

    const FIXTURES_PER_PAGE = perPage
    const [ fixtures, setFixtures] = useState([])
    const [anchorDate, setAnchorDate] = useState(null)
    const [page, setPage] = useState(0)
    const [loadingMorePast, setLoadingMorePast] = useState(false)
    const [hasMorePast, setHasMorePast] = useState(true)
    const pastOffsetRef = useRef(0)


    useEffect(() => {
      if (Platform.OS === 'web') {
        loadFixtures()
      }
      else{
        loadInitialFixuresMobile()
      }  
    
    },[page, club])

    const loadInitialFixuresMobile = async () => {
      pastOffsetRef.current = 0
      setHasMorePast(true)

      // Not Started / Match Finished(*) are exact/prefix filters, but a live
      // match's status is neither (e.g. '1st Half', 'Halftime') - fetch it
      // separately so it doesn't fall through both queries below.
      const {data: livefixtures} = await supabase.from('fixtures').select(`*,
        home_team:home_team_id (club_name,logo, id),
        away_team:away_team_id (club_name,logo, id),
        competition:league_id (name, id, logo)
        `
      )
      .or(`home_team_id.eq.${club?.id},away_team_id.eq.${club?.id}`)
      .neq('match_status', 'Not Started')
      .not('match_status', 'ilike', 'Match Finished%')
      .order('date_time_utc', { ascending: true })

      const {data: upcomingfixtures , error} = await supabase.from('fixtures').select(`*,
        home_team:home_team_id (club_name,logo, id),
        away_team:away_team_id (club_name,logo, id),
        competition:league_id (name, id, logo)
        `
      )
      .or(`home_team_id.eq.${club?.id},away_team_id.eq.${club?.id}`)
      .eq('match_status', 'Not Started')
      .order('date_time_utc', { ascending: true })

      const {data: donefixtures , error2} = await supabase.from('fixtures').select(`*,
        home_team:home_team_id (club_name,logo, id),
        away_team:away_team_id (club_name,logo, id),
        competition:league_id (name, id, logo)
        `
      )
      .or(`home_team_id.eq.${club?.id},away_team_id.eq.${club?.id}`)
      .ilike('match_status', 'Match Finished%')
      .order('date_time_utc', { ascending: false })
      .limit(INITIAL_PAST_LIMIT)

      if (error || error2) console.log(error || error2)

      const safeLive = livefixtures || []
      const safeUpcoming = upcomingfixtures || []
      const safeDone = donefixtures || []

      pastOffsetRef.current = safeDone.length
      setHasMorePast(safeDone.length === INITIAL_PAST_LIMIT)

      const processedLive = safeLive.map(fixture => ({
        ...fixture,
        result: '-',
        score: fixture.home_score + ' - ' + fixture.away_score,
      }))

      const proccesedUpcoming = safeUpcoming.map(fixture =>( {
        ...fixture,
        result: '-',
        score: '-',
      }))

      const proccesedDone = safeDone.map(fixture =>( {
        ...fixture,
        result: getClubResult(fixture, club.id),
        score: fixture.home_score + ' - ' + fixture.away_score,
      }))

      setFixtures([...proccesedDone.reverse(), ...processedLive, ...proccesedUpcoming])
    }

    const loadMorePastFixturesMobile = async () => {
      if (!club?.id || loadingMorePast || !hasMorePast) return

      setLoadingMorePast(true)

      const { data: moreFixtures, error } = await supabase.from('fixtures').select(`*,
        home_team:home_team_id (club_name,logo, id),
        away_team:away_team_id (club_name,logo, id),
        competition:league_id (name, id, logo)
        `
      )
      .or(`home_team_id.eq.${club.id},away_team_id.eq.${club.id}`)
      .ilike('match_status', 'Match Finished%')
      .order('date_time_utc', { ascending: false })
      .range(pastOffsetRef.current, pastOffsetRef.current + LOAD_MORE_PAST_LIMIT - 1)

      if (error) console.log(error)

      const safeMore = moreFixtures || []
      pastOffsetRef.current += safeMore.length
      setHasMorePast(safeMore.length === LOAD_MORE_PAST_LIMIT)

      const processedMore = safeMore.map(fixture => ({
        ...fixture,
        result: getClubResult(fixture, club.id),
        score: fixture.home_score + ' - ' + fixture.away_score,
      })).reverse()

      setFixtures(prev => [...processedMore, ...prev])
      setLoadingMorePast(false)
    }
    const loadInitialFixuresWeb = async () => {

      const {data: anchorFixtures , error} = await supabase.from('fixtures').select(`*,
        home_team:home_team_id (club_name,logo, id),
        away_team:away_team_id (club_name,logo, id),
        competition:league_id (name, id, logo)
        `
      )
      .or(`home_team_id.eq.${club?.id},away_team_id.eq.${club?.id}`)
      .eq('match_status', 'Match Finished')
      .order('date_time_utc', { ascending: false })
      .limit(4)
      if (error){
        console.log(error)
      }
      if (!anchorFixtures || anchorFixtures.length === 0) {
        console.log('No finished fixtures found for this club')
        setFixtures([]) // Set empty fixtures
        return
      }
      const anchor = anchorFixtures.at(-1).date_time_utc
      console.log(anchor)
      setAnchorDate(anchor)
      
      const {data: firstFixtures , error2} = await supabase.from('fixtures').select(`*,
          home_team:home_team_id (club_name,logo, id),
          away_team:away_team_id (club_name,logo, id),
          competition:league_id (name, id, logo)
          `
        )
        .or(`home_team_id.eq.${club.id},away_team_id.eq.${club.id}`)
        .gt('date_time_utc', anchor)
        .order('date_time_utc', { ascending: true })
        .range(page * FIXTURES_PER_PAGE, (page + 1) * FIXTURES_PER_PAGE - 1)
  
      

      const processedFixtures = firstFixtures?.map(fixture =>( {
        ...fixture,
        result: getClubResult(fixture, club.id),
        score: fixture.home_score + ' - ' + fixture.away_score,
      }))
      setFixtures(processedFixtures)
      
      
    }
    const loadFixtures = async () => {
      console.log(page)
      let query = supabase.from('fixtures').select(`*,
          home_team:home_team_id (club_name,logo, id),
          away_team:away_team_id (club_name,logo, id),
          competition:league_id (name, id, logo)
          `
        )
      if (page === 0){
       loadInitialFixuresWeb()
       return
      }
      else if (page < 0){
        query = query
        .or(`home_team_id.eq.${club.id},away_team_id.eq.${club.id}`)
        .lt('date_time_utc', anchorDate)
        .order('date_time_utc', { ascending: false })
        .range((-page-1) * FIXTURES_PER_PAGE, (-(page) + 1) * FIXTURES_PER_PAGE - 1)
      }
      else if (page > 0){
        query = query
        .or(`home_team_id.eq.${club.id},away_team_id.eq.${club.id}`)
        .gt('date_time_utc', anchorDate)
        .order('date_time_utc', { ascending: true })
        .range(page  * FIXTURES_PER_PAGE, (page + 1) * FIXTURES_PER_PAGE - 1)
      }

      const {data: data , error} = await query

      if (!data) return
      const processedFixtures = data.map(fixture =>( {
        ...fixture,
        result: getClubResult(fixture, club.id),
        score: fixture.home_score + ' - ' + fixture.away_score,
      }))


      setFixtures(processedFixtures.reverse())
      
    }



     const formatDate = (date) => {
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      return new Date(date).toLocaleDateString('en-US', options);
    };
     const formatTime = (date) => {
  const options = { hour: 'numeric', minute: '2-digit' , hour12: true};
  return new Date(date).toLocaleTimeString('en-US', options);
 }
  const renderFixture = useCallback(({item}) => (
    <FixtureRow
      item={item}
      formatDate={formatDate}
      formatTime={formatTime}
    />
  ), [formatDate, formatTime])

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


  return (
    <View className='flex flex-col items-center justify-center rounded-xl  bg-white' style={{height: '100%'}} >
      <View className='flex flex-row items-center justify-between w-full p-5 px-10'>
        {Platform.OS == 'web' &&
        <TouchableOpacity onPress={() => setPage(page - 1)}>
            <View className='w-10 h-10 rounded-full justify-center items-center' style={{backgroundColor: '#D1D1D1', width: 30, height: 30}}>
                <AntDesign name="left" size={15} color="black" />
            </View>
        </TouchableOpacity>}
        <Text className='text-2xl  font-supreme'>Fixtures</Text>
        {Platform.OS == 'web' && 
        <TouchableOpacity onPress={() => setPage(page + 1)}>
            <View className='w-10 h-10 rounded-full justify-center items-center' style={{backgroundColor: '#D1D1D1', width: 30, height: 30}}>
                <AntDesign name="right" size={15} color="black" />
            </View>
        </TouchableOpacity>}
      </View>
      
    <View className='flex flex-col w-full ' style={{flex: 1}}>
        <FixturesList
        style={{flex: 1}}
        data={fixtures}
        contentContainerStyle={{ flexGrow: 1 }}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderFixture}
        ListHeaderComponent={Platform.OS !== 'web' ? renderLoadMorePast : null}
        />
    </View>
    </View>
  )
}
export default ClubFixtures