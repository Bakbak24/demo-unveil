import React, { createContext, useContext, useState, useEffect } from 'react';
import { audioItemsAPI, AudioItem } from '../services/api';
import { useAuth } from './AuthContext';

interface AudioItemsContextType {
  // State
  audioItems: AudioItem[];
  myAudioItems: AudioItem[];
  newStories: AudioItem[];
  bestReviewed: AudioItem[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAudioItems: () => Promise<void>;
  fetchMyAudioItems: () => Promise<void>;
  fetchNewStories: () => Promise<void>;
  fetchBestReviewed: () => Promise<void>;
  fetchAudioItemsBySoundspot: (soundspotId: string) => Promise<AudioItem[]>;
  createAudioItem: (itemData: {
    title: string;
    description?: string;
    audioUrl: string;
    duration?: number;
  }) => Promise<AudioItem>;
  uploadAudioItem: (itemData: {
    title: string;
    description?: string;
    category?: string;
    soundspot: string;
    audio: any;
  }) => Promise<AudioItem>;
  updateAudioItem: (id: string, itemData: Partial<AudioItem>) => Promise<AudioItem>;
  deleteAudioItem: (id: string) => Promise<void>;
  getAudioItemById: (id: string) => Promise<AudioItem>;
  trackPlay: (itemId: string) => Promise<void>;
  addReview: (itemId: string, rating: number, comment?: string) => Promise<void>;
  getReviews: (itemId: string, page?: number, limit?: number) => Promise<any>;
  clearError: () => void;
}

const AudioItemsContext = createContext<AudioItemsContextType>({
  audioItems: [],
  myAudioItems: [],
  newStories: [],
  bestReviewed: [],
  isLoading: false,
  error: null,
  fetchAudioItems: async () => {},
  fetchMyAudioItems: async () => {},
  fetchNewStories: async () => {},
  fetchBestReviewed: async () => {},
  fetchAudioItemsBySoundspot: async () => [],
  createAudioItem: async () => ({} as AudioItem),
  uploadAudioItem: async () => ({} as AudioItem),
  updateAudioItem: async () => ({} as AudioItem),
  deleteAudioItem: async () => {},
  getAudioItemById: async () => ({} as AudioItem),
  trackPlay: async () => {},
  addReview: async () => {},
  getReviews: async () => ({}),
  clearError: () => {},
});

export function AudioItemsProvider({ children }: { children: React.ReactNode }) {
  const [audioItems, setAudioItems] = useState<AudioItem[]>([]);
  const [myAudioItems, setMyAudioItems] = useState<AudioItem[]>([]);
  const [newStories, setNewStories] = useState<AudioItem[]>([]);
  const [bestReviewed, setBestReviewed] = useState<AudioItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isLoggedIn } = useAuth();

  // Fetch all audio items
  const fetchAudioItems = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await audioItemsAPI.getAll();
      setAudioItems(data);
    } catch (err: any) {
      console.error('Error fetching audio items:', err);
      setError(err.response?.data?.message || 'Failed to fetch audio items');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch new stories
  const fetchNewStories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await audioItemsAPI.getNewStories();
      setNewStories(data);
    } catch (err: any) {
      console.error('Error fetching new stories:', err);
      setError(err.response?.data?.message || 'Failed to fetch new stories');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch best reviewed stories
  const fetchBestReviewed = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await audioItemsAPI.getBestReviewed();
      setBestReviewed(data);
    } catch (err: any) {
      console.error('Error fetching best reviewed stories:', err);
      setError(err.response?.data?.message || 'Failed to fetch best reviewed stories');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's audio items
  const fetchMyAudioItems = async () => {
    if (!isLoggedIn) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await audioItemsAPI.getMyItems();
      setMyAudioItems(data);
    } catch (err: any) {
      console.error('Error fetching my audio items:', err);
      setError(err.response?.data?.message || 'Failed to fetch my audio items');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch audio items by soundspot
  const fetchAudioItemsBySoundspot = async (soundspotId: string): Promise<AudioItem[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await audioItemsAPI.getBySoundspot(soundspotId);
      return data;
    } catch (err: any) {
      console.error('Error fetching audio items by soundspot:', err);
      setError(err.response?.data?.message || 'Failed to fetch audio items by soundspot');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new audio item
  const createAudioItem = async (itemData: {
    title: string;
    description?: string;
    audioUrl: string;
    duration?: number;
  }): Promise<AudioItem> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newItem = await audioItemsAPI.create(itemData);
      setAudioItems(prev => [newItem, ...prev]);
      return newItem;
    } catch (err: any) {
      console.error('Error creating audio item:', err);
      setError(err.response?.data?.message || 'Failed to create audio item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Upload a new audio item with file
  const uploadAudioItem = async (itemData: {
    title: string;
    description?: string;
    category?: string;
    soundspot: string;
    audio: any;
  }): Promise<AudioItem> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newItem = await audioItemsAPI.upload(itemData);
      setAudioItems(prev => [newItem, ...prev]);
      return newItem;
    } catch (err: any) {
      console.error('Error uploading audio item:', err);
      setError(err.response?.data?.message || 'Failed to upload audio item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an audio item
  const updateAudioItem = async (id: string, itemData: Partial<AudioItem>): Promise<AudioItem> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedItem = await audioItemsAPI.update(id, itemData);
      setAudioItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      return updatedItem;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an audio item
  const deleteAudioItem = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await audioItemsAPI.delete(id);
      setAudioItems(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      console.error('Error deleting audio item:', err);
      setError(err.response?.data?.message || 'Failed to delete audio item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get audio item by ID
  const getAudioItemById = async (id: string): Promise<AudioItem> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const item = await audioItemsAPI.getById(id);
      return item;
    } catch (err: any) {
      console.error('Error fetching audio item:', err);
      setError(err.response?.data?.message || 'Failed to fetch audio item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Track play count
  const trackPlay = async (itemId: string) => {
    try {
      await audioItemsAPI.trackPlay(itemId);
    } catch (err: any) {
      console.error('Error tracking play:', err);
      // Don't set error state for this as it's not critical
    }
  };

  // Add review
  const addReview = async (itemId: string, rating: number, comment?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await audioItemsAPI.addReview(itemId, rating, comment);
    } catch (err: any) {
      console.error('Error adding review:', err);
      setError(err.response?.data?.message || 'Failed to add review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get reviews
  const getReviews = async (itemId: string, page: number = 1, limit: number = 10) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const reviews = await audioItemsAPI.getReviews(itemId, page, limit);
      return reviews;
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.response?.data?.message || 'Failed to fetch reviews');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  // Auto-fetch audio items on mount
  useEffect(() => {
    fetchAudioItems();
  }, []);

  const value = {
    audioItems,
    myAudioItems,
    newStories,
    bestReviewed,
    isLoading,
    error,
    fetchAudioItems,
    fetchMyAudioItems,
    fetchNewStories,
    fetchBestReviewed,
    fetchAudioItemsBySoundspot,
    createAudioItem,
    uploadAudioItem,
    updateAudioItem,
    deleteAudioItem,
    getAudioItemById,
    trackPlay,
    addReview,
    getReviews,
    clearError,
  };

  return (
    <AudioItemsContext.Provider value={value}>
      {children}
    </AudioItemsContext.Provider>
  );
}

export function useAudioItems() {
  const context = useContext(AudioItemsContext);
  if (!context) {
    throw new Error('useAudioItems must be used within an AudioItemsProvider');
  }
  return context;
} 