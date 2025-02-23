import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function AboutScreen() {
  const menuItems: { label: string; icon: "document-text-outline" | "shield-checkmark-outline"; route: "/user/about/terms-of-service" | "/user/about/privacy" }[] = [
    { label: "Terms of Service", icon: "document-text-outline", route: "/user/about/terms-of-service" },
    { label: "Privacy Policy", icon: "shield-checkmark-outline", route: "/user/about/privacy" },
  ];

  return (
    <View style={styles.container}>
      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
            <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => router.push(item.route)}
            >
            <Ionicons
              name={item.icon}
              size={24}
              color="white"
              style={styles.icon}
            />
            <Text style={styles.menuText}>{item.label}</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={24}
              color="white"
              style={styles.arrow}
            />
            </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    padding: 20,
  },
  menuContainer: {
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 16,
  },
  icon: {
    marginRight: 10,
  },
  menuText: {
    flex: 1,
    fontSize: 18,
    color: "white",
  },
  arrow: {
    marginLeft: 10,
  },
});