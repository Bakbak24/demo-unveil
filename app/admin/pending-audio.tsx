import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAudioItems } from '../../context/AudioItemsContext';
import { useAuth } from '../../context/AuthContext';
import { AudioItem } from '../../services/api';
import { Audio } from 'expo-av';
import axios from 'axios';
import API_CONFIG from '../../config/api';

export default function PendingAudioScreen() {
  const [audioItems, setAudioItems] = useState<AudioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<AudioItem | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  const { fetchAudioItems } = useAudioItems();
  const { adminUser, isAdminLoggedIn, getAdminToken } = useAuth();

  // Helper function to make admin API calls with admin token
  const makeAdminAPICall = async (url: string, options: any = {}) => {
    const adminToken = getAdminToken();
    if (!adminToken) {
      throw new Error('Admin authentication required');
    }

    const response = await axios({
      url: `${API_CONFIG.BASE_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: API_CONFIG.TIMEOUT,
      ...options,
    });

    return response;
  };

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

    loadAudioItems();
  }, [adminUser, isAdminLoggedIn]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadAudioItems = async () => {
    setIsLoading(true);
    try {
      console.log('loadAudioItems: Starting fetch with admin token...');
      const response = await makeAdminAPICall('/audio-items/pending', {
        method: 'GET',
      });
      
      console.log('loadAudioItems: API response:', response.data);
      
      // Transform _id to id for frontend compatibility
      const transformedItems = response.data.map((item: any) => ({
        ...item,
        id: item._id || item.id
      }));
      
      setAudioItems(transformedItems);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error loading audio items:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load audio items');
      setIsLoading(false);
    }
  };

  const playAudio = async (audioUrl: string, id: string) => {
    try {
      if (currentPlayingId === id && isPlaying) {
        await sound?.pauseAsync();
        setIsPlaying(false);
        return;
      }

      if (currentPlayingId === id && sound) {
        await sound.playAsync();
        setIsPlaying(true);
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

  const handleReview = (item: AudioItem) => {
    setSelectedItem(item);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const submitReview = async (approved: boolean) => {
    if (!selectedItem) return;

    setIsReviewing(true);
    try {
      console.log('submitReview: Reviewing audio item with admin token...');
      const response = await makeAdminAPICall('/audio-items/review', {
        method: 'POST',
        data: {
          itemId: selectedItem.id,
          approved,
          notes: reviewNotes,
        },
      });
      
      console.log('submitReview: API response:', response.data);
      
      Alert.alert(
        'Success',
        `Audio item has been ${approved ? 'approved' : 'rejected'} successfully`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowReviewModal(false);
              setSelectedItem(null);
              loadAudioItems();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error reviewing audio item:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to review audio item');
    } finally {
      setIsReviewing(false);
    }
  };

  const renderAudioItem = (item: AudioItem) => {
    const isCurrentlyPlaying = currentPlayingId === item.id && isPlaying;

    return (
      <View key={item.id} style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Pending</Text>
          </View>
        </View>

        <Text style={styles.itemDescription} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.itemMeta}>
          <Text style={styles.itemCategory}>📁 {item.category}</Text>
          <Text style={styles.itemDate}>
            📅 {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => 
              isCurrentlyPlaying 
                ? stopAudio() 
                : playAudio(item.audioUrl, item.id)
            }
          >
            <Ionicons
              name={isCurrentlyPlaying ? "pause" : "play"}
              size={16}
              color="white"
            />
            <Text style={styles.playButtonText}>
              {isCurrentlyPlaying ? "Pause" : "Play"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => handleReview(item)}
          >
            <Ionicons name="checkmark-circle" size={16} color="white" />
            <Text style={styles.reviewButtonText}>Review</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Check access before rendering
  if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'reviewer')) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="shield-outline" size={60} color="#FF6B6B" />
        <Text style={styles.loadingText}>Access Denied</Text>
        <Text style={[styles.loadingText, { fontSize: 14, marginTop: 5 }]}>
          Admin or reviewer access required
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5CD4FF" />
        <Text style={styles.loadingText}>Loading audio items...</Text>
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
        <Text style={styles.headerTitle}>Pending Audio Items</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadAudioItems}
        >
          <Ionicons name="refresh" size={24} color="#5CD4FF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {audioItems.length > 0 ? (
          audioItems.map(renderAudioItem)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes" size={60} color="#666" />
            <Text style={styles.emptyText}>No Pending Audio Items</Text>
            <Text style={styles.emptySubtext}>
              All audio items have been reviewed
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReviewModal(false)}
      >
        {selectedItem && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review Audio Item</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowReviewModal(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Title</Text>
                <Text style={styles.modalSectionText}>{selectedItem.title}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Description</Text>
                <Text style={styles.modalSectionText}>{selectedItem.description}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Category</Text>
                <Text style={styles.modalSectionText}>{selectedItem.category}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Audio Preview</Text>
                <TouchableOpacity
                  style={styles.previewButton}
                  onPress={() => playAudio(selectedItem.audioUrl, selectedItem.id)}
                >
                  <Ionicons name="play" size={20} color="white" />
                  <Text style={styles.previewButtonText}>Play Audio</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Review Notes (Optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  value={reviewNotes}
                  onChangeText={setReviewNotes}
                  placeholder="Add any notes about this review..."
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => submitReview(false)}
                  disabled={isReviewing}
                >
                  {isReviewing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="close-circle" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => submitReview(true)}
                  disabled={isReviewing}
                >
                  {isReviewing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Approve</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
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
  itemCard: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemDescription: {
    color: '#999',
    fontSize: 14,
    marginBottom: 10,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  itemCategory: {
    color: '#5CD4FF',
    fontSize: 12,
  },
  itemDate: {
    color: '#666',
    fontSize: 12,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 10,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5CD4FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
  },
  playButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
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
  closeButton: {
    padding: 10,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSectionText: {
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5CD4FF',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  previewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  notesInput: {
    backgroundColor: '#333',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    flex: 1,
  },
  rejectButton: {
    backgroundColor: '#FF6B6B',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 