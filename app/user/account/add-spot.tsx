import { View, Text, StyleSheet } from "react-native";
import { Stack } from "expo-router";

export default function AddSpotScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Add a Spot to the Map</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 18,
  },
});
