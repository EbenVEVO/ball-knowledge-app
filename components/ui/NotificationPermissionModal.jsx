import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNotificationPermissionStore } from "@/contexts/notificationPermissionStore";
import { requestPermissionAndRegister } from "@/lib/pushNotifications";

const NotificationPermissionModal = () => {
  const promptOpen = useNotificationPermissionStore((s) => s.promptOpen);
  const canAskAgain = useNotificationPermissionStore((s) => s.canAskAgain);
  const closePrompt = useNotificationPermissionStore((s) => s.closePrompt);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["40%"], []);

  useEffect(() => {
    if (promptOpen) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [promptOpen]);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={closePrompt}
      />
    ),
    [closePrompt],
  );

  const handleEnable = () => {
    closePrompt();
    if (!canAskAgain) {
      Linking.openSettings();
      return;
    }
    requestPermissionAndRegister();
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDismissOnClose
      enableDynamicSizing={false}
      onDismiss={closePrompt}
      backgroundStyle={{ borderRadius: 20 }}
      stackBehavior="switch"
      backdropComponent={renderBackdrop}
    >
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="notifications" size={22} color="#A477C7" />
        </View>
        <Text style={styles.title}>Stay In The Loop</Text>
        <Text style={styles.message}>
          Get notified when a player or team you follow has a big performance,
          plus live score updates as their matches happen.
        </Text>
        <TouchableOpacity
          onPress={handleEnable}
          style={styles.actionBtn}
          activeOpacity={0.75}
        >
          <Text style={styles.actionBtnLabel}>
            {canAskAgain ? "Enable Notifications" : "Open Settings"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={closePrompt}
          style={styles.dismissBtn}
          activeOpacity={0.6}
        >
          <Text style={styles.dismissBtnLabel}>Not now</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
};

export default NotificationPermissionModal;

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
  dismissBtn: {
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  dismissBtnLabel: {
    fontFamily: "Supreme",
    fontSize: 13,
    color: "rgba(0,0,0,0.4)",
  },
});
