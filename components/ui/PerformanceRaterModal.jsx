import {
  Modal as RNModal,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Platform,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Slider from "@react-native-community/slider";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";

const PURPLE = "#A477C7";

const formatDateShort = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

const getRatingColor = (rating) =>
  rating > 8.9
    ? "#12CCFF"
    : rating > 6.9
      ? "#00F70C"
      : rating > 5.9
        ? "#FF9C00"
        : "red";

const PerformanceRaterModal = ({ isVisible, onClose, stats, player, fixture }) => {
  const { session } = useAuth();
  const requireAuth = useRequireAuth();
  const [screen, setScreen] = useState("input");
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const [communityAvg, setCommunityAvg] = useState(null);
  const [communityCount, setCommunityCount] = useState(0);
  const [topTags, setTopTags] = useState([]);

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["75%"], []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    if (isVisible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible]);

  const fetchAggregates = async () => {
    const { data, error } = await supabase
      .from("users_performance_ratings")
      .select("rating, tags")
      .eq("player_stats_id", stats?.id);
    if (error || !data) return;

    const count = data.length;
    const avg = count > 0 ? data.reduce((sum, r) => sum + r.rating, 0) / count : 0;
    setCommunityAvg(avg);
    setCommunityCount(count);

    const tagCounts = data.reduce((acc, row) => {
      (row.tags || []).forEach((t) => {
        acc[t] = (acc[t] || 0) + 1;
      });
      return acc;
    }, {});
    const sortedTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
    setTopTags(sortedTags);
  };

  useEffect(() => {
    const checkExisting = async () => {
      const { data, error } = await supabase
        .from("users_performance_ratings")
        .select("*")
        .eq("user_id", session?.user.id)
        .eq("player_stats_id", stats?.id)
        .maybeSingle();

      if (!error && data) {
        setHasExisting(true);
        setRating(data.rating);
        setTags(data.tags || []);
        setScreen("result");
        fetchAggregates();
      } else {
        setHasExisting(false);
        setRating(5);
        setTags([]);
        setScreen("input");
      }
    };
    if (isVisible && session && stats?.id) checkExisting();
  }, [isVisible, stats?.id]);

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/^#/, "");
    if (!trimmed) return;
    const formatted = `#${trimmed}`;
    if (!tags.includes(formatted)) setTags((prev) => [...prev, formatted]);
    setTagInput("");
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

  const submitRating = async () => {
    if (!session?.user?.id || !stats?.id) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("users_performance_ratings")
      .upsert(
        { user_id: session.user.id, player_stats_id: stats.id, rating, tags },
        { onConflict: "user_id,player_stats_id" },
      )
      .select()
      .single();
    setSaving(false);
    if (error) {
      console.log(error.message);
      return;
    }
    setHasExisting(true);
    await fetchAggregates();
    setScreen("result");
  };

  const isHome = fixture?.home_team?.id === stats?.team_id;
  const opponent = isHome ? fixture?.away_team : fixture?.home_team;

  const renderHeader = () => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
        paddingRight: 30,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Image
          source={{ uri: stats?.player?.photo }}
          style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1 }}
        />
        <View>
          <Text style={{ fontFamily: "SupremeBold", fontSize: 16 }}>
            Rate {player?.player_name ?? player?.name}
          </Text>
          <Text
            style={{
              fontFamily: "Supreme",
              fontSize: 12,
              color: "rgba(0,0,0,0.5)",
            }}
          >
            vs {opponent?.club_name} · {formatDateShort(fixture?.date_time_utc)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTagInput = ({ readOnly = false } = {}) => (
    <View style={{ marginBottom: 16 }}>
      {!readOnly && (
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <TextInput
            value={tagInput}
            onChangeText={setTagInput}
            placeholder="Add a tag e.g. GOAT"
            placeholderTextColor="rgba(0,0,0,0.35)"
            onSubmitEditing={addTag}
            returnKeyType="done"
            style={styles.tagInput}
          />
          <TouchableOpacity onPress={addTag} style={styles.addTagBtn}>
            <Text style={{ color: "white", fontFamily: "SupremeBold" }}>Add</Text>
          </TouchableOpacity>
        </View>
      )}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginTop: readOnly ? 0 : 10,
        }}
      >
        {tags.map((tag) => (
          <View key={tag} style={styles.tagChip}>
            <Text style={styles.tagChipText}>{tag}</Text>
            {!readOnly && (
              <TouchableOpacity onPress={() => removeTag(tag)}>
                <Ionicons name="close" size={14} color={PURPLE} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderInputScreen = () => (
    <View style={{ padding: 20 }}>
      {renderHeader()}

      <Text
        style={{
          fontFamily: "SupremeExtraBold",
          fontSize: 48,
          textAlign: "center",
          color: PURPLE,
        }}
      >
        {rating.toFixed(1)}
      </Text>
      <Text
        style={{
          fontFamily: "Supreme",
          fontSize: 12,
          textAlign: "center",
          color: "rgba(0,0,0,0.4)",
          marginBottom: 10,
        }}
      >
        your rating
      </Text>

      <Slider
        style={{ width: "100%", height: 40 }}
        minimumValue={0}
        maximumValue={10}
        step={0.1}
        value={rating}
        onValueChange={setRating}
        minimumTrackTintColor={PURPLE}
        maximumTrackTintColor="rgba(0,0,0,0.1)"
        thumbTintColor={PURPLE}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <Text style={styles.sliderLabel}>0</Text>
        <Text style={styles.sliderLabel}>5</Text>
        <Text style={styles.sliderLabel}>10</Text>
      </View>

      <Text style={styles.sectionLabel}>Tags</Text>
      {renderTagInput()}

      <TouchableOpacity
        style={[styles.actionBtn, saving && styles.actionBtnDisabled]}
        activeOpacity={0.75}
        disabled={saving}
        onPress={() => requireAuth(submitRating)}
      >
        <Text className="font-supreme text-xl text-white">
          {hasExisting ? "Update Rating" : "Submit Rating"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderResultScreen = () => (
    <View style={{ padding: 20 }}>
      <View style={{ flexDirection: "column", alignItems: "center" }}>
        <View style={{ position: "relative", width: 125, height: 125 }}>
          <Image
            source={{ uri: stats?.player?.photo }}
            style={{ width: 125, height: 125, borderRadius: 62.5, borderWidth: 1 }}
          />
          {stats?.rating > 0 && (
            <View
              style={{
                position: "absolute",
                zIndex: 1,
                top: 5,
                right: -5,
                paddingHorizontal: 9,
                paddingVertical: 3,
                borderRadius: 50,
                backgroundColor: getRatingColor(stats?.rating),
              }}
            >
              <Text style={{ fontFamily: "SupremeBold", fontSize: 14, color: "white" }}>
                {parseFloat(stats?.rating).toFixed(1)}
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
              source={{ uri: stats?.team?.logo }}
              style={{ width: 35, height: 35, borderRadius: 50 }}
            />
          </View>
        </View>
        <View className="flex flex-row gap-2 items-center justify-center pt-2">
          <Text style={{ fontFamily: "Supreme", fontSize: 20, textAlign: "center" }}>
            {player?.player_name ?? player?.name}
          </Text>
          <Text style={{ fontFamily: "Supreme", fontSize: 20, textAlign: "center" }}>
            #{player?.number}
          </Text>
          {stats?.player?.flag?.flag_url && (
            <Image
              source={{ uri: stats?.player?.flag?.flag_url }}
              style={{ width: 20, height: 20, borderRadius: 10 }}
            />
          )}
        </View>
      </View>

      <View
        style={{
          borderWidth: 1,
          borderColor: "#CCCCCC",
          marginVertical: 12,
          opacity: 0.6,
        }}
      />

      <View className="flex flex-row justify-between p-2">
        <View className="flex flex-row gap-2 items-center">
          <Image
            resizeMode="contain"
            style={{ width: 30, height: 30 }}
            source={{ uri: fixture?.home_team?.logo }}
          />
          <Text className="text-lg font-supreme" style={{ color: PURPLE }}>
            {fixture?.home_score}
          </Text>
          <Text className="text-lg font-supreme" style={{ color: PURPLE }}>
            {" "}
            -{" "}
          </Text>
          <Text className="text-lg font-supreme" style={{ color: PURPLE }}>
            {fixture?.away_score}
          </Text>
          <Image
            resizeMode="contain"
            style={{ width: 30, height: 30 }}
            source={{ uri: fixture?.away_team?.logo }}
          />
        </View>
        <Text className="font-supremeBold text-xl">Ball Knowledge</Text>
      </View>

      <View
        style={{
          borderWidth: 1,
          borderColor: "#CCCCCC",
          marginVertical: 5,
          opacity: 0.6,
        }}
      />

      <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 16 }}>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.sectionLabel}>your rating</Text>
          <Text style={{ fontFamily: "SupremeExtraBold", fontSize: 28, color: PURPLE }}>
            {rating.toFixed(1)}
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.sectionLabel}>community avg</Text>
          <Text style={{ fontFamily: "SupremeExtraBold", fontSize: 28 }}>
            {communityAvg != null ? communityAvg.toFixed(1) : "—"}
          </Text>
          <Text style={{ fontFamily: "Supreme", fontSize: 11, color: "rgba(0,0,0,0.4)" }}>
            {communityCount} ratings
          </Text>
        </View>
      </View>

      {tags.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>your tags</Text>
          {renderTagInput({ readOnly: true })}
        </>
      )}

      {topTags.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.sectionLabel}>top community tags</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {topTags.map(({ tag, count }) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>
                  {tag} {count}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.75}
        onPress={() => setScreen("input")}
      >
        <Text className="font-supreme text-xl text-white">Edit rating</Text>
      </TouchableOpacity>
    </View>
  );

  const sharedContent = (ScrollViewComponent) => (
    <ScrollViewComponent
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <TouchableOpacity
        onPress={onClose}
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          zIndex: 50,
          borderRadius: 50,
          backgroundColor: "rgba(0,0,0,0.05)",
          padding: 6,
        }}
      >
        <Ionicons name="close" size={20} color="black" />
      </TouchableOpacity>
      {screen === "input" ? renderInputScreen() : renderResultScreen()}
    </ScrollViewComponent>
  );

  return (
    <View>
      {Platform.OS === "web" ? (
        <RNModal visible={isVisible} onRequestClose={onClose} transparent>
          <TouchableWithoutFeedback onPress={onClose}>
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.container}>{sharedContent(ScrollView)}</View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </RNModal>
      ) : (
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
          {sharedContent(BottomSheetScrollView)}
        </BottomSheetModal>
      )}
    </View>
  );
};

export default PerformanceRaterModal;

const styles = StyleSheet.create({
  container: {
    width: Platform.OS === "web" ? "50%" : "90%",
    height: "85%",
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionLabel: {
    fontFamily: "SupremeBold",
    fontSize: 11,
    color: "rgba(0,0,0,0.4)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  sliderLabel: {
    fontFamily: "Supreme",
    fontSize: 12,
    color: "rgba(0,0,0,0.4)",
  },
  tagInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.15)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontFamily: "Supreme",
  },
  addTagBtn: {
    backgroundColor: PURPLE,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: PURPLE,
    backgroundColor: "#ede8ff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tagChipText: {
    fontFamily: "SupremeExtraBold",
    fontSize: 12,
    color: PURPLE,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: 12,
    borderRadius: 10,
    backgroundColor: PURPLE,
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
});
