import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="user"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="new-stories"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="+not-found" options={{}} />
    </Stack>
  );
}
