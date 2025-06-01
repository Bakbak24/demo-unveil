import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/api';

interface SubscriptionData {
  hasAccess: boolean;
  isLifetimeUser: boolean;
  subscriptionType: string | null;
  subscriptionEndDate: string | null;
  subscription: any | null;
}

export const useSubscription = () => {
  const { user, isLoggedIn, getToken } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    hasAccess: false,
    isLifetimeUser: false,
    subscriptionType: null,
    subscriptionEndDate: null,
    subscription: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscriptionStatus = async () => {
    if (!isLoggedIn || !user) {
      setSubscriptionData({
        hasAccess: false,
        isLifetimeUser: false,
        subscriptionType: null,
        subscriptionEndDate: null,
        subscription: null,
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('No authentication token');
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
        setSubscriptionData({
          hasAccess: data.hasAccess,
          isLifetimeUser: data.isLifetimeUser,
          subscriptionType: data.subscriptionType,
          subscriptionEndDate: data.subscriptionEndDate,
          subscription: data.subscription,
        });
      } else {
        throw new Error(data.message || 'Failed to check subscription status');
      }
    } catch (err) {
      console.error('Error checking subscription status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSubscriptionData({
        hasAccess: false,
        isLifetimeUser: false,
        subscriptionType: null,
        subscriptionEndDate: null,
        subscription: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSubscription = async () => {
    if (!isLoggedIn || !user) {
      return null;
    }

    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/subscriptions/current`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.subscription;
      } else {
        throw new Error(data.message || 'Failed to get current subscription');
      }
    } catch (err) {
      console.error('Error getting current subscription:', err);
      return null;
    }
  };

  const refreshSubscriptionStatus = () => {
    checkSubscriptionStatus();
  };

  useEffect(() => {
    checkSubscriptionStatus();
  }, [isLoggedIn, user]);

  return {
    ...subscriptionData,
    loading,
    error,
    refreshSubscriptionStatus,
    getCurrentSubscription,
  };
}; 