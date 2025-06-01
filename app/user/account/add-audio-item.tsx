import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as DocumentPicker from 'expo-document-picker';
import { useAudioItems } from "../../../context/AudioItemsContext";
import { useSoundspots } from "../../../context/SoundspotsContext";
// Using a simple dropdown approach instead of external picker

const AddAudioItemScreen = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    soundspot: '',
    audioFile: null as any,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [showSoundspotPicker, setShowSoundspotPicker] = useState(false);

  const { uploadAudioItem } = useAudioItems();
  const { soundspots, fetchSoundspots } = useSoundspots();

  useEffect(() => {
    fetchSoundspots();
  }, []);

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setFormData(prev => ({
          ...prev,
          audioFile: {
            uri: file.uri,
            type: file.mimeType || 'audio/mpeg',
            name: file.name,
          }
        }));
      }
    } catch (error) {
      console.error('Error picking audio file:', error);
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!formData.soundspot) {
      Alert.alert('Error', 'Please select a soundspot');
      return;
    }

    if (!formData.audioFile) {
      Alert.alert('Error', 'Please select an audio file');
      return;
    }

    setIsUploading(true);
    try {
      await uploadAudioItem({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        soundspot: formData.soundspot,
        audio: formData.audioFile,
      });

      Alert.alert('Success', 'Audio item uploaded successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error uploading audio item:', error);
      Alert.alert('Error', 'Failed to upload audio item');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Audio Item</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Enter audio title..."
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Enter description..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
              placeholder="e.g., Music, Podcast, Story..."
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Soundspot *</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowSoundspotPicker(true)}
            >
              <Text style={styles.dropdownText}>
                {formData.soundspot 
                  ? soundspots.find(s => s.id === formData.soundspot)?.name || 'Select a soundspot...'
                  : 'Select a soundspot...'
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color="#5CD4FF" />
            </TouchableOpacity>
            {soundspots.length === 0 && (
              <Text style={styles.helperText}>
                No soundspots available. Create a soundspot first.
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Audio File *</Text>
            <TouchableOpacity
              style={styles.filePickerButton}
              onPress={pickAudioFile}
            >
              <Ionicons name="document" size={20} color="#5CD4FF" />
              <Text style={styles.filePickerText}>
                {formData.audioFile ? formData.audioFile.name : 'Select Audio File'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isUploading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={20} color="white" />
              <Text style={styles.submitButtonText}>Upload Audio Item</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Soundspot Picker Modal */}
      <Modal
        visible={showSoundspotPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSoundspotPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Soundspot</Text>
              <TouchableOpacity
                onPress={() => setShowSoundspotPicker(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {soundspots.map((spot) => (
                <TouchableOpacity
                  key={spot.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, soundspot: spot.id }));
                    setShowSoundspotPicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{spot.name}</Text>
                  <Text style={styles.modalItemSubtext}>
                    {spot.location.latitude.toFixed(4)}, {spot.location.longitude.toFixed(4)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#333",
    color: "white",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  textArea: {
    textAlignVertical: "top",
    minHeight: 100,
  },
  pickerContainer: {
    backgroundColor: "#333",
    borderRadius: 10,
    overflow: "hidden",
  },
  picker: {
    color: "white",
    backgroundColor: "#333",
  },
  helperText: {
    color: "#666",
    fontSize: 12,
    marginTop: 5,
    fontStyle: "italic",
  },
  filePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  filePickerText: {
    color: "#5CD4FF",
    fontSize: 16,
    flex: 1,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5CD4FF",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    gap: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
  },
  dropdownText: {
    color: "white",
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#212121",
    borderRadius: 10,
    width: "90%",
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalCloseButton: {
    padding: 5,
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalItemText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalItemSubtext: {
    color: "#666",
    fontSize: 12,
    marginTop: 2,
  },
});

export default AddAudioItemScreen; 