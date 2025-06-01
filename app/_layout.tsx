import { Stack } from 'expo-router';
import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from '../context/AuthContext';
import { SoundspotsProvider } from '../context/SoundspotsContext';
import { AudioItemsProvider } from '../context/AudioItemsContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { STRIPE_CONFIG } from '../config/stripe';

export default function RootLayout() {
  return (
    <StripeProvider publishableKey={STRIPE_CONFIG.PUBLISHABLE_KEY}>
      <AuthProvider>
        <SoundspotsProvider>
          <AudioItemsProvider>
            <FavoritesProvider>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="user" options={{ headerShown: false }} />
                <Stack.Screen name="admin" options={{ headerShown: false }} />
                <Stack.Screen name="for-you" options={{ headerShown: false }} />
                <Stack.Screen name="new-stories" options={{ headerShown: false }} />
                <Stack.Screen name="best-reviewed-stories" options={{ headerShown: false }} />
                <Stack.Screen name="audio-player" options={{ headerShown: false }} />
                <Stack.Screen name="soundspot-detail" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </FavoritesProvider>
          </AudioItemsProvider>
        </SoundspotsProvider>
      </AuthProvider>
    </StripeProvider>
  );
}