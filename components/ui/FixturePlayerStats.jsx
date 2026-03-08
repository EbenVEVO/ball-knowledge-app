import { View, Text, Image, TouchableOpacity, Pressable, ScrollView, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import _ from 'lodash';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list'

// ── Column definitions ───────────────────────────────────────────────────────
const PLAYER_COL_WIDTH = 160;
const STAT_COL_WIDTH   = 80;
const RATING_COL_WIDTH = 60;

const columnDefs = {
    'Top Stats': [
        { key: 'rating',        label: 'Rating',          width: RATING_COL_WIDTH },
        { key: 'minutes',       label: 'Minutes',         width: STAT_COL_WIDTH },
        { key: 'goals',         label: 'Goals',           width: STAT_COL_WIDTH },
        { key: 'assists',       label: 'Assists',         width: STAT_COL_WIDTH },
        { key: 'shots_on_goal', label: 'Shots on Target', width: STAT_COL_WIDTH },
    ],
    'Attacking': [
        { key: 'rating',              label: 'Rating',          width: RATING_COL_WIDTH },
        { key: 'goals',               label: 'Goals',           width: STAT_COL_WIDTH },
        { key: 'penalties_scored',    label: 'Pen. Scored',     width: STAT_COL_WIDTH },
        { key: 'assists',             label: 'Assists',         width: STAT_COL_WIDTH },
        { key: 'shots',               label: 'Total Shots',     width: STAT_COL_WIDTH },
        { key: 'shots_on_goal',       label: 'Shots on Target', width: STAT_COL_WIDTH },
        { key: 'dribbles_successful', label: 'Succ. Dribbles',  width: STAT_COL_WIDTH },
        { key: 'passes',              label: 'Acc. Passes',     width: STAT_COL_WIDTH },
        { key: 'key_passes',          label: 'Key Passes',      width: STAT_COL_WIDTH },
    ],
    'Defending': [
        { key: 'rating',        label: 'Rating',        width: RATING_COL_WIDTH },
        { key: 'tackles',       label: 'Tackles',       width: STAT_COL_WIDTH },
        { key: 'interceptions', label: 'Interceptions', width: STAT_COL_WIDTH },
        { key: 'blocks',        label: 'Blocks',        width: STAT_COL_WIDTH },
        { key: 'dribbled_past', label: 'Dribbled Past', width: STAT_COL_WIDTH },
    ],
    'Duels': [
        { key: 'rating',              label: 'Rating',         width: RATING_COL_WIDTH },
        { key: 'duels_won',           label: 'Duels Won',      width: STAT_COL_WIDTH },
        { key: 'duels',               label: 'Duels Lost',     width: STAT_COL_WIDTH },
        { key: 'fouls',               label: 'Fouls',          width: STAT_COL_WIDTH },
        { key: 'fouled',              label: 'Was Fouled',     width: STAT_COL_WIDTH },
        { key: 'dribbles_successful', label: 'Succ. Dribbles', width: STAT_COL_WIDTH },
        { key: 'tackles',             label: 'Tackles',        width: STAT_COL_WIDTH },
    ],
};

// ── Shared helpers ───────────────────────────────────────────────────────────
const getValue = (item, key) => {
    if (key === 'duels') return (item.duels || 0) - (item.duels_won || 0);
    if (key === 'passes') return `${item.passes || 0}(${item.pass_accuracy || 0})`;
    return item[key] ?? 0;
};

const RatingBadge = ({ value }) => (
    <View style={{
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 2,
        paddingHorizontal: 6,
        backgroundColor: value > 8.9 ? '#12CCFF' : value > 6.9 ? '#00F70C' : value > 5.9 ? '#FF9C00' : 'red',
    }}>
        <Text className='font-supremeBold text-sm text-white'>
            {parseFloat(value).toFixed(1)}
        </Text>
    </View>
);

// ── Web layout (original FlashList approach) ─────────────────────────────────
const WebLayout = ({ playerStats, section, setSection, sections, selectedColumn, direction, handleSort }) => {

    const renderHeader = () => (
        <>
            <View className='flex flex-row p-5 px-10 gap-10'>
                {sections.map(s => (
                    <Pressable
                        key={s}
                        className='p-2 px-7 rounded-full'
                        style={{ borderColor: '#DBDBDB', borderWidth: 1, backgroundColor: section === s ? 'black' : undefined }}
                        onPress={() => setSection(s)}
                    >
                        <Text className='font-supreme' style={{ color: section === s ? 'white' : 'black' }}>{s}</Text>
                    </Pressable>
                ))}
            </View>
            <View className='flex flex-row w-full items-center p-7 gap-2'>
                <View style={{ flex: 2 }} />
                {section === 'Top Stats' && <>
                    {[
                        { key: 'rating',        label: 'Rating',          flex: 0.4 },
                        { key: 'minutes',       label: 'Minutes',         flex: 1 },
                        { key: 'goals',         label: 'Goals',           flex: 1 },
                        { key: 'assists',       label: 'Assists',         flex: 1 },
                        { key: 'shots_on_goal', label: 'Shots on Target', flex: 1 },
                    ].map(col => (
                        <View key={col.key} className='flex flex-row items-center gap-2 justify-center' style={{ flex: col.flex }}>
                            <TouchableOpacity onPress={() => handleSort(col.key)}>
                                <Text numberOfLines={2} className='font-supreme text-center'>{col.label}</Text>
                            </TouchableOpacity>
                            {selectedColumn === col.key && <Ionicons name={direction === 'asc' ? 'arrow-up' : 'arrow-down'} size={10} color="black" />}
                        </View>
                    ))}
                </>}
                {section === 'Attacking' && <>
                    {[
                        { key: 'rating',              label: 'Rating',              flex: 0.4 },
                        { key: 'goals',               label: 'Goals',               flex: 1 },
                        { key: 'penalties_scored',    label: 'Penalties Scored',    flex: 1 },
                        { key: 'assists',             label: 'Assists',             flex: 1 },
                        { key: 'shots',               label: 'Total Shots',         flex: 1 },
                        { key: 'shots_on_goal',       label: 'Shots on Target',     flex: 1 },
                        { key: 'dribbles_successful', label: 'Successful Dribbles', flex: 1 },
                        { key: 'passes',              label: 'Accurate Passes',     flex: 1 },
                        { key: 'key_passes',          label: 'Key Passes',          flex: 1 },
                    ].map(col => (
                        <View key={col.key} className='flex flex-row items-center gap-2 justify-center' style={{ flex: col.flex }}>
                            <TouchableOpacity onPress={() => handleSort(col.key)}>
                                <Text numberOfLines={2} className='font-supreme text-center'>{col.label}</Text>
                            </TouchableOpacity>
                            {selectedColumn === col.key && <Ionicons name={direction === 'asc' ? 'arrow-up' : 'arrow-down'} size={10} color="black" />}
                        </View>
                    ))}
                </>}
                {section === 'Defending' && <>
                    {[
                        { key: 'rating',        label: 'Rating',        flex: 0.4 },
                        { key: 'tackles',       label: 'Tackles',       flex: 1 },
                        { key: 'interceptions', label: 'Interceptions', flex: 1 },
                        { key: 'blocks',        label: 'Blocks',        flex: 1 },
                        { key: 'dribbled_past', label: 'Dribbled Past', flex: 1 },
                    ].map(col => (
                        <View key={col.key} className='flex flex-row items-center gap-2 justify-center' style={{ flex: col.flex }}>
                            <TouchableOpacity onPress={() => handleSort(col.key)}>
                                <Text numberOfLines={2} className='font-supreme text-center'>{col.label}</Text>
                            </TouchableOpacity>
                            {selectedColumn === col.key && <Ionicons name={direction === 'asc' ? 'arrow-up' : 'arrow-down'} size={10} color="black" />}
                        </View>
                    ))}
                </>}
                {section === 'Duels' && <>
                    {[
                        { key: 'rating',              label: 'Rating',              flex: 0.4 },
                        { key: 'duels_won',           label: 'Duels Won',           flex: 1 },
                        { key: 'duels',               label: 'Duels Lost',          flex: 1 },
                        { key: 'fouls',               label: 'Fouls Committed',     flex: 1 },
                        { key: 'fouled',              label: 'Was Fouled',          flex: 1 },
                        { key: 'dribbles_successful', label: 'Successful Dribbles', flex: 1 },
                        { key: 'tackles',             label: 'Tackles',             flex: 1 },
                    ].map(col => (
                        <View key={col.key} className='flex flex-row items-center gap-2 justify-center' style={{ flex: col.flex }}>
                            <TouchableOpacity onPress={() => handleSort(col.key)}>
                                <Text numberOfLines={2} className='font-supreme text-center'>{col.label}</Text>
                            </TouchableOpacity>
                            {selectedColumn === col.key && <Ionicons name={direction === 'asc' ? 'arrow-up' : 'arrow-down'} size={10} color="black" />}
                        </View>
                    ))}
                </>}
            </View>
        </>
    );

    const renderPlayer = ({ item }) => (
        <>
            <View className='flex flex-row w-full items-center px-3 p-1 gap-2'>
                <View className='flex flex-row gap-5 items-center' style={{ flex: 2 }}>
                    <View className='relative'>
                        <Image className='rounded-full' source={{ uri: item.player.photo }} resizeMode='cover' style={{ width: 40, height: 40 }} />
                        <Image className='rounded-full absolute bottom-0 -right-1' source={{ uri: item.team.logo }} resizeMode='cover' style={{ width: 15, height: 15 }} />
                    </View>
                    <Text>{item.player_name}</Text>
                </View>
                {section === 'Top Stats' && <>
                    <View style={{ flex: 0.4 }}>
                        <View className='rounded-full items-center justify-center' style={{ paddingHorizontal: 2, backgroundColor: item.rating > 8.9 ? '#12CCFF' : item.rating > 6.9 ? '#00F70C' : item.rating > 5.9 ? '#FF9C00' : 'red' }}>
                            <Text className='text-center font-supremeBold text-sm text-white'>{parseFloat(item.rating).toFixed(1)}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.minutes}</Text></View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.goals || 0}</Text></View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.assists || 0}</Text></View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.shots_on_goal || 0}</Text></View>
                </>}
                {section === 'Attacking' && <>
                    <View style={{ flex: 0.4 }}>
                        <View className='rounded-full items-center justify-center' style={{ paddingHorizontal: 2, backgroundColor: item.rating > 8.9 ? '#12CCFF' : item.rating > 6.9 ? '#00F70C' : item.rating > 5.9 ? '#FF9C00' : 'red' }}>
                            <Text className='text-center font-supremeBold text-sm text-white'>{parseFloat(item.rating).toFixed(1)}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.goals || 0}</Text></View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.penalties_scored || 0}</Text></View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.assists || 0}</Text></View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.shots || 0}</Text></View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.shots_on_goal || 0}</Text></View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.dribbles_successful || 0}</Text></View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{`${item.passes || 0}(${item.pass_accuracy})`}</Text></View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.key_passes || 0}</Text></View>
                </>}
                {section === 'Defending' && <>
                    <View style={{ flex: 0.4 }}>
                        <View className='rounded-full items-center justify-center' style={{ paddingHorizontal: 2, backgroundColor: item.rating > 8.9 ? '#12CCFF' : item.rating > 6.9 ? '#00F70C' : item.rating > 5.9 ? '#FF9C00' : 'red' }}>
                            <Text className='text-center font-supremeBold text-sm text-white'>{parseFloat(item.rating).toFixed(1)}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.tackles || 0}</Text></View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.interceptions || 0}</Text></View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.blocks || 0}</Text></View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.dribbled_past || 0}</Text></View>
                </>}
                {section === 'Duels' && <>
                    <View style={{ flex: 0.4 }}>
                        <View className='rounded-full items-center justify-center' style={{ paddingHorizontal: 2, backgroundColor: item.rating > 8.9 ? '#12CCFF' : item.rating > 6.9 ? '#00F70C' : item.rating > 5.9 ? '#FF9C00' : 'red' }}>
                            <Text className='text-center font-supremeBold text-sm text-white'>{parseFloat(item.rating).toFixed(1)}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.duels_won}</Text></View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{(item.duels || 0) - (item.duels_won || 0)}</Text></View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.fouls || 0}</Text></View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.fouled || 0}</Text></View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.dribbles_successful || 0}</Text></View>
                    <View style={{ flex: 1 }}><Text className='text-center font-supreme'>{item.tackles || 0}</Text></View>
                </>}
            </View>
            <View className='border-b border-gray-300 w-full' />
        </>
    );

    return (
        <View className='bg-white rounded-xl'>
            <Text className='p-5 font-supremeBold text-xl text-center'>Player Stats</Text>
            <FlashList
                ListHeaderComponent={renderHeader}
                renderItem={renderPlayer}
                data={playerStats}
                estimatedItemSize={52}
                scrollEnabled
            />
        </View>
    );
};

