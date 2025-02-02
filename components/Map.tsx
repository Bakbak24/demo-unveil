import React from "react";
import { StyleSheet, View } from "react-native";
import Mapbox from "@rnmapbox/maps";

Mapbox.setAccessToken(
  "pk.eyJ1IjoiemFrYWJhayIsImEiOiJjbTY5bGExdXIwY2V1MmlzZHBuN2Nvd3J1In0.Rlp8SLzrBJrDNO9rmIXszA"
);

const Map = () => {
  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Mapbox.MapView style={styles.map} />
      </View>
    </View>
  );
};

export default Map;

import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
    page: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        height: height,
        width: width,
    },
    map: {
        flex: 1,
    },
});
