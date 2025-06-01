import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  TextInput,
  ScrollView 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import { useSoundspots } from "../../../context/SoundspotsContext";
import { useAuth } from "../../../context/AuthContext";
import { router } from "expo-router";

export default function AddSpotScreen() {
  const [isChecked, setIsChecked] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<any>(null);
  const [spotName, setSpotName] = useState('');
  const [spotScript, setSpotScript] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  const { uploadSpot, isLoading, error } = useSoundspots();
  const { isLoggedIn } = useAuth();

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to add a spot.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Check file size (30MB limit)
        if (file.size && file.size > 30 * 1024 * 1024) {
          Alert.alert('File too large', 'Please select an audio file smaller than 30MB.');
          return;
        }

        setSelectedAudio({
          uri: file.uri,
          type: file.mimeType || 'audio/mpeg',
          name: file.name || 'audio.mp3',
        });
      }
    } catch (error) {
      console.error('Error picking audio file:', error);
      Alert.alert('Error', 'Failed to select audio file.');
    }
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      Alert.alert('Authentication required', 'Please log in to upload a spot.');
      return;
    }

    if (!selectedAudio) {
      Alert.alert('Audio required', 'Please select an audio file.');
      return;
    }

    if (!currentLocation) {
      Alert.alert('Location required', 'Please enable location services.');
      return;
    }

    if (!isChecked) {
      Alert.alert('Terms required', 'Please accept the terms and conditions.');
      return;
    }

    try {
      await uploadSpot({
        audio: selectedAudio,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        termsAccepted: true,
        name: spotName || 'New Audio Spot',
        script: spotScript,
      });

      Alert.alert(
        'Success', 
        'Your spot has been uploaded and is pending review.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload failed', 'Failed to upload your spot. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.descriptionText}>
        Here, you can select the audio file you created. Make sure you’re at the
        location where you want the spot to be placed. Once your upload is
        complete, we’ll review it before turning it into a sound spot.
      </Text>

      {/* Location Status */}
      <View style={styles.locationContainer}>
        <Ionicons name="location" size={20} color="#5CD4FF" />
        <Text style={styles.locationText}>
          {isLoadingLocation 
            ? 'Getting location...' 
            : currentLocation 
              ? `Location: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
              : 'Location not available'
          }
        </Text>
        <TouchableOpacity onPress={getCurrentLocation} style={styles.refreshButton}>
          <Ionicons name="refresh" size={16} color="#5CD4FF" />
        </TouchableOpacity>
      </View>

      {/* Spot Name Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Spot Name (Optional)</Text>
        <TextInput
          style={styles.textInput}
          value={spotName}
          onChangeText={setSpotName}
          placeholder="Enter a name for your spot"
          placeholderTextColor="#666"
        />
      </View>

      {/* Spot Script Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description (Optional)</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={spotScript}
          onChangeText={setSpotScript}
          placeholder="Describe your audio spot"
          placeholderTextColor="#666"
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Audio Upload Section */}
      <View style={styles.uploadContainer}>
        <TouchableOpacity 
          style={[styles.uploadButton, selectedAudio && styles.uploadButtonSelected]} 
          onPress={pickAudioFile}
        >
          <Ionicons 
            name={selectedAudio ? "musical-notes" : "add"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
        <Text style={styles.uploadLabel}>
          {selectedAudio ? selectedAudio.name : 'Select Audio File'}
        </Text>
        {selectedAudio && (
          <Text style={styles.audioInfo}>
            Audio file selected: {selectedAudio.name}
          </Text>
        )}
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Spacer to push content up */}
      <View style={styles.spacer} />

      {/* Checkbox and Submit Section */}
      <View style={styles.formBottomSection}>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              { backgroundColor: isChecked ? "#5CD4FF" : "#333" },
            ]}
            onPress={toggleCheckbox}
          >
            {isChecked && <Ionicons name="checkmark" size={16} color="white" />}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>
            I confirm that my upload is in line with the terms and conditions.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[
            styles.submitButton,
            (!selectedAudio || !currentLocation || !isChecked || isLoading) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!selectedAudio || !currentLocation || !isChecked || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#212121",
    padding: 20,
  },
  descriptionText: {
    color: "white",
    fontSize: 16,
    textAlign: "left",
    marginBottom: 20,
  },
  uploadContainer: {
    alignItems: "center",
    paddingVertical: 40,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#333",
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  uploadLabel: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 5,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  formBottomSection: {
    paddingBottom: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxLabel: {
    color: "white",
    fontSize: 16,
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#5CD4FF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  submitButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.6,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  locationText: {
    color: "white",
    fontSize: 14,
    flex: 1,
    marginLeft: 10,
  },
  refreshButton: {
    padding: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#333",
    color: "white",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  uploadButtonSelected: {
    backgroundColor: "#5CD4FF",
  },
  audioInfo: {
    color: "#5CD4FF",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
    maxWidth: 250,
  },
  errorContainer: {
    backgroundColor: "#FF6B6B",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  errorText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
});
