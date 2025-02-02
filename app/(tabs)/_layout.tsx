import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#212121",
          borderTopColor: "#5CD4FF",
          paddingTop: 17,
          height: 90,
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
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="mic-outline"
              size={32}
              color={color}
              marginTop={-1}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "Map",
          headerShown: false,
          tabBarLabel: "Map",
          tabBarIcon: ({ color }) => (
            <Ionicons name="map-outline" size={32} color={color} marginTop={-2}/>
          ),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          headerTitle: "User",
          headerShown: false,
          tabBarLabel: "User",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={32} color={color} marginTop={-2}/>
          ),
        }}
      />
      <Tabs.Screen name="+not-found" options={{}} />
    </Tabs>
  );
}
