import React from "react";
import { Stack } from "expo-router";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function AuthLayout() {

  const CustomHeaderTitle = ({ title }: { title: string }) => (
    <View style={styles.headerTitleContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );

  return (
    <Stack
      screenOptions={{
        headerStyle: { 
          backgroundColor: "#212121",
        },
        headerTitleStyle: { color: "white", fontSize: 20 },
        headerTintColor: "#5CD4FF",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="intro"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 55,
    height: 55,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
    marginLeft: 10,
    marginTop: 26,
    marginBottom: 24,
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -55,
    marginTop: 26,
    marginBottom: 24,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});