import { FlashList } from "@shopify/flash-list";
import { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { supabase } from "../../lib/supabase";

const DEFAULT_PLAYERS = [
  {
    transfermarkt_name: "Ousmane Dembélé",
    id: 153,
    photo: "https://media.api-sports.io/football/players/153.png",
  },
  {
    transfermarkt_name: "Lionel Messi",
    id: 154,
    photo: "https://media.api-sports.io/football/players/154.png",
  },
  {
    transfermarkt_name: "Harry Kane",
    id: 184,
    photo: "https://media.api-sports.io/football/players/184.png",
  },
  {
    transfermarkt_name: "Kylian Mbappé",
    id: 278,
    photo: "https://media.api-sports.io/football/players/278.png",
  },
  {
    transfermarkt_name: "Mohamed Salah",
    id: 306,
    photo: "https://media.api-sports.io/football/players/306.png",
  },
  {
    transfermarkt_name: "Vinicius Junior",
    id: 762,
    photo: "https://media.api-sports.io/football/players/762.png",
  },
  {
    transfermarkt_name: "Cristiano Ronaldo",
    id: 874,
    photo: "https://media.api-sports.io/football/players/874.png",
  },
  {
    transfermarkt_name: "Erling Haaland",
    id: 1100,
    photo: "https://media.api-sports.io/football/players/1100.png",
  },
  {
    transfermarkt_name: "Bukayo Saka",
    id: 1460,
    photo: "https://media.api-sports.io/football/players/1460.png",
  },
  {
    transfermarkt_name: "Michael Olise",
    id: 19617,
    photo: "https://media.api-sports.io/football/players/19617.png",
  },
  {
    transfermarkt_name: "Jude Bellingham",
    id: 129718,
    photo: "https://media.api-sports.io/football/players/129718.png",
  },
  {
    transfermarkt_name: "Lamine Yamal",
    id: 386828,
    photo: "https://media.api-sports.io/football/players/386828.png",
  },
];

const PlayerCard = ({ player, selected, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[styles.card, selected && styles.cardSelected]}
  >
    <Text style={[styles.star, selected && styles.starFilled]}>★</Text>
    <Image
      source={{ uri: player.photo }}
      style={styles.photo}
      resizeMode="contain"
    />
    <Text style={styles.name} numberOfLines={1}>
      {player.transfermarkt_name}
    </Text>
  </Pressable>
);

const ClubCard = ({ club, selected, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[styles.card, selected && styles.cardSelected]}
  >
    <Text style={[styles.star, selected && styles.starFilled]}>★</Text>
    <Image
      source={{ uri: club.logo}}
      style={styles.clubPhoto}
      resizeMode="contain"
    />
    <Text style={styles.name} numberOfLines={1}>
      {club.club_name}
    </Text>
  </Pressable>
);

const DEFAULT_COMPETITIONS = [
  { id: 39, name: "Premier League", logo: "https://media.api-sports.io/football/leagues/39.png" },
  { id: 140, name: "La Liga", logo: "https://media.api-sports.io/football/leagues/140.png" },
  { id: 2, name: "UEFA Champions League", logo: "https://media.api-sports.io/football/leagues/2.png" },
  { id: 1, name: "World Cup", logo: "https://media.api-sports.io/football/leagues/1.png" },
  { id: 61, name: "Ligue 1", logo: "https://media.api-sports.io/football/leagues/61.png" },
  { id: 78, name: "Bundesliga", logo: "https://media.api-sports.io/football/leagues/78.png" },
  { id: 135, name: "Serie A", logo: "https://media.api-sports.io/football/leagues/135.png" },
  { id: 3, name: "UEFA Europa League", logo: "https://media.api-sports.io/football/leagues/3.png" },
  { id: 848, name: "UEFA Europa Conference League", logo: "https://media.api-sports.io/football/leagues/848.png" },
];

const CompetitionCard = ({ competition, selected, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[styles.card, selected && styles.cardSelected]}
  >
    <Text style={[styles.star, selected && styles.starFilled]}>★</Text>
    <Image
      source={{ uri: competition.logo }}
      style={styles.clubPhoto}
      resizeMode="contain"
    />
    <Text style={styles.name} numberOfLines={2}>
      {competition.name}
    </Text>
  </Pressable>
);

const DEFAULT_CLUBS = [
  { id: 33, club_name: "Manchester United", logo: "https://media.api-sports.io/football/teams/33.png" },
  { id: 40, club_name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" },
  { id: 529, club_name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
  { id: 541, club_name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
  { id: 42, club_name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
    { id: 85, club_name: "Paris Saint Germain", logo: "https://media.api-sports.io/football/teams/85.png" }, 
  { id: 157, club_name: "Bayern München", logo: "https://media.api-sports.io/football/teams/157.png" },

  { id: 49, club_name: "Chelsea", logo: "https://media.api-sports.io/football/teams/49.png" },
  { id: 50, club_name: "Manchester City", logo: "https://media.api-sports.io/football/teams/50.png" },
   { id: 530, club_name: "Atletico Madrid", logo: "https://media.api-sports.io/football/teams/530.png" },
  { id: 47, club_name: "Tottenham", logo: "https://media.api-sports.io/football/teams/47.png" },
  { id: 496, club_name: "Juventus", logo: "https://media.api-sports.io/football/teams/496.png" },

  { id: 165, club_name: "Borussia Dortmund", logo: "https://media.api-sports.io/football/teams/165.png" },
  { id: 489, club_name: "AC Milan", logo: "https://media.api-sports.io/football/teams/489.png" },
  { id: 505, club_name: "Inter", logo: "https://media.api-sports.io/football/teams/505.png" },
  
]

const PersonalizationStep = ({ type, onNext, onSelectionChange, setForm }) => {
  const [defaultList, setDefaultList] = useState(
    type === "players" ? DEFAULT_PLAYERS : type === "clubs" ? DEFAULT_CLUBS : type === "competitions" ? DEFAULT_COMPETITIONS : [],
  );
  const [selected, setSelected] = useState([]);
  const [results, setResults] = useState([]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const formKey = type === "players" ? 'favorite_players' : type === "clubs" ? 'favorite_clubs' :  'favorite_competitions'
  const fetchResults = async (input) => {
    setResults([]);
    if (input.length > 3) {
      console.log(input);
      const { data, error } = await supabase.rpc(`search_${type}`, {
        search_term: input,
      });
      if (error) console.log(error);
      console.log(data);
      setResults(data?.results);
    }
  };

  useEffect(() => {
    onSelectionChange?.(selected.length > 0)
    console.log('slected', selected)
    setForm((f)=>({...f, [formKey]: selected}))
  }, [selected])

  const toggle = (player) =>
    setSelected((prev) =>
      prev.some((p) => p.id === player.id)
        ? prev.filter((p) => p.id !== player.id)
        : [...prev, player]
    );

  const renderCard = ({ item }) => {
    const isSelected = selected.some((p) => p.id === item.id);
    const onPress = () => toggle(item);
    if (type === "players") return <PlayerCard player={item} selected={isSelected} onPress={onPress} />;
    if (type === "competitions") return <CompetitionCard competition={item} selected={isSelected} onPress={onPress} />;
    return <ClubCard club={item} selected={isSelected} onPress={onPress} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Search for {type} to favorite</Text>
      </View>
      <Text style={styles.subtitle}>
        Receive notifications from your selected favorite {type}. Favorited{" "}
        {type} will display on your profile.
      </Text>
      {type !== "competitions" && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: "#e0d8f0",
            paddingHorizontal: 14,
            height: 50,
            marginBottom: 10,
          }}
        >
          <TextInput
            ref={inputRef}
            placeholder={`Search ${type}...`}
            style={{
              flex: 1,
              fontSize: 20,
              fontWeight: "700",
              color: "#1a1430",
              letterSpacing: 0.5,
              fontFamily: "Supreme",
            }}
            placeholderTextColor="#9b8ec4"
            value={input}
            onChangeText={(text) => {
              setInput(text);
              fetchResults(text);
            }}
          />
          {input.length > 0 && (
            <Pressable
              onPress={() => {
                setInput("");
                setResults([]);
                inputRef.current?.focus();
              }}
              hitSlop={8}
            >
              <Text style={{ fontSize: 16, color: "#9b8ec4", fontWeight: "700", fontFamily: "Supreme" }}>
                CLEAR
              </Text>
            </Pressable>
          )}
        </View>
      )}
      <FlashList
        data={
          input
            ? results
            : [
                ...selected.filter((p) => !defaultList.some((d) => d.id === p.id)),
                ...defaultList.filter((p) => selected.some((s) => s.id === p.id)),
                ...defaultList.filter((p) => !selected.some((s) => s.id === p.id)),
              ]
        }
        numColumns={2}
        estimatedItemSize={160}
        renderItem={renderCard}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default PersonalizationStep;

const CARD_BG = "#f0ecfc";
const CARD_SEL_BG = "#ede8ff";
const PURPLE = "#6b5fa0";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 32,
    color: "#2d1f5e",
    fontFamily: "SupremeExtraBold",
  },
  actionButton: {
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: PURPLE,
  },
  actionButtonText: {
    color: "#fff",
    fontFamily: "SupremeExtraBold",
    fontSize: 14,
  },
  subtitle: {
    fontSize: 15,
    color: "#5a4a8a",
    lineHeight: 21,
    fontFamily: "Supreme",
    marginBottom: 16,
  },

  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#2d1f5e",
    marginBottom: 16,
    fontFamily: "Supreme",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
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
  cardSelected: {
    backgroundColor: CARD_SEL_BG,
    borderColor: PURPLE,
  },
  star: {
    alignSelf: "flex-end",
    fontSize: 20,
    color: "#d0c8f0",
    lineHeight: 22,
  },
  starFilled: {
    color: "#f5c518",
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: 4,
    marginBottom: 10,
    backgroundColor: "#e8e2f8",
  },
    clubPhoto: {
    width: 80,
    height: 80,
    marginTop: 4,
    marginBottom: 10,
  },
  name: {
    fontSize: 13,
    fontFamily: "SupremeExtraBold",
    color: "#2d1f5e",
    textAlign: "center",
  },
});
