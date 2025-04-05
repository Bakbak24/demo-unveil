// app/layout.tsx
import { Stack } from 'expo-router';
// import { AuthProvider, useAuth } from '../context/AuthContext';

export default function RootLayout() {
  return (
    // <AuthProvider>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="account" options={{ headerShown: false }} />
      </Stack>
    // </AuthProvider>
  );
}