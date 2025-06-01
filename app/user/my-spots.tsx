import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSoundspots } from '../../context/SoundspotsContext';
import { useAuth } from '../../context/AuthContext';
import { Soundspot } from '../../services/api';
import { Audio } from 'expo-av';

export default function MySpotsScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { mySpots, isLoading, fetchMySpots, deleteSpot } = useSoundspots();
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    console.log('My Spots - isLoggedIn:', isLoggedIn, 'user:', user);
    if (isLoggedIn) {
      console.log('Fetching my spots...');
      fetchMySpots();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    console.log('My Spots - mySpots:', mySpots.length, mySpots);
  }, [mySpots]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMySpots();
    setRefreshing(false);
  };

  const playAudio = async (audioUrl: string, id: string) => {
    try {
      if (!audioUrl || audioUrl.trim() === '') {
        Alert.alert('Error', 'Audio file not available');
        return;
      }

      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      setCurrentPlayingId(id);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setCurrentPlayingId(null);
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
      setCurrentPlayingId(null);
    }
  };

  const handleDeleteSpot = (spot: Soundspot) => {
    Alert.alert(
      'Delete Spot',
      `Are you sure you want to delete "${spot.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSpot(spot.id);
              Alert.alert('Success', 'Spot deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete spot');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'pending':
      default:
        return '#FF9800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'pending':
      default:
        return 'time';
    }
  };

  const renderSpotItem = (spot: Soundspot) => (
    <View key={spot.id} style={styles.spotCard}>
      <View style={styles.spotHeader}>
        <View style={styles.spotTitleContainer}>
          <Text style={styles.spotName}>{spot.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(spot.status) }]}>
            <Ionicons 
              name={getStatusIcon(spot.status)} 
              size={12} 
              color="white" 
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>
              {spot.status.charAt(0).toUpperCase() + spot.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.spotDate}>
          {new Date(spot.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.spotInfo}>
        <Text style={styles.spotLocation}>
          📍 {spot.location.latitude.toFixed(4)}, {spot.location.longitude.toFixed(4)}
        </Text>
        {spot.script && (
          <Text style={styles.spotScript} numberOfLines={3}>
            {spot.script}
          </Text>
        )}
        {spot.reviewNotes && spot.status === 'rejected' && (
          <View style={styles.reviewNotesContainer}>
            <Text style={styles.reviewNotesLabel}>Rejection Reason:</Text>
            <Text style={styles.reviewNotes}>{spot.reviewNotes}</Text>
          </View>
        )}
      </View>

      <View style={styles.spotActions}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => 
            currentPlayingId === spot.id && isPlaying
              ? stopAudio()
              : playAudio(spot.audioUrl, spot.id)
          }
        >
          <Ionicons
            name={currentPlayingId === spot.id && isPlaying ? "pause" : "play"}
            size={16}
            color="white"
          />
          <Text style={styles.playButtonText}>
            {currentPlayingId === spot.id && isPlaying ? "Pause" : "Play"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteSpot(spot)}
        >
          <Ionicons name="trash" size={16} color="white" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isLoggedIn) {
    return (
      <View style={styles.notLoggedInContainer}>
        <Ionicons name="log-in" size={60} color="#666" />
        <Text style={styles.notLoggedInText}>Please log in to view your spots</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5CD4FF" />
        <Text style={styles.loadingText}>Loading your spots...</Text>
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
        <Text style={styles.headerTitle}>My Spots</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/user/account/add-spot')}
        >
          <Ionicons name="add" size={24} color="#5CD4FF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {mySpots.length > 0 ? (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {mySpots.filter(s => s.status === 'approved').length}
                </Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {mySpots.filter(s => s.status === 'pending').length}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {mySpots.filter(s => s.status === 'rejected').length}
                </Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Your Spots ({mySpots.length})
            </Text>
            {mySpots.map(renderSpotItem)}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={60} color="#666" />
            <Text style={styles.emptyText}>No spots uploaded yet</Text>
            <Text style={styles.emptySubtext}>
              Start by uploading your first sound spot!
            </Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => router.push('/user/account/add-spot')}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.uploadButtonText}>Upload First Spot</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  addButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  spotCard: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  spotHeader: {
    marginBottom: 10,
  },
  spotTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  spotName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  spotDate: {
    color: '#666',
    fontSize: 12,
  },
  spotInfo: {
    marginBottom: 15,
  },
  spotLocation: {
    color: '#5CD4FF',
    fontSize: 14,
    marginBottom: 5,
  },
  spotScript: {
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  reviewNotesContainer: {
    backgroundColor: '#2A2A2A',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  reviewNotesLabel: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reviewNotes: {
    color: '#999',
    fontSize: 14,
    lineHeight: 18,
  },
  spotActions: {
    flexDirection: 'row',
    gap: 10,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5CD4FF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  playButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  deleteButtonText: {
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
    marginBottom: 30,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5CD4FF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#212121',
    padding: 40,
  },
  notLoggedInText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#5CD4FF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 