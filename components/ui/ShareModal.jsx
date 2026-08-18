import {
  Modal as RNModal,
  TouchableWithoutFeedback,
  View,
  Text,
  Platform,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

const PURPLE = "#A477C7";

const ShareModal = ({ isVisible, onClose, link, capture, title, fileName = "statcard.png" }) => {
  const [copied, setCopied] = useState(false);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["40%"], []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    if (isVisible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible]);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={onClose}
      />
    ),
    [onClose]
  );

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(link);
    setCopied(true);
  };

  const onSaveImage = async () => {
    const uri = await capture();
    if (Platform.OS === "web") {
      const anchor = document.createElement("a");
      anchor.href = uri;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } else {
      await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Save Image" });
    }
  };

  const content = (
    <>
      <Text style={styles.title}>{title}</Text>
      {capture && (
        <View className="p-5">
          <TouchableOpacity className='items-center gap-2' onPress={onSaveImage}>
            <View
              style={{
                backgroundColor: "#f0ecfc",
                borderRadius: 50,
                padding: 15,
              }}
            >
              <EvilIcons name="image" size={24} color={PURPLE} />
            </View>
            <Text>Save as Image...</Text>
          </TouchableOpacity>
        </View>
      )}
      <Pressable onPress={copyToClipboard} style={styles.linkPressable}>
        <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="tail">
          {link}
        </Text>
        <Text style={styles.copyText}>{copied ? "COPIED" : "Copy"}</Text>
      </Pressable>
    </>
  );

  if (Platform.OS === "web") {
    return (
      <View>
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
                <View style={styles.container}>{content}</View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </RNModal>
      </View>
    );
  }

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDismissOnClose
      enableDynamicSizing={false}
      onDismiss={onClose}
      backgroundStyle={{ borderRadius: 20 }}
      stackBehavior="switch"
      backdropComponent={renderBackdrop}
    >
      <View style={{ padding: 20 }}>{content}</View>
    </BottomSheetModal>
  );
};

export default ShareModal;

const styles = StyleSheet.create({
  container: {
    width: "50%",
    height: "55%",
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 10,
  },
  title: {
    fontFamily: "SupremeBold",
    fontSize: 16,
    color: "#0d0d0d",
    marginBottom: 4,
  },
  linkPressable: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  linkText: {
    flex: 1,
    color: "#333",
    fontSize: 14,
  },
  copyText: {
    color: PURPLE,
    fontWeight: "600",
    fontSize: 14,
    flexShrink: 0,
  },
});
