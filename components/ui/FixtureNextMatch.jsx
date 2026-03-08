import { View, Text, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase';
import { Link } from 'expo-router';

const FixtureNextMatch = ({ away, home }) => {
    const [awayNextMatch, setAwayNextMatch] = useState(null)
    const [homeNextMatch, setHomeNextMatch] = useState(null)

    useEffect(() => {
        const getAwayNextMatch = async () => {
            const { data, error } = await supabase.from('fixtures').select(`*, 
            home_team:home_team_id(club_name,logo, id),
            away_team:away_team_id(club_name,logo, id),
            competition:league_id(name, id, logo)`)
                .or(`home_team_id.eq.${away?.id},away_team_id.eq.${away?.id}`)
                .eq('match_status', 'Not Started')
                .order('date_time_utc', { ascending: true })
                .limit(1)
                .single()
            if (!error) setAwayNextMatch(data)
        }

        const getHomeNextMatch = async () => {
            const { data, error } = await supabase.from('fixtures').select(`*, 
            home_team:home_team_id(club_name,logo, id),
            away_team:away_team_id(club_name,logo, id),
            competition:league_id(name, id, logo)`)
                .or(`home_team_id.eq.${home?.id},away_team_id.eq.${home?.id}`)
                .eq('match_status', 'Not Started')
                .order('date_time_utc', { ascending: true })
                .limit(1)
                .single()
            if (!error) setHomeNextMatch(data)
        }

        getAwayNextMatch()
        getHomeNextMatch()
    }, [away, home])

    const formatDate = (date) => {
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        return new Date(date).toLocaleDateString('en-US', options);
    }
    const formatTime = (date) => {
        const options = { hour: 'numeric', minute: '2-digit', hour12: true };
        return new Date(date).toLocaleTimeString('en-US', options);
    }

    if (!awayNextMatch || !homeNextMatch) return null;

    const MatchCard = ({ match }) => (
        <View style={{ marginBottom: 8 }}>
            {/* Competition pill */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E8E8E8', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 6 }}>
                <Link href={{ pathname: '/competition/[id]', params: { id: match?.competition.id } }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Image source={{ uri: match?.competition.logo }} style={{ width: 14, height: 14 }} resizeMode='contain' />
                        <Text style={{ fontSize: 12, fontFamily: 'supremeBold' }}>{match?.competition?.name}</Text>
                    </View>
                </Link>
            </View>

            {/* Match row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingVertical: 8 }}>

                {/* Home team */}
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Image source={{ uri: match?.home_team.logo }} style={{ width: 36, height: 36 }} resizeMode='contain' />
                    <Text numberOfLines={2} style={{ fontFamily: 'supremeBold', fontSize: 12, flex: 1 }}>
                        {match?.home_team?.club_name || ''}
                    </Text>
                </View>

                {/* Date / time */}
                <View style={{ alignItems: 'center', paddingHorizontal: 8 }}>
                    <Text style={{ fontFamily: 'supremeBold', fontSize: 12, textAlign: 'center' }}>
                        {formatDate(match?.date_time_utc)}
                    </Text>
                    <Text style={{ fontFamily: 'supreme', fontSize: 11, color: '#666', marginTop: 2 }}>
                        {formatTime(match?.date_time_utc)}
                    </Text>
                </View>

                {/* Away team */}
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                    <Text numberOfLines={2} style={{ fontFamily: 'supremeBold', fontSize: 12, flex: 1, textAlign: 'right' }}>
                        {match?.away_team?.club_name || ''}
                    </Text>
                    <Image source={{ uri: match?.away_team.logo }} style={{ width: 36, height: 36 }} resizeMode='contain' />
                </View>

            </View>
  
        </View>
    );

    return (
        <View className='bg-white  rounded-xl p-3' style={{ width: '100%' }}>
            <Text style={{ fontSize: 16, fontFamily: 'supremeBold', paddingVertical: 8, paddingHorizontal: 4 }}>
                Next Match
            </Text>
            <View className='gap-2'>
            <MatchCard match={awayNextMatch} />
            <MatchCard match={homeNextMatch} />
            </View>
        </View>
    );
}

export default FixtureNextMatch;