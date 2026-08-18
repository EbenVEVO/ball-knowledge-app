import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ImageBackground,
  Platform,
  Pressable,
  Modal as RNModal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import ViewShot from "react-native-view-shot";

const EXPORT_W = 1080;
const EXPORT_H = 1350;
const IMAGE_H = 520;

const STAT_CONFIG = {
  GLS: { label: "Goals", score: (v) => v * 40 },
  AST: { label: "Assists", score: (v) => v * 30 },
  DRB: {
    label: "Dribbles",
    score: (v, raw) => {
      const [made, att] = raw.split("/").map(Number);
      return att > 0 ? (made / att) * 25 + made * 3 : 0;
    },
  },
  KP: { label: "Key passes", score: (v) => v * 8 },
  "PA%": {
    label: "Pass acc.",
    score: (v) => {
      const n = parseInt(v);
      return n >= 90 ? 30 : n >= 80 ? 18 : n >= 70 ? 8 : 0;
    },
  },
  TKL: { label: "Tackles", score: (v) => v * 7 },
  INT: { label: "Interceptions", score: (v) => v * 7 },
  BLK: { label: "Blocks", score: (v) => v * 8 },
  SH: {
    label: "Shots",
    score: (v, raw) => {
      const n = parseInt(raw);
      return n >= 4 ? 20 : n >= 2 ? 10 : 0;
    },
  },
  MIN: { label: "Minutes", score: (v) => (v === 90 ? 5 : 0) },
  DPST: { label: "Def. duels", score: (v) => v * 5 },
};

function deriveStandoutStats(playerStats, maxCount = 4) {
  if (!playerStats) return [];

  const passAcc =
    playerStats.passes > 0
      ? Math.round(
          (parseInt(playerStats.pass_accuracy) / playerStats.passes) * 100,
        )
      : 0;

  const drbRate =
    playerStats.dribbles_attempted > 0
      ? playerStats.dribbles_successful / playerStats.dribbles_attempted
      : 0;

  const duelsRate =
    playerStats.duels > 0 ? playerStats.duels_won / playerStats.duels : 0;

  const candidates = [
    {
      key: "GLS",
      label: "Goals",
      value: playerStats.goals,
      display: String(playerStats.goals),
      score: playerStats.goals * 40,
    },
    {
      key: "AST",
      label: "Assists",
      value: playerStats.assists,
      display: String(playerStats.assists),
      score: playerStats.assists * 30,
    },
    {
      key: "DRB",
      label: "Dribbles",
      value: playerStats.dribbles_successful,
      display: `${playerStats.dribbles_successful}/${playerStats.dribbles_attempted}`,
      score:
        playerStats.dribbles_attempted > 0
          ? drbRate * 25 + playerStats.dribbles_successful * 3
          : 0,
    },
    {
      key: "KP",
      label: "Key Passes",
      value: playerStats.key_passes,
      display: String(playerStats.key_passes),
      score: playerStats.key_passes * 8,
    },
    {
      key: "PA",
      label: "Pass Acc.",
      value: passAcc,
      display: `${passAcc}%`,
      score: passAcc >= 90 ? 30 : passAcc >= 80 ? 18 : passAcc >= 70 ? 8 : 0,
    },
    {
      key: "TKL",
      label: "Tackles",
      value: playerStats.tackles,
      display: String(playerStats.tackles),
      score: playerStats.tackles * 7,
    },
    {
      key: "INT",
      label: "Interceptions",
      value: playerStats.interceptions,
      display: String(playerStats.interceptions),
      score: playerStats.interceptions * 7,
    },
    {
      key: "BLK",
      label: "Blocks",
      value: playerStats.blocks,
      display: String(playerStats.blocks),
      score: playerStats.blocks * 8,
    },
    {
      key: "SH",
      label: "Shots",
      value: playerStats.shots,
      display: `${playerStats.shots}(${playerStats.shots_on_goal})`,
      score: playerStats.shots >= 4 ? 20 : playerStats.shots >= 2 ? 10 : 0,
    },
    {
      key: "DLS",
      label: "Duels Won",
      value: playerStats.duels_won,
      display: `${playerStats.duels_won}/${playerStats.duels}`,
      score:
        playerStats.duels > 0 ? duelsRate * 15 + playerStats.duels_won * 2 : 0,
    },
    {
      key: "MIN",
      label: "Minutes",
      value: playerStats.minutes,
      display: String(playerStats.minutes),
      score: playerStats.minutes >= 90 ? 5 : 0,
    },
  ];

  return candidates
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCount);
}
const StatItem = ({ theme, label, value, width = "16.66%" }) => (
  <View style={{ width, paddingVertical: 7, alignItems: "center", gap: 3 }}>
    <Text
      style={{ color: theme.primary, fontFamily: "SupremeBold", fontSize: 22 }}
    >
      {value ?? 0}
    </Text>
    <Text
      style={{
        color: theme.primary,
        fontFamily: "SupremeExtraBold",
        textTransform: "uppercase",
        textAlign: "center",
        fontSize: 11,
      }}
    >
      {label}
    </Text>
  </View>
);

