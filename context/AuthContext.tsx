import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import API_CONFIG from "../config/api";

type User = {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  role?: string;
  token: string;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'reviewer';
  token: string;
  isAdmin: true;
};

type AuthContextType = {
  user: User | null;
  adminUser: AdminUser | null;
  isLoggedIn: boolean;
  isAdminLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  adminLogout: () => Promise<void>;
  getUserId: () => string | null;
  getAdminId: () => string | null;
  getToken: () => string | null;
  getAdminToken: () => string | null;
  clearError: () => void;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (profileData: Partial<User>) => Promise<void>;
  updateProfilePicture: (imageUri: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  adminUser: null,
  isLoggedIn: false,
  isAdminLoggedIn: false,
  isLoading: false,
  error: null,
  signup: async () => {},
  login: async () => {},
  adminLogin: async () => {},
  logout: async () => {},
  adminLogout: async () => {},
  getUserId: () => null,
  getAdminId: () => null,
  getToken: () => null,
  getAdminToken: () => null,
  clearError: () => {},
  fetchUserProfile: async () => {},
  updateUserProfile: async () => {},
  updateProfilePicture: async () => {},
});

// Configure axios defaults
axios.defaults.timeout = API_CONFIG.TIMEOUT;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    const loadStoredUsers = async () => {
      try {
        // Load regular user
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Only set as regular user if not admin/reviewer
          if (userData.role !== 'admin' && userData.role !== 'reviewer') {
            setUser(userData);
            setIsLoggedIn(true);
            axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
          }
        }

        // Load admin user separately
        const storedAdminUser = await AsyncStorage.getItem("adminUser");
        if (storedAdminUser) {
          const adminUserData = JSON.parse(storedAdminUser);
          setAdminUser(adminUserData);
          setIsAdminLoggedIn(true);
          // Don't set default axios headers for admin - we'll handle this per request
        }
      } catch (err) {
        console.error("Error loading stored users:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredUsers();
  }, []);

  // Signup function (only for regular users)
  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endpoint = `${API_CONFIG.BASE_URL}/auth/signup`;
      console.log(`Using signup endpoint: ${endpoint}`);
      
      const response = await axios.post(endpoint, { name, email, password }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`Signup successful:`, JSON.stringify(response.data));
      
      const userData = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role || 'user',
        token: response.data.token
      };
      
      if (!userData.id || !userData.token) {
        throw new Error("Invalid response from server - missing user data");
      }
      
      // Only store as regular user if not admin/reviewer
      if (userData.role !== 'admin' && userData.role !== 'reviewer') {
        setUser(userData);
        setIsLoggedIn(true);
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
      } else {
        throw new Error("Admin/Reviewer accounts cannot be created through regular signup");
      }
      
      console.log("User data stored successfully:", userData);
      
    } catch (err: any) {
      console.error('Signup error:', err);
      
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError("Network error. Please check your connection and try again.");
        } else {
          const status = err.response.status;
          const responseData = err.response.data;
          
          if (status === 400) {
            setError(responseData.message || "Invalid signup data");
          } else if (status === 409) {
            setError("Email already in use");
          } else {
            setError(responseData.message || `Signup failed. Please try again.`);
          }
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Regular user login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endpoint = `${API_CONFIG.BASE_URL}/auth/login`;
      console.log(`Using login endpoint: ${endpoint}`);
      
      const response = await axios.post(endpoint, { email, password }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`Login successful:`, JSON.stringify(response.data));
      
      const userData = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        token: response.data.token
      };
      
      if (!userData.id || !userData.token) {
        throw new Error("Invalid response from server - missing user data");
      }
      
      // Check if this is an admin/reviewer trying to login through regular login
      if (userData.role === 'admin' || userData.role === 'reviewer') {
        throw new Error("Admin and reviewer accounts must use the admin login page");
      }
      
      // Store as regular user
      setUser(userData);
      setIsLoggedIn(true);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
      
      console.log("User data stored successfully:", userData);
      
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError("Network error. Please check your connection and try again.");
        } else {
          const status = err.response.status;
          const responseData = err.response.data;
          
          if (status === 400 || status === 401) {
            setError("Invalid email or password");
          } else {
            setError(responseData.message || `Login failed. Please try again.`);
          }
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('Logging out user...');
      
      // Clear user data from state
      setUser(null);
      setIsLoggedIn(false);
      setError(null);
      
      // Remove user data from AsyncStorage
      await AsyncStorage.removeItem("user");
      
      // Clear auth token from axios defaults
      delete axios.defaults.headers.common["Authorization"];
      
      console.log('User logged out successfully');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Utility functions to get user data
  const getUserId = () => user?.id || null;
  const getToken = () => user?.token || null;

  // Clear error function
  const clearError = () => setError(null);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const endpoint = `${API_CONFIG.BASE_URL}/auth/profile`;
      const response = await axios.get(endpoint);
      
      const userData = {
        ...user,
        ...response.data,
        token: user?.token || ''
      };
      
      setUser(userData);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
    } catch (err: any) {
      console.error('Fetch profile error:', err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        // Token expired, logout user
        await logout();
      }
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const endpoint = `${API_CONFIG.BASE_URL}/auth/profile`;
      const response = await axios.put(endpoint, profileData);
      
      const userData = {
        ...user,
        ...response.data.user,
        token: user?.token || ''
      };
      
      setUser(userData);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
    } catch (err: any) {
      console.error('Update profile error:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          await logout();
        } else {
          setError(err.response?.data?.message || "Failed to update profile");
        }
      } else {
        setError("An unexpected error occurred");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile picture
  const updateProfilePicture = async (imageUri: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);
      
      const endpoint = `${API_CONFIG.BASE_URL}/auth/profile/picture`;
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const userData = {
        ...user,
        ...response.data.user,
        token: user?.token || ''
      };
      
      setUser(userData);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
    } catch (err: any) {
      console.error('Update profile picture error:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          await logout();
        } else {
          setError(err.response?.data?.message || "Failed to update profile picture");
        }
      } else {
        setError("An unexpected error occurred");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Admin login function
  const adminLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endpoint = `${API_CONFIG.BASE_URL}/auth/login`;
      console.log(`Using admin login endpoint: ${endpoint}`);
      
      const response = await axios.post(endpoint, { email, password }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`Admin login successful:`, JSON.stringify(response.data));
      
      const userData = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        token: response.data.token
      };
      
      if (!userData.id || !userData.token) {
        throw new Error("Invalid response from server - missing user data");
      }
      
      // Check if this is actually an admin/reviewer
      if (userData.role !== 'admin' && userData.role !== 'reviewer') {
        throw new Error("This account does not have admin or reviewer privileges");
      }
      
      // Store as admin user
      const adminUserData: AdminUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role as 'admin' | 'reviewer',
        token: userData.token,
        isAdmin: true
      };
      
      setAdminUser(adminUserData);
      setIsAdminLoggedIn(true);
      await AsyncStorage.setItem("adminUser", JSON.stringify(adminUserData));
      
      console.log("Admin user data stored successfully:", adminUserData);
      
    } catch (err: any) {
      console.error('Admin login error:', err);
      
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError("Network error. Please check your connection and try again.");
        } else {
          const status = err.response.status;
          const responseData = err.response.data;
          
          if (status === 400 || status === 401) {
            setError("Invalid email or password");
          } else {
            setError(responseData.message || `Admin login failed. Please try again.`);
          }
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Admin logout function
  const adminLogout = async () => {
    try {
      console.log('Logging out admin user...');
      
      // Clear admin user data from state
      setAdminUser(null);
      setIsAdminLoggedIn(false);
      setError(null);
      
      // Remove admin user data from AsyncStorage
      await AsyncStorage.removeItem("adminUser");
      
      console.log('Admin user logged out successfully');
    } catch (err) {
      console.error("Admin logout error:", err);
    }
  };

  // Admin utility functions
  const getAdminId = () => adminUser?.id || null;
  const getAdminToken = () => adminUser?.token || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        isLoggedIn,
        isAdminLoggedIn,
        isLoading,
        error,
        signup,
        login,
        adminLogin,
        logout,
        adminLogout,
        getUserId,
        getAdminId,
        getToken,
        getAdminToken,
        clearError,
        fetchUserProfile,
        updateUserProfile,
        updateProfilePicture,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
