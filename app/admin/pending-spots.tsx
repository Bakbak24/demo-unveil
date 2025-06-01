import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { useSoundspots } from '../../context/SoundspotsContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { Soundspot } from '../../services/api';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

export default function PendingSpotsScreen() {
  const [selectedSpot, setSelectedSpot] = useState<Soundspot | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const { pendingSpots, isLoading, fetchPendingSpots, reviewSpot } = useSoundspots();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite, getFavoriteId } = useFavorites();
  const { adminUser, isAdminLoggedIn, getAdminToken } = useAuth();

  useEffect(() => {
    // Check if admin user is logged in
    if (!isAdminLoggedIn || !adminUser) {
      Alert.alert('Access Denied', 'Please log in as admin to access this page.');
      router.push('/admin/login');
      return;
    }
    
    if (adminUser.role !== 'admin' && adminUser.role !== 'reviewer') {
      Alert.alert('Access Denied', 'You do not have permission to access this page.');
      router.back();
      return;
    }

    fetchPendingSpots();
  }, [adminUser, isAdminLoggedIn]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playAudio = async (audioUrl: string, spotId: string) => {
    try {
      if (!audioUrl || audioUrl.trim() === '') {
        Alert.alert('Error', 'Audio file not available');
        return;
      }

      // If same audio is playing, pause it
      if (currentPlayingId === spotId && isPlaying && !isPaused) {
        await sound?.pauseAsync();
        setIsPlaying(false);
        setIsPaused(true);
        return;
      }

      // If same audio is paused, resume it
      if (currentPlayingId === spotId && isPaused) {
        await sound?.playAsync();
        setIsPlaying(true);
        setIsPaused(false);
        return;
      }

      // Stop current audio and play new one
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentPlayingId(spotId);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackPosition(status.positionMillis || 0);
          setPlaybackDuration(status.durationMillis || 0);
          
          if (status.didJustFinish) {
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentPlayingId(null);
            setPlaybackPosition(0);
          }
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
      setIsPaused(false);
      setCurrentPlayingId(null);
      setPlaybackPosition(0);
    }
  };

  const restartAudio = async (audioUrl: string, spotId: string) => {
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
      setIsPaused(false);
      setCurrentPlayingId(spotId);
      setPlaybackPosition(0);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackPosition(status.positionMillis || 0);
          setPlaybackDuration(status.durationMillis || 0);
          
          if (status.didJustFinish) {
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentPlayingId(null);
            setPlaybackPosition(0);
          }
        }
      });
    } catch (error) {
      console.error('Error restarting audio:', error);
      Alert.alert('Error', 'Failed to restart audio');
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleFavoriteToggle = async (spot: Soundspot) => {
    try {
      if (isFavorite(spot.id, 'soundspot')) {
        const favoriteId = getFavoriteId(spot.id, 'soundspot');
        if (favoriteId) {
          await removeFromFavorites(favoriteId);
        }
      } else {
        await addToFavorites(spot.id, 'soundspot');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const handleReview = (spot: Soundspot) => {
    setSelectedSpot(spot);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const submitReview = async (approved: boolean) => {
    if (!selectedSpot) return;

    console.log('Reviewing spot:', selectedSpot.id, 'approved:', approved, 'notes:', reviewNotes);
    setIsReviewing(true);
    try {
      await reviewSpot(selectedSpot.id, approved, reviewNotes);
      
      Alert.alert(
        'Success',
        `Spot has been ${approved ? 'approved' : 'rejected'} successfully.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowReviewModal(false);
              setSelectedSpot(null);
              setReviewNotes('');
              fetchPendingSpots(); // Refresh the list
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error reviewing spot:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to review spot. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsReviewing(false);
    }
  };

  const renderAudioPlayer = (spot: Soundspot) => {
    const isCurrentlyPlaying = currentPlayingId === spot.id && isPlaying;
    const isCurrentSpot = currentPlayingId === spot.id;
    const isCurrentPaused = currentPlayingId === spot.id && isPaused;
    
    return (
      <View style={styles.audioPlayer}>
        <View style={styles.audioControls}>
          <TouchableOpacity
            style={[styles.audioButton, isCurrentlyPlaying && styles.audioButtonActive]}
            onPress={() => playAudio(spot.audioUrl, spot.id)}
          >
            <Ionicons 
              name={isCurrentlyPlaying ? "pause" : "play"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
          
          {isCurrentSpot && (
            <>
              <TouchableOpacity
                style={styles.audioButton}
                onPress={stopAudio}
              >
                <Ionicons name="stop" size={20} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.audioButton}
                onPress={() => restartAudio(spot.audioUrl, spot.id)}
              >
                <Ionicons name="refresh" size={20} color="white" />
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity
            style={[styles.favoriteButton, isFavorite(spot.id, 'soundspot') && styles.favoriteButtonActive]}
            onPress={() => handleFavoriteToggle(spot)}
          >
            <Ionicons 
              name={isFavorite(spot.id, 'soundspot') ? "heart" : "heart-outline"} 
              size={20} 
              color={isFavorite(spot.id, 'soundspot') ? "#FF6B6B" : "white"} 
            />
          </TouchableOpacity>
        </View>
        
        {isCurrentSpot && (
          <View style={styles.audioProgress}>
            <Text style={styles.audioTime}>
              {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(playbackPosition / playbackDuration) * 100 || 0}%` }
                ]} 
              />
            </View>
            <Text style={styles.audioStatus}>
              {isCurrentlyPlaying ? 'Playing' : isCurrentPaused ? 'Paused' : 'Stopped'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderSpotItem = (spot: Soundspot, index?: number) => (
    <View key={spot.id || `spot-${index || 0}`} style={styles.spotCard}>
      <View style={styles.spotHeader}>
        <Text style={styles.spotName}>{spot.name}</Text>
        <Text style={styles.spotDate}>
          {new Date(spot.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.spotInfo}>
        <TouchableOpacity 
          style={styles.locationContainer}
          onPress={() => {
            setSelectedSpot(spot);
            setShowMap(true);
          }}
        >
          <Ionicons name="location" size={16} color="#5CD4FF" />
          <Text style={styles.spotLocation}>
            {spot.location.latitude.toFixed(4)}, {spot.location.longitude.toFixed(4)}
          </Text>
          <Ionicons name="map" size={16} color="#5CD4FF" style={{ marginLeft: 10 }} />
        </TouchableOpacity>
        
        {spot.script && (
          <Text style={styles.spotScript} numberOfLines={3}>
            {spot.script}
          </Text>
        )}
        
        <View style={styles.spotMeta}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="person" size={12} color="#666" />
            <Text style={styles.spotCreator}>
              {' '}{typeof spot.createdBy === 'object' ? spot.createdBy.name : spot.createdBy || 'Unknown User'}
            </Text>
          </View>
        </View>
      </View>

      {renderAudioPlayer(spot)}

      <View style={styles.spotActions}>
        <TouchableOpacity
          style={[styles.reviewButton, styles.approveButton]}
          onPress={() => {
            setSelectedSpot(spot);
            submitReview(true);
          }}
        >
          <Ionicons name="checkmark" size={20} color="white" />
          <Text style={styles.reviewButtonText}>Approve</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.reviewButton, styles.rejectButton]}
          onPress={() => handleReview(spot)}
        >
          <Ionicons name="close" size={20} color="white" />
          <Text style={styles.reviewButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'reviewer')) {
    return (
      <View style={styles.accessDeniedContainer}>
        <Ionicons name="lock-closed" size={60} color="#666" />
        <Text style={styles.accessDeniedText}>Access Denied</Text>
        <Text style={styles.accessDeniedSubtext}>
          You need admin or reviewer privileges to access this page.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5CD4FF" />
        <Text style={styles.loadingText}>Loading pending spots...</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Pending Spots Review</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchPendingSpots}
        >
          <Ionicons name="refresh" size={24} color="#5CD4FF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {pendingSpots.length > 0 ? (
          <>
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>
                {pendingSpots.length} Spot{pendingSpots.length !== 1 ? 's' : ''} Pending Review
              </Text>
              <TouchableOpacity
                style={styles.mapToggleButton}
                onPress={() => setShowMap(true)}
              >
                <Ionicons name="map" size={20} color="#5CD4FF" />
                <Text style={styles.mapToggleText}>View All on Map</Text>
              </TouchableOpacity>
            </View>
            {pendingSpots.map((spot, index) => renderSpotItem(spot, index))}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={60} color="#5CD4FF" />
            <Text style={styles.emptyText}>No Pending Spots</Text>
            <Text style={styles.emptySubtext}>
              All spots have been reviewed. Great job!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Enhanced Map Modal */}
      <Modal
        visible={showMap}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowMap(false)}
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>
              {selectedSpot ? selectedSpot.name : 'All Pending Spots'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowMap(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: selectedSpot ? selectedSpot.location.latitude : pendingSpots[0]?.location.latitude || 37.4217937,
              longitude: selectedSpot ? selectedSpot.location.longitude : pendingSpots[0]?.location.longitude || -122.083922,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {(selectedSpot ? [selectedSpot] : pendingSpots).map((spot) => (
              <Marker
                key={spot.id}
                coordinate={{
                  latitude: spot.location.latitude,
                  longitude: spot.location.longitude,
                }}
                title={spot.name}
                description={spot.script || 'No description'}
                pinColor="#5CD4FF"
                onCalloutPress={() => {
                  setSelectedSpot(spot);
                  setShowMap(false);
                }}
              />
            ))}
          </MapView>
          
          {/* Map Audio Controls */}
          {selectedSpot && (
            <View style={styles.mapAudioControls}>
              <View style={styles.mapSpotInfo}>
                <Text style={styles.mapSpotName}>{selectedSpot.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="location" size={14} color="#5CD4FF" />
                  <Text style={styles.mapSpotLocation}>
                    {' '}{selectedSpot.location.latitude.toFixed(4)}, {selectedSpot.location.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>
              {renderAudioPlayer(selectedSpot)}
            </View>
          )}
        </View>
      </Modal>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reject Spot</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowReviewModal(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {selectedSpot && (
              <>
                <Text style={styles.modalSpotName}>{selectedSpot.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="location" size={14} color="#5CD4FF" />
                  <Text style={styles.modalSpotInfo}>
                    {' '}{selectedSpot.location.latitude.toFixed(4)}, {selectedSpot.location.longitude.toFixed(4)}
                  </Text>
                </View>
                
                <Text style={styles.modalLabel}>Rejection Reason (Optional)</Text>
                <TextInput
                  style={styles.modalTextInput}
                  value={reviewNotes}
                  onChangeText={setReviewNotes}
                  placeholder="Enter reason for rejection..."
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={4}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setShowReviewModal(false)}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalRejectButton}
                    onPress={() => submitReview(false)}
                    disabled={isReviewing}
                  >
                    {isReviewing ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.modalRejectButtonText}>Reject Spot</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
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
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  mapToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mapToggleText: {
    color: '#5CD4FF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  spotCard: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  spotName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  spotDate: {
    color: '#666',
    fontSize: 12,
  },
  spotInfo: {
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotLocation: {
    color: '#5CD4FF',
    fontSize: 14,
    marginLeft: 5,
  },
  spotScript: {
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  spotMeta: {
    marginTop: 5,
  },
  spotCreator: {
    color: '#666',
    fontSize: 12,
  },
  audioPlayer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  audioButton: {
    backgroundColor: '#5CD4FF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  favoriteButton: {
    backgroundColor: '#666',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  favoriteButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  audioProgress: {
    marginTop: 10,
  },
  audioTime: {
    color: '#999',
    fontSize: 12,
    marginBottom: 5,
  },
  audioStatus: {
    color: '#5CD4FF',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5CD4FF',
  },
  spotActions: {
    flexDirection: 'row',
    gap: 10,
  },
  reviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#212121',
    padding: 40,
  },
  accessDeniedText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  accessDeniedSubtext: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#212121',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  mapTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 10,
  },
  map: {
    flex: 1,
  },
  mapAudioControls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 15,
  },
  mapSpotInfo: {
    marginBottom: 10,
  },
  mapSpotName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapSpotLocation: {
    color: '#5CD4FF',
    fontSize: 12,
    marginTop: 2,
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
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSpotName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSpotInfo: {
    color: '#5CD4FF',
    fontSize: 16,
    marginBottom: 30,
  },
  modalLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalTextInput: {
    backgroundColor: '#333',
    color: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 30,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalRejectButton: {
    flex: 1,
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalRejectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 