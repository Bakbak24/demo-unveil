import React from "react";
import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

export default function AboutLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#212121" },
        headerTitleStyle: { color: "white", fontSize: 20 },
        headerTintColor: "#5CD4FF",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: "About",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/user")} 
              style={{ marginLeft: 0, marginRight: 40 }}
            >
              <Ionicons name="arrow-back" size={24} color="#5CD4FF" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="terms-of-service" 
        options={{
          headerTitle: "Terms of Service",
        }}
      />
      <Stack.Screen name="privacy" 
        options={{
          headerTitle: "Privacy Policy",
        }}
      />
    </Stack>
  );
}
