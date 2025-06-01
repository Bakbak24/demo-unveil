import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from "../../../context/AuthContext";

export default function PersonalInfoScreen() {
  const { user, updateUserProfile, updateProfilePicture, fetchUserProfile, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''
      });
    }
    // Fetch latest profile data
    fetchUserProfile();
  }, []);

  // Clear error when user starts typing
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  // Handle profile picture change
  const handleChangeProfilePicture = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera roll is required!");
        return;
      }

      // Show action sheet
      Alert.alert(
        "Change Profile Picture",
        "Choose an option",
        [
          { text: "Camera", onPress: () => openCamera() },
          { text: "Photo Library", onPress: () => openImagePicker() },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } catch (error) {
      console.error('Error requesting permission:', error);
      Alert.alert("Error", "Failed to request permission");
    }
  };

  const openCamera = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera is required!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateProfilePicture(result.assets[0].uri);
        Alert.alert("Success", "Profile picture updated successfully!");
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const openImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateProfilePicture(result.assets[0].uri);
        Alert.alert("Success", "Profile picture updated successfully!");
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      setIsUpdating(true);
      clearError();

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        Alert.alert("Error", "Please enter a valid email address");
        return;
      }

      // Validate date of birth format
      if (formData.dateOfBirth) {
        const date = new Date(formData.dateOfBirth);
        if (isNaN(date.getTime())) {
          Alert.alert("Error", "Please enter a valid date of birth (YYYY-MM-DD)");
          return;
        }
      }

      // Prepare update data (only include non-empty fields)
      const updateData: any = {};
      if (formData.firstName.trim()) updateData.firstName = formData.firstName.trim();
      if (formData.lastName.trim()) updateData.lastName = formData.lastName.trim();
      if (formData.email.trim()) updateData.email = formData.email.trim();
      if (formData.phone.trim()) updateData.phone = formData.phone.trim();
      if (formData.dateOfBirth) updateData.dateOfBirth = formData.dateOfBirth;

      await updateUserProfile(updateData);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error('Update error:', error);
      // Error is handled in AuthContext
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Image Section */}
      <View style={styles.profileImageContainer}>
        <View style={styles.imageWrapper}>
          {user?.profilePicture ? (
            <Image
              source={{ uri: user.profilePicture }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#5CD4FF" />
            </View>
          )}
        </View>
        <TouchableOpacity onPress={handleChangeProfilePicture} disabled={isLoading}>
          <Text style={styles.changeProfileText}>Change profile picture</Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Form Fields */}
      <View style={styles.formContainer}>
        {/* First Name and Last Name */}
        <View style={styles.nameContainer}>
          <TextInput
            style={[styles.input, styles.nameInput]}
            placeholder="First Name"
            placeholderTextColor="#888"
            value={formData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
            editable={!isLoading && !isUpdating}
          />
          <TextInput
            style={[styles.input, styles.nameInput]}
            placeholder="Last Name"
            placeholderTextColor="#888"
            value={formData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
            editable={!isLoading && !isUpdating}
          />
        </View>

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          editable={!isLoading && !isUpdating}
        />

        {/* Phone Number */}
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
          editable={!isLoading && !isUpdating}
        />

        {/* Date of Birth */}
        <TextInput
          style={styles.input}
          placeholder="Date of Birth (YYYY-MM-DD)"
          placeholderTextColor="#888"
          value={formData.dateOfBirth}
          onChangeText={(value) => handleInputChange('dateOfBirth', value)}
          editable={!isLoading && !isUpdating}
        />
      </View>

      {/* Save Changes Button */}
      <TouchableOpacity 
        style={[styles.saveButton, (isLoading || isUpdating) && styles.saveButtonDisabled]} 
        onPress={handleSaveChanges}
        disabled={isLoading || isUpdating}
      >
        {isUpdating ? (
          <ActivityIndicator color="#212121" size="small" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    padding: 20,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 148,
    height: 148,
    borderRadius: 74,
  },
  placeholderImage: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#5CD4FF",
    fontSize: 48,
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 74,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeProfileText: {
    color: "#5CD4FF",
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: "#ff6b6b20",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 30,
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#333",
    color: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  nameInput: {
    flex: 1,
    marginRight: 10,
    marginBottom: 0,
  },
  saveButton: {
    backgroundColor: "#5CD4FF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  saveButtonDisabled: {
    backgroundColor: "#5CD4FF80",
  },
  saveButtonText: {
    color: "#212121",
    fontSize: 18,
    fontWeight: "bold",
  },
});