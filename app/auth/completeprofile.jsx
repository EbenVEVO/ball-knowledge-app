import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  BackHandler,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable
} from "react-native";
import Toast, {ErrorToast} from "react-native-toast-message";
import PersonalizationStep from "../../components/screens/PersonalizationStep";
import UsernameStep from "../../components/screens/UsernameStep";
import { toastConfig } from "../../constants/Toast";
import { useAuth } from "../../contexts/AuthContext";
import {completeSignUp, logout} from '../../auth/authfunctions'

const STEPS = ["username", "players", "clubs", "competitions"];

const completeprofile = () => {
  const {session} = useAuth()
  const [step, setStep] = useState(0);
  const [stepHasSelections, setStepHasSelections] = useState(false);
  const [form, setForm] = useState({
    username: "",
    favorite_players: [],
    favorite_clubs: [],
    favorite_competitions: [],
  });

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (Platform.OS !== 'android') return
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => sub.remove()
  }, [])

  const handleSubmit = async () => {
    if (session) {
      const req = await completeSignUp(form, session)
      if (!req.success) {
        setErrorMessage(req.message || 'Something went wrong')
      }
      // on success: AuthGate detects profile now exists and navigates to /(tabs)
    }
  }
  useEffect(() => {
    if (errorMessage?.length > 0) {
      console.log("error in username");
      errorToast();
      setErrorMessage("");
    }
  }, [errorMessage]);

  const goToStep = (n) => {
    setStepHasSelections(false);
    setStep(n);
  };

  const errorToast = () => Toast.show({ type: "error", position: 'bottom', text1: errorMessage , visibilityTime: 1750});

  return (
    <LinearGradient
      colors={["#e4daf7", "#ccbff0", "#b8ace8"]}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 10,
            paddingTop: 40,
            paddingBottom: 40,
          }}
        >
                <Pressable onPress={logout}>
                  <Text>sign out</Text>
                  <Text style={{color: session ? 'green': 'red'}}>{session ? 'session' : 'no session'}</Text>
                </Pressable>
          {step > 0 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => goToStep(step - 1)}
                style={{ padding: 8 }}
              >
                <Ionicons name="chevron-back" size={24} color="#4a3a7a" />
              </TouchableOpacity>
              {(step === 1 || step === 2) && (
                <TouchableOpacity
                  onPress={() => goToStep(step + 1)}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 15,
                    borderRadius: 20,
                    backgroundColor: "rgba(255,255,255,0.35)",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#4a3a7a",
                      fontFamily: "Supreme",
                    }}
                  >
                    {stepHasSelections ? "Next" : "Skip"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: "rgba(255,255,255,0.35)",
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 6,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#4a3a7a",
                letterSpacing: 1.5,
                fontFamily: "Supreme",
              }}
            >
              Getting Started
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            {step === 0 && (
              <UsernameStep
                setErrorMessage={setErrorMessage}
                onSubmit={(v) => {
                  setForm((f) => ({ ...f, username: v }));
                }}
                onNext={() => goToStep(step + 1)}
              />
            )}
            {step === 1 && (
              <PersonalizationStep
                type={"players"}
                onNext={(selections) => {
                  goToStep(step + 1)
                }}
                setForm={setForm}
                onSelectionChange={setStepHasSelections}
              />
            )}
            {step === 2 && (
              <PersonalizationStep
                type={"clubs"}
                setForm={setForm}
                onNext={() => goToStep(step + 1)}
                onSelectionChange={setStepHasSelections}
              />
            )}
            {step === 3 && (
              <>
                <PersonalizationStep
                  type={"competitions"}
                  onNext={() => goToStep(step + 1)}
                  setForm={setForm}
                  onSelectionChange={setStepHasSelections}
                />
                <TouchableOpacity
                  style={styles.continueBtn}
                  onPress={handleSubmit}
                  activeOpacity={0.85}
                >
                  <Text style={styles.continueBtnText}>Create Account →</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default completeprofile;
const styles = StyleSheet.create({
  continueBtn: {
    backgroundColor: "#A477C7",
    borderRadius: 14,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#A477C7",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // BaseToast/ErrorToast overrides
  successToast: {
    borderLeftColor: '#6b5fa0',
    borderLeftWidth: 5,
    borderRadius: 14,
    height: 60,
  },

  contentContainer: {
    paddingHorizontal: 16,
  },
  text1: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  text2: {
    fontSize: 13,
    color: '#7a6fa8',
  },

  customToast: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#A477C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});

