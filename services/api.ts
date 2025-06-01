import axios from 'axios';
import API_CONFIG from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  role?: string;
}

export interface Soundspot {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  script?: string;
  audioUrl: string;
  publicId: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  } | string;
  approved: boolean;
  status: 'pending' | 'approved' | 'rejected';
  reviewerId?: string;
  reviewDate?: string;
  reviewNotes?: string;
  termsAccepted: boolean;
  audioItemsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AudioItem {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  duration?: number;
  category?: string;
  soundspot: {
    id: string;
    name: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
  createdBy: string;
  playCount?: number;
  averageRating?: number;
  totalReviews?: number;
  ratingDistribution?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  audioItem: string;
  user: {
    id: string;
    name: string;
  };
  rating: number;
  comment?: string;
  helpful: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  itemId: string;
  itemType: 'soundspot' | 'audioItem';
  userId: string;
  createdAt: string;
}

export interface LocationResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

// Configure axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`;
        }
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear stored user data
      AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: async (userData: { name: string; email: string; password: string; firstName?: string; lastName?: string; phone?: string }) => {
    const response = await api.post(API_CONFIG.ENDPOINTS.SIGNUP, userData);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post(API_CONFIG.ENDPOINTS.LOGIN, { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post(API_CONFIG.ENDPOINTS.LOGOUT);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get(API_CONFIG.ENDPOINTS.PROFILE);
    return response.data;
  },

  updateProfile: async (profileData: Partial<User>) => {
    const response = await api.put(API_CONFIG.ENDPOINTS.PROFILE, profileData);
    return response.data;
  },

  updateProfilePicture: async (imageUri: string) => {
    const formData = new FormData();
    formData.append('profilePicture', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    const response = await api.post(API_CONFIG.ENDPOINTS.PROFILE_PICTURE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProfilePicture: async () => {
    const response = await api.delete(API_CONFIG.ENDPOINTS.PROFILE_PICTURE);
    return response.data;
  },
};

// Soundspots API
export const soundspotsAPI = {
  // Client-specified endpoints - Map/Geo Locations
  
  // GET /soundspots - Retrieve all available soundspots
  getAllApproved: async (): Promise<Soundspot[]> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.SOUNDSPOTS);
    // Transform _id to id for frontend compatibility
    return response.data.map((spot: any) => ({
      ...spot,
      id: spot._id || spot.id
    }));
  },

  // GET /soundspot/{id} - Retrieve detailed information for specific soundspot
  getById: async (id: string): Promise<Soundspot> => {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.SOUNDSPOT_BY_ID}/${id}`);
    // Transform _id to id for frontend compatibility
    return {
      ...response.data,
      id: response.data._id || response.data.id
    };
  },

  // POST /soundspot - Add new soundspot to database
  createSoundspot: async (spotData: {
    name: string;
    latitude: number;
    longitude: number;
    script?: string;
    audio: any;
  }) => {
    const formData = new FormData();
    formData.append('audio', spotData.audio);
    formData.append('name', spotData.name);
    formData.append('latitude', spotData.latitude.toString());
    formData.append('longitude', spotData.longitude.toString());
    if (spotData.script) formData.append('script', spotData.script);

    const response = await api.post(API_CONFIG.ENDPOINTS.SOUNDSPOT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Client-specified endpoints - Account/Upload
  
  // POST /spots/upload - Upload spot for review
  uploadSpot: async (spotData: {
    audio: any;
    latitude: number;
    longitude: number;
    termsAccepted: boolean;
    name?: string;
    script?: string;
  }) => {
    const formData = new FormData();
    formData.append('audioFile', spotData.audio);
    formData.append('latitude', spotData.latitude.toString());
    formData.append('longitude', spotData.longitude.toString());
    formData.append('termsAccepted', spotData.termsAccepted.toString());
    if (spotData.name) formData.append('name', spotData.name);
    if (spotData.script) formData.append('script', spotData.script);

    const response = await api.post(API_CONFIG.ENDPOINTS.SPOTS_UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // POST /spots/review - Review spot (approve/reject)
  reviewSpot: async (spotId: string, approved: boolean, notes?: string) => {
    const response = await api.post(API_CONFIG.ENDPOINTS.SPOTS_REVIEW, {
      spotId,
      approved,
      notes,
    });
    return response.data;
  },

  // POST /spots/location - Update spot location
  updateLocation: async (spotId: string, latitude: number, longitude: number) => {
    const response = await api.post(API_CONFIG.ENDPOINTS.SPOTS_LOCATION, {
      spotId,
      latitude,
      longitude,
    });
    return response.data;
  },

  // Extended endpoints for enhanced functionality
  
  getMySpots: async (): Promise<{ spots: Soundspot[]; count: number }> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.SPOTS_MY);
    // Transform _id to id for frontend compatibility
    const transformedSpots = response.data.spots.map((spot: any) => ({
      ...spot,
      id: spot._id || spot.id
    }));
    return {
      ...response.data,
      spots: transformedSpots
    };
  },

  deleteSpot: async (id: string) => {
    const response = await api.delete(`${API_CONFIG.ENDPOINTS.SOUNDSPOTS}/${id}`);
    return response.data;
  },

  getPendingSpots: async (): Promise<{ spots: Soundspot[]; count: number }> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.SPOTS_PENDING);
    // Transform _id to id for frontend compatibility
    const transformedSpots = response.data.spots.map((spot: any) => ({
      ...spot,
      id: spot._id || spot.id
    }));
    return {
      ...response.data,
      spots: transformedSpots
    };
  },

  getAllSpots: async (): Promise<Soundspot[]> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.SPOTS_ADMIN_ALL);
    // Transform _id to id for frontend compatibility
    return response.data.map((spot: any) => ({
      ...spot,
      id: spot._id || spot.id
    }));
  },
};

// Audio API - Client-specified endpoints
export const audioAPI = {
  // GET /audio/{fileName} - Retrieve audio file from external storage
  getAudioFile: async (fileName: string) => {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.AUDIO_FILE}/${fileName}`);
    return response.data;
  },

  // POST /audio/upload - Upload audio to external storage
  uploadAudio: async (audioFile: any) => {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await api.post(API_CONFIG.ENDPOINTS.AUDIO_UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Audio Items API
export const audioItemsAPI = {
  getAll: async (): Promise<AudioItem[]> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.AUDIO_ITEMS);
    // Transform _id to id for frontend compatibility
    return response.data.map((item: any) => ({
      ...item,
      id: item._id || item.id
    }));
  },

  getById: async (id: string): Promise<AudioItem> => {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.AUDIO_ITEMS}/${id}`);
    // Transform _id to id for frontend compatibility
    return {
      ...response.data,
      id: response.data._id || response.data.id
    };
  },

  create: async (itemData: {
    title: string;
    description?: string;
    audioUrl: string;
    duration?: number;
  }): Promise<AudioItem> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.AUDIO_ITEMS, itemData);
    // Transform _id to id for frontend compatibility
    return {
      ...response.data,
      id: response.data._id || response.data.id
    };
  },

  upload: async (itemData: {
    title: string;
    description?: string;
    category?: string;
    soundspot: string;
    audio: any;
  }): Promise<AudioItem> => {
    const formData = new FormData();
    formData.append('audio', itemData.audio);
    formData.append('title', itemData.title);
    formData.append('soundspot', itemData.soundspot);
    if (itemData.description) formData.append('description', itemData.description);
    if (itemData.category) formData.append('category', itemData.category);

    const response = await api.post(API_CONFIG.ENDPOINTS.AUDIO_ITEMS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Transform _id to id for frontend compatibility
    return {
      ...response.data,
      id: response.data._id || response.data.id
    };
  },

  update: async (id: string, itemData: Partial<AudioItem>): Promise<AudioItem> => {
    const response = await api.put(`${API_CONFIG.ENDPOINTS.AUDIO_ITEMS}/${id}`, itemData);
    // Transform _id to id for frontend compatibility
    return {
      ...response.data,
      id: response.data._id || response.data.id
    };
  },

  delete: async (id: string) => {
    const response = await api.delete(`${API_CONFIG.ENDPOINTS.AUDIO_ITEMS}/${id}`);
    return response.data;
  },

  // Admin endpoints
  getPending: async (): Promise<AudioItem[]> => {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.AUDIO_ITEMS}/pending`);
    // Transform _id to id for frontend compatibility
    return response.data.map((item: any) => ({
      ...item,
      id: item._id || item.id
    }));
  },

  review: async (itemId: string, approved: boolean, notes?: string) => {
    const response = await api.post(`${API_CONFIG.ENDPOINTS.AUDIO_ITEMS}/review`, {
      itemId,
      approved,
      notes,
    });
    return response.data;
  },

  // New story categories
  getNewStories: async (): Promise<AudioItem[]> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.AUDIO_ITEMS_NEW_STORIES);
    return response.data.map((item: any) => ({
      ...item,
      id: item._id || item.id
    }));
  },

  getBestReviewed: async (): Promise<AudioItem[]> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.AUDIO_ITEMS_BEST_REVIEWED);
    return response.data.map((item: any) => ({
      ...item,
      id: item._id || item.id
    }));
  },

  getBySoundspot: async (soundspotId: string): Promise<AudioItem[]> => {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.AUDIO_ITEMS_BY_SOUNDSPOT}/${soundspotId}`);
    return response.data.map((item: any) => ({
      ...item,
      id: item._id || item.id
    }));
  },

  getMyItems: async (): Promise<AudioItem[]> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.AUDIO_ITEMS_MY_ITEMS);
    return response.data.map((item: any) => ({
      ...item,
      id: item._id || item.id
    }));
  },

  trackPlay: async (itemId: string) => {
    const response = await api.post(`${API_CONFIG.ENDPOINTS.AUDIO_ITEMS_PLAY}/${itemId}`);
    return response.data;
  },

  // Reviews
  addReview: async (itemId: string, rating: number, comment?: string): Promise<Review> => {
    const response = await api.post(`${API_CONFIG.ENDPOINTS.AUDIO_ITEMS}/${itemId}/reviews`, {
      rating,
      comment,
    });
    return response.data.review;
  },

  getReviews: async (itemId: string, page: number = 1, limit: number = 10) => {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.AUDIO_ITEMS}/${itemId}/reviews`, {
      params: { page, limit }
    });
    return response.data;
  },
};

