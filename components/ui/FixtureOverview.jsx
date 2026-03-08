import { StyleSheet, Text, View, Platform, Image} from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import React from 'react'
import { Link } from 'expo-router';

export const FixtureOverview = ({fixture}) => {
    const formatDate = (date) => {
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      return new Date(date).toLocaleDateString('en-US', options);
    };
    const formatTime = (date) => {
      const options = { hour: 'numeric', minute: '2-digit', hour12: true };
      return new Date(date).toLocaleTimeString('en-US', options);
    }

    const goalEvents = fixture?.events.filter(e => e.event_type === 'Goal')

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

    const isWeb = Platform.OS === 'web';

    return (
      <View style={[styles.container]} className='flex flex-col bg-white'>

        {/* Meta row: date, stadium, competition */}
        <View className='p-5 gap-5 flex flex-row items-center justify-center flex-wrap'>
          <View className='flex flex-row items-center gap-2'>
            <AntDesign name="calendar" size={15} color="black" />
            <Text className='font-supreme'>{formatDate(fixture?.date_time_utc)}, {formatTime(fixture?.date_time_utc)}</Text>
          </View>
          <View className='flex flex-row items-center gap-2'>
            <MaterialIcons name="stadium" size={20} color="black" />
            <Text className='font-supreme'>{fixture?.stadium_name}</Text>
          </View>
          <Link href={{pathname: '/competition/[id]', params:{id: fixture?.competition.id}}}>
            <View className='flex flex-row items-center gap-2'>
              <Image source={{ uri: fixture?.competition.logo }} style={{width: 15, height: 15}} resizeMode='contain' />
              <Text className='font-supreme'>{fixture?.round}</Text>
            </View>
          </Link>
        </View>

        <View className='border-b border-gray-300 w-full' />

        {/* Teams + Score row */}
        <View style={styles.teamsRow}>

          {/* Home team */}
          <Link href={{pathname: '/club/[id]', params:{id: fixture?.home_team.id}}}>
            <View style={styles.teamHeader}>
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
            </View>
          </Link>

          {/* Score (centered) */}
          <View style={styles.scoreBlock}>
            <Text className='font-supremeBold text-4xl'>
              {fixture?.home_score} - {fixture?.away_score}
            </Text>
            <Text className='font-supreme text-sm' style={{color: 'gray'}}>
              {fixture?.match_status}
            </Text>
          </View>

          {/* Away team */}
          <Link href={{pathname: '/club/[id]', params:{id: fixture?.away_team.id}}}>
            <View style={styles.teamHeader}>
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
            </View>
          </Link>

        </View>

        {/* Goals & Cards row — separate from the team headers so it has full width */}
        <View style={styles.eventsRow}>

          {/* Home events */}
          <View style={styles.eventsColumn}>
            {homeGoals.map((goalGroup, index) => (
              <View key={index} style={styles.eventItem}>
                <MaterialIcons name="sports-soccer" size={13} color="black" />
                <Text className='font-supreme text-xs' style={styles.eventText}>
                  {goalGroup.player_name} {goalGroup.times.join(', ')}'
                  {goalGroup.event_details === 'Own Goal' ? ' (OG)' : ''}
                </Text>
              </View>
            ))}
            {homeRedCards.map((card, index) => (
              <View key={index} style={styles.eventItem}>
                <View style={styles.redCard}/>
                <Text className='font-supreme text-xs' style={styles.eventText}>
                  {card.player_name} {card.time_elapsed}{card.time_extra ? `+${card.time_extra}` : ''}'
                </Text>
              </View>
            ))}
          </View>

          {/* Spacer so columns don't overlap score area */}
          <View style={styles.eventsSpacer} />

          {/* Away events */}
          <View style={[styles.eventsColumn, styles.eventsColumnRight]}>
            {awayGoals.map((goalGroup, index) => (
              <View key={index} style={[styles.eventItem, styles.eventItemRight]}>
                <Text className='font-supreme text-xs' style={styles.eventText}>
                  {goalGroup.player_name} {goalGroup.times.join(', ')}'
                  {goalGroup.event_details === 'Own Goal' ? ' (OG)' : ''}
                </Text>
                <MaterialIcons name="sports-soccer" size={13} color="black" />
              </View>
            ))}
            {awayRedCards.map((card, index) => (
              <View key={index} style={[styles.eventItem, styles.eventItemRight]}>
                <Text className='font-supreme text-xs' style={styles.eventText}>
                  {card.player_name} {card.time_elapsed}{card.time_extra ? `+${card.time_extra}` : ''}'
                </Text>
                <View style={styles.redCard}/>
              </View>
            ))}
          </View>

        </View>

      </View>
    )
}

export default FixtureOverview

const styles = StyleSheet.create({
  container: {
    borderRadius: Platform.select({ ios: 0, android: 0, web: 12, default: 0 }),
  },
  // Row that holds home | score | away
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