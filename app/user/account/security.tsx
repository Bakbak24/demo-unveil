import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { API_CONFIG } from "../../../config/api";

export default function SecurityScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const { getToken, isLoggedIn, user } = useAuth();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        console.log('Auth check - isLoggedIn:', isLoggedIn);
        console.log('Auth check - user:', user ? 'User exists' : 'No user');
        console.log('Auth check - token:', token ? 'Token exists' : 'No token');
        setAuthChecked(true);
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, []);

  const validatePasswords = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All password fields are required");
      return false;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long");
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return false;
    }

    if (currentPassword === newPassword) {
      Alert.alert("Error", "New password must be different from current password");
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) {
      return;
    }

    console.log('isLoggedIn:', isLoggedIn);
    
    if (!isLoggedIn) {
      Alert.alert("Error", "Please log in again");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      
      console.log('Token retrieved:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        Alert.alert("Error", "Authentication failed. Please log in again");
        return;
      }

      console.log('Attempting to change password...');
      console.log('API URL:', `${API_CONFIG.BASE_URL}/auth/change-password`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Change password response:', data);

      if (response.ok) {
        Alert.alert("Success", "Password changed successfully");
        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const errorMessage = data.message || data.error || "Failed to change password";
        console.error('Password change failed:', errorMessage);
        
        if (response.status === 401) {
          Alert.alert("Error", "Session expired. Please log in again");
        } else {
          Alert.alert("Error", errorMessage);
        }
      }
    } catch (error) {
      console.error("Error changing password:", error);
      Alert.alert("Error", "Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!authChecked ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4FC3F7" />
          <Text style={styles.loadingText}>Checking authentication...</Text>
        </View>
      ) : !isLoggedIn ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please log in to change your password</Text>
        </View>
      ) : (
        <>
          {/* Change Password Section */}
          <Text style={styles.sectionTitle}>Change Password</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter current password"
              placeholderTextColor="#888"
              secureTextEntry={true}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              placeholderTextColor="#888"
              secureTextEntry={true}
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor="#888"
              secureTextEntry={true}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <Text style={styles.requirementText}>• At least 6 characters long</Text>
            <Text style={styles.requirementText}>• Different from current password</Text>
            <Text style={styles.requirementText}>• Should be unique and secure</Text>
          </View>

          {/* Save Changes Button */}
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Change Password</Text>
            )}
          </TouchableOpacity>

          {/* Security Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Security Tips:</Text>
            <Text style={styles.tipText}>• Use a strong, unique password</Text>
            <Text style={styles.tipText}>• Don't share your password with anyone</Text>
            <Text style={styles.tipText}>• Change your password regularly</Text>
            <Text style={styles.tipText}>• Use a password manager for better security</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#333",
    color: "white",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  requirementsContainer: {
    backgroundColor: "#333",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  requirementsTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  requirementText: {
    color: "#888",
    fontSize: 14,
    marginBottom: 4,
  },
  saveButton: {
    backgroundColor: "#5CD4FF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  saveButtonDisabled: {
    backgroundColor: "#666",
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  tipsContainer: {
    backgroundColor: "#2A2A2A",
    padding: 16,
    borderRadius: 10,
    marginTop: "auto",
  },
  tipsTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tipText: {
    color: "#888",
    fontSize: 14,
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "white",
    fontSize: 16,
  },
});