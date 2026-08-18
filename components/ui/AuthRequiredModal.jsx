import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuthGateStore } from "@/contexts/authGateStore";

const AuthRequiredModal = () => {
  const isOpen = useAuthGateStore((s) => s.isOpen);
  const close = useAuthGateStore((s) => s.close);
  const router = useRouter();
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["35%"], []);

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isOpen]);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={close}
      />
    ),
    [close],
  );

  const handleSignIn = () => {
    close();
    router.push("/auth/signin");
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDismissOnClose
      enableDynamicSizing={false}
      onDismiss={close}
      backgroundStyle={{ borderRadius: 20 }}
      stackBehavior="switch"
      backdropComponent={renderBackdrop}
    >
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
    </BottomSheetModal>
  );
};

export default AuthRequiredModal;

const styles = StyleSheet.create({
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
