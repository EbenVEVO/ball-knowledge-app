import DuelPlayerCard from "@/components/ui/DuelPlayerCard";
import SignInPrompt from "@/components/ui/SignInPrompt";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchCurrentDuelRun,
  startDuelRun,
  submitLadderStat,
} from "@/lib/games";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  SlideInDown,
  SlideInRight,
  SlideOutLeft,
  SlideOutUp,
} from "react-native-reanimated";

const PURPLE = "#A477C7";
const GREEN = "#22c55e";
const RED = "#ef4444";
const GAME = "climb-the-ladder";
const IS_WEB = Platform.OS === "web";

// Cards slide along whichever axis they're laid out on: horizontal on web (side-by-side),
// vertical on mobile (stacked). Both cards use the same pair so they move together.
const ENTERING = IS_WEB
  ? SlideInRight.duration(300)
  : SlideInDown.duration(300);
const EXITING = IS_WEB ? SlideOutLeft.duration(250) : SlideOutUp.duration(250);

const STAT_ORDER = [
  "minutes",
  "goals",
  "assists",
  "key_passes",
  "rating",
  "dribbles_successful",
  "tackles",
];
const STAT_LABELS = {
  minutes: "Minutes",
  goals: "Goals",
  assists: "Assists",
  key_passes: "Key Passes",
  rating: "Rating",
  dribbles_successful: "Dribbles",
  tackles: "Tackles",
};

