import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Text, TouchableOpacity } from "react-native";
// import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import Map from "@/components/Map";
// import * as Location from "expo-location";

export default function Index() {

  return (
    <Map />
  );
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