const StatSection = ({ theme, title, children, columns = 6 }) => {
  const itemWidth = `${(100 / columns).toFixed(2)}%`;
  return (
    <View style={{ marginBottom: 10 }}>
      <Text
        style={{
          paddingHorizontal: 5,
          color: theme.primary,
          fontFamily: "SupremeBold",
          fontSize: 14,
        }}
      >
        {title}
      </Text>
      <View
        style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 8 }}
      >
        {React.Children.map(children, (child) =>
          child ? React.cloneElement(child, { width: itemWidth }) : null,
        )}
      </View>
    </View>
  );
};
const getTheme = (theme, teamColors) => {
  const themes = {
    dark: {
      gradient: ["transparent", "rgba(13,13,13,0.6)", "#0d0d0d"],
      card: "#0d0d0d",
      cardBorder: "rgba(255,255,255,0.08)",
      primary: "#ffffff",
      secondary: "rgba(255,255,255,0.5)",
      tertiary: "rgba(255,255,255,0.25)",
      accent: "#A477C7",
      divider: "rgba(255,255,255,0.08)",
      statBg: "rgba(255,255,255,0.06)",
    },
    light: {
      gradient: ["transparent", "rgba(255,255,255,0.6)", "#ffffff"],
      card: "#ffffff",
      cardBorder: "rgba(0,0,0,0.08)",
      primary: "#0d0d0d",
      secondary: "rgba(0,0,0,0.45)",
      tertiary: "rgba(0,0,0,0.25)",
      accent: "#A477C7",
      divider: "rgba(0,0,0,0.07)",
      statBg: "rgba(0,0,0,0.04)",
    },
    ...(teamColors && {
      team: {
        gradient: ["transparent", teamColors[0] + "80", teamColors[0]],
        card: teamColors[0],
        cardBorder: teamColors[1] + "BF",
        primary: teamColors[1],
        secondary: teamColors[1] + "80",
        tertiary: teamColors[2],
        accent: "#A477C7",
        statBg: teamColors[1] + "80",
      },
    }),
  };

  return themes[theme] || themes.dark;
};
function GraphicCard({ theme, image, playerStats, forExport = false }) {
  const standouts = deriveStandoutStats(playerStats);

  return (
    <View style={{ width: EXPORT_W, height: EXPORT_H, backgroundColor: theme.card || "#0d0d0d" }}>
      {image ? (
        // Wrapper stays exactly IMAGE_H so layout below is unaffected, but the
        // image+gradient itself renders a couple px taller and bleeds past that
        // line — otherwise the two abutting elements leave a faint seam where
        // they meet, even though both resolve to the same color there.
        <View style={card.image}>
          <ImageBackground
            source={{ uri: image }}
            style={{ width: "100%", height: IMAGE_H + 2 }}
            resizeMode="cover"
          >
            <LinearGradient
              colors={theme.gradient}
              locations={[0.2, 0.65, 1]}
              style={card.gradient}
            />
          </ImageBackground>
        </View>
      ) : (
        <View style={[card.image, card.imageFallback]}>
          <Text style={card.noImageText}>
            Select an image to complete graphic
          </Text>
        </View>
      )}
      <View style={{ marginTop: -45, flex: 1 }}>
        <View style={{ alignItems: "center" }}>
          <View style={{ alignItems: "center", gap: 8 }}>
            <Image
              source={playerStats?.player.photo}
              transition={0}
              style={{
                width: 200,
                height: 200,
                borderRadius: 100,
                borderWidth: 1,
                borderColor: theme.cardBorder,
              }}
            />
            {playerStats?.rating > 0 && (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  height: 34,
                  paddingHorizontal: 24,
                  borderRadius: 14,
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
                    fontFamily: "SupremeExtraBold",
                    fontSize: 24,
                    color: "white",
                    textAlign: "center",
                    ...Platform.select({
                      // react-native-view-shot's web capture renders through
                      // html2canvas, which paints text using a per-font
                      // baseline offset it precomputes for "line-height:
                      // normal" and then adds to the text node's real
                      // (correctly flex-centered) layout box — for this
                      // font/size that offset is miscalibrated, consistently
                      // pushing the glyphs ~26px below where the live DOM
                      // renders them. Only nudge the capture target (never
                      // the on-screen preview, which doesn't go through
                      // html2canvas and is already centered).
                      web: {
                        lineHeight: "normal",
                        ...(forExport && { marginTop: -26 }),
                      },
                      default: {
                        lineHeight: 24,
                        textAlignVertical: "center",
                        includeFontPadding: false,
                      },
                    }),
                  }}
                >
                  {parseFloat(playerStats?.rating).toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
            gap: 10,
          }}
        >
          <Image
            transition={0}
            contentFit="contain"
            style={{ width: 70, height: 70 }}
            source={playerStats?.fixture?.home_team.logo}
          />
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Supreme",
              color: theme.primary,
            }}
          >
            {playerStats?.fixture?.home_score}
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Supreme",
              color: theme.secondary,
            }}
          >
            {" "}
            -{" "}
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Supreme",
              color: theme.primary,
            }}
          >
            {playerStats?.fixture?.away_score}
          </Text>
          <Image
            transition={0}
            contentFit="contain"
            style={{ width: 70, height: 70 }}
            source={playerStats?.fixture?.away_team.logo}
          />
        </View>
        <Text
          style={{
            color: theme.secondary,
            fontFamily: "Supreme",
            fontSize: 15,
            textAlign: "center",
            marginBottom: 6,
          }}
        >
          ballknow.app
        </Text>

        <View style={{ paddingHorizontal: 50, paddingVertical: 20, flex: 1, justifyContent: "center" }}>
            <View className='flex flex-row space-between py-3'>
          {standouts.map((s, i) => (
            <View key={s.key} style={card.standoutItem}>
              <Text
                style={[
                  card.standoutVal,
                  { color: i === 0 ? theme.accent : theme.primary },
                ]}
              >
                {s.display}
              </Text>
              <Text style={[card.standoutLabel, { color: theme.primary }]}>
                {s.label}
              </Text>
            </View>
          ))}
          </View>
          <View
            style={[
              card.statsContainer,
              { borderColor: theme.cardBorder, backgroundColor: theme.statBg },
            ]}
          >
            <StatSection title="Attacking" theme={theme} columns={5}>
              <StatItem
                theme={theme}
                label="Min"
                value={playerStats?.minutes}
              />
              <StatItem theme={theme} label="Gls" value={playerStats?.goals} />
              <StatItem
                theme={theme}
                label="Ast"
                value={playerStats?.assists}
              />
              <StatItem
                theme={theme}
                label="SH(OG)"
                value={`${playerStats?.shots}(${playerStats?.shots_on_goal})`}
              />
              <StatItem
                theme={theme}
                label="Pas"
                value={`${playerStats?.passes}(${playerStats?.pass_accuracy})`}
              />
              <StatItem
                theme={theme}
                label="PA%"
                value={`${((playerStats?.pass_accuracy / playerStats?.passes) * 100).toFixed(0)}%`}
              />
              <StatItem
                theme={theme}
                label="KP"
                value={playerStats?.key_passes}
              />
              <StatItem
                theme={theme}
                label="Drb"
                value={`${playerStats?.dribbles_successful}/${playerStats?.dribbles_attempted}`}
              />
              <StatItem theme={theme} label="Fld" value={playerStats?.fouled} />
              <StatItem
                theme={theme}
                label="Pen"
                value={`${playerStats?.penalties_scored + playerStats?.penalties_missed}(${playerStats?.penalties_scored})`}
              />
              <StatItem
                theme={theme}
                label="PW"
                value={playerStats?.penalties_won}
              />
            </StatSection>
            <StatSection theme={theme} title="Defending" columns={5}>
              <StatItem
                theme={theme}
                label="Tkl"
                value={playerStats?.tackles}
              />
              <StatItem theme={theme} label="Blk" value={playerStats?.blocks} />
              <StatItem
                theme={theme}
                label="Int"
                value={playerStats?.interceptions}
              />
              <StatItem theme={theme} label="Fls" value={playerStats?.fouls} />
              <StatItem
                theme={theme}
                label="YC"
                value={playerStats?.yellow_cards}
              />
              <StatItem
                theme={theme}
                label="RC"
                value={playerStats?.red_cards}
              />
              <StatItem
                theme={theme}
                label="Dls"
                value={`${playerStats?.duels_won}/${playerStats?.duels}`}
              />
              <StatItem
                theme={theme}
                label="Dpst"
                value={playerStats?.dribbled_past}
              />
              <StatItem
                theme={theme}
                label="PC"
                value={playerStats?.penalties_conceded}
              />
            </StatSection>
          </View>
        </View>
      </View>
    </View>
  );
}

