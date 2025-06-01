import React, { createContext, useContext, useState, useEffect } from 'react';
import { favoritesAPI, Favorite } from '../services/api';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  // State
  favorites: Favorite[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchFavorites: () => Promise<void>;
  addToFavorites: (itemId: string, itemType: 'soundspot' | 'audioItem') => Promise<void>;
  removeFromFavorites: (favoriteId: string) => Promise<void>;
  isFavorite: (itemId: string, itemType: 'soundspot' | 'audioItem') => boolean;
  getFavoriteId: (itemId: string, itemType: 'soundspot' | 'audioItem') => string | null;
  clearError: () => void;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isLoading: false,
  error: null,
  fetchFavorites: async () => {},
  addToFavorites: async () => {},
  removeFromFavorites: async () => {},
  isFavorite: () => false,
  getFavoriteId: () => null,
  clearError: () => {},
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isLoggedIn } = useAuth();

  // Fetch user's favorites
  const fetchFavorites = async () => {
    if (!isLoggedIn) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await favoritesAPI.getAll();
      setFavorites(data);
    } catch (err: any) {
      console.error('Error fetching favorites:', err);
      setError(err.response?.data?.message || 'Failed to fetch favorites');
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to favorites
  const addToFavorites = async (itemId: string, itemType: 'soundspot' | 'audioItem') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newFavorite = await favoritesAPI.add(itemId, itemType);
      setFavorites(prev => [newFavorite, ...prev]);
    } catch (err: any) {
      console.error('Error adding to favorites:', err);
      setError(err.response?.data?.message || 'Failed to add to favorites');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from favorites
  const removeFromFavorites = async (favoriteId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await favoritesAPI.remove(favoriteId);
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
    } catch (err: any) {
      console.error('Error removing from favorites:', err);
      setError(err.response?.data?.message || 'Failed to remove from favorites');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if an item is in favorites
  const isFavorite = (itemId: string, itemType: 'soundspot' | 'audioItem'): boolean => {
    return favorites.some(fav => fav.itemId === itemId && fav.itemType === itemType);
  };

  // Get favorite ID for an item
  const getFavoriteId = (itemId: string, itemType: 'soundspot' | 'audioItem'): string | null => {
    const favorite = favorites.find(fav => fav.itemId === itemId && fav.itemType === itemType);
    return favorite ? favorite.id : null;
  };

  const clearError = () => setError(null);

  // Auto-fetch favorites when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [isLoggedIn]);

  const value = {
    favorites,
    isLoading,
    error,
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoriteId,
    clearError,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
} 