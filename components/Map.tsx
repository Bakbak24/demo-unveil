import React from "react";
import { StyleSheet, View, TouchableOpacity, Alert, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Mapbox from "@rnmapbox/maps";

Mapbox.setAccessToken(
  "pk.eyJ1IjoiemFrYWJhayIsImEiOiJjbTY5bGExdXIwY2V1MmlzZHBuN2Nvd3J1In0.Rlp8SLzrBJrDNO9rmIXszA"
);

const Map = () => {
  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        scaleBarEnabled={false}
        logoPosition={{ bottom: -20, left: -100 }}
        attributionPosition={{ bottom: -20, left: -20 }}
      />
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

{
  /* import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window"); */
}

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
});
