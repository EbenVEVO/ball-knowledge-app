import { StyleSheet, Text, View, Platform, Image, Pressable, TouchableOpacity} from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { isFixtureNotStarted, isFixtureLive } from '../../lib/matchStatus';

const TWITTER_EMOJI_BASE = "https://cdn.jsdelivr.net/npm/emoji-datasource-twitter/img/twitter/64/";

const MissedPenaltyIcon = ({ size = 13 }) => (
  <View style={{ width: size, height: size, borderRadius: size * 0.3, borderWidth: 1.5, borderColor: 'red', alignItems: 'center', justifyContent: 'center' }}>
    <AntDesign name="close" size={size * 0.6} color="red" />
  </View>
)

export const FixtureOverview = ({fixture, reactionCount = 0, hasReacted = false, topReactions = [], commentCount = 0, onReactionPress, onCommentPress}) => {
  const [teamStandings, setTeamStandings] = useState([])
  const [awayForm, setAwayForm] = useState([])
  const [homeForm, setHomeForm] = useState([])

  const reactionButtonRef = useRef(null)

    const formatDate = (date) => {
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      return new Date(date).toLocaleDateString('en-US', options);
    };
    const formatTime = (date) => {
      const options = { hour: 'numeric', minute: '2-digit', hour12: true };
      return new Date(date).toLocaleTimeString('en-US', options);
    }

    const goalEvents = fixture?.events.filter(e => e.event_type === 'Goal' && e.comments !== 'Penalty Shootout')

    const groupGoalsByPlayer = (goals) => {
      const grouped = {};
      goals.forEach(goal => {
        const key = `${goal.player_name}_${goal.event_details}`;
        if (!grouped[key]) {
          grouped[key] = {
            player_name: goal.player_name,
            event_details: goal.event_details,
            times: []
          };
        }
        const timeString = goal.time_elapsed + (goal.time_extra ? `+${goal.time_extra}` : '');
        grouped[key].times.push(timeString);
      });
      return Object.values(grouped).sort((a, b) => parseInt(a.times[0]) - parseInt(b.times[0]));
    };

    const awayGoals = groupGoalsByPlayer(goalEvents.filter(e => e.team_id === fixture.away_team_id));
    const homeGoals = groupGoalsByPlayer(goalEvents.filter(e => e.team_id === fixture.home_team_id));
    const awayRedCards = fixture?.events.filter(e => e.event_details === 'Red Card' && e.team_id === fixture.away_team_id)
    const homeRedCards = fixture?.events.filter(e => e.event_details === 'Red Card' && e.team_id === fixture.home_team_id)

    const hasPenaltyShootout = fixture?.home_penalty != null && fixture?.away_penalty != null
    const shootoutEvents = fixture?.events?.filter(e => e.comments === 'Penalty Shootout') ?? []
    const getShootoutDots = (teamId) => shootoutEvents
      .filter(e => e.team_id === teamId)
      .sort((a, b) => a.id - b.id)
      .map(e => e.event_details === 'Penalty' ? '#22c55e' : '#ef4444')
    const homePenaltyDots = getShootoutDots(fixture?.home_team_id)
    const awayPenaltyDots = getShootoutDots(fixture?.away_team_id)

    const isWeb = Platform.OS === 'web';
    const getOrdinal = (n) => {
      const num = Number(n);
      const mod100 = num % 100;
      if (mod100 >= 11 && mod100 <= 13) return `${num}th`;
      switch (num % 10) {
        case 1: return `${num}st`;
        case 2: return `${num}nd`;
        case 3: return `${num}rd`;
        default: return `${num}th`;
      }
    };

    useEffect(()=>{
      const fetchStandings = async () => {
          const {data} = await supabase.from('league_standings').select('*').eq('season_id', fixture?.season_id).in('club_id', [fixture?.home_team_id, fixture?.away_team_id])
          if (data) {
            setTeamStandings([data.filter(s=> s.club_id === fixture?.home_team_id)[0], data.filter(s=> s.club_id === fixture?.away_team_id)[0] ])

      }
}
      const fetchForm = async ()=>{
        const {data: home} = await supabase.from('fixtures')
          .select(`*`)
          .or(`home_team_id.eq.${fixture?.home_team_id},away_team_id.eq.${fixture?.home_team_id}`)
          .eq('match_status', 'Match Finished')
          .order('date_time_utc', { ascending: false })
          .limit(5)
        const {data: away} = await supabase.from('fixtures')
          .select(`*`)
          .or(`home_team_id.eq.${fixture?.away_team_id},away_team_id.eq.${fixture?.away_team_id}`)
          .eq('match_status', 'Match Finished')
          .order('date_time_utc', { ascending: false })
          .limit(5)

          if (away) setAwayForm(away)
          if (home) setHomeForm(home)
          
      }
      if (fixture?.competition?.type !== 'Cup') fetchStandings()
      fetchForm()
    },[fixture])

    const handleReactionPress = () => {
      if (Platform.OS === 'web') {
        reactionButtonRef.current?.measureInWindow((x, y, width, height) => {
          onReactionPress?.({ x, y, width, height })
        })
      } else {
        onReactionPress?.()
      }
    }

  const getResult = (fixture, teamId) => {
    const isHome = fixture.home_team_id === teamId
    const teamScore = isHome ? fixture.home_score : fixture.away_score
    const opponentScore = isHome ? fixture.away_score : fixture.home_score

    if (teamScore > opponentScore) return 'W'
    if (teamScore < opponentScore) return 'L'
    return 'D'
  }

const getResultColor = (result) => {
  if (result === 'W') return '#22c55e'
  if (result === 'L') return '#ef4444'
  return '#6b7280'
}
    return (
      <View style={[styles.container]} className='flex flex-col'>
        <View className='p-5 gap-5 flex flex-row items-center justify-center flex-wrap'>
          <View className='flex flex-row items-center gap-2'>
            <AntDesign name="calendar" size={15} color="black" />
            <Text className='font-supremeBold'>{formatDate(fixture?.date_time_utc)}, {formatTime(fixture?.date_time_utc)}</Text>
          </View>
          <View className='flex flex-row items-center gap-2'>
            <MaterialIcons name="stadium" size={20} color="black" />
            <Text className='font-supremeBold'>{fixture?.stadium_name}</Text>
          </View>
          <Link href={{pathname: '/competition/[id]', params:{id: fixture?.competition.id}}}>
            <View className='flex flex-row items-center gap-2'>
              <Image source={{ uri: fixture?.competition.logo }} style={{width: 15, height: 15}} resizeMode='contain' />
              <Text className='font-supremeBold'>{fixture?.round}</Text>
            </View>
          </Link>
        </View>

        <View className='border-b border-gray-300 w-full' />

        <View style={styles.teamsRow}>
          <Link href={{pathname: '/club/[id]', params:{id: fixture?.home_team.id}}} asChild>
            <Pressable style={styles.teamHeader}>
              <Image
                source={{ uri: fixture?.home_team.logo }}
                style={{ width: isWeb ? 100 : 50, height: isWeb ? 100 : 50 }}
                resizeMode='contain'
              />
              <Text
                style={styles.teamName}
                className={`font-supreme ${isWeb ? 'text-4xl' : 'text-base'} text-center`}
                numberOfLines={2}
              >
                {fixture?.home_team.club_name}
              </Text>
              <View className='flex flex-row gap-2'>
              {homeForm.map((fix, idx) => (
                <View key={idx} className='rounded-full' style={{width:10, height:10, 
                backgroundColor: getResultColor(getResult(fix, fixture?.home_team_id)) 
                }}>
                </View>
              ))}
              </View>
              {fixture?.competition?.type !== 'Cup' && teamStandings[0]?.rank && (
                <Text className='text-center font-supreme text-lg'>
                  {`(${getOrdinal(teamStandings[0]?.rank)})`}
                </Text>
              )}

            </Pressable>
          </Link>

          <View style={styles.scoreBlock}>
            {isFixtureNotStarted(fixture?.match_status) ?
            <Text className='font-supremeBold text-4xl'>
                {formatTime(fixture?.date_time_utc)}
              </Text>
            :
              <Text className='font-supremeBold text-4xl'>
                {fixture?.home_score} - {fixture?.away_score}
              </Text>
            }
            {isFixtureLive(fixture?.match_status) ?
              <View className='flex flex-row items-center gap-1'>
                <View style={styles.liveDot} />
                <Text className='font-supremeBold text-sm' style={{color: '#ef4444'}}>
                  {fixture?.match_status === 'Halftime' ? 'HT' : `${fixture?.minute ?? ''}'`}
                </Text>
              </View>
            :
              <Text className='font-supreme text-sm' style={{color: 'gray'}}>
                {fixture?.match_status}
              </Text>
            }

            {hasPenaltyShootout && (
              <View style={{ alignItems: 'center', marginTop: 6, gap: 2 }}>
                <Text className='font-supreme text-xs' style={{color: 'gray'}}>After Penalties</Text>
                <Text className='font-supremeBold text-base'>
                  {fixture.home_penalty} - {fixture.away_penalty}
                </Text>
                {homePenaltyDots.length > 0 && (
                  <View className='flex flex-row gap-1' style={{marginTop: 2}}>
                    {homePenaltyDots.map((color, idx) => (
                      <View key={idx} className='rounded-full' style={{width: 8, height: 8, backgroundColor: color}} />
                    ))}
                  </View>
                )}
                {awayPenaltyDots.length > 0 && (
                  <View className='flex flex-row gap-1'>
                    {awayPenaltyDots.map((color, idx) => (
                      <View key={idx} className='rounded-full' style={{width: 8, height: 8, backgroundColor: color}} />
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 }}>
              <TouchableOpacity
                ref={reactionButtonRef}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                onPress={handleReactionPress}
              >
                {topReactions.length > 0 ? (
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {topReactions.map((reaction, index) => (
                      <Image
                        key={index}
                        source={{ uri: `${TWITTER_EMOJI_BASE}${reaction.emoji.image}` }}
                        style={{ width: 16, height: 16 }}
                      />
                    ))}
                  </View>
                ) : (
                  <Entypo name='emoji-happy' size={18} color={hasReacted ? '#A477C7' : 'black'} />
                )}
                <Text className='font-supreme text-xs' style={hasReacted ? { color: '#A477C7' } : undefined}>{reactionCount}</Text>
              </TouchableOpacity>

              <Pressable
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                onPress={onCommentPress}
              >
                <FontAwesome name='comment' size={16} color='#A477C7' />
                <Text className='font-supreme text-xs'>{commentCount}</Text>
              </Pressable>
            </View>

          </View>

          <Link href={{pathname: '/club/[id]', params:{id: fixture?.away_team.id}}} asChild>
            <Pressable style={styles.teamHeader}>
              <Image
                source={{ uri: fixture?.away_team.logo }}
                style={{ width: isWeb ? 100 : 50, height: isWeb ? 100 : 50 }}
                resizeMode='contain'
              />
              <Text
                style={styles.teamName}
                className={`font-supreme ${isWeb ? 'text-4xl' : 'text-base'} text-center`}
                numberOfLines={2}
              >
                {fixture?.away_team.club_name}
              </Text>
              <View className='flex flex-row gap-2'>
              {awayForm.map((fix, idx) => (
                <View key={idx} className='rounded-full' style={{width:10, height:10, 
                backgroundColor: getResultColor(getResult(fix, fixture?.away_team_id)) 
                }}>
                </View>
              ))}
            </View>
              {fixture?.competition?.type !== 'Cup' && teamStandings[1]?.rank && (
                <Text className='text-center font-supreme text-lg'>
                  {`(${getOrdinal(teamStandings[1]?.rank)})`}
                </Text>
              )}
            </Pressable>
          </Link>

        </View>
        {!isFixtureNotStarted(fixture?.match_status) &&
        <View style={styles.eventsRow}>

          <View style={styles.eventsColumn}>
            {homeGoals.map((goalGroup, index) => (
              <View key={index} style={styles.eventItem}>
                {goalGroup.event_details === 'Missed Penalty'
                  ? <MissedPenaltyIcon size={13} />
                  : <MaterialIcons name="sports-soccer" size={13} color="black" />}
                <Text className='font-supreme text-sm' style={styles.eventText}>
                  {goalGroup.player_name}
                  {goalGroup.event_details === 'Penalty' ? ' (P)' : ''}
                  {' '}{goalGroup.times.join(', ')}'
                  {goalGroup.event_details === 'Own Goal' ? ' (OG)' : ''}
                  {goalGroup.event_details === 'Missed Penalty' ? ' (pen missed)' : ''}
                </Text>
              </View>
            ))}
            {homeRedCards.map((card, index) => (
              <View key={index} style={styles.eventItem}>
                <View style={styles.redCard}/>
                <Text className='font-supreme text-sm' style={styles.eventText}>
                  {card.player_name} {card.time_elapsed}{card.time_extra ? `+${card.time_extra}` : ''}'
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.eventsSpacer} />

          <View style={[styles.eventsColumn, styles.eventsColumnRight]}>
            {awayGoals.map((goalGroup, index) => (
              <View key={index} style={[styles.eventItem, styles.eventItemRight]}>
                <Text className='font-supreme text-sm' style={styles.eventText}>
                  {goalGroup.player_name}
                  {goalGroup.event_details === 'Penalty' ? ' (P)' : ''}
                  {' '}{goalGroup.times.join(', ')}'
                  {goalGroup.event_details === 'Own Goal' ? ' (OG)' : ''}
                  {goalGroup.event_details === 'Missed Penalty' ? ' (pen missed)' : ''}
                </Text>
                {goalGroup.event_details === 'Missed Penalty'
                  ? <MissedPenaltyIcon size={13} />
                  : <MaterialIcons name="sports-soccer" size={13} color="black" />}
              </View>
            ))}
            {awayRedCards.map((card, index) => (
              <View key={index} style={[styles.eventItem, styles.eventItemRight]}>
                <Text className='font-supreme text-sm' style={styles.eventText}>
                  {card.player_name} {card.time_elapsed}{card.time_extra ? `+${card.time_extra}` : ''}'
                </Text>
                <View style={styles.redCard}/>
              </View>
            ))}
          </View>

        </View>
        }

      </View>
    )
}

export default FixtureOverview

const styles = StyleSheet.create({
  container: {
    borderRadius: Platform.select({ ios: 0, android: 0, web: 12, default: 0 }),
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Platform.OS === 'web' ? 40 : 16,
    paddingTop: Platform.OS === 'web' ? 40 : 20,
    paddingBottom: Platform.OS === 'web' ? 20 : 12,
  },
  teamHeader: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  teamName: {
    textAlign: 'center',
    flexShrink: 1,
  },
  scoreBlock: {
    alignItems: 'center',
    paddingHorizontal: 12,
    minWidth: 90,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  // Row that holds the goal/card lists
  eventsRow: {
    flexDirection: 'row',
    paddingHorizontal: Platform.OS === 'web' ? 40 : 16,
    paddingBottom: Platform.OS === 'web' ? 40 : 20,
  },
  eventsColumn: {
    flex: 1,
    gap: 4,
  },
  eventsColumnRight: {
    alignItems: 'flex-end',
  },
  eventsSpacer: {
    width: Platform.OS === 'web' ? 90 : 70, // mirrors scoreBlock minWidth
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventItemRight: {
    flexDirection: 'row-reverse',
  },
  eventText: {
    flexShrink: 1,
  },
  redCard: {
    width: 11,
    height: 14,
    backgroundColor: 'red',
    borderRadius: 2,
  },
})