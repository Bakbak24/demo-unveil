import React from "react";
import { StyleSheet, View, TouchableOpacity, Alert, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Mapbox, { MarkerView, Camera, LocationPuck } from "@rnmapbox/maps";

Mapbox.setAccessToken(
  "pk.eyJ1IjoiemFrYWJhayIsImEiOiJjbTY5bGExdXIwY2V1M2lzZHBuN2Nvd3J1In0.Rlp8SLzrBJrDNO9rmIXszA"
);

const soundSpots = [
  { id: 1, coordinates: [4.487911, 51.022523] },
  { id: 2, coordinates: [4.486660, 51.022755] },
  { id: 3, coordinates: [4.487757, 51.022894] },
];

const Map = () => {
  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        scaleBarEnabled={false}
        logoPosition={{ bottom: -20, left: -100 }}
        attributionPosition={{ bottom: -20, left: -20 }}
        styleURL={Mapbox.StyleURL.Dark}
      >
        {/* Camera gefixeerd op Thomas More */}
        <Camera
          zoomLevel={17.5}
          centerCoordinate={[4.487538, 51.022563]}
          animationMode="flyTo"
          animationDuration={2000}
        />

        {/* Soundspots markers */}
        {soundSpots.map((spot) => (
          <MarkerView key={spot.id} coordinate={spot.coordinates}>
            <View>
              {/* Vervang het vraagteken door de afbeelding */}
              <Image
                source={require("../assets/images/sound-spot.png")}
                style={styles.soundSpotImage}
              />
            </View>
          </MarkerView>
        ))}

        {/* Locatie-indicator (vaste plek) */}
        <LocationPuck puckBearing="course" puckBearingEnabled={true} />
      </Mapbox.MapView>

      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.themesButton}
          onPress={() => Alert.alert("Themes", "Themes button pressed!")}
        >
          <Ionicons
            name="bookmark-outline"
            size={24}
            color="white"
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Theme</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favouritesButton}
          onPress={() =>
            Alert.alert("Favourites", "Favourites button pressed!")
          }
        >
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
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
  soundSpotMarker: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  soundSpotImage: {
    width: 56,
    height: 56,
  },
});