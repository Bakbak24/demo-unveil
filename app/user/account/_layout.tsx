import React from "react";
import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

export default function AccountLayout() {
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
          headerTitle: "Your Account",
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
      <Stack.Screen name="personal-info" 
        options={{
          headerTitle: "Personal Information",
        }}
      />
      <Stack.Screen name="security" 
        options={{
          headerTitle: "Account Security",
        }}
      />
      <Stack.Screen name="payment" 
        options={{
          headerTitle: "Payment Options",
        }}
      />
      <Stack.Screen name="add-spot" 
        options={{
          headerTitle: "Upload Audio",
        }}
      />
    </Stack>
  );
}
