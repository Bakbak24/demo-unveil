import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { soundspotsAPI, audioAPI } from '../services/api';

/**
 * Demo component showing usage of client-specified API endpoints
 * This demonstrates the exact API structure requested by the client
 */
const ClientAPIDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Demo: GET /soundspots - Retrieve all available soundspots
  const testGetSoundspots = async () => {
    setIsLoading(true);
    try {
      const soundspots = await soundspotsAPI.getAllApproved();
      Alert.alert('Success', `Retrieved ${soundspots.length} soundspots`);
      console.log('GET /soundspots result:', soundspots);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch soundspots');
      console.error('GET /soundspots error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo: GET /soundspot/{id} - Retrieve specific soundspot
  const testGetSoundspotById = async () => {
    setIsLoading(true);
    try {
      // First get all soundspots to get a valid ID
      const soundspots = await soundspotsAPI.getAllApproved();
      if (soundspots.length > 0) {
        const soundspot = await soundspotsAPI.getById(soundspots[0].id);
        Alert.alert('Success', `Retrieved soundspot: ${soundspot.name}`);
        console.log('GET /soundspot/{id} result:', soundspot);
      } else {
        Alert.alert('Info', 'No soundspots available to test');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch soundspot by ID');
      console.error('GET /soundspot/{id} error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo: GET /audio/{fileName} - Retrieve audio file
  const testGetAudioFile = async () => {
    setIsLoading(true);
    try {
      // Example with a test filename
      const result = await audioAPI.getAudioFile('test-audio.mp3');
      Alert.alert('Success', 'Audio file retrieved');
      console.log('GET /audio/{fileName} result:', result);
    } catch (error) {
      Alert.alert('Info', 'Audio file not found (expected for demo)');
      console.log('GET /audio/{fileName} error (expected):', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Client API Demo</Text>
      <Text style={styles.subtitle}>Testing client-specified endpoints</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Map/Geo Locations</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={testGetSoundspots}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>GET /soundspots</Text>
          <Text style={styles.buttonSubtext}>Retrieve all soundspots</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={testGetSoundspotById}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>GET /soundspot/{'{id}'}</Text>
          <Text style={styles.buttonSubtext}>Get specific soundspot</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio Files</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={testGetAudioFile}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>GET /audio/{'{fileName}'}</Text>
          <Text style={styles.buttonSubtext}>Retrieve audio file</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>✅ Implemented Endpoints:</Text>
        <Text style={styles.infoText}>• GET /soundspots</Text>
        <Text style={styles.infoText}>• POST /soundspot</Text>
        <Text style={styles.infoText}>• GET /soundspot/{'{id}'}</Text>
        <Text style={styles.infoText}>• GET /audio/{'{fileName}'}</Text>
        <Text style={styles.infoText}>• POST /audio/upload</Text>
        <Text style={styles.infoText}>• POST /spots/upload</Text>
        <Text style={styles.infoText}>• POST /spots/review</Text>
        <Text style={styles.infoText}>• POST /spots/location</Text>
      </View>

      {isLoading && (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Testing API...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#212121',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#5CD4FF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#5CD4FF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSubtext: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  info: {
    backgroundColor: '#1a3d1a',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  infoTitle: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    color: '#4CAF50',
    fontSize: 14,
    marginBottom: 2,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ClientAPIDemo; 