import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FavouriteSoundSpotProps {
  name: string;
  distance: string;
  onPress: () => void;
}

const FavouriteSoundSpot: React.FC<FavouriteSoundSpotProps> = ({ name, distance, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Geluidsicoon */}
      <Ionicons name="musical-notes" size={24} color="#C2C2C2" style={styles.icon} />

      {/* Naam en afstand */}
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.distance}>{distance}</Text>
      </View>

      {/* Locatie-icoon */}
      <Ionicons name="location" size={24} color="#C2C2C2" style={styles.locationIcon} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333333",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  distance: {
    color: "#C2C2C2",
    fontSize: 12,
    marginTop: 5,
  },
  locationIcon: {
    marginLeft: 10,
  },
});

export default FavouriteSoundSpot;