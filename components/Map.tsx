import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSoundspots } from "../context/SoundspotsContext";
import { Soundspot } from "../services/api";

const Map = () => {
  const router = useRouter();
  const { soundspots, isLoading, fetchSoundspots } = useSoundspots();

  useEffect(() => {
    fetchSoundspots();
  }, []);

  const handleSoundSpotPress = (soundspot: Soundspot) => {
    router.push({
      pathname: "/soundspot-detail",
      params: {
        soundspotId: soundspot.id,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.placeholderText}>Map View (Mapbox Removed)</Text>
        <Text style={styles.subText}>Tap on a sound spot below to explore</Text>
      </View>

      <ScrollView style={styles.soundSpotsList}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5CD4FF" />
            <Text style={styles.loadingText}>Loading soundspots...</Text>
          </View>
        ) : Array.isArray(soundspots) && soundspots.length > 0 ? (
          soundspots
            .filter(spot => spot && spot.id && typeof spot.id === 'string')
            .map((spot) => (
            <TouchableOpacity
              key={spot.id}
              style={styles.soundSpotItem}
              onPress={() => handleSoundSpotPress(spot)}
            >
              <View style={styles.soundSpotIcon}>
                <Ionicons name="location" size={30} color="#5CD4FF" />
              </View>
              <View style={styles.soundSpotInfo}>
                <Text style={styles.spotName}>
                  {(spot.name && typeof spot.name === 'string') ? spot.name : 'Unnamed Spot'}
                </Text>
                <Text style={styles.spotLocation}>
                  📍 {(spot.location && spot.location.latitude && spot.location.longitude) 
                    ? `${spot.location.latitude.toFixed(4)}, ${spot.location.longitude.toFixed(4)}`
                    : '0.0000, 0.0000'
                  }
                </Text>
                {spot.script && typeof spot.script === 'string' && spot.script.trim() && (
                  <Text style={styles.spotScript} numberOfLines={2}>
                    {spot.script}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={60} color="#666" />
            <Text style={styles.emptyText}>No Soundspots Available</Text>
            <Text style={styles.emptySubtext}>
              Check back later for new audio locations
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.overlay}>
        <TouchableOpacity style={styles.themesButton}>
          <Ionicons
            name="bookmark-outline"
            size={24}
            color="white"
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Theme</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.favouritesButton}>
          <Ionicons
            name="star-outline"
            size={24}
            color="white"
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Favourites</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  subText: {
    color: "#ccc",
    marginTop: 8,
  },
  soundSpotsList: {
    flex: 1,
    padding: 16,
  },
  soundSpotItem: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  soundSpotIcon: {
    marginRight: 16,
  },
  soundSpotInfo: {
    flex: 1,
  },
  spotName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  spotLocation: {
    fontSize: 12,
    color: "#666",
  },
  spotScript: {
    fontSize: 12,
    color: "#666",
  },
  overlay: {
    position: "absolute",
    top: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  themesButton: {
    flexDirection: "row",
    alignItems: "center",
    width: 112,
    height: 53,
    borderRadius: 16,
    backgroundColor: "#333",
    margin: 34,
    marginLeft: 20,
    justifyContent: "center",
  },
  favouritesButton: {
    flexDirection: "row",
    alignItems: "center",
    width: 139,
    height: 53,
    borderRadius: 16,
    backgroundColor: "#333",
    margin: 34,
    marginRight: 20,
    justifyContent: "center",
  },
  icon: {
    marginRight: 11,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#5CD4FF",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptySubtext: {
    color: "#666",
    fontSize: 12,
    marginTop: 8,
  },
});