// Favorites API
export const favoritesAPI = {
  getAll: async (): Promise<Favorite[]> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.FAVORITES);
    return response.data;
  },

  add: async (itemId: string, itemType: 'soundspot' | 'audioItem'): Promise<Favorite> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.FAVORITES, {
      itemId,
      itemType,
    });
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete(`${API_CONFIG.ENDPOINTS.FAVORITES}/${id}`);
    return response.data;
  },
};

// LocationIQ API for geocoding and reverse geocoding
export const locationAPI = {
  search: async (query: string): Promise<LocationResult[]> => {
    try {
      const response = await axios.get(`${API_CONFIG.LOCATION_IQ.BASE_URL}${API_CONFIG.LOCATION_IQ.ENDPOINTS.SEARCH}`, {
        params: {
          key: API_CONFIG.LOCATION_IQ.API_KEY,
          q: query,
          format: 'json',
          limit: 5,
          addressdetails: 1,
        },
      });
      return response.data;
    } catch (error) {
      console.error('LocationIQ search error:', error);
      throw error;
    }
  },

  reverse: async (latitude: number, longitude: number): Promise<LocationResult> => {
    try {
      const response = await axios.get(`${API_CONFIG.LOCATION_IQ.BASE_URL}${API_CONFIG.LOCATION_IQ.ENDPOINTS.REVERSE}`, {
        params: {
          key: API_CONFIG.LOCATION_IQ.API_KEY,
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1,
        },
      });
      return response.data;
    } catch (error) {
      console.error('LocationIQ reverse geocoding error:', error);
      throw error;
    }
  },

  autocomplete: async (query: string): Promise<LocationResult[]> => {
    try {
      const response = await axios.get(`${API_CONFIG.LOCATION_IQ.BASE_URL}${API_CONFIG.LOCATION_IQ.ENDPOINTS.AUTOCOMPLETE}`, {
        params: {
          key: API_CONFIG.LOCATION_IQ.API_KEY,
          q: query,
          format: 'json',
          limit: 5,
          addressdetails: 1,
        },
      });
      return response.data;
    } catch (error) {
      console.error('LocationIQ autocomplete error:', error);
      throw error;
    }
  },
};

export default api; 