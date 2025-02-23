import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";

export default function UserLayout() {
  return (
    <View style={styles.container}>
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#212121" },
        headerTitleStyle: { color: "white", fontSize: 20 },
        headerTintColor: "#5CD4FF",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="account" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="about" />
      <Stack.Screen name="permissions" />
      <Stack.Screen name="language" />
    </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
  },
});