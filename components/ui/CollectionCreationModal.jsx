import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  Modal as RNModal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Gesture, GestureDetector, TextInput as GHTextInput } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useAuth } from "../../contexts/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { supabase } from "../../lib/supabase";
import { nanoid } from "nanoid/non-secure";

const PURPLE = "#A477C7";
const CARD_BG = "#f0ecfc";
const CARD_SEL_BG = "#ede8ff";
const GAMES_PER_PAGE = 20;

const DEFAULT_PLAYERS = [
  { transfermarkt_name: "Ousmane Dembélé", id: 153, photo: "https://media.api-sports.io/football/players/153.png" },
  { transfermarkt_name: "Lionel Messi", id: 154, photo: "https://media.api-sports.io/football/players/154.png" },
  { transfermarkt_name: "Harry Kane", id: 184, photo: "https://media.api-sports.io/football/players/184.png" },
  { transfermarkt_name: "Kylian Mbappé", id: 278, photo: "https://media.api-sports.io/football/players/278.png" },
  { transfermarkt_name: "Mohamed Salah", id: 306, photo: "https://media.api-sports.io/football/players/306.png" },
  { transfermarkt_name: "Vinicius Junior", id: 762, photo: "https://media.api-sports.io/football/players/762.png" },
  { transfermarkt_name: "Cristiano Ronaldo", id: 874, photo: "https://media.api-sports.io/football/players/874.png" },
  { transfermarkt_name: "Erling Haaland", id: 1100, photo: "https://media.api-sports.io/football/players/1100.png" },
  { transfermarkt_name: "Bukayo Saka", id: 1460, photo: "https://media.api-sports.io/football/players/1460.png" },
  { transfermarkt_name: "Michael Olise", id: 19617, photo: "https://media.api-sports.io/football/players/19617.png" },
  { transfermarkt_name: "Jude Bellingham", id: 129718, photo: "https://media.api-sports.io/football/players/129718.png" },
  { transfermarkt_name: "Lamine Yamal", id: 386828, photo: "https://media.api-sports.io/football/players/386828.png" },
];

// ── Segmented Control ──────────────────────────────────────────────────────────
function SegmentedControl({ options, selected, onSelect }) {
  return (
    <View style={{ flexDirection: "row", backgroundColor: "#f0ecfc", borderRadius: 20, padding: 3 }}>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          onPress={() => onSelect(opt.value)}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 18,
            alignItems: "center",
            backgroundColor: selected === opt.value ? PURPLE : "transparent",
          }}
        >
          <Text
            style={{
              fontFamily: "SupremeExtraBold",
              fontSize: 13,
              color: selected === opt.value ? "#fff" : "#6b5fa0",
            }}
          >
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// ── Player card (PersonalizationStep style) ────────────────────────────────────
function PlayerCard({ player, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.playerCard}>
      <Image source={{ uri: player.photo }} style={styles.playerCardPhoto} resizeMode="contain" />
      <Text style={styles.playerCardName} numberOfLines={2}>
        {player.transfermarkt_name}
      </Text>
    </Pressable>
  );
}

// ── Rating color ───────────────────────────────────────────────────────────────
const getRatingColor = (r) => {
  if (!r) return "#ccc";
  if (r >= 9) return "#12CCFF";
  if (r >= 7) return "#4CAF50";
  if (r >= 6) return "#FF9800";
  return "#f44336";
};

const formatDateShort = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });

// ── Match card (PlayerGames mobile style) ──────────────────────────────────────
function MatchCard({ item, onPress }) {
  const isHome = item.fixture.home_team.id === item.team_id;
  const opponent = isHome ? item.fixture.away_team : item.fixture.home_team;
  const playerScore = isHome ? item.fixture.home_score : item.fixture.away_score;
  const oppScore = isHome ? item.fixture.away_score : item.fixture.home_score;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ backgroundColor: "white", borderRadius: 16, marginBottom: 10,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}
    >

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10 }}>
      <View className='flex gap-2'>
        <View className ='flex flex-row gap-3 items-center '>
          <Image className='rounded-full' source={{uri:item?.player.photo}} style={{width:45, height:45 }}/>
          <Text style={{ fontFamily: "Supreme", fontSize: 18 }}>{item?.player_name}</Text>

        </View>
        <View className ='flex flex-row px-5 gap-3 items-center'>
          <Image source={{uri:item?.team.logo}} style={{width:20, height:20 }}/>
          <Text style={{ fontFamily: "Supreme", fontSize: 12 }}>{item?.team.club_name}</Text> 
        </View>
      </View>
      
        <Image source={{ uri: item.fixture.league.logo }} style={{ width: 24, height: 24 }} resizeMode="contain" />
      </View>
      <View style={{ height: 1, backgroundColor: "#f0f0f0", marginHorizontal: 16 }} />
      <Text style={{ color: "#888", fontFamily: "Supreme", fontSize: 12, padding:10 }}>
          {formatDateShort(item.fixture.date_time_utc)}
        </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
          
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Image source={{ uri: opponent.logo }} style={{ width: 36, height: 36 }} resizeMode="contain" />
          <View>
            <Text style={{ fontFamily: "SupremeExtraBold", fontSize: 14 }}>{opponent.club_name}</Text>
            <Text style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
              <Text style={{ fontWeight: "700" }}>{playerScore}</Text> - {oppScore}
            </Text>
          </View>
        </View>
        {item.rating != null && (
          <View style={{ backgroundColor: getRatingColor(item.rating), borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontFamily: "SupremeExtraBold", color: "white", fontSize: 13 }}>{item.rating}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Selectable stat item ───────────────────────────────────────────────────────
function SelectableStatItem({ label, value, field, highlighted_stats, onToggle, width }) {
  const isSelected = highlighted_stats.includes(field);
  const isDisabled = !isSelected && highlighted_stats.length >= 5;
  return (
    <Pressable
      onPress={() => !isDisabled && onToggle(field)}
      style={{
        width,
        paddingVertical: 8,
        alignItems: "center",
        gap: 3,
        backgroundColor: isSelected ? "#A477C720" : "transparent",
        borderRadius: 8,
        borderWidth: isSelected ? 1.5 : 0,
        borderColor: isSelected ? PURPLE : "transparent",
        opacity: isDisabled ? 0.35 : 1,
      }}
    >
      <Text style={{ fontFamily: "SupremeExtraBold", fontSize: 14 }}>{value ?? 0}</Text>
      <Text style={{ fontFamily: "Supreme", textTransform: "uppercase", textAlign: "center", fontSize: 9, color: "#555" }}>
        {label}
      </Text>
    </Pressable>
  );
}

function SelectableStatSection({ title, children, columns = 5, highlighted_stats, onToggle }) {
  const itemWidth = `${(100 / columns).toFixed(2)}%`;
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontFamily: "SupremeExtraBold", paddingHorizontal: 5, color: PURPLE, marginBottom: 4 }}>
        {title}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 4 }}>
        {React.Children.map(children, (child) =>
          child ? React.cloneElement(child, { width: itemWidth, highlighted_stats, onToggle }) : null
        )}
      </View>
    </View>
  );
}

// ── Drag handle (press-and-drag to reorder, works on native + web) ─────────────
function DragHandle({ panGesture }) {
  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.editBtnRight}>
        <MaterialIcons name="menu" size={20} color="#555" />
      </View>
    </GestureDetector>
  );
}

// White card backgrounds make the default white text invisible — fall back to the
// team/query's second color, or black if there isn't one.
const getCardTextColor = (background, secondary) =>
  background === "#FFFFFF" ? (secondary ?? "#000000") : "white";

// White cards otherwise disappear against the (also white) screen behind them.
const getCardBorderStyle = (background) =>
  background === "#FFFFFF" ? { borderWidth: 1, borderColor: "rgba(0,0,0,0.1)" } : null;

