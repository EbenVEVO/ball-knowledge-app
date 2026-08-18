import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { useAuthGateStore } from "@/contexts/authGateStore";

// react-native's <Modal> renders a plain `position: fixed` div with no
// z-index on web, so stacking is decided purely by DOM/mount order. This
// gate is mounted once at the root (before any feature modal exists), so
// nesting it in the normal render tree would always put it *behind*
// whatever modal the gated action was triggered from (e.g. rating a
// performance from inside the player modal). Portaling straight to
// `document.body` plus an explicit high z-index guarantees it always wins.
const AuthRequiredModal = () => {
  const isOpen = useAuthGateStore((s) => s.isOpen);
  const close = useAuthGateStore((s) => s.close);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyUp = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keyup", onKeyUp);
    return () => document.removeEventListener("keyup", onKeyUp);
  }, [isOpen, close]);

  if (!isOpen) return null;

  const handleSignIn = () => {
    close();
    router.push("/auth/signin");
  };

  return createPortal(
    <TouchableWithoutFeedback onPress={close}>
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View style={styles.container}>
            <View style={styles.content}>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-closed" size={22} color="#A477C7" />
              </View>
              <Text style={styles.title}>Sign In Required</Text>
              <Text style={styles.message}>
                You must be logged in to use this feature.
              </Text>
              <TouchableOpacity
                onPress={handleSignIn}
                style={styles.actionBtn}
                activeOpacity={0.75}
              >
                <Text style={styles.actionBtnLabel}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>,
    document.body,
  );
};

export default AuthRequiredModal;

const styles = StyleSheet.create({
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "40%",
    minWidth: 320,
    backgroundColor: "white",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    alignItems: "center",
    gap: 10,
    padding: 28,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#A477C720",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontFamily: "SupremeBold",
    fontSize: 16,
    color: "#0d0d0d",
  },
  message: {
    fontFamily: "Supreme",
    fontSize: 13,
    color: "rgba(0,0,0,0.5)",
    textAlign: "center",
  },
  actionBtn: {
    marginTop: 8,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#A477C7",
  },
  actionBtnLabel: {
    fontFamily: "SupremeBold",
    fontSize: 14,
    color: "white",
  },
});
