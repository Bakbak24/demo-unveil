import { Text, View, StyleSheet } from "react-native";

export default function PrivacyScreen() {
  return (
    <View style={styles.container}>
      <Text>Privacy Policy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
  },
});
