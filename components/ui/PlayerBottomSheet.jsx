import {
  StyleSheet,
  Text,
  View,
  Platform,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import Comments from "../screens/Comments";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link } from "expo-router";
import PlayerStats from "./PlayerStats";
import Entypo from "@expo/vector-icons/Entypo";
import { EmojiStyle } from "emoji-picker-react";
import EmojiPicker from "emoji-picker-react";
import ReactionSelector from "./ReactionSelector";
import ExportGraphicModal from "./ExportGraphicModal";
import PerformanceRaterModal from "./PerformanceRaterModal";

const TWITTER_EMOJI_BASE =
  "https://cdn.jsdelivr.net/npm/emoji-datasource-twitter/img/twitter/64/";

function deriveStandoutStats(playerStats, maxCount = 4) {
  if (!playerStats) return [];

  const passAcc =
    playerStats.passes > 0
      ? Math.round((parseInt(playerStats.pass_accuracy) / playerStats.passes) * 100)
      : 0;

  const drbRate =
    playerStats.dribbles_attempted > 0
      ? playerStats.dribbles_successful / playerStats.dribbles_attempted
      : 0;

  const duelsRate =
    playerStats.duels > 0 ? playerStats.duels_won / playerStats.duels : 0;

  const candidates = [
    { key: "GLS", label: "Goals", value: playerStats.goals, display: String(playerStats.goals), score: playerStats.goals * 40 },
    { key: "AST", label: "Assists", value: playerStats.assists, display: String(playerStats.assists), score: playerStats.assists * 30 },
    { key: "DRB", label: "Dribbles", value: playerStats.dribbles_successful, display: `${playerStats.dribbles_successful}/${playerStats.dribbles_attempted}`, score: playerStats.dribbles_attempted > 0 ? drbRate * 25 + playerStats.dribbles_successful * 3 : 0 },
    { key: "KP", label: "Key Passes", value: playerStats.key_passes, display: String(playerStats.key_passes), score: playerStats.key_passes * 8 },
    { key: "PA", label: "Pass Acc.", value: passAcc, display: `${passAcc}%`, score: passAcc >= 90 ? 30 : passAcc >= 80 ? 18 : passAcc >= 70 ? 8 : 0 },
    { key: "TKL", label: "Tackles", value: playerStats.tackles, display: String(playerStats.tackles), score: playerStats.tackles * 7 },
    { key: "INT", label: "Interceptions", value: playerStats.interceptions, display: String(playerStats.interceptions), score: playerStats.interceptions * 7 },
    { key: "BLK", label: "Blocks", value: playerStats.blocks, display: String(playerStats.blocks), score: playerStats.blocks * 8 },
    { key: "SH", label: "Shots", value: playerStats.shots, display: `${playerStats.shots}(${playerStats.shots_on_goal})`, score: playerStats.shots >= 4 ? 20 : playerStats.shots >= 2 ? 10 : 0 },
    { key: "DLS", label: "Duels Won", value: playerStats.duels_won, display: `${playerStats.duels_won}/${playerStats.duels}`, score: playerStats.duels > 0 ? duelsRate * 15 + playerStats.duels_won * 2 : 0 },
    { key: "MIN", label: "Minutes", value: playerStats.minutes, display: String(playerStats.minutes), score: playerStats.minutes >= 90 ? 5 : 0 },
  ];

  return candidates
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCount);
}