// ── Mobile layout (pinned column + single horizontal ScrollView, no vertical scroll) ──
const MobileLayout = ({ playerStats, section, setSection, sections, selectedColumn, direction, handleSort }) => {
    const columns = columnDefs[section];

    return (
        <View style={{ backgroundColor: 'white', borderRadius: 12 }}>
            <Text style={{ padding: 20, fontSize: 18, textAlign: 'center', fontFamily: 'supremeBold' }}>
                Player Stats
            </Text>

            {/* Section tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 12, gap: 8, flexDirection: 'row' }}
            >
                {sections.map(s => (
                    <Pressable
                        key={s}
                        onPress={() => setSection(s)}
                        style={{
                            paddingVertical: 6,
                            paddingHorizontal: 16,
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: '#DBDBDB',
                            backgroundColor: section === s ? 'black' : 'transparent',
                        }}
                    >
                        <Text style={{ fontFamily: 'supreme', color: section === s ? 'white' : 'black' }}>{s}</Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Table — no vertical ScrollView, renders full height */}
            <View style={{ flexDirection: 'row' }}>

                {/* Pinned player column */}
                <View style={{ width: PLAYER_COL_WIDTH }}>
                    {/* Header */}
                    <View style={{ height: 44, justifyContent: 'center', paddingLeft: 12, borderBottomWidth: 1, borderColor: '#E5E5E5' }}>
                        <Text style={{ fontFamily: 'supreme', fontSize: 12, color: 'gray' }}>Player</Text>
                    </View>
                    {/* Rows */}
                    {playerStats.map((item, i) => (
                        <View key={i}>
                            <View style={{ height: 52, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 12, paddingRight: 8 }}>
                                <View>
                                    <Image source={{ uri: item.player.photo }} resizeMode='cover' style={{ width: 34, height: 34, borderRadius: 17 }} />
                                    <Image source={{ uri: item.team.logo }} resizeMode='cover' style={{ width: 14, height: 14, borderRadius: 7, position: 'absolute', bottom: 0, right: -2 }} />
                                </View>
                                <Text numberOfLines={2} style={{ fontFamily: 'supreme', fontSize: 12, flex: 1 }}>
                                    {item.player_name}
                                </Text>
                            </View>
                            <View style={{ height: 1, backgroundColor: '#E5E5E5' }} />
                        </View>
                    ))}
                </View>

                {/* Single horizontal ScrollView — header + all stat rows scroll together */}
                <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ flex: 1 }}>
                    <View>
                        {/* Column headers */}
                        <View style={{ flexDirection: 'row', height: 44, alignItems: 'center', borderBottomWidth: 1, borderColor: '#E5E5E5' }}>
                            {columns.map(col => (
                                <TouchableOpacity
                                    key={col.key}
                                    onPress={() => handleSort(col.key)}
                                    style={{ width: col.width, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 2, paddingHorizontal: 4 }}
                                >
                                    <Text numberOfLines={2} style={{ fontFamily: 'supreme', fontSize: 11, textAlign: 'center' }}>{col.label}</Text>
                                    {selectedColumn === col.key && (
                                        <Ionicons name={direction === 'asc' ? 'arrow-up' : 'arrow-down'} size={10} color="black" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Stat rows */}
                        {playerStats.map((item, i) => (
                            <View key={i}>
                                <View style={{ flexDirection: 'row', height: 52, alignItems: 'center' }}>
                                    {columns.map(col => (
                                        <View key={col.key} style={{ width: col.width, alignItems: 'center', justifyContent: 'center' }}>
                                            {col.key === 'rating'
                                                ? <RatingBadge value={item.rating} />
                                                : <Text style={{ fontFamily: 'supreme', textAlign: 'center', fontSize: 13 }}>{getValue(item, col.key)}</Text>
                                            }
                                        </View>
                                    ))}
                                </View>
                                <View style={{ height: 1, backgroundColor: '#E5E5E5' }} />
                            </View>
                        ))}
                    </View>
                </ScrollView>

            </View>
        </View>
    );
};

// ── Root component ───────────────────────────────────────────────────────────
const FixturePlayerStats = ({ fixture }) => {
    const [section, setSection]               = useState('Top Stats');
    const [direction, setDirection]           = useState('desc');
    const [selectedColumn, setSelectedColumn] = useState('rating');
    const [playerStats, setPlayerStats]       = useState(null);

    const sections = ['Top Stats', 'Attacking', 'Defending', 'Duels'];

    useEffect(() => {
        if (fixture) {
            const stats = fixture.playerStats
                .filter(p => p.minutes)
                .sort((a, b) => b.rating - a.rating);
            setPlayerStats(stats.map(obj =>
                Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === null ? 0 : v]))
            ));
            setSelectedColumn('rating');
            setDirection('desc');
        }
    }, [fixture]);

    useEffect(() => {
        if (playerStats) {
            setPlayerStats(_.orderBy(playerStats, ['rating'], ['desc']));
            setSelectedColumn('rating');
            setDirection('desc');
        }
    }, [section]);

    const handleSort = (column) => {
        const newDir = direction === 'desc' ? 'asc' : 'desc';
        setPlayerStats(_.orderBy(playerStats, [column], [newDir]));
        setDirection(newDir);
        setSelectedColumn(column);
    };

    if (!playerStats) return null;

    const sharedProps = { playerStats, section, setSection, sections, selectedColumn, direction, handleSort };

    return Platform.OS === 'web'
        ? <WebLayout {...sharedProps} />
        : <MobileLayout {...sharedProps} />;
};

export default FixturePlayerStats;