import React, { createContext, useContext, useState, useEffect } from 'react';
import { soundspotsAPI, Soundspot } from '../services/api';
import { useAuth } from './AuthContext';
import axios from 'axios';
import API_CONFIG from '../config/api';

interface SoundspotsContextType {
  // State
  soundspots: Soundspot[];
  mySpots: Soundspot[];
  pendingSpots: Soundspot[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSoundspots: () => Promise<void>;
  fetchMySpots: () => Promise<void>;
  fetchPendingSpots: () => Promise<void>;
  createSoundspot: (spotData: {
    name: string;
    latitude: number;
    longitude: number;
    script?: string;
    audio: any;
  }) => Promise<void>;
  uploadSpot: (spotData: {
    audio: any;
    latitude: number;
    longitude: number;
    termsAccepted: boolean;
    name?: string;
    script?: string;
  }) => Promise<void>;
  updateSpotLocation: (spotId: string, latitude: number, longitude: number) => Promise<void>;
  deleteSpot: (spotId: string) => Promise<void>;
  reviewSpot: (spotId: string, approved: boolean, notes?: string) => Promise<void>;
  clearError: () => void;
}

const SoundspotsContext = createContext<SoundspotsContextType>({
  soundspots: [],
  mySpots: [],
  pendingSpots: [],
  isLoading: false,
  error: null,
  fetchSoundspots: async () => {},
  fetchMySpots: async () => {},
  fetchPendingSpots: async () => {},
  createSoundspot: async () => {},
  uploadSpot: async () => {},
  updateSpotLocation: async () => {},
  deleteSpot: async () => {},
  reviewSpot: async () => {},
  clearError: () => {},
});

export function SoundspotsProvider({ children }: { children: React.ReactNode }) {
  const [soundspots, setSoundspots] = useState<Soundspot[]>([]);
  const [mySpots, setMySpots] = useState<Soundspot[]>([]);
  const [pendingSpots, setPendingSpots] = useState<Soundspot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isLoggedIn, user, adminUser, isAdminLoggedIn, getAdminToken } = useAuth();

  // Helper function to make admin API calls with admin token
  const makeAdminAPICall = async (url: string, options: any = {}) => {
    const adminToken = getAdminToken();
    if (!adminToken) {
      throw new Error('Admin authentication required');
    }

    const response = await axios({
      url: `${API_CONFIG.BASE_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: API_CONFIG.TIMEOUT,
      ...options,
    });

    return response;
  };

  // Fetch all approved soundspots (public)
  const fetchSoundspots = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await soundspotsAPI.getAllApproved();
      setSoundspots(data);
    } catch (err: any) {
      console.error('Error fetching soundspots:', err);
      setError(err.response?.data?.message || 'Failed to fetch soundspots');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's own spots
  const fetchMySpots = async () => {
    if (!isLoggedIn) {
      console.log('fetchMySpots: User not logged in');
      return;
    }
    
    console.log('fetchMySpots: Starting fetch...');
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await soundspotsAPI.getMySpots();
      console.log('fetchMySpots: API response:', data);
      setMySpots(data.spots);
    } catch (err: any) {
      console.error('Error fetching my spots:', err);
      setError(err.response?.data?.message || 'Failed to fetch your spots');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pending spots (admin/reviewer only) - Updated to use admin authentication
  const fetchPendingSpots = async () => {
    if (!isAdminLoggedIn || !adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'reviewer')) {
      console.log('fetchPendingSpots: Admin authentication required');
      setError('Admin authentication required');
      return;
    }
    
    console.log('fetchPendingSpots: Starting fetch with admin token...');
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await makeAdminAPICall('/soundspots/pending', {
        method: 'GET',
      });
      
      console.log('fetchPendingSpots: API response:', response.data);
      
      // Transform _id to id for frontend compatibility
      const transformedSpots = response.data.spots.map((spot: any) => ({
        ...spot,
        id: spot._id || spot.id
      }));
      
      setPendingSpots(transformedSpots);
    } catch (err: any) {
      console.error('Error fetching pending spots:', err);
      setError(err.response?.data?.message || 'Failed to fetch pending spots');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new soundspot (client-specified POST /soundspot)
  const createSoundspot = async (spotData: {
    name: string;
    latitude: number;
    longitude: number;
    script?: string;
    audio: any;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await soundspotsAPI.createSoundspot(spotData);
      // Refresh soundspots after creation
      await fetchSoundspots();
    } catch (err: any) {
      console.error('Error creating soundspot:', err);
      setError(err.response?.data?.message || 'Failed to create soundspot');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Upload a new spot
  const uploadSpot = async (spotData: {
    audio: any;
    latitude: number;
    longitude: number;
    termsAccepted: boolean;
    name?: string;
    script?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await soundspotsAPI.uploadSpot(spotData);
      // Refresh my spots after upload
      await fetchMySpots();
    } catch (err: any) {
      console.error('Error uploading spot:', err);
      setError(err.response?.data?.message || 'Failed to upload spot');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update spot location
  const updateSpotLocation = async (spotId: string, latitude: number, longitude: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await soundspotsAPI.updateLocation(spotId, latitude, longitude);
      // Refresh my spots after update
      await fetchMySpots();
    } catch (err: any) {
      console.error('Error updating spot location:', err);
      setError(err.response?.data?.message || 'Failed to update spot location');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a spot
  const deleteSpot = async (spotId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await soundspotsAPI.deleteSpot(spotId);
      // Remove from local state
      setMySpots(prev => prev.filter(spot => spot.id !== spotId));
      setSoundspots(prev => prev.filter(spot => spot.id !== spotId));
      setPendingSpots(prev => prev.filter(spot => spot.id !== spotId));
    } catch (err: any) {
      console.error('Error deleting spot:', err);
      setError(err.response?.data?.message || 'Failed to delete spot');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Review a spot (admin/reviewer only) - Updated to use admin authentication
  const reviewSpot = async (spotId: string, approved: boolean, notes?: string) => {
    if (!isAdminLoggedIn || !adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'reviewer')) {
      throw new Error('Admin authentication required');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await makeAdminAPICall('/soundspots/review', {
        method: 'POST',
        data: {
          spotId,
          approved,
          notes,
        },
      });
      
      console.log('reviewSpot: API response:', response.data);
      
      // Remove from pending spots after review
      setPendingSpots(prev => prev.filter(spot => spot.id !== spotId));
      
      // If approved, add to main soundspots list
      if (approved) {
        await fetchSoundspots();
      }
    } catch (err: any) {
      console.error('Error reviewing spot:', err);
      setError(err.response?.data?.message || 'Failed to review spot');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  // Auto-fetch soundspots on mount
  useEffect(() => {
    fetchSoundspots();
  }, []);

  // Auto-fetch user-specific data when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchMySpots();
      if (user?.role === 'admin' || user?.role === 'reviewer') {
        fetchPendingSpots();
      }
    } else {
      setMySpots([]);
      setPendingSpots([]);
    }
  }, [isLoggedIn, user?.role]);

  const value = {
    soundspots,
    mySpots,
    pendingSpots,
    isLoading,
    error,
    fetchSoundspots,
    fetchMySpots,
    fetchPendingSpots,
    createSoundspot,
    uploadSpot,
    updateSpotLocation,
    deleteSpot,
    reviewSpot,
    clearError,
  };

  return (
    <SoundspotsContext.Provider value={value}>
      {children}
    </SoundspotsContext.Provider>
  );
}

export function useSoundspots() {
  const context = useContext(SoundspotsContext);
  if (!context) {
    throw new Error('useSoundspots must be used within a SoundspotsProvider');
  }
  return context;
} 