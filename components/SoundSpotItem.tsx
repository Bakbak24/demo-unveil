import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SoundSpotItemProps {
  name: string;
  distance: string;
  onPress: () => void;
}

const SoundSpotItem: React.FC<SoundSpotItemProps> = ({ name, distance, onPress }) => {
  return (
    <TouchableOpacity style={styles.listenNowButton} onPress={onPress}>
      {/* Geluidsicoon */}
      <Ionicons
        name="headset"
        size={24}
        color="#C2C2C2"
        style={styles.listenNowIcon}
      />

      {/* Naam en afstand */}
      <View style={styles.listenNowTextContainer}>
        <Text style={styles.listenNowTitle}>{name}</Text>
        <Text style={styles.listenNowDistance}>{distance}</Text>
      </View>

      {/* Locatie-icoon */}
      <Ionicons
        name="location"
        size={24}
        color="#C2C2C2" // Grijs kleur
        style={styles.listenNowIcon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  listenNowButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333333",
    borderRadius: 10,
    marginVertical: 10,
    padding: 10,
  },
  listenNowIcon: {
    marginHorizontal: 10,
  },
  listenNowTextContainer: {
    flex: 1,
  },
  listenNowTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  listenNowDistance: {
    color: "#C2C2C2", 
    fontSize: 12,
  },
});

export default SoundSpotItem;