import { Stack } from "expo-router";

export default function UserLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#212121" },
        headerTitleStyle: { color: "white", fontSize: 20 },
        headerTintColor: "#5CD4FF",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="account" />
      <Stack.Screen name="about" />
      <Stack.Screen name="permissions" />
      <Stack.Screen name="language" />
    </Stack>
  );
}
