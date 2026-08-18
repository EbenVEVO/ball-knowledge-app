import DuelPlayerCard from "@/components/ui/DuelPlayerCard";
import SignInPrompt from "@/components/ui/SignInPrompt";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchCurrentDuelRun,
  startDuelRun,
  submitHigherLowerGuess,
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
const DARK = "#1a1430";
const MUTED_BG = "#E5E5E5";
const MUTED_TEXT = "#999";
const GAME = "higher-lower";
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

export default function HigherOrLowerScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [runStatus, setRunStatus] = useState("loading"); // 'loading' | 'no-run' | 'active'
  const [run, setRun] = useState(null); // { run_id, score, current, next, stat }
  const [isStartingRun, setIsStartingRun] = useState(false);
  const [guessDirection, setGuessDirection] = useState(null); // 'higher' | 'lower' | null
  const [isSubmittingGuess, setIsSubmittingGuess] = useState(false);
  const [result, setResult] = useState(null); // last hl_submit_guess response, or null pre-guess
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
      setRunStatus("active");
    };
    loadCurrent();
  }, [userId]);

  const handleStartRun = async () => {
    setIsStartingRun(true);
    setGuessDirection(null);
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

  // Tapping HIGHER/LOWER submits immediately — no separate confirm step.
  const handleGuess = async (direction) => {
    if (!run || result || isSubmittingGuess) return;
    setGuessDirection(direction);
    setIsSubmittingGuess(true);

    const { data, error } = await submitHigherLowerGuess(run.run_id, direction);
    if (error) {
      console.log("submitHigherLowerGuess error", error);
      setIsSubmittingGuess(false);
      return;
    }
    setResult(data);
    setRun((prev) => ({ ...prev, score: data.score }));
    if (!data.correct) setBest(data.best);
    setIsSubmittingGuess(false);
  };

  const handleNextRound = () => {
    setRun((prev) => ({
      ...prev,
      current: result.current,
      next: result.next,
      stat: result.next_stat,
    }));
    setGuessDirection(null);
    setResult(null);
  };

  const cardB = result ? result.revealed : run?.next;
  const questionStat = result ? result.stat : run?.stat;

  return (
    <View style={{ padding: 16, flex: 1 }}>
      <Text className="font-supremeBold text-2xl">Higher or Lower</Text>

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

            {!result ? (
              <Text
                style={{
                  fontFamily: "SupremeBold",
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                {`Higher or lower than ${run.current.name}'s ${STAT_LABELS[questionStat]}?`}
              </Text>
            ) : (
              <View style={{ alignItems: "center", gap: 4 }}>
                <Text
                  style={{
                    fontFamily: "SupremeBold",
                    fontSize: 16,
                    textAlign: "center",
                    color: result.correct ? GREEN : RED,
                  }}
                >
                  {result.correct ? "Correct!" : "Wrong!"}
                </Text>
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

            <View
              style={{
                flexDirection: IS_WEB ? "row" : "column",
                gap: 16,
                alignItems: "center",
              }}
            >
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
                  selectedStat={questionStat}
                  highlight={
                    result ? (result.correct ? "correct" : "incorrect") : null
                  }
                />
              </Animated.View>

              <View
                style={{
                  flexDirection: IS_WEB ? "column" : "row",
                  gap: 16,
                }}
              >
                <Pressable
                  disabled={!!result || isSubmittingGuess}
                  onPress={() => handleGuess("higher")}
                  style={{ alignItems: "center", gap: 4 }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: !result
                        ? DARK
                        : guessDirection === "higher"
                          ? result.correct
                            ? GREEN
                            : RED
                          : MUTED_BG,
                    }}
                  >
                    <FontAwesome
                      name="chevron-up"
                      size={16}
                      color={
                        !result || guessDirection === "higher"
                          ? "white"
                          : MUTED_TEXT
                      }
                    />
                  </View>
                  <Text
                    style={{
                      fontFamily: "SupremeBold",
                      fontSize: 11,
                      color: !result
                        ? DARK
                        : guessDirection === "higher"
                          ? result.correct
                            ? GREEN
                            : RED
                          : MUTED_TEXT,
                    }}
                  >
                    HIGHER
                  </Text>
                </Pressable>

                <Pressable
                  disabled={!!result || isSubmittingGuess}
                  onPress={() => handleGuess("lower")}
                  style={{ alignItems: "center", gap: 4 }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: !result
                        ? DARK
                        : guessDirection === "lower"
                          ? result.correct
                            ? GREEN
                            : RED
                          : MUTED_BG,
                    }}
                  >
                    <FontAwesome
                      name="chevron-down"
                      size={16}
                      color={
                        !result || guessDirection === "lower"
                          ? "white"
                          : MUTED_TEXT
                      }
                    />
                  </View>
                  <Text
                    style={{
                      fontFamily: "SupremeBold",
                      fontSize: 11,
                      color: !result
                        ? DARK
                        : guessDirection === "lower"
                          ? result.correct
                            ? GREEN
                            : RED
                          : MUTED_TEXT,
                    }}
                  >
                    LOWER
                  </Text>
                </Pressable>
              </View>

              <View
                style={{
                  flex: IS_WEB ? 1 : undefined,
                  width: IS_WEB ? undefined : "100%",
                  position: "relative",
                }}
              >
                {result && (
                  <View
                    style={{
                      position: "absolute",
                      top: -14,
                      alignSelf: "center",
                      zIndex: 2,
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: result.correct ? GREEN : RED,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: "white",
                    }}
                  >
                    <FontAwesome
                      name={result.correct ? "check" : "close"}
                      size={14}
                      color="white"
                    />
                  </View>
                )}
                <Animated.View
                  key={cardB.player_season_id}
                  entering={ENTERING}
                  exiting={EXITING}
                  style={{
                    backgroundColor: "#DBDBDB",
                    borderRadius: 20,
                    padding: 16,
                  }}
                >
                  <DuelPlayerCard
                    card={cardB}
                    statOrder={STAT_ORDER}
                    statLabels={STAT_LABELS}
                    selectedStat={questionStat}
                    pendingStat={isSubmittingGuess ? questionStat : null}
                    highlight={
                      result ? (result.correct ? "correct" : "incorrect") : null
                    }
                  />
                </Animated.View>
              </View>
            </View>

            {result && (
              <Pressable
                onPress={result.correct ? handleNextRound : handleStartRun}
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
                  NEXT ROUND
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
              Higher or Lower
            </Text>
            <Text
              style={{
                fontFamily: "Supreme",
                color: "white",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              Higher or lower? Call the hidden stat
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
