import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PermissionsScreen() {
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  const toggleLocation = () => {
    setIsLocationEnabled((prevState) => !prevState);
  };

  return (
    <View style={styles.container}>
      {/* Location Toggle Button */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} activeOpacity={1}>
          <Ionicons name="location-outline" size={24} color="white" style={styles.icon} />
          <Text style={styles.menuText}>Location</Text>
          <Switch
            value={isLocationEnabled}
            onValueChange={toggleLocation}
            trackColor={{ false: "#444", true: "#5CD4FF" }}
            thumbColor={isLocationEnabled ? "#ffffff" : "#888"}
          />
        </TouchableOpacity>
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
});

