import { Text, View, StyleSheet } from "react-native";

export default function PermissionsScreen() {
  return (
    <View style={styles.container}>
      <Text>Permissions screen</Text>
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
