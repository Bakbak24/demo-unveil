import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Region } from 'react-native-maps';
import { useSoundspots } from '../../context/SoundspotsContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { Soundspot } from '../../services/api';
import { Audio } from 'expo-av';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const [selectedSpot, setSelectedSpot] = useState<Soundspot | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [showSpotModal, setShowSpotModal] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 37.4217937,
    longitude: -122.083922,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const { soundspots, isLoading, error, fetchSoundspots } = useSoundspots();
  const { isFavorite, addToFavorites, removeFromFavorites, getFavoriteId } = useFavorites();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    fetchSoundspots();
  }, []);

  useEffect(() => {
    // Center map on first soundspot if available
    if (soundspots.length > 0) {
      const firstSpot = soundspots[0];
      setMapRegion({
        latitude: firstSpot.location.latitude,
        longitude: firstSpot.location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [soundspots]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handleMarkerPress = (spot: Soundspot) => {
    setSelectedSpot(spot);
    setShowSpotModal(true);
  };

  const handleSpotPress = (spot: Soundspot) => {
    setSelectedSpot(spot);
    setShowSpotModal(true);
  };

  const playAudio = async (audioUrl: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  const toggleFavorite = async (spot: Soundspot) => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please log in to add favorites');
      return;
    }

    try {
      const favoriteId = getFavoriteId(spot.id, 'soundspot');
      if (favoriteId) {
        await removeFromFavorites(favoriteId);
      } else {
        await addToFavorites(spot.id, 'soundspot');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const centerMapOnSpot = (spot: Soundspot) => {
    setMapRegion({
      latitude: spot.location.latitude,
      longitude: spot.location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const renderSpotItem = (spot: Soundspot) => (
    <TouchableOpacity
      key={spot.id}
      style={styles.spotItem}
      onPress={() => handleSpotPress(spot)}
    >
      <View style={styles.spotInfo}>
        <Text style={styles.spotName}>
          {(spot.name && typeof spot.name === 'string') ? spot.name : 'Unnamed Spot'}
        </Text>
        <Text style={styles.spotLocation}>
          {(spot.location && spot.location.latitude && spot.location.longitude) 
            ? `${spot.location.latitude.toFixed(4)}, ${spot.location.longitude.toFixed(4)}`
            : '0.0000, 0.0000'
          }
        </Text>
        {spot.script && typeof spot.script === 'string' && (
          <Text style={styles.spotDescription} numberOfLines={2}>
            {spot.script}
          </Text>
        )}
        {/* Audio Items Count */}
        <Text style={styles.spotAudioInfo}>
          ♪ {(spot.audioItemsCount && typeof spot.audioItemsCount === 'number') ? spot.audioItemsCount : 0} audio items + soundspot audio
        </Text>
      </View>
      <View style={styles.spotActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => centerMapOnSpot(spot)}
        >
          <Ionicons name="location" size={20} color="#5CD4FF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push({
            pathname: '/soundspot-detail',
            params: { soundspotId: spot.id }
          })}
        >
          <Ionicons name="headset" size={20} color="#5CD4FF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => playAudio(spot.audioUrl || '')}
        >
          <Ionicons name="play" size={20} color="#5CD4FF" />
        </TouchableOpacity>
        {isLoggedIn && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleFavorite(spot)}
          >
            <Ionicons
              name={isFavorite(spot.id, 'soundspot') ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite(spot.id, 'soundspot') ? "#FF6B6B" : "#666"}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5CD4FF" />
        <Text style={styles.loadingText}>Loading soundspots...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSoundspots}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Sound Map</Text>
            <Text style={styles.headerSubtitle}>
              {Array.isArray(soundspots) ? soundspots.length : 0} spots available
            </Text>
          </View>
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => router.push('/admin/login')}
          >
            <Ionicons name="shield-checkmark" size={20} color="#5CD4FF" />
            <Text style={styles.adminButtonText}>Admin</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {Array.isArray(soundspots) && soundspots
            .filter(spot => spot && spot.id && spot.location && spot.location.latitude && spot.location.longitude)
            .map((spot) => (
            <Marker
              key={spot.id}
              coordinate={{
                latitude: spot.location.latitude,
                longitude: spot.location.longitude,
              }}
              title={(spot.name && typeof spot.name === 'string') ? spot.name : 'Unnamed Spot'}
              description={`${(spot.audioItemsCount && typeof spot.audioItemsCount === 'number') ? spot.audioItemsCount : 0} audio items + soundspot audio`}
              onPress={() => handleMarkerPress(spot)}
            >
              <View style={styles.markerContainer}>
                <View style={styles.markerContent}>
                  <Ionicons name="musical-notes" size={20} color="white" />
                  {((spot.audioItemsCount && typeof spot.audioItemsCount === 'number') ? spot.audioItemsCount : 0) > 0 && (
                    <View style={styles.markerBadge}>
                      <Text style={styles.markerBadgeText}>{spot.audioItemsCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      {/* Spots List */}
      <View style={styles.spotsContainer}>
        <Text style={styles.spotsTitle}>Available Spots</Text>
        <ScrollView style={styles.spotsList} showsVerticalScrollIndicator={false}>
          {Array.isArray(soundspots) && soundspots
            .filter(spot => spot && spot.id && typeof spot.id === 'string')
            .map(renderSpotItem)
          }
        </ScrollView>
      </View>

      {/* Spot Detail Modal */}
      <Modal
        visible={showSpotModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSpotModal(false)}
      >
        {selectedSpot && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {(selectedSpot.name && typeof selectedSpot.name === 'string') ? selectedSpot.name : 'Unnamed Spot'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSpotModal(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Mini Map */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Location</Text>
                <View style={styles.miniMapContainer}>
                  <MapView
                    style={styles.miniMap}
                    region={{
                      latitude: (selectedSpot.location && selectedSpot.location.latitude) ? selectedSpot.location.latitude : 0,
                      longitude: (selectedSpot.location && selectedSpot.location.longitude) ? selectedSpot.location.longitude : 0,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    rotateEnabled={false}
                    pitchEnabled={false}
                  >
                    <Marker
                      coordinate={{
                        latitude: (selectedSpot.location && selectedSpot.location.latitude) ? selectedSpot.location.latitude : 0,
                        longitude: (selectedSpot.location && selectedSpot.location.longitude) ? selectedSpot.location.longitude : 0,
                      }}
                    >
                      <View style={styles.markerContainer}>
                        <View style={styles.markerContent}>
                          <Ionicons name="musical-notes" size={20} color="white" />
                          {((selectedSpot.audioItemsCount && typeof selectedSpot.audioItemsCount === 'number') ? selectedSpot.audioItemsCount : 0) > 0 && (
                            <View style={styles.markerBadge}>
                              <Text style={styles.markerBadgeText}>{selectedSpot.audioItemsCount}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </Marker>
                  </MapView>
                </View>
                <Text style={styles.modalSectionText}>
                  Latitude: {(selectedSpot.location && selectedSpot.location.latitude) ? selectedSpot.location.latitude : '0.0000'}
                </Text>
                <Text style={styles.modalSectionText}>
                  Longitude: {(selectedSpot.location && selectedSpot.location.longitude) ? selectedSpot.location.longitude : '0.0000'}
                </Text>
              </View>

              {selectedSpot.script && typeof selectedSpot.script === 'string' && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Description</Text>
                  <Text style={styles.modalSectionText}>{selectedSpot.script}</Text>
                </View>
              )}

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Audio</Text>
                <Text style={styles.modalSectionText}>
                  ♪ {(selectedSpot.audioItemsCount && typeof selectedSpot.audioItemsCount === 'number') ? selectedSpot.audioItemsCount : 0} audio items + soundspot audio
                </Text>
                <View style={styles.audioControls}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => 
                      isPlaying 
                        ? stopAudio() 
                        : playAudio(selectedSpot.audioUrl || '')
                    }
                  >
                    <Ionicons
                      name={isPlaying ? "pause" : "play"}
                      size={24}
                      color="white"
                    />
                    <Text style={styles.playButtonText}>
                      {isPlaying ? "Pause Soundspot" : "Play Soundspot"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => {
                      setShowSpotModal(false);
                      router.push({
                        pathname: '/soundspot-detail',
                        params: { soundspotId: selectedSpot.id }
                      });
                    }}
                  >
                    <Ionicons name="headset" size={24} color="white" />
                    <Text style={styles.viewAllButtonText}>
                      View All Audio Content
                    </Text>
                  </TouchableOpacity>

                  {isLoggedIn && (
                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={() => toggleFavorite(selectedSpot)}
                    >
                      <Ionicons
                        name={isFavorite(selectedSpot.id, 'soundspot') ? "heart" : "heart-outline"}
                        size={24}
                        color={isFavorite(selectedSpot.id, 'soundspot') ? "#FF6B6B" : "white"}
                      />
                      <Text style={styles.favoriteButtonText}>
                        {isFavorite(selectedSpot.id, 'soundspot') ? "Remove from Favorites" : "Add to Favorites"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Add Spot Button */}
      {isLoggedIn && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/user/account/add-spot')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#212121',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#212121',
    padding: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#5CD4FF',
    padding: 15,
    borderRadius: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 16,
    marginTop: 5,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  adminButtonText: {
    color: '#5CD4FF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  mapContainer: {
    height: height * 0.4,
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#5CD4FF',
  },
  markerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markerBadge: {
    backgroundColor: '#FF6B6B',
    padding: 2,
    borderRadius: 10,
    marginLeft: 5,
  },
  markerBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  spotsContainer: {
    flex: 1,
    padding: 20,
  },
  spotsTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  spotsList: {
    flex: 1,
  },
  spotItem: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotInfo: {
    flex: 1,
  },
  spotName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spotLocation: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  spotDescription: {
    color: '#999',
    fontSize: 14,
    marginTop: 5,
  },
  spotAudioInfo: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  spotActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 10,
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#212121',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 10,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 25,
  },
  modalSectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSectionText: {
    color: '#999',
    fontSize: 16,
    lineHeight: 24,
  },
  miniMapContainer: {
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  miniMap: {
    flex: 1,
  },
  audioControls: {
    flexDirection: 'row',
    gap: 15,
  },
  playButton: {
    backgroundColor: '#5CD4FF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
  },
  playButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  favoriteButton: {
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
  },
  favoriteButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  viewAllButton: {
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
  },
  viewAllButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#5CD4FF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 