// Renders `children` (always laid out at the true EXPORT_W x EXPORT_H size) scaled down
// to fit `previewWidth`, so the on-screen preview is a pixel-exact match of the export —
// re-rendering GraphicCard at a smaller width would throw off its fixed-px footer/image ratio.
function ScaledPreview({ children, previewWidth }) {
  const [width, setWidth] = useState(0);
  const scale = width > 0 ? width / EXPORT_W : 0;
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{
        width: previewWidth,
        aspectRatio: EXPORT_W / EXPORT_H,
        borderRadius: 14,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.08)",
      }}
    >
      {width > 0 && (
        <View
          style={{
            width: EXPORT_W,
            height: EXPORT_H,
            transform: [{ scale }],
            transformOrigin: "0 0",
          }}
        >
          {children}
        </View>
      )}
    </View>
  );
}

const card = StyleSheet.create({
  image: { width: "100%", height: IMAGE_H },
  imageFallback: {
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: {
    color: "rgba(255,255,255,0.35)",
    fontFamily: "Supreme",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  gradient: { ...StyleSheet.absoluteFillObject },
  overlay: { borderTopWidth: 0.5, padding: 16, gap: 12 },
  statsContainer: { padding: 10, borderWidth: 2, borderRadius: 20 },

  standoutItem: { flex: 1, alignItems: "center", gap: 4 },
  standoutVal: { fontFamily: "SupremeExtraBold", fontSize: 32 },
  standoutLabel: {
    fontSize: 15,
    fontFamily: "Supreme",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
const THEMES = [
  {
    key: "light",
    label: "Light",
    icon: (active) => (
      <Entypo name="light-up" size={20} color={active ? "white" : "#0d0d0d"} />
    ),
  },
  {
    key: "dark",
    label: "Dark",
    icon: (active) => (
      <MaterialIcons
        name="dark-mode"
        size={20}
        color={active ? "white" : "#0d0d0d"}
      />
    ),
  },
  {
    key: "team",
    label: "Club",
    icon: (active) => (
      <Ionicons
        name="color-palette"
        size={20}
        color={active ? "white" : "#0d0d0d"}
      />
    ),
  },
];

const ExportGraphicModal = ({ playerStats, isVisible, onClose }) => {
  const [theme, setTheme] = useState("dark");
  const [image, setImage] = useState();
  const shotRef = useRef();
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["85%"], []);

  const teamColors = playerStats?.team?.colors;

  useEffect(() => {
    if (Platform.OS === "web") return;
    if (isVisible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible]);

  const capture = async () => {
    const uri = await shotRef.current.capture({ pixelRatio: 2 });
    return uri;
  };

  const saveImage = async () => {
    const uri = await capture();
    if (Platform.OS === "web") {
      const link = document.createElement("a");
      link.href = uri;
      link.download = `${playerStats.player_name}_${playerStats.id}_graphic.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Save Image",
      });
    }
  };

  const pickImage = async () => {
    if (Platform.OS === "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [EXPORT_W, IMAGE_H],
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const sharedContent = (ScrollViewComponent) => (
    <>
      <ScrollViewComponent
        style={{ flex: 1, marginBottom: 12 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        <Text
          style={{
            fontFamily: "SupremeBold",
            fontSize: 15,
            marginBottom: 12,
          }}
        >
          Export Stats as Graphic
        </Text>

        <View style={{ gap: 6, marginBottom: 10, alignItems: "center" }}>
          <Text style={styles.sectionLabel}>Preview</Text>
          <ScaledPreview previewWidth={Platform.OS === "web" ? "55%" : "90%"}>
            <GraphicCard
              image={image}
              playerStats={playerStats}
              theme={getTheme(theme, teamColors)}
            />
          </ScaledPreview>
        </View>

        <View style={{ gap: 20 }}>
          <Text style={styles.sectionLabel}>Customize</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Background Image</Text>
            {!image ? (
              <TouchableOpacity onPress={pickImage} style={styles.imageSquare}>
                <Entypo name="image" size={24} color="rgba(0,0,0,0.3)" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={pickImage}
                style={[styles.imageSquare, { borderWidth: 0, overflow: "hidden" }]}
              >
                <Image
                  source={{ uri: image }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
                <View style={styles.replaceOverlay}>
                  <MaterialIcons name="swap-horiz" size={20} color="white" />
                </View>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ gap: 10 }}>
            <Text style={styles.rowLabel}>Theme</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {THEMES.filter(({ key }) => key !== "team" || teamColors).map(
                ({ key, label, icon }) => {
                  const active = theme === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setTheme(key)}
                      style={[styles.themeBtn, active && styles.themeBtnActive]}
                    >
                      {icon(active)}
                      <Text
                        style={[
                          styles.themeBtnLabel,
                          active && styles.themeBtnLabelActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>
          </View>
        </View>
      </ScrollViewComponent>

      <View style={[styles.actionRow, { paddingHorizontal: 16, paddingBottom: 16 }]}>
        <TouchableOpacity
          disabled={!image}
          onPress={saveImage}
          style={[styles.actionBtn, !image && styles.actionBtnDisabled]}
          activeOpacity={0.75}
        >
          <MaterialIcons
            name="save-alt"
            size={18}
            color={image ? "white" : "rgba(0,0,0,0.25)"}
          />
          <Text
            style={[
              styles.actionBtnLabel,
              !image && styles.actionBtnLabelDisabled,
            ]}
          >
            Save Image
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View>
      <View style={styles.offscreen}>
        <ViewShot ref={shotRef} options={{ format: "png", quality: 1 }}>
          <GraphicCard
            image={image}
            playerStats={playerStats}
            theme={getTheme(theme, teamColors)}
            forExport
          />
        </ViewShot>
      </View>

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
                <View style={styles.container}>
                  {sharedContent(ScrollView)}
                </View>
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

export default ExportGraphicModal;

const styles = StyleSheet.create({
  offscreen: {
    position: "absolute",
    top: -99999,
    left: 0,
    overflow: "hidden",
  },
  container: {
    width: "50%",
    height: "85%",
    backgroundColor: "white",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionLabel: {
    fontFamily: "SupremeBold",
    fontSize: 11,
    color: "rgba(0,0,0,0.4)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    fontFamily: "SupremeBold",
    fontSize: 13,
    color: "#0d0d0d",
  },
  imageSquare: {
    width: 58,
    height: 58,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  replaceOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  themeBtn: {
    flex: 1,
    alignItems: "center",
    gap: 5,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: "transparent",
  },
  themeBtnActive: {
    backgroundColor: "#A477C7",
    borderColor: "#ffffff",
  },
  themeBtnLabel: {
    fontFamily: "Supreme",
    fontSize: 12,
    color: "#0d0d0d",
  },
  themeBtnLabelActive: {
    color: "white",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.07)",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#A477C7",
  },
  actionBtnDisabled: {
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  actionBtnLabel: {
    fontFamily: "SupremeBold",
    fontSize: 13,
    color: "white",
  },
  actionBtnLabelDisabled: {
    color: "rgba(0,0,0,0.25)",
  },
});
