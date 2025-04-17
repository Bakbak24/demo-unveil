import { Stack, Redirect } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack>
      {/* Voeg deze redirect toe als eerste child */}
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
        listeners={{
          state: () => {
            return <Redirect href="/(auth)/intro" />;
          }
        }}
      />
      
      <Stack.Screen
        name="(auth)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="user"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="new-stories"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="new-for-you"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="+not-found" options={{}} />
    </Stack>
  );
}