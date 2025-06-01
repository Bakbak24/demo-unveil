import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function LanguageScreen() {
  const languages: { label: string; icon: "globe-outline"; code: string }[] = [
    { label: "English", icon: "globe-outline", code: "en" },
    { label: "Nederlands", icon: "globe-outline", code: "nl" },
    { label: "Français", icon: "globe-outline", code: "fr" },
    { label: "日本語", icon: "globe-outline", code: "ja" }, // Japans
    { label: "العربية", icon: "globe-outline", code: "ar" }, // Arabisch
  ];

  return (
    <View style={styles.container}>
      {/* Language Selection Buttons */}
      <View style={styles.menuContainer}>
        {languages.map((lang, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <Ionicons name={lang.icon} size={24} color="white" style={styles.icon} />
            <Text style={styles.menuText}>{lang.label}</Text>
            <Ionicons name="chevron-forward-outline" size={24} color="white" style={styles.arrow} />
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
    color: "white",
  },
  menuText: {
    flex: 1,
    fontSize: 18,
    color: "white",
  },
  arrow: {
    color: "white",
  },
});
