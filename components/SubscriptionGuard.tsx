import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/api';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

export default function SubscriptionGuard({ children, fallbackMessage }: SubscriptionGuardProps) {
  const { user, isLoggedIn, getToken } = useAuth();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscriptionAccess();
  }, [isLoggedIn, user]);

  const checkSubscriptionAccess = async () => {
    if (!isLoggedIn || !user) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/subscriptions/check-access`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setHasAccess(data.hasAccess);
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Error checking subscription access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    router.push('/user/account/subscription-plans');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5CD4FF" />
        <Text style={styles.loadingText}>Checking subscription status...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Ionicons name="person-outline" size={80} color="#666" />
        <Text style={styles.title}>Login Required</Text>
        <Text style={styles.message}>
          Please log in to access this feature.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (hasAccess === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="lock-closed" size={80} color="#FF6B6B" />
        <Text style={styles.title}>Subscription Required</Text>
        <Text style={styles.message}>
          {fallbackMessage || 
            "You need an active subscription to access this feature. Choose from our flexible plans to unlock all content."}
        </Text>
        
        <View style={styles.planHighlights}>
          <View style={styles.highlight}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.highlightText}>Access to all soundspots</Text>
          </View>
          <View style={styles.highlight}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.highlightText}>Premium audio tours</Text>
          </View>
          <View style={styles.highlight}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.highlightText}>Offline downloads</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubscribe}>
          <Ionicons name="card" size={20} color="white" />
          <Text style={styles.buttonText}>View Subscription Plans</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#212121',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  planHighlights: {
    marginBottom: 32,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  highlightText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
  },
  button: {
    backgroundColor: '#5CD4FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 250,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    color: '#888',
    fontSize: 16,
  },
}); 