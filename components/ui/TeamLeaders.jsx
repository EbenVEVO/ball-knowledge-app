import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";

const playerName = (player) => {
  if (player?.transfermarkt_name) return player.transfermarkt_name;
  const parts = player?.name?.trim().split(/\s+/) ?? [];
  if (parts.length > 2) return `${parts[0]} ${parts[parts.length - 1]}`;
  return player?.name;
};

const StatCard = ({ label, value, leader, textColor }) => (
  <View style={styles.card}>
    <Text style={[styles.cardLabel, { color: textColor }]}>{label}</Text>
    <Text style={[styles.cardValue, { color: textColor }]}>{value ?? "-"}</Text>
    <Image
      source={{ uri: leader?.player?.photo }}
      style={styles.playerPhoto}
      resizeMode="contain"
    />
    <Text style={[styles.playerName, { color: textColor }]} numberOfLines={2}>
      {playerName(leader?.player) ?? "-"}
    </Text>
  </View>
);

const TeamLeaders = ({ club, fixture }) => {
  const [leaders, setLeaders] = useState({});

  useEffect(() => {
    if (!club?.id || !fixture?.season_id) return;
    const fetchLeaders = async () => {
      const { data } = await supabase
        .from("current_player_seasons")
        .select(`*, player: player_id(photo, transfermarkt_name, name)`)
        .eq("team_id", club.id)
        .eq("season_id", fixture.season_id);
      if (!data?.length) return;

      const by = (key) => data.reduce((top, item) => (item[key] > top[key] ? item : top));

      const gaLeader = data.reduce((top, item) => {
        const itemGA = (item.goals ?? 0) + (item.assists ?? 0);
        const topGA = (top.goals ?? 0) + (top.assists ?? 0);
        return itemGA > topGA ? item : top;
      });

      setLeaders({
        minutes: by("minutes"),
        rating: by("avg_rating"),
        ga: gaLeader,
        goals: by("goals"),
        assists: by("assists"),
      });
    };
    fetchLeaders();
  }, [club?.id, fixture?.season_id]);

  const bgColor = club?.colors?.[0] ?? "#A477C7";
  const textColor = club?.colors?.[1] ?? "#ffffff";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Season Leaders</Text>
      <View style={styles.row}>
        <StatCard
          label="Minutes"
          value={leaders.minutes?.minutes != null ? `${leaders.minutes.minutes}'` : null}
          leader={leaders.minutes}
          textColor={textColor}
        />
        <StatCard
          label="Rating"
          value={leaders.rating?.avg_rating != null ? parseFloat(leaders.rating.avg_rating).toFixed(2) : null}
          leader={leaders.rating}
          textColor={textColor}
        />
        <StatCard
          label="G/A"
          value={leaders.ga != null ? (leaders.ga.goals ?? 0) + (leaders.ga.assists ?? 0) : null}
          leader={leaders.ga}
          textColor={textColor}
        />
        <StatCard
          label="Goals"
          value={leaders.goals?.goals}
          leader={leaders.goals}
          textColor={textColor}
        />
        <StatCard
          label="Assists"
          value={leaders.assists?.assists}
          leader={leaders.assists}
          textColor={textColor}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
  },
  title: {
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 10,
    gap: 6,
  },
  card: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    opacity: 0.8,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },
  playerPhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 6,
  },
  playerName: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.9,
  },
});

export default TeamLeaders;
