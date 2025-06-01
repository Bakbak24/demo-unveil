import { Platform } from 'react-native';

/**
 * API Configuration
 * 
 * For development:
 * - iOS Simulator: localhost:3000
 * - Android Emulator: 10.0.2.2:3000 (special IP that routes to host machine)
 * - Physical Device: Your computer's local network IP (like 192.168.1.x)
 * 
 * IMPORTANT:
 * - For using a physical Android device, replace LOCAL_IP with your actual computer's IP address
 * - You can find your IP by running 'ipconfig' on Windows or 'ifconfig' on Mac/Linux
 */

// Replace with your computer's actual local IP address when using a physical device
const LOCAL_IP = '192.168.46.176'; // Your computer's actual IP address

// Determine the base URL based on platform
const getBaseUrl = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      // For physical Android device, use the local IP
      // For Android emulator, use the special IP that routes to host machine
      return `http://${LOCAL_IP}:3000`;
    } else if (Platform.OS === 'ios') {
      // For iOS simulator, localhost works fine
      // For physical iOS device, use the local IP
      return `http://${LOCAL_IP}:3000`;
    } else {
      // Web or other platforms
      return 'http://localhost:3000';
    }
  } else {
    // Production mode - you would replace this with your actual production API URL
    return 'https://your-production-api.com';
  }
};

// API configuration
export const API_CONFIG = {
  // Base URL for all API calls
  BASE_URL: getBaseUrl(),
  
  // API request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Debug information
  DEBUG_INFO: {
    platform: Platform.OS,
    isDev: __DEV__,
    baseUrl: getBaseUrl(),
  },
  
  // API endpoints - aligned with client specifications
  ENDPOINTS: {
    // Authentication
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    PROFILE_PICTURE: '/auth/profile/picture',
    
    // Client-specified Soundspot endpoints (Map/Geo Locations)
    SOUNDSPOTS: '/soundspots',                    // GET /soundspots - Retrieve all soundspots
    SOUNDSPOT: '/soundspot',                      // POST /soundspot - Add new soundspot
    SOUNDSPOT_BY_ID: '/soundspot',                // GET /soundspot/{id} - Get specific soundspot
    
    // Client-specified Spots endpoints (Account/Upload)
    SPOTS_UPLOAD: '/spots/upload',                // POST /spots/upload - Upload spot for review
    SPOTS_REVIEW: '/spots/review',                // POST /spots/review - Review spot
    SPOTS_LOCATION: '/spots/location',            // POST /spots/location - Update spot location
    
    // Client-specified Audio endpoints
    AUDIO_FILE: '/audio',                         // GET /audio/{fileName} - Get audio file
    AUDIO_UPLOAD: '/audio/upload',                // POST /audio/upload - Upload audio file
    
    // Extended endpoints for enhanced functionality
    SPOTS_PENDING: '/spots/pending',              // GET /spots/pending - Admin pending spots
    SPOTS_MY: '/spots/my-spots',                  // GET /spots/my-spots - User's spots
    SPOTS_ADMIN_ALL: '/soundspots/admin/all',     // GET /soundspots/admin/all - All spots (admin)
    
    // Audio Items (Enhanced functionality)
    AUDIO_ITEMS: '/audio-items',
    AUDIO_ITEMS_NEW_STORIES: '/audio-items/new-stories',
    AUDIO_ITEMS_BEST_REVIEWED: '/audio-items/best-reviewed',
    AUDIO_ITEMS_BY_SOUNDSPOT: '/audio-items/by-soundspot',
    AUDIO_ITEMS_MY_ITEMS: '/audio-items/my-items',
    AUDIO_ITEMS_PLAY: '/audio-items/play',
    AUDIO_ITEMS_PENDING: '/audio-items/pending',
    AUDIO_ITEMS_REVIEW: '/audio-items/review',
    
    // Favorites
    FAVORITES: '/user/favorites',
  },
  
  // LocationIQ API configuration
  LOCATION_IQ: {
    API_KEY: 'pk.your_locationiq_api_key_here', // Replace with your actual LocationIQ API key
    BASE_URL: 'https://us1.locationiq.com/v1',
    ENDPOINTS: {
      SEARCH: '/search.php',
      REVERSE: '/reverse.php',
      AUTOCOMPLETE: '/autocomplete.php'
    }
  }
};

// Helper function to log API configuration for debugging
export const logApiConfig = () => {
  console.log('API Configuration:', {
    baseUrl: API_CONFIG.BASE_URL,
    platform: Platform.OS,
    isDev: __DEV__,
    debugInfo: API_CONFIG.DEBUG_INFO
  });
};

export default API_CONFIG; 