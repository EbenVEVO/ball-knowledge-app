import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

const SignInPrompt = ({ message = "You must be logged in to use this feature." }) => {
  const router = useRouter();

  return (
    <View style={{ alignItems: "center", gap: 12, padding: 24 }}>
      <Text
        style={{
          fontFamily: "Supreme",
          fontSize: 14,
          color: "rgba(0,0,0,0.45)",
          textAlign: "center",
        }}
      >
        {message}
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/auth/signin")}
        style={{
          backgroundColor: "#A477C7",
          paddingVertical: 11,
          paddingHorizontal: 28,
          borderRadius: 10,
        }}
        activeOpacity={0.75}
      >
        <Text style={{ fontFamily: "SupremeBold", fontSize: 13, color: "white" }}>
          Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignInPrompt;