export default function ClimbTheLadderScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [runStatus, setRunStatus] = useState("loading"); // 'loading' | 'no-run' | 'active'
  const [run, setRun] = useState(null); // { run_id, score, current, next }
  const [isStartingRun, setIsStartingRun] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  const [isSubmittingStat, setIsSubmittingStat] = useState(false);
  const [result, setResult] = useState(null); // last ladder_submit_stat response, or null pre-submit
  const [best, setBest] = useState(null);

  useEffect(() => {
    const loadCurrent = async () => {
      if (!userId) {
        setRunStatus("no-run");
        return;
      }
      const { data, error } = await fetchCurrentDuelRun(GAME);
      if (error) {
        console.log("fetchCurrentDuelRun error", error);
        setRunStatus("no-run");
        return;
      }
      if (!data) {
        setRunStatus("no-run");
        return;
      }
      setRun(data);
      console.log('data', data)
      setRunStatus("active");
    };
    loadCurrent();
  }, [userId]);

  const handleStartRun = async () => {
    setIsStartingRun(true);
    setSelectedStat(null);
    setResult(null);
    setBest(null);

    const { data, error } = await startDuelRun(GAME);
    if (error) {
      console.log("startDuelRun error", error);
      setIsStartingRun(false);
      return;
    }
    setRun(data);
    setRunStatus("active");
    setIsStartingRun(false);
  };

  // Tapping a stat row submits the guess immediately — no separate confirm step.
  const handleSelectStat = async (statKey) => {
    if (!run || result || isSubmittingStat) return;
    setSelectedStat(statKey);
    setIsSubmittingStat(true);

    const { data, error } = await submitLadderStat(run.run_id, statKey);
    if (error) {
      console.log("submitLadderStat error", error);
      setIsSubmittingStat(false);
      return;
    }
    setResult(data);
    setRun((prev) => ({ ...prev, score: data.score }));
    if (!data.correct) setBest(data.best);
    setIsSubmittingStat(false);
  };

  const handleNextRound = () => {
    setRun((prev) => ({ ...prev, current: result.current, next: result.next }));
    setSelectedStat(null);
    setResult(null);
  };

  const handleNewGame = () => {
    setRun(null);
    setSelectedStat(null);
    setResult(null);
    setRunStatus("no-run");
  };

  const cardB = result ? result.revealed : run?.next;

  return (
    <View style={{ padding: 16, flex: 1 }}>
      <Text className="font-supremeBold text-2xl">Climb the Ladder</Text>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 16,
        }}
      >
        {!userId ? (
          <SignInPrompt message="Sign in to play." />
        ) : runStatus === "loading" ? (
          <ActivityIndicator color={PURPLE} />
        ) : runStatus === "active" && run ? (
          <View
            style={{ width: "100%", maxWidth: IS_WEB ? 760 : 420, gap: 16 }}
          >
            <Text style={{ fontFamily: "SupremeBold", fontSize: 16 }}>
              Score: {run.score}
            </Text>

            {result && (
              <View style={{ alignItems: "center", gap: 4 }}>
                <View
                  style={{
                    backgroundColor: result.correct ? GREEN : RED,
                    borderRadius: 999,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <FontAwesome
                    name={result.correct ? "check" : "close"}
                    size={14}
                    color="white"
                  />
                  <Text style={{ fontFamily: "SupremeBold", color: "white" }}>
                    {result.correct ? "Correct!" : "Incorrect!"}
                  </Text>
                </View>
                {!result.correct && best != null && (
                  <Text
                    style={{
                      fontFamily: "Supreme",
                      color: "#666",
                      fontSize: 13,
                    }}
                  >
                    Best: {best}
                  </Text>
                )}
              </View>
            )}

            <View style={{ flexDirection: IS_WEB ? "row" : "column", gap: 16 }}>
              <Animated.View
                key={run.current.player_season_id}
                entering={ENTERING}
                exiting={EXITING}
                style={{
                  flex: IS_WEB ? 1 : undefined,
                  width: IS_WEB ? undefined : "100%",
                  backgroundColor: "#EDE4F5",
                  borderRadius: 20,
                  padding: 16,
                }}
              >
                <DuelPlayerCard
                  card={run.current}
                  statOrder={STAT_ORDER}
                  statLabels={STAT_LABELS}
                  selectedStat={selectedStat}
                  highlight={
                    result ? (result.correct ? "correct" : "incorrect") : null
                  }
                />
              </Animated.View>

              <Animated.View
                key={cardB.player_season_id}
                entering={ENTERING}
                exiting={EXITING}
                style={{
                  flex: IS_WEB ? 1 : undefined,
                  width: IS_WEB ? undefined : "100%",
                  backgroundColor: "#DBDBDB",
                  borderRadius: 20,
                  padding: 16,
                }}
              >
                {!result && (
                  <Text
                    style={{
                      fontFamily: "SupremeBold",
                      fontSize: 14,
                      marginBottom: 8,
                      textAlign: "center",
                    }}
                  >
                    Choose a superior stat
                  </Text>
                )}
                <DuelPlayerCard
                  card={cardB}
                  statOrder={STAT_ORDER}
                  statLabels={STAT_LABELS}
                  selectable={!result && !isSubmittingStat}
                  selectedStat={selectedStat}
                  onSelectStat={handleSelectStat}
                  pendingStat={isSubmittingStat ? selectedStat : null}
                  highlight={
                    result ? (result.correct ? "correct" : "incorrect") : null
                  }
                />
              </Animated.View>
            </View>

            {result && (
              <Pressable
                onPress={result.correct ? handleNextRound : handleNewGame}
                style={{
                  backgroundColor: PURPLE,
                  borderRadius: 999,
                  paddingVertical: 14,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "SupremeBold",
                    color: "white",
                    fontSize: 16,
                  }}
                >
                  {result.correct ? "NEXT ROUND" : "NEW GAME"}
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View
            style={{
              backgroundColor: PURPLE,
              borderRadius: 24,
              padding: 24,
              alignItems: "center",
              gap: 8,
              width: "100%",
              maxWidth: 380,
            }}
          >
            <Text
              style={{
                fontFamily: "SupremeExtraBold",
                color: "white",
                fontSize: 22,
                textAlign: "center",
              }}
            >
              Climb the Ladder
            </Text>
            <Text
              style={{
                fontFamily: "Supreme",
                color: "white",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              Pick the stat where the new player comes out on top
            </Text>

            <Pressable
              onPress={handleStartRun}
              disabled={isStartingRun}
              style={{
                backgroundColor: "white",
                borderRadius: 999,
                paddingVertical: 14,
                width: "100%",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              {isStartingRun ? (
                <ActivityIndicator color={PURPLE} />
              ) : (
                <Text
                  style={{
                    fontFamily: "SupremeBold",
                    color: PURPLE,
                    fontSize: 18,
                  }}
                >
                  Start Game
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
