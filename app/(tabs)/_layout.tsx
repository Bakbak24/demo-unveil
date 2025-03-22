import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, StyleSheet } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#212121",
          borderTopWidth: 0,
          paddingTop: 17,
          height: 90,
          shadowColor: "#000", // Schaduw voor iOS
          shadowOffset: { width: 0, height: -4 }, // Schaduw voor iOS
          shadowOpacity: 0.25, // Schaduw voor iOS
          shadowRadius: 4, // Schaduw voor iOS
          elevation: 10, // Schaduw voor Android
        },
        tabBarActiveTintColor: "#5CD4FF",
        tabBarInactiveTintColor: "#FFFFFF",
        tabBarLabelStyle: {
          marginTop: 5,
          fontSize: 14,
        },
      }}
    >
      <Tabs.Screen
        name="audio"
        options={{
          headerTitle: "Audio",
          headerShown: false,
          tabBarLabel: "Audio",
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons
                name="mic-outline"
                size={32}
                color={color}
                marginTop={-1}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "Map",
          headerShown: false,
          tabBarLabel: "Map",
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons
                name="map-outline"
                size={32}
                color={color}
                marginTop={-2}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          headerTitle: "User",
          headerShown: false,
          tabBarLabel: "User",
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons
                name="person-outline"
                size={32}
                color={color}
                marginTop={-2}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen name="+not-found" options={{}} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: "#5CD4FF",
    paddingTop: 5,
  },
});