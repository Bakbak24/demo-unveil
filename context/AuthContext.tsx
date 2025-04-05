// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

type AuthContextType = {
  userToken: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  userToken: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Laad token bij opstarten app
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        setUserToken(token);
      } catch (error) {
        console.error('Failed to load token', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const authContext = {
    userToken,
    isLoading,
    signIn: async (token: string) => {
      try {
        await SecureStore.setItemAsync('userToken', token);
        setUserToken(token);
      } catch (error) {
        console.error('Failed to save token', error);
        throw error;
      }
    },
    signOut: async () => {
      try {
        await SecureStore.deleteItemAsync('userToken');
        setUserToken(null);
      } catch (error) {
        console.error('Failed to remove token', error);
        throw error;
      }
    },
    signUp: async (token: string) => {
      try {
        await SecureStore.setItemAsync('userToken', token);
        setUserToken(token);
      } catch (error) {
        console.error('Failed to save token', error);
        throw error;
      }
    },
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}