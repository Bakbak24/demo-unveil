import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  Text,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Mapbox, { MarkerView, Camera, LocationPuck } from "@rnmapbox/maps";
import { useRouter } from "expo-router";

Mapbox.setAccessToken(
  "pk.eyJ1IjoiemFrYWJhayIsImEiOiJjbTY5bGExdXIwY2V1MmlzZHBuN2Nvd3J1In0.Rlp8SLzrBJrDNO9rmIXszA"
);

const mockSoundSpots = [
  {
    id: 1,
    name: "Soundspot Dijle",
    script: "Dit is een script voor soundspot Dijle",
    location: { latitude: 4.487757, longitude: 51.022894 }, // Mechelen, België
    audio: "audio_dijle.mp3",
  },
  {
    id: 2,
    name: "Soundspot Dossinkazerne",
    script: "Dit is een script voor soundspot Dossinkazerne",
    location: { latitude: 4.48666, longitude: 51.022755 }, // Mechelen, België
    audio: "audio_dossinkazerne.mp3",
  },
  {
    id: 3,
    name: "Soundspot Campus De Ham",
    script: "Dit is een script voor soundspot Campus De Ham",
    location: { latitude: 4.487911, longitude: 51.022523 }, // Mechelen, België
    audio: "audio_campus_de_ham.mp3",
  },
];

const Map = () => {
  const [soundSpots, setSoundSpots] = useState(mockSoundSpots);
  const router = useRouter();

  // Pas als de backend klaar is kan ik een echte fetch doen, in plaats van de mockSoundSpots
  useEffect(() => {
    // fetch('https://api.backend.com/soundspots')
    //   .then(response => response.json())
    //   .then(data => setSoundSpots(data))
    //   .catch(error => console.error(error));
  }, []);

  const handleMarkerPress = (soundSpot: {
    id: number;
    name: string;
    script: any;
    location: { latitude: number; longitude: number };
    audio: any;
  }) => {
    router.push({
      pathname: "/audio",
      params: {
        audio: soundSpot.audio,
        text: soundSpot.script,
      },
    });
  };

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
          <MarkerView
            key={spot.id}
            coordinate={[spot.location.latitude, spot.location.longitude]}
          >
            <TouchableOpacity onPress={() => handleMarkerPress(spot)}>
              <Image
                source={require("../assets/images/sound-spot.png")}
                style={styles.soundSpotImage}
              />
            </TouchableOpacity>
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
