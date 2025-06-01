import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: string;
}

export default function AuthGuard({ children, fallback = "/(auth)/intro" }: AuthGuardProps) {
  const { isLoggedIn, isLoading } = useAuth();

  // Show loading spinner while checking authentication status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#212121' }}>
        <ActivityIndicator size="large" color="#5CD4FF" />
      </View>
    );
  }

  // Redirect to auth if not logged in
  if (!isLoggedIn) {
    return <Redirect href={fallback as any} />;
  }

  // Render children if authenticated
  return <>{children}</>;
} 