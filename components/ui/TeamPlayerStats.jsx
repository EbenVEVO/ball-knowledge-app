import { useEffect, useState } from 'react';
import {
  Image, Modal, Platform, Pressable, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import _ from 'lodash';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const PLAYER_COL_WIDTH = 150;
const STAT_COL_WIDTH   = 64;
const WIDE_COL_WIDTH   = 80;
const RATING_COL_WIDTH = 58;

const SECTIONS = ['Top Stats', 'Attacking', 'Defending', 'Duels'];

const columnDefs = {
  'Top Stats': [
    { key: 'avg_rating',   label: 'Rating',       width: RATING_COL_WIDTH },
    { key: 'appearances',  label: 'Apps',          width: STAT_COL_WIDTH },
    { key: 'minutes',      label: 'Mins',          width: STAT_COL_WIDTH },
    { key: 'goals',        label: 'Goals',         width: STAT_COL_WIDTH },
    { key: 'assists',      label: 'Assists',       width: STAT_COL_WIDTH },
  ],
  'Attacking': [
    { key: 'avg_rating',          label: 'Rating',     width: RATING_COL_WIDTH },
    { key: 'goals',               label: 'Goals',       width: STAT_COL_WIDTH },
    { key: 'assists',             label: 'Assists',     width: STAT_COL_WIDTH },
    { key: 'shots',               label: 'Shots',       width: STAT_COL_WIDTH },
    { key: 'shots_on_goal',       label: 'On Target',   width: WIDE_COL_WIDTH },
    { key: 'key_passes',          label: 'Key Passes',  width: WIDE_COL_WIDTH },
    { key: 'dribbles_successful', label: 'Dribbles',    width: WIDE_COL_WIDTH },
    { key: 'goals_per_90',        label: 'G/90',        width: STAT_COL_WIDTH },
    { key: 'assists_per_90',      label: 'A/90',        width: STAT_COL_WIDTH },
  ],
  'Defending': [
    { key: 'avg_rating',           label: 'Rating',       width: RATING_COL_WIDTH },
    { key: 'tackles',              label: 'Tackles',      width: WIDE_COL_WIDTH },
    { key: 'interceptions',        label: 'Interceptions',width: WIDE_COL_WIDTH },
    { key: 'blocks',               label: 'Blocks',       width: STAT_COL_WIDTH },
    { key: 'tackles_per_90',       label: 'Tkl/90',       width: STAT_COL_WIDTH },
    { key: 'interceptions_per_90', label: 'Int/90',       width: STAT_COL_WIDTH },
    { key: 'blocks_per_90',        label: 'Blk/90',       width: STAT_COL_WIDTH },
  ],
  'Duels': [
    { key: 'avg_rating',          label: 'Rating',   width: RATING_COL_WIDTH },
    { key: 'duels_won',           label: 'Won',       width: STAT_COL_WIDTH },
    { key: 'duels_lost',          label: 'Lost',      width: STAT_COL_WIDTH },
    { key: 'duels_won_per_90',    label: 'Won/90',    width: STAT_COL_WIDTH },
    { key: 'dribbles_successful', label: 'Dribbles',  width: WIDE_COL_WIDTH },
    { key: 'dribbles_per_90',     label: 'Drb/90',    width: STAT_COL_WIDTH },
    { key: 'yellow_cards',        label: 'Yellows',   width: WIDE_COL_WIDTH },
    { key: 'red_cards',           label: 'Reds',      width: STAT_COL_WIDTH },
  ],
};

const SUM_KEYS = [
  'appearances','goals','assists','key_passes','duels_won','duels','shots',
  'shots_on_goal','passes','tackles','interceptions','blocks','yellow_cards',
  'red_cards','minutes','dribbles_successful','dribbles_attempted',
];

const per90 = (n, mins) => mins > 0 ? ((n / mins) * 90).toFixed(2) : '0.00';

const aggregateRows = (rows) => {
  const byPlayer = {};
  for (const row of rows) {
    const pid = row.player_id;
    if (!byPlayer[pid]) {
      byPlayer[pid] = { player_id: pid, player: row.player, _rating_sum: 0, _rating_minutes: 0 };
      for (const k of SUM_KEYS) byPlayer[pid][k] = 0;
    }
    const p = byPlayer[pid];
    for (const k of SUM_KEYS) p[k] += row[k] ?? 0;
    p._rating_sum     += parseFloat(row._rating_sum ?? 0);
    p._rating_minutes += row._rating_minutes ?? 0;
  }
  return Object.values(byPlayer).map(p => ({
    ...p,
    avg_rating:            p._rating_minutes > 0 ? (p._rating_sum / p._rating_minutes).toFixed(2) : null,
    goals_per_90:          per90(p.goals,               p.minutes),
    assists_per_90:        per90(p.assists,              p.minutes),
    kp_per_90:             per90(p.key_passes,           p.minutes),
    duels_won_per_90:      per90(p.duels_won,            p.minutes),
    dribbles_per_90:       per90(p.dribbles_successful,  p.minutes),
    blocks_per_90:         per90(p.blocks,               p.minutes),
    interceptions_per_90:  per90(p.interceptions,        p.minutes),
    tackles_per_90:        per90(p.tackles,              p.minutes),
  }));
};

const playerName = (player) => {
  if (player?.transfermarkt_name) return player.transfermarkt_name;
  const parts = player?.name?.trim().split(/\s+/) ?? [];
  if (parts.length > 2) return `${parts[0]} ${parts[parts.length - 1]}`;
  return player?.name ?? '';
};

const getValue = (item, key) => {
  if (key === 'duels_lost') return (item.duels ?? 0) - (item.duels_won ?? 0);
  if (key === 'avg_rating') return item.avg_rating != null ? parseFloat(item.avg_rating).toFixed(2) : '—';
  const per90Keys = ['goals_per_90','assists_per_90','kp_per_90','duels_won_per_90','dribbles_per_90','blocks_per_90','interceptions_per_90','tackles_per_90'];
  if (per90Keys.includes(key)) return item[key] != null ? parseFloat(item[key]).toFixed(2) : '—';
  return item[key] ?? 0;
};

const RatingBadge = ({ value }) => {
  const num = parseFloat(value);
  const bg = num > 8.9 ? '#12CCFF' : num > 6.9 ? '#00F70C' : num > 5.9 ? '#FF9C00' : 'red';
  return (
    <View style={[styles.ratingBadge, { backgroundColor: bg }]}>
      <Text style={styles.ratingText}>{isNaN(num) ? '—' : num.toFixed(1)}</Text>
    </View>
  );
};

// ── Competition dropdown ──────────────────────────────────────────────────────
const CompDropdown = ({ competitions, selected, onSelect }) => {
  const [open, setOpen] = useState(false);
  const current = selected ?? { name: 'All Competitions' };
  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.dropdownTrigger}>
        {current.logo
          ? <Image source={{ uri: current.logo }} style={styles.dropdownLogo} resizeMode="contain" />
          : null}
        <Text style={styles.dropdownTriggerText} numberOfLines={1}>{current.name}</Text>
        <Ionicons name="chevron-down" size={14} color="#6b7280" />
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <View style={styles.dropdownMenu}>
            {/* All option */}
            <Pressable
              style={[styles.dropdownItem, !selected && styles.dropdownItemActive]}
              onPress={() => { onSelect(null); setOpen(false); }}
            >
              <Text style={[styles.dropdownItemText, !selected && styles.dropdownItemTextActive]}>
                All Competitions
              </Text>
            </Pressable>
            {competitions.map(comp => (
              <Pressable
                key={comp.id}
                style={[styles.dropdownItem, selected?.id === comp.id && styles.dropdownItemActive]}
                onPress={() => { onSelect(comp); setOpen(false); }}
              >
                {comp.logo
                  ? <Image source={{ uri: comp.logo }} style={styles.dropdownLogo} resizeMode="contain" />
                  : null}
                <Text style={[styles.dropdownItemText, selected?.id === comp.id && styles.dropdownItemTextActive]}>
                  {comp.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

// ── Root component ────────────────────────────────────────────────────────────
const TeamPlayerStats = ({ club, fixture }) => {
  const [section, setSection]               = useState('Top Stats');
  const [direction, setDirection]           = useState('desc');
  const [selectedColumn, setSelectedColumn] = useState('avg_rating');
  const [players, setPlayers]               = useState(null);

  // no-fixture mode state
  const [allRows, setAllRows]               = useState(null);
  const [competitions, setCompetitions]     = useState([]);
  const [selectedComp, setSelectedComp]     = useState(null);

  const noFixture = !fixture?.season_id;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!club?.id) return;

    if (noFixture) {
      const fetchAll = async () => {
        const { data } = await supabase
          .from('current_player_seasons')
          .select(`*, player: player_id(photo, transfermarkt_name, name), season: season_id(competition_id, competition_name, competition: competition_id(name, logo))`)
          .eq('team_id', club.id)
          .gt('minutes', 0);
        if (!data?.length) return;

        // extract unique competitions
        const compMap = {};
        for (const row of data) {
          const cid = row.season?.competition_id;
          if (cid && !compMap[cid]) {
            compMap[cid] = {
              id: cid,
              name: row.season?.competition?.name ?? row.season?.competition_name ?? `Season ${row.season_id}`,
              logo: row.season?.competition?.logo ?? null,
            };
          }
        }
        setCompetitions(Object.values(compMap));
        setAllRows(data);
      };
      fetchAll();
    } else {
      const fetchSeason = async () => {
        const { data } = await supabase
          .from('current_player_seasons')
          .select(`*, player: player_id(photo, transfermarkt_name, name)`)
          .eq('team_id', club.id)
          .eq('season_id', fixture.season_id)
          .gt('minutes', 0);
        if (data?.length) {
          setPlayers(_.orderBy(data, ['avg_rating'], ['desc']));
        }
      };
      fetchSeason();
    }
  }, [club?.id, fixture?.season_id]);

  // ── Aggregate when allRows or selectedComp changes ─────────────────────────
  useEffect(() => {
    if (!allRows) return;
    const filtered = selectedComp
      ? allRows.filter(r => r.season?.competition_id === selectedComp.id)
      : allRows;
    const aggregated = aggregateRows(filtered);
    setPlayers(_.orderBy(aggregated, ['avg_rating'], ['desc']));
    setSelectedColumn('avg_rating');
    setDirection('desc');
  }, [allRows, selectedComp]);

  // ── Reset sort on section change ───────────────────────────────────────────
  useEffect(() => {
    if (players) {
      setPlayers(prev => _.orderBy(prev, ['avg_rating'], ['desc']));
      setSelectedColumn('avg_rating');
      setDirection('desc');
    }
  }, [section]);

  const handleSort = (key) => {
    const newDir = direction === 'desc' ? 'asc' : 'desc';
    const iteratee = key === 'duels_lost'
      ? (item) => (item.duels ?? 0) - (item.duels_won ?? 0)
      : key;
    setPlayers(prev => _.orderBy(prev, [iteratee], [newDir]));
    setDirection(newDir);
    setSelectedColumn(key);
  };

  if (!players) return null;

  const columns = columnDefs[section];

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.header}>
        <Text style={styles.title}>Player Stats</Text>
        {noFixture && competitions.length > 0 && (
          <CompDropdown
            competitions={competitions}
            selected={selectedComp}
            onSelect={setSelectedComp}
          />
        )}
      </View>

      {/* Section tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {SECTIONS.map(s => (
          <Pressable
            key={s}
            onPress={() => setSection(s)}
            style={[styles.tab, section === s && styles.tabActive]}
          >
            <Text style={[styles.tabText, section === s && styles.tabTextActive]}>{s}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Table */}
      {(() => {
        const table = (
          <View style={styles.table}>
            {/* Pinned player column */}
            <View style={{ width: PLAYER_COL_WIDTH }}>
              <View style={styles.headerCell}>
                <Text style={styles.headerText}>Player</Text>
              </View>
              {players.map((item, i) => (
                <View key={i}>
                  <View style={styles.playerCell}>
                    <Image
                      source={{ uri: item.player?.photo }}
                      style={styles.playerPhoto}
                      resizeMode="cover"
                    />
                    <Text numberOfLines={2} style={styles.playerNameText}>
                      {playerName(item.player)}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                </View>
              ))}
            </View>

            {/* Scrollable stat columns */}
            <ScrollView horizontal showsHorizontalScrollIndicator style={{ flex: 1 }}>
              <View>
                <View style={styles.headerRow}>
                  {columns.map(col => (
                    <TouchableOpacity
                      key={col.key}
                      onPress={() => handleSort(col.key)}
                      style={[styles.statHeaderCell, { width: col.width }]}
                    >
                      <Text numberOfLines={2} style={styles.headerText}>{col.label}</Text>
                      {selectedColumn === col.key && (
                        <Ionicons name={direction === 'asc' ? 'arrow-up' : 'arrow-down'} size={9} color="#6b7280" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                {players.map((item, i) => (
                  <View key={i}>
                    <View style={styles.statRow}>
                      {columns.map(col => (
                        <View key={col.key} style={[styles.statCell, { width: col.width }]}>
                          {col.key === 'avg_rating'
                            ? <RatingBadge value={item.avg_rating} />
                            : <Text style={styles.statText}>{getValue(item, col.key)}</Text>
                          }
                        </View>
                      ))}
                    </View>
                    <View style={styles.divider} />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )

        // On native this renders inside a screen already wrapped in the
        // collapsible header's own Tabs.ScrollView - an inner vertical
        // ScrollView here would fight it for the scroll gesture. Web has no
        // collapsible header, so it keeps its own scroll container.
        if (Platform.OS === 'web') {
          return (
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {table}
            </ScrollView>
          )
        }
        return table
      })()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'supremeBold',
  },
  tabs: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
    flexDirection: 'row',
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DBDBDB',
  },
  tabActive: {
    backgroundColor: 'black',
    borderColor: 'black',
  },
  tabText: {
    fontFamily: 'supreme',
    color: 'black',
    fontSize: 13,
  },
  tabTextActive: {
    color: 'white',
  },
  // dropdown
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    maxWidth: 180,
  },
  dropdownLogo: {
    width: 16,
    height: 16,
  },
  dropdownTriggerText: {
    fontFamily: 'supreme',
    fontSize: 12,
    color: '#111827',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownItemActive: {
    backgroundColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontFamily: 'supreme',
    fontSize: 14,
    color: '#111827',
  },
  dropdownItemTextActive: {
    fontFamily: 'supremeBold',
  },
  // table
  table: {
    flexDirection: 'row',
  },
  headerCell: {
    height: 44,
    justifyContent: 'center',
    paddingLeft: 12,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
  },
  headerRow: {
    flexDirection: 'row',
    height: 44,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
  },
  statHeaderCell: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
    paddingHorizontal: 4,
    height: '100%',
  },
  headerText: {
    fontFamily: 'supreme',
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  playerCell: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    paddingRight: 8,
  },
  playerPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
  playerNameText: {
    fontFamily: 'supreme',
    fontSize: 12,
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    height: 52,
    alignItems: 'center',
  },
  statCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    fontFamily: 'supreme',
    fontSize: 13,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  ratingBadge: {
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    fontFamily: 'supremeBold',
    fontSize: 12,
    color: 'white',
  },
});

export default TeamPlayerStats;