// ── Collection item card (preview screen) ─────────────────────────────────────
export function CollectionItemCard({ item, isEditMode, onRemove, panGesture, isActive }) {
  if (item.type === "playerMatch") {
    const colors = item.stats?.team?.colors ?? ["#A477C7", "#6b5fa0"];
    const c1 = colors[0] ?? "#A477C7";
    const textColor = getCardTextColor(c1, colors[1]);
    const isHome = item.fixture.home_team.id === item.stats?.team_id;
    const opponent = isHome ? item.fixture.away_team : item.fixture.home_team;
    return (
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, opacity: isActive ? 0.7 : 1 }}>
        {isEditMode && (
          <Pressable onPress={onRemove} style={styles.editBtnLeft}>
            <Text style={{ color: "white", fontFamily: "SupremeExtraBold", fontSize: 18, lineHeight: 20 }}>−</Text>
          </Pressable>
        )}
        <View
          style={{ flex: 1, borderRadius: 16, padding: 14, backgroundColor: c1, ...getCardBorderStyle(c1) }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Image source={{ uri: item.player.photo }} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "rgba(255,255,255,0.6)" }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "SupremeExtraBold", color: textColor, fontSize: 14 }} numberOfLines={1}>
                {item.player.transfermarkt_name}
              </Text>
              <Text style={{ fontFamily: "Supreme", color: textColor, opacity: 0.8, fontSize: 12 }}>
                vs {opponent.club_name} · {formatDateShort(item.fixture.date_time_utc)}
              </Text>
            </View>
            {item.stats?.rating != null && (
              <View style={{ backgroundColor: getRatingColor(item.stats.rating), borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontFamily: "SupremeExtraBold", color: "white", fontSize: 13 }}>
                  {parseFloat(item.stats.rating).toFixed(1)}
                </Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {item.highlighted_stats.map((field) => {
              const val = item.stats[field];
              const label = field.replace(/_/g, " ");
              return (
                <View key={field} style={{ backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Text style={{ fontFamily: "SupremeExtraBold", color: textColor, fontSize: 12 }}>
                    {val ?? 0} {label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        {isEditMode && <DragHandle panGesture={panGesture} />}
      </View>
    );
  }

  // savedQuery card
  const colors = item.colors ?? ["#A477C7", "#6b5fa0"];
  const textColor = getCardTextColor(colors[0], colors[1]);
  const firstPhoto = item.hero?.photo;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, opacity: isActive ? 0.7 : 1 }}>
      {isEditMode && (
        <Pressable onPress={onRemove} style={styles.editBtnLeft}>
          <Text style={{ color: "white", fontFamily: "SupremeExtraBold", fontSize: 18, lineHeight: 20 }}>−</Text>
        </Pressable>
      )}
      <View
        style={{backgroundColor:colors[0], flex: 1, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, ...getCardBorderStyle(colors[0]) }}>
        {firstPhoto && (
          <Image source={{ uri: firstPhoto }} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: "rgba(255,255,255,0.6)" }} />
        )}
        <Text style={{ fontFamily: "Supreme", color: textColor, fontSize: 13, flex: 1, lineHeight: 18 }} numberOfLines={3}>
          {item.answer}
        </Text>
      </View>
      {isEditMode && <DragHandle panGesture={panGesture} />}
    </View>
  );
}

// ── Draggable wrapper (measures layout + drives reorder via pan gesture) ───────
function DraggableCollectionItemRow({ item, isEditMode, onRemove, itemLayoutsRef, collectionItemsList, setCollectionItemsList }) {
  const translateY = useSharedValue(0);
  const activeSV = useSharedValue(0);
  const [isActive, setIsActive] = useState(false);

  const commitReorder = (dy) => {
    const layouts = itemLayoutsRef.current;
    const dragged = layouts[item.localId];
    if (!dragged) return;
    const draggedCenter = dragged.y + dragged.height / 2 + dy;
    const rest = collectionItemsList.filter((it) => it.localId !== item.localId);
    const passedCount = rest.filter((it) => {
      const m = layouts[it.localId];
      return m && draggedCenter > m.y + m.height / 2;
    }).length;
    setCollectionItemsList([...rest.slice(0, passedCount), item, ...rest.slice(passedCount)]);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      activeSV.value = 1;
      runOnJS(setIsActive)(true);
    })
    .onChange((e) => {
      translateY.value += e.changeY;
    })
    .onEnd(() => {
      runOnJS(commitReorder)(translateY.value);
      translateY.value = 0;
    })
    .onFinalize(() => {
      activeSV.value = 0;
      runOnJS(setIsActive)(false);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    zIndex: activeSV.value ? 100 : 0,
    elevation: activeSV.value ? 4 : 0,
  }));

  const onLayout = (e) => {
    itemLayoutsRef.current[item.localId] = { y: e.nativeEvent.layout.y, height: e.nativeEvent.layout.height };
  };

  return (
    <Animated.View onLayout={onLayout} style={animatedStyle}>
      <CollectionItemCard
        item={item}
        isEditMode={isEditMode}
        onRemove={onRemove}
        panGesture={panGesture}
        isActive={isActive}
      />
    </Animated.View>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────────────
const CollectionCreationModal = ({ isVisible, onClose, editCollection, onSaved }) => {
  const { session } = useAuth();
  const requireAuth = useRequireAuth();
  const isEditing = !!editCollection?.id;

  // Navigation state
  const [screen, setScreen] = useState("preview"); // 'preview' | 'add'
  const [addSubScreen, setAddSubScreen] = useState("list"); // 'list' | 'playerSearch' | 'playerGames' | 'statPicker'
  const [addTab, setAddTab] = useState("playerGames");

  // Collection data
  const [collectionItemsList, setCollectionItemsList] = useState([]);
  const [collectionTitle, setCollectionTitle] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const itemLayoutsRef = useRef({});

  // Add screen data
  const [savedPlayerStats, setSavedPlayerStats] = useState([]);
  const [savedQueries, setSavedQueries] = useState([]);
  const [loadingAddScreen, setLoadingAddScreen] = useState(false);

  // Player search
  const [playerSearchText, setPlayerSearchText] = useState("");
  const [playerSearchResults, setPlayerSearchResults] = useState([]);

  // Player games
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerGames, setPlayerGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [opponentFilter, setOpponentFilter] = useState("");
  const [displayLimit, setDisplayLimit] = useState(20);
  const [activeFilters, setActiveFilters] = useState({ result: null, minGoals: null, minAssists: null, minRating: null, currentSeasonOnly: false, leagueIds: [], seasonYears: [], clubIds: [] });
  const [pendingFilters, setPendingFilters] = useState({ result: null, minGoals: "", minAssists: "", minRating: "" });
  const [filterVisible, setFilterVisible] = useState(false);
  const [openPopup, setOpenPopup] = useState(null); // 'filter' | null (web only)

  // Stat picker
  const [selectedGame, setSelectedGame] = useState(null);
  const [highlighted_stats, sethighlighted_stats] = useState([]);
  const [isMatchSaved, setIsMatchSaved] = useState(false);
  const [savingMatch, setSavingMatch] = useState(false);

  // Bottom sheet refs
  const bottomSheetRef = useRef(null);
  const filterSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["92%"], []);
  const filterSnapPoints = useMemo(() => ["60%"], []);

  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} onPress={onClose} />,
    [onClose]
  );
  const renderFilterBackdrop = useCallback(
    (props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  // Open/close mobile bottom sheet
  useEffect(() => {
    if (Platform.OS !== "web") {
      if (isVisible) bottomSheetRef.current?.present();
      else bottomSheetRef.current?.dismiss();
    }
  }, [isVisible]);

  // Reset when modal closes
  useEffect(() => {
    if (!isVisible) {
      setScreen("preview");
      setAddSubScreen("list");
      setAddTab("playerGames");
      setIsEditMode(false);
      setSelectedPlayer(null);
      setSelectedGame(null);
      sethighlighted_stats([]);
      setIsMatchSaved(false);
      setPlayerSearchText("");
      setPlayerSearchResults([]);
      setOpponentFilter("");
      setPlayerGames([]);
      setActiveFilters({ result: null, minGoals: null, minAssists: null, minRating: null, currentSeasonOnly: false, leagueIds: [], seasonYears: [], clubIds: [] });
      setOpenPopup(null);
    }
  }, [isVisible]);

  // Populate title/items when opening in edit mode
  useEffect(() => {
    if (isVisible && isEditing) {
      setCollectionTitle(editCollection.title ?? "");
      setCollectionDescription(editCollection.description ?? "");
      setCollectionItemsList(editCollection.items ?? []);
      setScreen("preview");
    }
  }, [isVisible, editCollection]);

  // Fetch add-screen data when entering add screen
  useEffect(() => {
    if (screen === "add" && session) {
      fetchAddScreenData();
    }
  }, [screen]);

  const fetchAddScreenData = async () => {
    setLoadingAddScreen(true);
    const [{ data: stats }, { data: queries }] = await Promise.all([
      supabase
        .from("users_saved_player_stats")
        .select(`id, player_stats_id, stats:player_stats_id(*,
          team:clubs!team_id(club_name, logo, colors),
          player:player_id(photo, transfermarkt_name),
          fixture:fixture_id(date_time_utc,
            home_team:home_team_id(club_name, logo, id),
            away_team:away_team_id(club_name, logo, id),
            league:league_id(name, logo), home_score, away_score)
        )`)
        .eq("user_id", session.user.id),
      supabase.from("users_saved_queries").select("*").eq("user_id", session.user.id),
    ]);
    if (stats) setSavedPlayerStats(stats.filter((s) => s.stats));
    if (queries) setSavedQueries(queries);
    setLoadingAddScreen(false);
  };

  // Search players
  const searchPlayers = async (text) => {
    setPlayerSearchText(text);
    setPlayerSearchResults([]);
    if (text.length > 3) {
      const { data, error } = await supabase.rpc("search_club_player_or_competition", { search_term: text });
      if (!error && data) {
        setPlayerSearchResults(data.players?.map((p) => ({ ...p, type: "player" })) ?? []);
      }
    }
  };

  // Fetch ALL games for a player — all filters are then client-side on the complete dataset
  const fetchPlayerGames = async (player) => {
    setLoadingGames(true);
    setPlayerGames([]);
    setOpponentFilter("");
    setDisplayLimit(20);
    setActiveFilters({ result: null, minGoals: null, minAssists: null, minRating: null, currentSeasonOnly: false, leagueIds: [], seasonYears: [], clubIds: [] });

    const { data, error } = await supabase
      .from("player_stats")
      .select(`*,
        team:clubs!team_id(club_name, logo, colors),
        player:player_id(photo, transfermarkt_name, nationality, DOB, country_code, flag:country_code(flag_url)),
        fixture:fixture_id(date_time_utc,
          home_team:home_team_id(club_name, logo, id),
          away_team:away_team_id(club_name, logo, id),
          league:league_id(name, logo),
          season:season_id(id, season, current),
          home_score, away_score)
      `)
      .eq("player_id", player.id)
      .order("fixture(date_time_utc)", { ascending: false });

    if (!error && data) {
      const fixture_ids = data.map((m) => m.fixture_id);
      const { data: lineupPlayers } = await supabase.from("fixture_lineups").select("*").in("fixture_id", fixture_ids);
      const merged = data.map((match) => {
        const lineup = (lineupPlayers ?? []).filter((l) => l.fixture_id === match.fixture_id);
        const found = lineup.find(
          (l) =>
            l.starting_lineup?.find((p) => p.player?.id === player.id) ||
            l.substitutes?.find((p) => p.player?.id === player.id)
        );
        if (!found) { match.playerInfo = null; return match; }
        const combined = [...(found.substitutes ?? []), ...(found.starting_lineup ?? [])];
        match.playerInfo = combined.find((p) => p.player?.id === player.id)?.player ?? null;
        return match;
      });
      setPlayerGames(merged);
    } else if (error) {
      console.log(error);
    }
    setLoadingGames(false);
  };

  // Derive filter options from the full loaded dataset
  const availableLeagues = useMemo(() => {
    const seen = new Set();
    const res = [];
    playerGames.forEach((g) => {
      const l = g.fixture?.league;
      if (l?.name && !seen.has(l.name)) { seen.add(l.name); res.push({ name: l.name, logo: l.logo }); }
    });
    return res;
  }, [playerGames]);

  // Dedupe by the season's year, not its DB id — the same year has a separate
  // season row per competition, so id-based dedup fragmented one season into
  // several checkboxes that each only covered one competition's games.
  const availableSeasons = useMemo(() => {
    const seen = new Map();
    playerGames.forEach((g) => {
      const s = g.fixture?.season;
      if (s?.season == null) return;
      const existing = seen.get(s.season);
      if (!existing) seen.set(s.season, { year: s.season, label: `${s.season}/${s.season + 1}`, current: !!s.current });
      else if (s.current) existing.current = true;
    });
    return Array.from(seen.values()).sort((a, b) => b.year - a.year);
  }, [playerGames]);

  const availableClubs = useMemo(() => {
    const seen = new Map();
    playerGames.forEach((g) => {
      const t = g.team;
      if (g.team_id != null && !seen.has(g.team_id)) seen.set(g.team_id, { id: g.team_id, name: t?.club_name, logo: t?.logo });
    });
    return Array.from(seen.values());
  }, [playerGames]);

  // All filtering is client-side on the complete dataset
  const filteredGames = playerGames.filter((item) => {
    if (opponentFilter) {
      const isHome = item.fixture.home_team.id === item.team_id;
      const opp = isHome ? item.fixture.away_team.club_name : item.fixture.home_team.club_name;
      if (!opp.toLowerCase().includes(opponentFilter.toLowerCase())) return false;
    }
    if (activeFilters.result) {
      const isHome = item.fixture.home_team.id === item.team_id;
      const ps = isHome ? item.fixture.home_score : item.fixture.away_score;
      const os = isHome ? item.fixture.away_score : item.fixture.home_score;
      const result = ps > os ? "W" : ps < os ? "L" : "D";
      if (result !== activeFilters.result) return false;
    }
    if (activeFilters.minGoals != null && (item.goals ?? 0) < activeFilters.minGoals) return false;
    if (activeFilters.minAssists != null && (item.assists ?? 0) < activeFilters.minAssists) return false;
    if (activeFilters.minRating != null && (item.rating == null || item.rating < activeFilters.minRating)) return false;
    if (activeFilters.currentSeasonOnly && !item.fixture?.season?.current) return false;
    if (activeFilters.leagueIds.length > 0 && !activeFilters.leagueIds.includes(item.fixture?.league?.name)) return false;
    if (activeFilters.seasonYears.length > 0 && !activeFilters.seasonYears.includes(item.fixture?.season?.season)) return false;
    if (activeFilters.clubIds.length > 0 && !activeFilters.clubIds.includes(item.team_id)) return false;
    return true;
  });

  // Reset display window whenever the filtered set changes
  useEffect(() => { setDisplayLimit(20); }, [opponentFilter, activeFilters]);

  const displayedGames = filteredGames.slice(0, displayLimit);

  const anyFilterActive = activeFilters.result || activeFilters.minGoals != null || activeFilters.minAssists != null
    || activeFilters.minRating != null || activeFilters.currentSeasonOnly
    || activeFilters.leagueIds.length > 0 || activeFilters.seasonYears.length > 0 || activeFilters.clubIds.length > 0;

  const activeFilterCount = [
    activeFilters.result, activeFilters.minGoals, activeFilters.minAssists,
    activeFilters.minRating, activeFilters.currentSeasonOnly || null,
    activeFilters.leagueIds.length > 0 ? true : null,
    activeFilters.seasonYears.length > 0 ? true : null,
    activeFilters.clubIds.length > 0 ? true : null,
  ].filter(Boolean).length;

  const clearAllFilters = () =>
    setActiveFilters({ result: null, minGoals: null, minAssists: null, minRating: null, currentSeasonOnly: false, leagueIds: [], seasonYears: [], clubIds: [] });

  // Check / toggle saved state when stat picker opens
  useEffect(() => {
    if (addSubScreen !== "statPicker" || !selectedGame || !session) return;
    supabase
      .from("users_saved_player_stats")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("player_stats_id", selectedGame.id)
      .maybeSingle()
      .then(({ data }) => setIsMatchSaved(!!data));
  }, [addSubScreen, selectedGame]);

  const handleSaveMatch = async () => {
    if (!session || !selectedGame) return;
    setSavingMatch(true);
    if (isMatchSaved) {
      const { error } = await supabase
        .from("users_saved_player_stats")
        .delete()
        .eq("user_id", session.user.id)
        .eq("player_stats_id", selectedGame.id);
      if (!error) setIsMatchSaved(false);
    } else {
      const { error } = await supabase
        .from("users_saved_player_stats")
        .insert({ user_id: session.user.id, player_stats_id: selectedGame.id });
      if (!error) setIsMatchSaved(true);
    }
    setSavingMatch(false);
  };

  // Stat toggle
  const toggleStat = (field) => {
    sethighlighted_stats((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : prev.length < 5 ? [...prev, field] : prev
    );
  };

  // Add player match to collection
  const addPlayerMatch = () => {
    const item = {
      type: "playerMatch",
      localId: `${selectedPlayer.id}-${selectedGame.fixture_id}-${Date.now()}`,
      player_stats_id: selectedGame.id,
      player: { id: selectedPlayer.id, transfermarkt_name: selectedPlayer.transfermarkt_name, photo: selectedPlayer.photo },
      fixture: selectedGame.fixture,
      stats: selectedGame,
      highlighted_stats,
    };
    setCollectionItemsList((prev) => [...prev, item]);
    setSelectedGame(null);
    sethighlighted_stats([]);
    setAddSubScreen("list");
    setScreen("preview");
  };

  // Add saved query to collection
  const addSavedQuery = (query) => {
    const item = {
      type: "savedQuery",
      localId: `query-${query.id}`,
      query_id: query.id,
      question: query.question,
      answer: query.answer,
      hero: query.hero,
      colors: query.colors,
    };
    setCollectionItemsList((prev) => [...prev, item]);
    setScreen("preview");
  };

  // Add saved player stat directly (skip to stat picker)
  const addSavedStat = (savedRow) => {
    const s = savedRow.stats;
    setSelectedPlayer({ id: s.player_id, transfermarkt_name: s.player?.transfermarkt_name, photo: s.player?.photo });
    setSelectedGame(s);
    sethighlighted_stats([]);
    setAddSubScreen("statPicker");
  };

  // Edit mode helpers
  const removeItem = (index) => setCollectionItemsList((prev) => prev.filter((_, i) => i !== index));

  // Save collection (create new, or update an existing one when editCollection is set)
  const saveCollection = async () => {
    if (saving || !collectionTitle.trim() || collectionItemsList.length === 0 || !session) return;
    setSaving(true);

    let collectionId;
    if (isEditing) {
      const { data: collection, error } = await supabase
        .from("users_collections")
        .update({ title: collectionTitle.trim(), description: collectionDescription.trim() || null })
        .eq("id", editCollection.id)
        .select()
        .single();
      if (error) { console.log(error); setSaving(false); return; }
      collectionId = collection.id;
      const { error: deleteError } = await supabase
        .from("users_collections_items")
        .delete()
        .eq("collection_id", collectionId);
      if (deleteError) { console.log(deleteError); setSaving(false); return; }
    } else {
      const { data: collection, error } = await supabase
        .from("users_collections")
        .insert({ user_id: session.user.id, title: collectionTitle.trim(), slug: nanoid(8), description: collectionDescription.trim() || null })
        .select()
        .single();
      if (error) { console.log(error); setSaving(false); return; }
      collectionId = collection.id;
    }

    const items = collectionItemsList.map((item, i) => ({
      collection_id: collectionId,
      player_stats_id: item.type === "playerMatch" ? item.player_stats_id : null,
      query_id: item.type === "savedQuery" ? (item.query_id ?? null) : null,
      highlighted_stats: item.type === "playerMatch" ? item.highlighted_stats : null,
      question: item.type === "savedQuery" ? (item.question ?? null) : null,
      answer: item.type === "savedQuery" ? (item.answer ?? null) : null,
      colors: item.type === "savedQuery" ? (item.colors ?? null) : null,
      hero: item.type === "savedQuery" ? (item.hero ?? null) : null,
      position: i,
    }));
    const { error: itemsError } = await supabase.from("users_collections_items").insert(items);
    if (itemsError) {
      console.log(itemsError);
      setSaving(false);
      if (!isEditing) await supabase.from("users_collections").delete().eq("id", collectionId);
      return;
    }

    setSaving(false);
    setCollectionItemsList([]);
    setCollectionTitle("");
    setCollectionDescription("");
    onSaved?.();
    onClose();
  };

  // Apply filters from sheet
  const closeFilterSheet = () => {
    if (Platform.OS === "web") setFilterVisible(false);
    else filterSheetRef.current?.dismiss();
  };

  const applyFilters = () => {
    setActiveFilters((f) => ({
      ...f,
      result: pendingFilters.result,
      minGoals: pendingFilters.minGoals !== "" ? parseInt(pendingFilters.minGoals, 10) : null,
      minAssists: pendingFilters.minAssists !== "" ? parseInt(pendingFilters.minAssists, 10) : null,
      minRating: pendingFilters.minRating !== "" ? parseInt(pendingFilters.minRating, 10) : null,
    }));
    closeFilterSheet();
  };

  const resetFilters = () => {
    setPendingFilters({ result: null, minGoals: "", minAssists: "", minRating: "" });
    clearAllFilters();
    closeFilterSheet();
  };

  // ── SCREENS ────────────────────────────────────────────────────────────────

  const renderPreviewScreen = () => (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Text style={{ fontFamily: "SupremeExtraBold", fontSize: 22, color: "#1a1430" }}>
          {isEditing ? "Edit Collection" : "Create A Collection"}
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {collectionItemsList.length > 0 && (
            <Pressable
              onPress={() => setIsEditMode((e) => !e)}
              style={{ backgroundColor: isEditMode ? PURPLE : "#f0ecfc", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}
            >
              <Text style={{ fontFamily: "SupremeExtraBold", color: isEditMode ? "white" : PURPLE, fontSize: 13 }}>
                {isEditMode ? "Done" : "Edit"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Title input */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontFamily: "Supreme", color: "#888", fontSize: 12, marginBottom: 4 }}>Title</Text>
        <TextInput
          value={collectionTitle}
          onChangeText={setCollectionTitle}
          placeholder="Collection title..."
          placeholderTextColor="#bbb"
          style={{ fontFamily: "SupremeExtraBold", fontSize: 28, color: "#1a1430", paddingVertical: 4 }}
        />
      </View>

      {/* Description input */}
      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <Text style={{ fontFamily: "Supreme", color: "#888", fontSize: 12 }}>Description</Text>
          <Text style={{ fontFamily: "Supreme", color: "#bbb", fontSize: 11 }}>{collectionDescription.length}/150</Text>
        </View>
        <TextInput
          value={collectionDescription}
          onChangeText={setCollectionDescription}
          placeholder="Add a description..."
          placeholderTextColor="#bbb"
          multiline
          maxLength={150}
          style={{
            fontFamily: "Supreme",
            fontSize: 14,
            color: "#1a1430",
            minHeight: 60,
            textAlignVertical: "top",
            borderWidth: 1.5,
            borderColor: "#e0d8f0",
            borderRadius: 14,
            padding: 12,
          }}
        />
      </View>

      {/* Items */}
      {collectionItemsList.length === 0 ? (
        <View style={{ alignItems: "center", paddingVertical: 30 }}>
          <Text style={{ fontFamily: "Supreme", color: "#aaa", fontSize: 14, textAlign: "center" }}>
            No items to display, please add a collection item below
          </Text>
        </View>
      ) : (
        collectionItemsList.map((item, index) => (
          <DraggableCollectionItemRow
            key={item.localId}
            item={item}
            isEditMode={isEditMode}
            onRemove={() => removeItem(index)}
            itemLayoutsRef={itemLayoutsRef}
            collectionItemsList={collectionItemsList}
            setCollectionItemsList={setCollectionItemsList}
          />
        ))
      )}

      {/* Add button */}
      <Pressable onPress={() => { setScreen("add"); setAddSubScreen("list"); }}
        style={{ borderWidth: 1.5, borderColor: "#ccc", borderStyle: "dashed", borderRadius: 14, padding: 16, alignItems: "center", marginTop: 8 }}>
        <Text style={{ fontFamily: "Supreme", color: "#999", fontSize: 14 }}>+ Add a query answer or player match</Text>
      </Pressable>

      {/* Save */}

        <Pressable
          onPress={() => requireAuth(saveCollection)}
          disabled={saving || !collectionTitle.trim() || collectionItemsList.length === 0}
          style={{ backgroundColor: PURPLE, borderRadius: 14, padding: 16, alignItems: "center", marginTop: 14 }}
        >
          {saving
            ? <ActivityIndicator color="white" />
            : <Text style={{ fontFamily: "SupremeExtraBold", color: "white", fontSize: 16 }}>
                {isEditing ? "Save Changes" : "Save Collection"}
              </Text>
          }
        </Pressable>
    </ScrollView>
  );

  const renderAddScreen = () => {
    if (addSubScreen === "playerSearch") return renderPlayerSearchStep();
    if (addSubScreen === "playerGames") return renderPlayerGamesStep();
    if (addSubScreen === "statPicker") return renderStatPickerStep();
    return renderAddListStep();
  };

  const renderAddListStep = () => (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 20, paddingBottom: 12 }}>
        <Pressable onPress={() => setScreen("preview")}>
          <AntDesign name="arrow-left" size={22} color="#1a1430" />
        </Pressable>
        <Text style={{ fontFamily: "SupremeExtraBold", fontSize: 20, color: "#1a1430" }}>Add Item</Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
        <SegmentedControl
          options={[{ label: "Player Games", value: "playerGames" }, { label: "Saved Queries", value: "savedQueries" }]}
          selected={addTab}
          onSelect={setAddTab}
        />
      </View>

      {loadingAddScreen ? (
        <ActivityIndicator style={{ marginTop: 30 }} color={PURPLE} />
      ) : addTab === "playerGames" ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}>
          <Pressable
            onPress={() => { setPlayerSearchText(""); setPlayerSearchResults([]); setAddSubScreen("playerSearch"); }}
            style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f0ecfc", borderRadius: 12, padding: 12, marginBottom: 14 }}
          >
            <Ionicons name="search" size={18} color={PURPLE} />
            <Text style={{ fontFamily: "Supreme", color: PURPLE, fontSize: 14 }}>+ Search for new player</Text>
          </Pressable>

          {savedPlayerStats.length === 0 ? (
            <Text style={{ fontFamily: "Supreme", color: "#aaa", textAlign: "center", marginTop: 20 }}>
              No saved player stats yet
            </Text>
          ) : (
            savedPlayerStats.map((row) => (
              <MatchCard key={row.id} item={row.stats} onPress={() => addSavedStat(row)} />
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}>
          {savedQueries.length === 0 ? (
            <Text style={{ fontFamily: "Supreme", color: "#aaa", textAlign: "center", marginTop: 20 }}>
              No saved queries yet
            </Text>
          ) : (
            savedQueries.map((query) => {
              const colors = query.colors ?? [PURPLE, "#6b5fa0"];
              const firstPhoto = query.hero?.photo;
              return (
                <Pressable key={query.id} onPress={() => addSavedQuery(query)}
                  style={{ marginBottom: 10 }}>
                  <View 
                    style={{backgroundColor:colors[0], borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
                    {firstPhoto && (
                      <Image source={{ uri: firstPhoto }} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: "rgba(255,255,255,0.5)" }} />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: "Supreme", color: "rgba(255,255,255,0.75)", fontSize: 11, marginBottom: 2 }} numberOfLines={1}>
                        {query.question}
                      </Text>
                      <Text style={{ fontFamily: "SupremeExtraBold", color: "white", fontSize: 13 }} numberOfLines={2}>
                        {query.answer}
                      </Text>
                    </View>
                    <AntDesign name="plus" size={18} color="rgba(255,255,255,0.8)" />
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );

  const renderPlayerSearchStep = () => {
    const displayList = playerSearchText
      ? playerSearchResults
      : [
          ...DEFAULT_PLAYERS.filter((d) => !DEFAULT_PLAYERS.some(() => false)), // just default
          ...DEFAULT_PLAYERS,
        ].filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);

    const data = playerSearchText ? playerSearchResults : DEFAULT_PLAYERS;

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 20, paddingBottom: 12 }}>
          <Pressable onPress={() => setAddSubScreen("list")}>
            <AntDesign name="arrow-left" size={22} color="#1a1430" />
          </Pressable>
          <Text style={{ fontFamily: "SupremeExtraBold", fontSize: 20, color: "#1a1430", flex: 1 }}>
            Search for a player
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <View style={styles.searchBox}>
            <GHTextInput
              placeholder="Search players..."
              placeholderTextColor="#9b8ec4"
              style={styles.searchInput}
              value={playerSearchText}
              onChangeText={searchPlayers}
            />
            {playerSearchText.length > 0 && (
              <Pressable onPress={() => { setPlayerSearchText(""); setPlayerSearchResults([]); }} hitSlop={8}>
                <Text style={{ fontSize: 14, color: "#9b8ec4", fontFamily: "SupremeExtraBold" }}>CLEAR</Text>
              </Pressable>
            )}
          </View>
        </View>

        <FlashList
          data={data}
          numColumns={2}
          estimatedItemSize={160}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 30 }}
          renderItem={({ item }) => (
            <PlayerCard
              player={item}
              onPress={() => {
                setSelectedPlayer(item);
                fetchPlayerGames(item);
                setAddSubScreen("playerGames");
              }}
            />
          )}
        />
      </View>
    );
  };

  const renderPlayerGamesStep = () => (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 20, paddingBottom: 10 }}>
        <Pressable onPress={() => setAddSubScreen("playerSearch")}>
          <AntDesign name="arrow-left" size={22} color="#1a1430" />
        </Pressable>
        {selectedPlayer?.photo && (
          <Image source={{ uri: selectedPlayer.photo }} style={{ width: 32, height: 32, borderRadius: 16 }} />
        )}
        <Text style={{ fontFamily: "SupremeExtraBold", fontSize: 18, color: "#1a1430", flex: 1 }} numberOfLines={1}>
          {selectedPlayer?.transfermarkt_name}
        </Text>
      </View>

      {/* Search row */}
      <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
        <View style={styles.searchBox}>
          <GHTextInput
            placeholder="Search opponent..."
            placeholderTextColor="#9b8ec4"
            style={[styles.searchInput, { fontSize: 14 }]}
            value={opponentFilter}
            onChangeText={setOpponentFilter}
          />
          {opponentFilter.length > 0 && (
            <Pressable onPress={() => setOpponentFilter("")} hitSlop={8}>
              <Text style={{ fontSize: 12, color: "#9b8ec4", fontFamily: "SupremeExtraBold" }}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter row — web: Filter popup + quick chips; mobile: bottom sheet trigger */}
      {Platform.OS === "web" ? (
        <View style={{ paddingHorizontal: 20, marginBottom: 10, zIndex: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>

            {/* ── Filter button + popup ── */}
            <View style={{ position: "relative" }}>
              <Pressable
                onPress={() => setOpenPopup((p) => (p === "filter" ? null : "filter"))}
                style={[styles.filterMainBtn, (openPopup === "filter" || anyFilterActive) && styles.filterMainBtnActive]}
              >
                <Ionicons name="filter" size={14} color="white" />
                <Text style={styles.filterMainBtnText}>
                  Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                </Text>
                <AntDesign name={openPopup === "filter" ? "up" : "down"} size={10} color="white" style={{ marginLeft: 2 }} />
              </Pressable>

              {openPopup === "filter" && (
                <View style={styles.filterPopup}>
                  <Text style={{ fontFamily: "SupremeExtraBold", fontSize: 15, color: "#1a1430", marginBottom: 14, paddingHorizontal: 16, paddingTop: 16 }}>Filter</Text>
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>

                  {/* Competition */}
                  {availableLeagues.length > 0 && (
                    <View style={{ marginBottom: 14 }}>
                      <Text style={styles.filterSectionLabel}>Competition</Text>
                      {availableLeagues.map((l) => {
                        const active = activeFilters.leagueIds.includes(l.name);
                        return (
                          <Pressable
                            key={l.name}
                            onPress={() => setActiveFilters((f) => ({ ...f, leagueIds: active ? f.leagueIds.filter((n) => n !== l.name) : [...f.leagueIds, l.name] }))}
                            style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 }}
                          >
                            <View style={[styles.checkbox, active && styles.checkboxActive]}>
                              {active && <AntDesign name="check" size={9} color="white" />}
                            </View>
                            {l.logo && <Image source={{ uri: l.logo }} style={{ width: 15, height: 15 }} resizeMode="contain" />}
                            <Text style={{ fontFamily: "Supreme", fontSize: 13, color: "#1a1430", flex: 1 }} numberOfLines={1}>{l.name}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}

                  {/* Club */}
                  {availableClubs.length > 0 && (
                    <View style={{ marginBottom: 14 }}>
                      <Text style={styles.filterSectionLabel}>Club</Text>
                      {availableClubs.map((c) => {
                        const active = activeFilters.clubIds.includes(c.id);
                        return (
                          <Pressable
                            key={c.id}
                            onPress={() => setActiveFilters((f) => ({ ...f, clubIds: active ? f.clubIds.filter((id) => id !== c.id) : [...f.clubIds, c.id] }))}
                            style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 }}
                          >
                            <View style={[styles.checkbox, active && styles.checkboxActive]}>
                              {active && <AntDesign name="check" size={9} color="white" />}
                            </View>
                            {c.logo && <Image source={{ uri: c.logo }} style={{ width: 15, height: 15 }} resizeMode="contain" />}
                            <Text style={{ fontFamily: "Supreme", fontSize: 13, color: "#1a1430", flex: 1 }} numberOfLines={1}>{c.name}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}

                  {/* Goals */}
                  <View style={{ marginBottom: 14 }}>
                    <Text style={styles.filterSectionLabel}>Goals</Text>
                    <View style={{ flexDirection: "row", gap: 5 }}>
                      {[null, 1, 2, 3].map((n) => (
                        <Pressable
                          key={String(n)}
                          onPress={() => setActiveFilters((f) => ({ ...f, minGoals: (f.minGoals ?? null) === n ? null : n }))}
                          style={[styles.filterOption, (activeFilters.minGoals ?? null) === n && styles.filterOptionActive]}
                        >
                          <Text style={(activeFilters.minGoals ?? null) === n ? styles.filterOptionTextActive : styles.filterOptionText}>
                            {n === null ? "Any" : `${n}+`}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Assists */}
                  <View style={{ marginBottom: 14 }}>
                    <Text style={styles.filterSectionLabel}>Assists</Text>
                    <View style={{ flexDirection: "row", gap: 5 }}>
                      {[null, 1, 2, 3].map((n) => (
                        <Pressable
                          key={String(n)}
                          onPress={() => setActiveFilters((f) => ({ ...f, minAssists: (f.minAssists ?? null) === n ? null : n }))}
                          style={[styles.filterOption, (activeFilters.minAssists ?? null) === n && styles.filterOptionActive]}
                        >
                          <Text style={(activeFilters.minAssists ?? null) === n ? styles.filterOptionTextActive : styles.filterOptionText}>
                            {n === null ? "Any" : `${n}+`}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Season */}
                  {availableSeasons.length > 0 && (
                    <View style={{ marginBottom: 14 }}>
                      <Text style={styles.filterSectionLabel}>Season</Text>
                      {availableSeasons.slice(0, 5).map((s) => {
                        const active = activeFilters.seasonYears.includes(s.year);
                        return (
                          <Pressable
                            key={s.year}
                            onPress={() => setActiveFilters((f) => ({ ...f, seasonYears: active ? f.seasonYears.filter((y) => y !== s.year) : [...f.seasonYears, s.year] }))}
                            style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 }}
                          >
                            <View style={[styles.checkbox, active && styles.checkboxActive]}>
                              {active && <AntDesign name="check" size={9} color="white" />}
                            </View>
                            <Text style={{ fontFamily: "Supreme", fontSize: 13, color: "#1a1430", flex: 1 }}>{s.label}</Text>
                            {s.current && (
                              <View style={{ backgroundColor: CARD_SEL_BG, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                                <Text style={{ fontFamily: "SupremeExtraBold", fontSize: 9, color: PURPLE }}>NOW</Text>
                              </View>
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  )}

                  {/* Stat Value (Rating) */}
                  <View style={{ marginBottom: 6 }}>
                    <Text style={styles.filterSectionLabel}>Stat Value</Text>
                    <View style={{ flexDirection: "row", gap: 4 }}>
                      {[null, 6, 7, 8, 9].map((n) => (
                        <Pressable
                          key={String(n)}
                          onPress={() => setActiveFilters((f) => ({ ...f, minRating: (f.minRating ?? null) === n ? null : n }))}
                          style={[styles.filterOption, (activeFilters.minRating ?? null) === n && styles.filterOptionActive]}
                        >
                          <Text style={(activeFilters.minRating ?? null) === n ? styles.filterOptionTextActive : styles.filterOptionText}>
                            {n === null ? "Any" : `${n}+`}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {anyFilterActive && (
                    <Pressable onPress={() => { clearAllFilters(); setOpenPopup(null); }}
                      style={{ marginTop: 12, paddingVertical: 8, borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: "#e0d8f0" }}>
                      <Text style={{ fontFamily: "SupremeExtraBold", color: "#888", fontSize: 12 }}>Reset All</Text>
                    </Pressable>
                  )}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* ── Quick chips ── */}
            {[
              { key: "goals1", label: "1+ Goals", active: activeFilters.minGoals === 1, onPress: () => setActiveFilters((f) => ({ ...f, minGoals: f.minGoals === 1 ? null : 1 })) },
              { key: "season", label: "Current Season", active: activeFilters.currentSeasonOnly, onPress: () => setActiveFilters((f) => ({ ...f, currentSeasonOnly: !f.currentSeasonOnly })) },
              { key: "assists1", label: "1+ Assists", active: activeFilters.minAssists === 1, onPress: () => setActiveFilters((f) => ({ ...f, minAssists: f.minAssists === 1 ? null : 1 })) },
              { key: "win", label: "Win", active: activeFilters.result === "W", onPress: () => setActiveFilters((f) => ({ ...f, result: f.result === "W" ? null : "W" })) },
              { key: "rating8", label: "8+ Rating", active: activeFilters.minRating === 8, onPress: () => setActiveFilters((f) => ({ ...f, minRating: f.minRating === 8 ? null : 8 })) },
            ].map((chip) => (
              <Pressable key={chip.key} onPress={chip.onPress} style={[styles.filterChip, chip.active && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, chip.active && styles.filterChipTextActive]}>{chip.label}</Text>
              </Pressable>
            ))}

          </View>
        </View>
      ) : (
        /* Mobile: single filter button → bottom sheet */
        <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
          <Pressable
            onPress={() => {
              setPendingFilters({
                result: activeFilters.result,
                minGoals: activeFilters.minGoals != null ? String(activeFilters.minGoals) : "",
                minAssists: activeFilters.minAssists != null ? String(activeFilters.minAssists) : "",
                minRating: activeFilters.minRating != null ? String(activeFilters.minRating) : "",
              });
              filterSheetRef.current?.present();
            }}
            style={{ flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", borderWidth: 1.5, borderColor: anyFilterActive ? PURPLE : "#ddd", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
          >
            <Ionicons name="filter" size={16} color={anyFilterActive ? PURPLE : "#555"} />
            <Text style={{ fontFamily: "SupremeExtraBold", color: anyFilterActive ? PURPLE : "#555", fontSize: 13 }}>
              Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </Text>
          </Pressable>
        </View>
      )}

      {loadingGames && playerGames.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 30 }} color={PURPLE} />
      ) : (
        <FlatList
          data={displayedGames}
          keyExtractor={(item) => item.fixture_id?.toString()}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
          renderItem={({ item }) => (
            <MatchCard
              item={item}
              onPress={() => {
                setSelectedGame(item);
                sethighlighted_stats([]);
                setAddSubScreen("statPicker");
              }}
            />
          )}
          ListEmptyComponent={
            !loadingGames && (
              <Text style={{ fontFamily: "Supreme", color: "#aaa", textAlign: "center", marginTop: 30 }}>
                No matches found
              </Text>
            )
          }
          ListFooterComponent={
            displayLimit < filteredGames.length ? (
              <Pressable
                onPress={() => setDisplayLimit((n) => n + 20)}
                style={{ marginTop: 4, marginBottom: 10, padding: 14, backgroundColor: CARD_BG, borderRadius: 12, alignItems: "center" }}
              >
                <Text style={{ fontFamily: "SupremeExtraBold", color: PURPLE, fontSize: 14 }}>
                  Load More ({filteredGames.length - displayLimit} remaining)
                </Text>
              </Pressable>
            ) : filteredGames.length > 0 ? (
              <Text style={{ fontFamily: "Supreme", color: "#aaa", textAlign: "center", padding: 12, fontSize: 12 }}>
                All {filteredGames.length} matches shown
              </Text>
            ) : null
          }
        />
      )}
    </View>
  );

  const renderStatPickerStep = () => {
    if (!selectedGame) return null;
    const s = selectedGame;
    const isHome = s.fixture?.home_team?.id === s.team_id;
    const opponent = isHome ? s.fixture?.away_team : s.fixture?.home_team;
    const playerScore = isHome ? s.fixture?.home_score : s.fixture?.away_score;
    const oppScore = isHome ? s.fixture?.away_score : s.fixture?.home_score;
    const passAcc = s.passes > 0 ? Math.round((parseInt(s.pass_accuracy) / s.passes) * 100) : 0;

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 20, paddingBottom: 10 }}>
          <Pressable onPress={() => setAddSubScreen("playerGames")}>
            <AntDesign name="arrow-left" size={22} color="#1a1430" />
          </Pressable>
          <Text style={{ fontFamily: "SupremeExtraBold", fontSize: 18, color: "#1a1430" }}>Select Stats</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          {/* Match summary */}
          <View style={{ backgroundColor: "#f0ecfc", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
            {opponent?.logo && (
              <Image source={{ uri: opponent.logo }} style={{ width: 40, height: 40 }} resizeMode="contain" />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "SupremeExtraBold", color: "#1a1430", fontSize: 15 }}>{opponent?.club_name}</Text>
              <Text style={{ fontFamily: "Supreme", color: "#666", fontSize: 12, marginTop: 2 }}>
                {playerScore} - {oppScore} · {formatDateShort(s.fixture?.date_time_utc)}
              </Text>
            </View>
            {s.rating != null && (
              <View style={{ backgroundColor: getRatingColor(s.rating), borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontFamily: "SupremeExtraBold", color: "white" }}>{s.rating}</Text>
              </View>
            )}
          </View>

          {/* Label + counter */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontFamily: "Supreme", color: "#555", fontSize: 13, flex: 1 }}>
              Choose up to 5 stats to highlight in collection
            </Text>
            <Text style={{ fontFamily: "SupremeExtraBold", color: PURPLE, fontSize: 14 }}>
              {highlighted_stats.length}/5
            </Text>
          </View>

          {/* Attacking */}
          <SelectableStatSection title="Attacking" columns={5} highlighted_stats={highlighted_stats} onToggle={toggleStat}>
            <SelectableStatItem label="Min" value={s.minutes} field="minutes" />
            <SelectableStatItem label="Gls" value={s.goals} field="goals" />
            <SelectableStatItem label="Ast" value={s.assists} field="assists" />
            <SelectableStatItem label="SH(OG)" value={`${s.shots}(${s.shots_on_goal})`} field="shots" />
            <SelectableStatItem label="Pas" value={`${s.passes}(${s.pass_accuracy})`} field="passes" />
            <SelectableStatItem label="PA%" value={`${passAcc}%`} field="pass_accuracy" />
            <SelectableStatItem label="KP" value={s.key_passes} field="key_passes" />
            <SelectableStatItem label="Drb" value={`${s.dribbles_successful}/${s.dribbles_attempted}`} field="dribbles_successful" />
            <SelectableStatItem label="Fld" value={s.fouled} field="fouled" />
            <SelectableStatItem label="Pen" value={`${(s.penalties_scored ?? 0) + (s.penalties_missed ?? 0)}(${s.penalties_scored ?? 0})`} field="penalties_scored" />
            <SelectableStatItem label="PW" value={s.penalties_won} field="penalties_won" />
          </SelectableStatSection>

          {/* Defending */}
          <SelectableStatSection title="Defending" columns={5} highlighted_stats={highlighted_stats} onToggle={toggleStat}>
            <SelectableStatItem label="Tkl" value={s.tackles} field="tackles" />
            <SelectableStatItem label="Blk" value={s.blocks} field="blocks" />
            <SelectableStatItem label="Int" value={s.interceptions} field="interceptions" />
            <SelectableStatItem label="Fls" value={s.fouls} field="fouls" />
            <SelectableStatItem label="YC" value={s.yellow_cards} field="yellow_cards" />
            <SelectableStatItem label="RC" value={s.red_cards} field="red_cards" />
            <SelectableStatItem label="Dls" value={`${s.duels_won}/${s.duels}`} field="duels_won" />
            <SelectableStatItem label="Dpst" value={s.dribbled_past} field="dribbled_past" />
            <SelectableStatItem label="PC" value={s.penalties_conceded} field="penalties_conceded" />
          </SelectableStatSection>

          {/* Save + Add match buttons */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
            <Pressable
              onPress={() => requireAuth(handleSaveMatch)}
              disabled={savingMatch}
              style={{
                borderWidth: 1.5,
                borderColor: isMatchSaved ? PURPLE : "#ddd",
                backgroundColor: isMatchSaved ? "#A477C720" : "white",
                borderRadius: 14,
                padding: 16,
                alignItems: "center",
                justifyContent: "center",
                width: 56,
              }}
            >
              {savingMatch ? (
                <ActivityIndicator color={PURPLE} size="small" />
              ) : (
                <AntDesign name={isMatchSaved ? "star" : "staro"} size={22} color={isMatchSaved ? PURPLE : "#aaa"} />
              )}
            </Pressable>
            <Pressable
              onPress={addPlayerMatch}
              disabled={highlighted_stats.length === 0}
              style={{
                flex: 1,
                backgroundColor: highlighted_stats.length === 0 ? "#e0d8f0" : PURPLE,
                borderRadius: 14, padding: 16, alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: "SupremeExtraBold", color: highlighted_stats.length === 0 ? "#aaa" : "white", fontSize: 16 }}>
                Add Match
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderFilterContent = () => (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={{ fontFamily: "SupremeExtraBold", fontSize: 20, color: "#1a1430", marginBottom: 20 }}>Filter Matches</Text>

      <Text style={{ fontFamily: "SupremeExtraBold", color: "#555", marginBottom: 8 }}>Result</Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
        {["W", "D", "L"].map((r) => (
          <Pressable
            key={r}
            onPress={() => setPendingFilters((f) => ({ ...f, result: f.result === r ? null : r }))}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center", backgroundColor: pendingFilters.result === r ? PURPLE : "#f0ecfc" }}
          >
            <Text style={{ fontFamily: "SupremeExtraBold", color: pendingFilters.result === r ? "white" : "#6b5fa0", fontSize: 16 }}>{r}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ fontFamily: "SupremeExtraBold", color: "#555", marginBottom: 8 }}>Min Goals</Text>
      <View style={[styles.searchBox, { marginBottom: 20 }]}>
        <GHTextInput placeholder="e.g. 1" placeholderTextColor="#9b8ec4" keyboardType="numeric"
          style={[styles.searchInput, { fontSize: 16 }]} value={pendingFilters.minGoals}
          onChangeText={(t) => setPendingFilters((f) => ({ ...f, minGoals: t }))} />
      </View>

      <Text style={{ fontFamily: "SupremeExtraBold", color: "#555", marginBottom: 8 }}>Min Assists</Text>
      <View style={[styles.searchBox, { marginBottom: 20 }]}>
        <GHTextInput placeholder="e.g. 1" placeholderTextColor="#9b8ec4" keyboardType="numeric"
          style={[styles.searchInput, { fontSize: 16 }]} value={pendingFilters.minAssists}
          onChangeText={(t) => setPendingFilters((f) => ({ ...f, minAssists: t }))} />
      </View>

      <Text style={{ fontFamily: "SupremeExtraBold", color: "#555", marginBottom: 8 }}>Min Rating</Text>
      <View style={[styles.searchBox, { marginBottom: 24 }]}>
        <GHTextInput placeholder="e.g. 8" placeholderTextColor="#9b8ec4" keyboardType="numeric"
          style={[styles.searchInput, { fontSize: 16 }]} value={pendingFilters.minRating}
          onChangeText={(t) => setPendingFilters((f) => ({ ...f, minRating: t }))} />
      </View>

      <Pressable onPress={applyFilters} style={{ backgroundColor: PURPLE, borderRadius: 14, padding: 16, alignItems: "center", marginBottom: 10 }}>
        <Text style={{ fontFamily: "SupremeExtraBold", color: "white", fontSize: 16 }}>Apply</Text>
      </Pressable>
      <Pressable onPress={resetFilters} style={{ borderWidth: 1.5, borderColor: "#ddd", borderRadius: 14, padding: 14, alignItems: "center" }}>
        <Text style={{ fontFamily: "SupremeExtraBold", color: "#888", fontSize: 15 }}>Reset</Text>
      </Pressable>
    </ScrollView>
  );

  const mainContent = (
    <View style={{ flex: 1 }}>
      {screen === "preview" ? renderPreviewScreen() : renderAddScreen()}
    </View>
  );

  if (Platform.OS === "web") {
    return (
      <RNModal visible={isVisible} onRequestClose={onClose} transparent>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
            <TouchableWithoutFeedback onPress={(e) => { e.stopPropagation?.(); setOpenPopup(null); }}>
              <View style={styles.webContainer}>{mainContent}</View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </RNModal>
    );
  }

  // Mobile: both BottomSheetModals as siblings, never nested
  return (
    <>
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableDismissOnClose
        enableDynamicSizing={false}
        onDismiss={onClose}
        backgroundStyle={{ borderRadius: 20 }}
        stackBehavior="switch"
        backdropComponent={renderBackdrop}
      >
        <BottomSheetScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {mainContent}
        </BottomSheetScrollView>
      </BottomSheetModal>

      <BottomSheetModal
        ref={filterSheetRef}
        snapPoints={filterSnapPoints}
        enablePanDownToClose
        enableDismissOnClose
        enableDynamicSizing={false}
        backgroundStyle={{ borderRadius: 20 }}
        stackBehavior="push"
        backdropComponent={renderFilterBackdrop}
      >
        <BottomSheetScrollView>
          {renderFilterContent()}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
};

export default CollectionCreationModal;

const styles = StyleSheet.create({
  webContainer: {
    width: "50%",
    height: "85%",
    backgroundColor: "white",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  editBtnLeft: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ff4444",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  editBtnRight: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  playerCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    margin: 5,
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  playerCardPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: "#e8e2f8",
  },
  playerCardName: {
    fontSize: 13,
    fontFamily: "SupremeExtraBold",
    color: "#2d1f5e",
    textAlign: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e0d8f0",
    paddingHorizontal: 14,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1430",
    letterSpacing: 0.5,
    fontFamily: "Supreme",
  },
  filterMainBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#1a1430",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterMainBtnActive: {
    backgroundColor: PURPLE,
  },
  filterMainBtnText: {
    fontFamily: "SupremeExtraBold",
    fontSize: 13,
    color: "white",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "white",
  },
  filterChipActive: {
    borderColor: PURPLE,
    backgroundColor: CARD_SEL_BG,
  },
  filterChipText: {
    fontFamily: "SupremeExtraBold",
    fontSize: 12,
    color: "#555",
  },
  filterChipTextActive: {
    color: PURPLE,
  },
  filterPopup: {
    position: "absolute",
    top: 42,
    left: 0,
    zIndex: 1000,
    backgroundColor: "white",
    borderRadius: 14,
    width: 250,
    maxHeight: 380,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: "#ede8ff",
  },
  filterSectionLabel: {
    fontFamily: "SupremeExtraBold",
    fontSize: 11,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  filterOption: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: CARD_BG,
  },
  filterOptionActive: {
    backgroundColor: PURPLE,
  },
  filterOptionText: {
    fontFamily: "SupremeExtraBold",
    fontSize: 12,
    color: "#6b5fa0",
  },
  filterOptionTextActive: {
    fontFamily: "SupremeExtraBold",
    fontSize: 12,
    color: "white",
  },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#ddd",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    borderColor: PURPLE,
    backgroundColor: PURPLE,
  },
});
