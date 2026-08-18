import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as yup from "yup";
import { useAuth } from "../../contexts/AuthContext";
import { sendOTP } from "../../auth/authfunctions";
import Toast from "react-native-toast-message";

const FEATURES = [
  { icon: "💬", label: "Ask any footy question — get instant answers" },
  { icon: "⭐", label: "Follow your favorite teams, players & leagues" },
  { icon: "🏆", label: "Save queries & build epic player collections" },
  { icon: "🎮", label: "Play games to level up your ball knowledge" },
];

export default function SignUp() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();
  const [numberSubmitted, setNumberSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState()
  const { session, profile } = useAuth();
  const [countryCode, setCountryCode] = useState('1');
  const phoneSchema = yup.object().shape({
    phoneNumber: yup.string().phone().required("Phone number is required"),
  });

  const handleNumberSubmit = async (phone) => {
    setPhoneNumber(phone);
    const req = await sendOTP(phone)
    if (req.success){
        router.push({
            pathname: "/auth/verification",
            params: { phoneNumber: phone },
        });
    }
    else{
        setErrorMessage(req.message)
        errorToast()
    }
  };

  const errorToast = () => Toast.show({ type: "error", position: 'bottom', text1: errorMessage , visibilityTime: 1750})
  return (
    <LinearGradient colors={["#e8e0f8", "#c8bce8"]} style={styles.background}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
      <TouchableOpacity style={styles.top} activeOpacity={1} onPress={Keyboard.dismiss}>
        <Text style={styles.title}>Ball Knowledge</Text>

        <Text style={styles.subtitle}>
          Sign up for years of knowledge about your favorite teams and players
          in football. New here? Just enter your number — we'll create your
          account.
        </Text>

        <View style={styles.featureList}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>{f.icon}</Text>
              </View>
              <Text style={styles.featureText}>{f.label}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>

      {/* Bottom card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Phone number</Text>

        <Formik
          initialValues={{ phoneNumber: "" }}
          validationSchema={phoneSchema}
          onSubmit={(values) => handleNumberSubmit(countryCode+values.phoneNumber)}
        >
          {({
            errors,
            isValid,
            handleChange,
            handleBlur,
            handleSubmit,
            values,
          }) => (
            <>
              <View style={styles.inputRow}>
                <TouchableOpacity style={styles.countryPicker}>
                  <Text style={styles.flag}>🇺🇸</Text>
                  <Text style={styles.countryCode}> +1</Text>
                  <Text style={styles.chevron}> ⌄</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.phoneInput}
                  value={values.phoneNumber}
                  onChangeText={handleChange("phoneNumber")}
                  keyboardType="phone-pad"
                  onBlur={handleBlur("phoneNumber")}
                  placeholder="000 000 0000"
                  placeholderTextColor="#aaa"
                />
              </View>
              
              <TouchableOpacity
                disabled={!isValid}
                style={
                  isValid ? styles.continueBtn : styles.continueBtnDisabled
                }
                onPress={handleSubmit}
                activeOpacity={0.85}
              >
                <Text style={styles.continueBtnText}>Continue →</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>

        <Text style={styles.hint}>
          No account yet? Entering your number signs you up.
        </Text>

        {/* Legal */}
        <Text style={styles.legal}>
          By continuing you agree to our{" "}
          <Text style={styles.legalLink}>Terms</Text>
          {" & "}
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </Text>
      </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const PURPLE_BG = "#d8d0f0";
const PURPLE_DARK = "#5c4f8a";
const PURPLE_BTN = "#A477C7";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PURPLE_BG,
  },
  background: {
    flex: 1,
  },
  top: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 18,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: PURPLE_DARK,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#655085",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#655085",
    marginBottom: 20,
  },

  // ── Feature rows ────────────────────────────────────────────
  featureList: {
    gap: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconEmoji: {
    fontSize: 20,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: "#655085",
    fontWeight: "500",
    lineHeight: 22,
  },

  // ── Bottom white card ────────────────────────────────────────
  card: {
    backgroundColor: "#f5f3ff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 16,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2e2450",
    marginBottom: 12,
  },

  // Phone input
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e0d8f0",
    paddingHorizontal: 14,
    height: 58,
    marginBottom: 10,
  },
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },
  flag: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2e2450",
  },
  chevron: {
    fontSize: 16,
    color: "#888",
    marginTop: -2,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: "#ddd",
    marginRight: 14,
  },
  phoneInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1430",
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    marginBottom: 18,
  },

  // Continue button
  continueBtn: {
    backgroundColor: PURPLE_BTN,
    borderRadius: 14,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: PURPLE_BTN,
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
  continueBtnDisabled: {
    backgroundColor: "gray",
    borderRadius: 14,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  // Maybe later
  maybeLater: {
    textAlign: "center",
    fontSize: 15,
    color: "#555",
    marginBottom: 16,
  },

  // Legal
  legal: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    lineHeight: 18,
  },
  legalLink: {
    textDecorationLine: "underline",
    color: "#777",
  },
});
