import React from "react";
import { Stack } from "expo-router";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function UserLayout() {
  const customHeaderLeft = () => (
    <TouchableOpacity
      style={{
        width: 55,
        height: 55,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#333",
        marginLeft: 10,
        marginTop: 26,
        marginBottom: 24,
      }}
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.push("/(tabs)/user");
        }
      }}
    >
      <Ionicons name="arrow-back" size={24} color="white" />
    </TouchableOpacity>
  );

  const CustomHeaderTitle = ({ title }: { title: string }) => (
    <View style={styles.headerTitleContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerStyle: { 
            backgroundColor: "#212121",
          },
          headerTitleStyle: { color: "white", fontSize: 20 },
          headerTintColor: "#5CD4FF",
          headerShadowVisible: false,
          headerLeft: customHeaderLeft,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="account"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="about"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="permissions"
          options={{
            headerTitle: () => <CustomHeaderTitle title="Device Permissions" />,
          }}
        />
        <Stack.Screen
          name="language"
          options={{
            headerTitle: () => <CustomHeaderTitle title="Language" />,
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
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