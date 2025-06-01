import React from "react";
import { Stack } from "expo-router";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function AccountLayout() {
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
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: () => <CustomHeaderTitle title="Your Account" />,
        }}
      />
      <Stack.Screen
        name="personal-info"
        options={{
          headerTitle: () => <CustomHeaderTitle title="Personal Information" />,
        }}
      />
      <Stack.Screen
        name="security"
        options={{
          headerTitle: () => <CustomHeaderTitle title="Account Security" />,
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          headerTitle: () => <CustomHeaderTitle title="Payment Options" />,
        }}
      />
      <Stack.Screen
        name="add-spot"
        options={{
          headerTitle: () => <CustomHeaderTitle title="Upload Audio" />,
        }}
      />
      <Stack.Screen
        name="add-audio-item"
        options={{
          headerTitle: () => <CustomHeaderTitle title="Add Audio Item" />,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
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