const PlayerBottomSheet = ({ isVisible, onClose, stats, player, fixture }) => {
  const { session } = useAuth();
  const [playerStats, setPlayerStats] = useState(null);
  const [commentsScreen, setCommentsScreen] = useState(false);
  const [reactionPicker, setReactionPicker] = useState(false);
  const [topReactions, setTopReactions] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [reactionCount, setReactionCount] = useState();
  const [saved, setSaved] = useState()
  const [exportModal, setExportModal] = useState(false);
  const [raterModal, setRaterModal] = useState(false);
  const [communityAvg, setCommunityAvg] = useState(null);
  const [communityCount, setCommunityCount] = useState(0);

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["90%"], []);
  useEffect(() => {
    if (isVisible) {
      console.log("expand");

      bottomSheetRef.current?.present();
      console.log(bottomSheetRef.current);
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible]);

  useEffect(() => {
    const fetchReactionCount = async () => {
      const { data, count, error } = await supabase
        .from("social_player_reactions")
        .select(`*`, { count: "exact" })
        .eq("post_id", stats?.id);
      if (!error) {
        setReactionCount(count);
        setReactions(data);
        const reactionsObject = data.reduce((acc, val) => {
          const emoji = val.emoji.unified;
          if (!acc[emoji]) {
            acc[emoji] = { emoji: val.emoji, count: 0 };
          }
          acc[emoji].count++;
          return acc;
        }, {});
        const topReacts = Object.entries(reactionsObject)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([reaction, count]) => ({ reaction, count }));

        setTopReactions(topReacts);
      }
    };
    if (session) {
      fetchReactionCount();
      const channel = supabase
        .channel(`reactions-${stats?.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "social_player_reactions",
            filter: `post_id=eq.${stats?.id}`,
          },
          (payload) => {
            console.log("Reaction change:", payload);
            fetchReactionCount();
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [stats]);

  const fetchCommunityRatings = async () => {
    if (!stats?.id) return;
    const { data, error } = await supabase
      .from("users_performance_ratings")
      .select("rating")
      .eq("player_stats_id", stats.id);
    if (error || !data) return;
    const count = data.length;
    const avg = count > 0 ? data.reduce((sum, r) => sum + r.rating, 0) / count : null;
    setCommunityCount(count);
    setCommunityAvg(avg);
  };

  useEffect(() => {
    fetchCommunityRatings();
  }, [stats?.id]);

  useEffect(() => {
    if (!stats) return;

    const newStats = Object.fromEntries(
      Object.entries(stats).map(([key, value]) => [
        key,
        value === null ? 0 : value,
      ]),
    );
    setPlayerStats(newStats);
  }, [stats]);

  const StatItem = ({ label, value, width = "16.66%" }) => (
    <View style={{ width, paddingVertical: 6, alignItems: "center", gap: 2 }}>
      <Text className="font-supremeBold text-lg">{value ?? 0}</Text>
      <Text className="font-SupremeExtraBold  uppercase text-center ">
        {label}
      </Text>
    </View>
  );

  const StatSection = ({ title, children, columns = 6 }) => {
    const itemWidth = `${(100 / columns).toFixed(2)}%`;
    return (
      <View style={{ marginBottom: 12 }}>
        <Text
          className="font-supremeBold"
          style={{ paddingHorizontal: 5, color: "#A477C7" }}
        >
          {title}
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            paddingHorizontal: 8,
          }}
        >
          {React.Children.map(children, (child) =>
            child ? React.cloneElement(child, { width: itemWidth }) : null,
          )}
        </View>
      </View>
    );
  };


    const handleSave = async () =>{
       if (!session) return
       if (saved){
            const {error} = await supabase.from('users_saved_player_stats').delete()
            .eq('user_id', session.user.id )
            .eq('player_stats_id',  stats?.id)
            if(!error) setSaved(false)
          }
          else
          {
            const {error} = await supabase.from('users_saved_player_stats').insert({user_id: session.user.id, player_stats_id: stats?.id})
            if (error) console.log(error.message)
            else setSaved(true)
        }
    }
  
   
     useEffect(()=>{
         const checkSaved =  async () =>{
           if (!session) { setSaved(false); return }
           const {data: savedData, error} = await supabase.from('users_saved_player_stats').select('*')
           .eq('user_id', session.user.id)
           .eq('player_stats_id', stats?.id)
           if (error || !savedData) { console.log(error); setSaved(false); return }
           if (savedData.length > 0){
             console.log(savedData, 'saved true')
             setSaved(true)
           }
           else{
             setSaved(false)
           }
         }
         checkSaved()
       },[session])

  if (player?.player_id === 0) return null;

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
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            onPress={onClose}
          />
        )}
      >
        <View style={{ flex: 1, paddingVertical: 10 }}>
          <Comments
            post_id={stats?.id}
            type={player}
            ListHeaderComponent={
              <View style={{ padding: 20 }}>
                <View style={{position: "absolute",
                            top: 20,
                            right: 20,
                            zIndex: 50,flexDirection:'col', gap:10 }}>
                        <Pressable
                  
                          onPress={() => setExportModal(true)}
                        >
                          <View
                            style={{
                              borderRadius: 50,
                              backgroundColor: "white",
                              padding: 8,
                              borderWidth: 1,
                              borderColor: "rgba(0,0,0,0.1)",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Ionicons
                              name="share-outline"
                              size={22}
                              color="black"
                            />
                          </View>
                        </Pressable>
                                        {session && <Pressable
                  style={{

                  }}
                  onPress={() => handleSave()}
                >
                 <View style={{ backgroundColor: '#ffffff' }} className='rounded-full p-2 px-4 items-center'>
              {saved ?
                <FontAwesome name="star" size={30} color={'black'} />
                :
                <FontAwesome name="star-o" size={30} color="black" />}
            </View>
                </Pressable>}
                </View>
                <View style={{ flexDirection: "column", alignItems: "center" }}>
                  <Link
                    href={{
                      pathname: "/player/[id]",
                      params: { id: player?.player_id },
                    }}
                    asChild
                  >
                    <Pressable style={{ alignItems: "center" }}>
                      <View
                        className="items-center justify-center"
                        style={{
                          position: "relative",
                          width: 125,
                          height: 125,
                        }}
                      >
                        <Image
                          source={{ uri: playerStats?.player.photo }}
                          style={{
                            width: 125,
                            height: 125,
                            borderRadius: 62.5,
                            borderWidth: 1,
                            borderColor:'#e2e2e2'

                          }}
                        />
                        {playerStats?.rating > 0 && (
                          <View
                            style={{
                              position: "absolute",
                              zIndex: 1,
                              top: 5,
                              right: -5,
                              paddingHorizontal: 9,
                              paddingVertical: 3,
                              borderRadius: 50,
                              backgroundColor:
                                playerStats?.rating > 8.9
                                  ? "#12CCFF"
                                  : playerStats?.rating > 6.9
                                    ? "#00F70C"
                                    : playerStats?.rating > 5.9
                                      ? "#FF9C00"
                                      : "red",
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "SupremeBold",
                                fontSize: 14,
                                color: "white",
                              }}
                            >
                              {parseFloat(playerStats?.rating).toFixed(1)}
                            </Text>
                          </View>
                        )}
                        <View
                          style={{
                            position: "absolute",
                            zIndex: 1,
                            bottom: -4,
                            right: -5,
                            paddingHorizontal: 6,
                            paddingVertical: 1,
                            borderRadius: 50,
                          }}
                        >
                          <Image
                            resizeMode="contain"
                            source={{ uri: playerStats?.team.logo }}
                            style={{ width: 35, height: 35, borderRadius: 50 }}
                          />
                        </View>
                      </View>
                      <View>
                        <View className="flex flex-row gap-2 items-center justify-center pt-2">
                          <Text
                            style={{
                              fontFamily: "Supreme",
                              fontSize: 20,
                              textAlign: "center",
                            }}
                          >
                            {player?.player_name
                              ? player?.player_name
                              : player?.name}
                          </Text>
                          <Text
                            style={{
                              fontFamily: "Supreme",
                              fontSize: 20,
                              textAlign: "center",
                            }}
                          >
                            #{player?.number}
                          </Text>
                          <Image
                            source={{
                              uri: playerStats?.player?.flag?.flag_url,
                            }}
                            style={{ width: 20, height: 20, borderRadius: 10 }}
                          />
                        </View>
                      </View>
                    </Pressable>
                  </Link>
                  <View className="p-2">
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                      onPress={() => setReactionPicker(!reactionPicker)}
                    >
                      {session !== null &&
                      !reactions.some(
                        (reaction) => reaction.user_id === session.user.id,
                      ) ? (
                        <>
                          <Entypo name="emoji-happy" size={24} color="black" />
                          <Text style={{ fontSize: 18, fontFamily: "Supreme" }}>
                            {reactionCount}
                          </Text>
                          <View style={{ flexDirection: "row", gap: 8 }}>
                            {topReactions.map((reaction, index) => (
                              <Image
                                key={index}
                                source={{
                                  uri: `${TWITTER_EMOJI_BASE}${reaction.count.emoji.image}`,
                                }}
                                style={{ width: 20, height: 20 }}
                              />
                            ))}
                          </View>
                        </>
                      ) : (
                        <>
                          <View style={{ flexDirection: "row", gap: 8 }}>
                            {topReactions.map((reaction, index) => (
                              <Image
                                key={index}
                                source={{
                                  uri: `${TWITTER_EMOJI_BASE}${reaction.count.emoji.image}`,
                                }}
                                style={{ width: 20, height: 20 }}
                              />
                            ))}
                          </View>
                          <Text
                            style={{
                              fontSize: 18,
                              fontFamily: "SupremeBold",
                              marginLeft: 12,
                              color: "#A477C7",
                            }}
                          >
                            {reactionCount}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#CCCCCC",
                    marginVertical: 5,
                    opacity: 0.6,
                  }}
                />
                <View className="flex flex-row justify-between p-2">
                  <Link
                    href={{
                      pathname: "/fixture/[id]",
                      params: { id: playerStats?.fixture_id },
                    }}
                  >
                    <View className="flex flex-row items-center">
                      <View className="flex flex-row gap-2  items-center">
                        <Image
                          resizeMode="contain"
                          style={{ width: 30, height: 30 }}
                          source={{ uri: fixture?.home_team.logo }}
                        />
                        <Text
                          className="text-lg font-supreme"
                          style={{ color: "#A477C7" }}
                        >
                          {fixture?.home_score}
                        </Text>
                      </View>
                      <Text
                        className="text-lg font-supreme"
                        style={{ color: "#A477C7" }}
                      >
                        {" "}
                        -{" "}
                      </Text>
                      <View className="flex flex-row  items-center gap-2">
                        <Text
                          className="text-lg font-supreme"
                          style={{ color: "#A477C7" }}
                        >
                          {fixture?.away_score}
                        </Text>
                        <Image
                          resizeMode="contain"
                          style={{ width: 30, height: 30 }}
                          source={{ uri: fixture?.away_team.logo }}
                        />
                      </View>
                    </View>
                  </Link>
                  <View>
                              <Image source={require('../../assets/images/logo.png')}
                                style={{ height: 33, width: 116 }}
                                resizeMode='contain'
                              />
                  </View>
                </View>
                <View className="flex flex-row py-3 px-5">
                  {deriveStandoutStats(playerStats).map((s) => (
                    <View key={s.key} style={{ flex: 1, alignItems: "center", gap: 2 }}>
                      <Text className="font-supremeBold text-2xl" style={{color:'#A477C7'}}>{s.display}</Text>
                      <Text
                        className="font-supremeBold"
                        style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}
                      >
                        {s.label}
                      </Text>
                    </View>
                  ))}
                </View>
                <StatSection title="Attacking" columns={5}>
                  <StatItem label="Min" value={playerStats?.minutes} />
                  <StatItem label="Gls" value={playerStats?.goals} />
                  <StatItem label="Ast" value={playerStats?.assists} />
                  <StatItem
                    label="SH(OG)"
                    value={`${playerStats?.shots}(${playerStats?.shots_on_goal})`}
                  />
                  <StatItem
                    label="Pas"
                    value={`${playerStats?.passes}(${playerStats?.pass_accuracy})`}
                  />
                  <StatItem
                    label="PA%"
                    value={`${((playerStats?.pass_accuracy / playerStats?.passes) * 100).toFixed(0)}%`}
                  />
                  <StatItem label="KP" value={playerStats?.key_passes} />
                  <StatItem
                    label="Drb"
                    value={`${playerStats?.dribbles_successful}/${playerStats?.dribbles_attempted}`}
                  />
                  <StatItem label="Fld" value={playerStats?.fouled} />
                  <StatItem
                    label="Pen"
                    value={`${playerStats?.penalties_scored + playerStats?.penalties_missed}(${playerStats?.penalties_scored})`}
                  />
                  <StatItem label="PW" value={playerStats?.penalties_won} />
                </StatSection>
                <StatSection title="Defending" columns={5}>
                  <StatItem label="Tkl" value={playerStats?.tackles} />
                  <StatItem label="Blk" value={playerStats?.blocks} />
                  <StatItem label="Int" value={playerStats?.interceptions} />
                  <StatItem label="Fls" value={playerStats?.fouls} />
                  <StatItem label="YC" value={playerStats?.yellow_cards} />
                  <StatItem label="RC" value={playerStats?.red_cards} />
                  <StatItem
                    label="Dls"
                    value={`${playerStats?.duels_won}/${playerStats?.duels}`}
                  />
                  <StatItem label="Dpst" value={playerStats?.dribbled_past} />
                  <StatItem
                    label="PC"
                    value={playerStats?.penalties_conceded}
                  />
                </StatSection>

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#CCCCCC",
                    marginVertical: 5,
                    opacity: 0.6,
                  }}
                />
                <View className='flex gap-3 items-center'>
                  <View className='flex gap-3 items-center justify-center'>
                    <View className='flex flex-row gap-2 items-center'>
                      <Text className='font-supreme text-lg'> Community Ratings </Text>
                      <Text className='font-supremeExtraBold text-sm '>{communityCount}</Text>
                    </View>

                    {communityCount > 0 ? (
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          backgroundColor:
                            communityAvg > 8.9
                              ? "#12CCFF"
                              : communityAvg > 6.9
                                ? "#00F70C"
                                : communityAvg > 5.9
                                  ? "#FF9C00"
                                  : "red",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "SupremeBold",
                            fontSize: 16,
                            color: "white",
                          }}
                        >
                          {communityAvg.toFixed(1)}
                        </Text>
                      </View>
                    ) : (
                      <Text
                        className='font-supreme'
                        style={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}
                      >
                        Be the first to rate this performance
                      </Text>
                    )}
                  </View>
                  <View>
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        paddingVertical: 5,
                        paddingHorizontal: 16,
                        borderRadius: 10,
                        backgroundColor: "#A477C7",
                      }}
                      activeOpacity={0.75}
                      onPress={() => setRaterModal(true)}
                    >
                      <Text className='font-supreme text-xl text-white'>Rate this Performance</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            }
          />
        </View>
      </BottomSheetModal>
      <ExportGraphicModal
        playerStats={playerStats}
        isVisible={exportModal}
        onClose={() => setExportModal(false)}
      />
      <PerformanceRaterModal
        isVisible={raterModal}
        onClose={() => {
          setRaterModal(false);
          fetchCommunityRatings();
        }}
        stats={playerStats}
        player={player}
        fixture={fixture}
      />
      <ReactionSelector
        visible={reactionPicker}
        onClose={() => setReactionPicker(false)}
        height={600}
        width={Platform.OS === "web" ? 600 : undefined}
        table="social_player_reactions"
        filters={{ post_id: stats?.id }}
      />
    </>
  );
};

export default PlayerBottomSheet;
