import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAudioItems } from "../../context/AudioItemsContext";
import { useSoundspots } from "../../context/SoundspotsContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import { AudioItem, Soundspot } from "../../services/api";
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';

const AudioScreen = () => {
  const [activeTab, setActiveTab] = useState<'audioItems' | 'soundspots' | 'myItems'>('soundspots');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [currentPlayingType, setCurrentPlayingType] = useState<'audioItem' | 'soundspot' | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: '',
    audioFile: null as any,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { audioItems, myAudioItems, isLoading: audioLoading, fetchAudioItems, fetchMyAudioItems, uploadAudioItem } = useAudioItems();
  const { soundspots, isLoading: spotsLoading, fetchSoundspots } = useSoundspots();
  const { addToFavorites, removeFromFavorites, isFavorite, getFavoriteId } = useFavorites();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    fetchAudioItems();
    fetchSoundspots();
    if (isLoggedIn) {
      fetchMyAudioItems();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const onRefresh = async () => {
    setRefreshing(true);
    const promises = [fetchAudioItems(), fetchSoundspots()];
    if (isLoggedIn) {
      promises.push(fetchMyAudioItems());
    }
    await Promise.all(promises);
    setRefreshing(false);
  };

  const playAudio = async (audioUrl: string, id: string, type: 'audioItem' | 'soundspot') => {
    try {
      if (!audioUrl || audioUrl.trim() === '') {
        Alert.alert('Error', 'Audio file not available');
        return;
      }

      // If same audio is playing, pause it
      if (currentPlayingId === id && isPlaying) {
        await sound?.pauseAsync();
        setIsPlaying(false);
        return;
      }

      // If same audio is paused, resume it
      if (currentPlayingId === id && sound) {
        await sound.playAsync();
        setIsPlaying(true);
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
      setCurrentPlayingId(id);
      setCurrentPlayingType(type);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackPosition(status.positionMillis || 0);
          setPlaybackDuration(status.durationMillis || 0);
          
          if (status.didJustFinish) {
            setIsPlaying(false);
            setCurrentPlayingId(null);
            setCurrentPlayingType(null);
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
      setCurrentPlayingId(null);
      setCurrentPlayingType(null);
      setPlaybackPosition(0);
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleFavoriteToggle = async (itemId: string, itemType: 'audioItem' | 'soundspot') => {
    if (!isLoggedIn) {
      Alert.alert(
        'Login Required',
        'Please log in to add items to your favorites.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }

    try {
      if (isFavorite(itemId, itemType)) {
        const favoriteId = getFavoriteId(itemId, itemType);
        if (favoriteId) {
          await removeFromFavorites(favoriteId);
        }
      } else {
        await addToFavorites(itemId, itemType);
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update favorites';
      Alert.alert('Error', errorMessage);
    }
  };

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setUploadData(prev => ({
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

  const handleUpload = async () => {
    if (!uploadData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!uploadData.audioFile) {
      Alert.alert('Error', 'Please select an audio file');
      return;
    }

    setIsUploading(true);
    try {
      // For now, we'll use the first available soundspot
      // In a real app, you'd want to let the user select a soundspot
      const firstSoundspot = soundspots[0];
      if (!firstSoundspot) {
        Alert.alert('Error', 'No soundspots available. Please create a soundspot first.');
        return;
      }

      await uploadAudioItem({
        title: uploadData.title,
        description: uploadData.description,
        category: uploadData.category,
        soundspot: firstSoundspot.id,
        audio: uploadData.audioFile,
      });

      Alert.alert('Success', 'Audio item uploaded successfully!');
      setShowUploadModal(false);
      setUploadData({
        title: '',
        description: '',
        category: '',
        audioFile: null,
      });
      fetchAudioItems();
      if (isLoggedIn) {
        fetchMyAudioItems();
      }
    } catch (error) {
      console.error('Error uploading audio item:', error);
      Alert.alert('Error', 'Failed to upload audio item');
    } finally {
      setIsUploading(false);
    }
  };

  const renderAudioItem = (item: AudioItem) => {
    if (!item || !item.id || typeof item.id !== 'string') {
      return null;
    }

    try {
      const isCurrentlyPlaying = currentPlayingId === item.id && currentPlayingType === 'audioItem' && isPlaying;
      const isCurrentItem = currentPlayingId === item.id && currentPlayingType === 'audioItem';

      return (
        <View key={item.id} style={styles.audioCard}>
          <View style={styles.audioHeader}>
            <Text style={styles.audioTitle}>
              {(item.title && typeof item.title === 'string') ? item.title : 'Untitled'}
            </Text>
            <TouchableOpacity
              style={[styles.favoriteButton, isFavorite(item.id, 'audioItem') && styles.favoriteButtonActive]}
              onPress={() => handleFavoriteToggle(item.id, 'audioItem')}
            >
              <Ionicons 
                name={isFavorite(item.id, 'audioItem') ? "heart" : "heart-outline"} 
                size={20} 
                color={isFavorite(item.id, 'audioItem') ? "#FF6B6B" : "#666"} 
              />
            </TouchableOpacity>
          </View>

          {item.description && typeof item.description === 'string' && item.description.trim() && (
            <Text style={styles.audioDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.audioMeta}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="musical-notes" size={12} color="#5CD4FF" />
              <Text style={styles.audioCategory}>
                {' '}{(item.category && typeof item.category === 'string' && item.category.trim()) || 'General'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time" size={12} color="#666" />
              <Text style={styles.audioDuration}>
                {' '}{(item.duration && typeof item.duration === 'number') ? formatTime(item.duration * 1000) : 'Unknown'}
              </Text>
            </View>
          </View>

          <View style={styles.audioControls}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => router.push({
                pathname: '/audio-player',
                params: { itemId: item.id, itemType: 'audioItem' }
              })}
            >
              <Ionicons
                name="play"
                size={20}
                color="white"
              />
              <Text style={styles.playButtonText}>Play</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickPlayButton}
              onPress={() => 
                isCurrentlyPlaying 
                  ? stopAudio() 
                  : playAudio(item.audioUrl || '', item.id, 'audioItem')
              }
            >
              <Ionicons
                name={isCurrentlyPlaying ? "pause" : "play-circle"}
                size={24}
                color="#5CD4FF"
              />
            </TouchableOpacity>
          </View>

          {isCurrentItem && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressTime}>
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
            </View>
          )}
        </View>
      );
    } catch (error) {
      console.error('Error rendering audio item:', error);
      return null;
    }
  };

  const renderSoundspot = (spot: Soundspot) => {
    if (!spot || !spot.id || typeof spot.id !== 'string') {
      return null;
    }

    try {
      const isCurrentlyPlaying = currentPlayingId === spot.id && currentPlayingType === 'soundspot' && isPlaying;
      const isCurrentSpot = currentPlayingId === spot.id && currentPlayingType === 'soundspot';

      return (
        <TouchableOpacity
          key={spot.id}
          style={styles.audioCard}
          onPress={() => router.push({
            pathname: '/soundspot-detail',
            params: { soundspotId: spot.id }
          })}
          activeOpacity={0.8}
        >
          <View style={styles.audioHeader}>
            <Text style={styles.audioTitle}>
              {(spot.name && typeof spot.name === 'string') ? spot.name : 'Unnamed Spot'}
            </Text>
            <TouchableOpacity
              style={[styles.favoriteButton, isFavorite(spot.id, 'soundspot') && styles.favoriteButtonActive]}
              onPress={(e) => {
                e.stopPropagation();
                handleFavoriteToggle(spot.id, 'soundspot');
              }}
            >
              <Ionicons 
                name={isFavorite(spot.id, 'soundspot') ? "heart" : "heart-outline"} 
                size={20} 
                color={isFavorite(spot.id, 'soundspot') ? "#FF6B6B" : "#666"} 
              />
            </TouchableOpacity>
          </View>

          {spot.script && typeof spot.script === 'string' && spot.script.trim() && (
            <Text style={styles.audioDescription} numberOfLines={2}>
              {spot.script}
            </Text>
          )}

          <View style={styles.audioMeta}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location" size={12} color="#5CD4FF" />
              <Text style={styles.audioLocation}>
                {' '}{(spot.location && spot.location.latitude && spot.location.longitude) 
                  ? `${spot.location.latitude.toFixed(4)}, ${spot.location.longitude.toFixed(4)}`
                  : '0.0000, 0.0000'
                }
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
              <Text style={styles.audioStatus}>
                {' '}{(spot.status && typeof spot.status === 'string') ? spot.status : 'Unknown'}
              </Text>
            </View>
          </View>

          {/* Audio Items Count */}
          <View style={styles.audioItemsInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="musical-notes" size={12} color="#5CD4FF" />
              <Text style={styles.soundspotAudioInfo}>
                {' '}{(spot.audioItemsCount && typeof spot.audioItemsCount === 'number') ? spot.audioItemsCount : 0} audio items + soundspot audio
              </Text>
            </View>
          </View>

          <View style={styles.audioControls}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={(e) => {
                e.stopPropagation();
                router.push({
                  pathname: '/audio-player',
                  params: { itemId: spot.id, itemType: 'soundspot' }
                });
              }}
            >
              <Ionicons
                name="play"
                size={20}
                color="white"
              />
              <Text style={styles.playButtonText}>Play Soundspot</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickPlayButton}
              onPress={(e) => {
                e.stopPropagation();
                isCurrentlyPlaying 
                  ? stopAudio() 
                  : playAudio(spot.audioUrl || '', spot.id, 'soundspot');
              }}
            >
              <Ionicons
                name={isCurrentlyPlaying ? "pause" : "play-circle"}
                size={24}
                color="#5CD4FF"
              />
            </TouchableOpacity>
          </View>

          {isCurrentSpot && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressTime}>
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
            </View>
          )}

          {/* Tap to view details indicator */}
          <View style={styles.tapIndicator}>
            <Ionicons name="chevron-forward" size={16} color="#666" />
            <Text style={styles.tapIndicatorText}>Tap to view all audio content</Text>
          </View>
        </TouchableOpacity>
      );
    } catch (error) {
      console.error('Error rendering soundspot:', error);
      return null;
    }
  };

  const renderFavoriteItem = (favorite: any, index: number) => {
    if (!favorite || !favorite.itemId || !favorite.itemType) {
      return null;
    }

    if (favorite.itemType === 'audioItem') {
      const audioItem = audioItems.find(item => item.id === favorite.itemId);
      return audioItem ? (
        <View key={`favorite-audio-${favorite.id || index}`}>
          {renderAudioItem(audioItem)}
        </View>
      ) : null;
    } else {
      const soundspot = soundspots.find(spot => spot.id === favorite.itemId);
      return soundspot ? (
        <View key={`favorite-spot-${favorite.id || index}`}>
          {renderSoundspot(soundspot)}
        </View>
      ) : null;
    }
  };

  const isLoading = audioLoading || spotsLoading;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Audio</Text>
          <Text style={styles.headerSubtitle}>Discover amazing audio content</Text>
        </View>
        {isLoggedIn && (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => setShowUploadModal(true)}
          >
            <Ionicons name="add" size={24} color="#5CD4FF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
          contentContainerStyle={styles.tabContentContainer}
        >
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'soundspots' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('soundspots')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location" size={14} color={activeTab === 'soundspots' ? "white" : "#999"} />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'soundspots' && styles.activeTabText,
                ]}
              >
                {' '}Soundspots ({Array.isArray(soundspots) ? soundspots.length : 0})
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'audioItems' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('audioItems')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="musical-notes" size={14} color={activeTab === 'audioItems' ? "white" : "#999"} />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'audioItems' && styles.activeTabText,
                ]}
              >
                {' '}Audio Items ({Array.isArray(audioItems) ? audioItems.length : 0})
              </Text>
            </View>
          </TouchableOpacity>

          {isLoggedIn && (
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'myItems' && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab('myItems')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="person" size={14} color={activeTab === 'myItems' ? "white" : "#999"} />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'myItems' && styles.activeTabText,
                  ]}
                >
                  {' '}My Items ({Array.isArray(myAudioItems) ? myAudioItems.length : 0})
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>
        
        <View style={styles.tabInfo}>
          <Text style={styles.tabInfoText}>
            {activeTab === 'soundspots' 
              ? `${Array.isArray(soundspots) ? soundspots.length : 0} locations available` 
              : activeTab === 'myItems'
              ? `${Array.isArray(myAudioItems) ? myAudioItems.length : 0} of your tracks`
              : `${Array.isArray(audioItems) ? audioItems.length : 0} tracks available`
            }
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5CD4FF" />
            <Text style={styles.loadingText}>Loading audio...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'audioItems' && (
              <>
                {Array.isArray(audioItems) && audioItems.length > 0 ? (
                  audioItems
                    .filter(item => item && item.id && typeof item.id === 'string')
                    .map(renderAudioItem)
                    .filter(Boolean)
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="musical-notes" size={60} color="#666" />
                    <Text style={styles.emptyText}>No Audio Items</Text>
                    <Text style={styles.emptySubtext}>
                      Upload your first audio item to get started
                    </Text>
                  </View>
                )}
              </>
            )}

            {activeTab === 'soundspots' && (
              <>
                {Array.isArray(soundspots) && soundspots.length > 0 ? (
                  soundspots
                    .filter(spot => spot && spot.id && typeof spot.id === 'string')
                    .map(renderSoundspot)
                    .filter(Boolean)
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="location" size={60} color="#666" />
                    <Text style={styles.emptyText}>No Soundspots</Text>
                    <Text style={styles.emptySubtext}>
                      Create your first soundspot on the map
                    </Text>
                    <TouchableOpacity
                      style={styles.loginButton}
                      onPress={() => router.push('/user/account/add-spot')}
                    >
                      <Text style={styles.loginButtonText}>Add Soundspot</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {activeTab === 'myItems' && (
              <>
                {Array.isArray(myAudioItems) && myAudioItems.length > 0 ? (
                  myAudioItems
                    .filter(item => item && item.id && typeof item.id === 'string')
                    .map(renderAudioItem)
                    .filter(Boolean)
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="musical-notes" size={60} color="#666" />
                    <Text style={styles.emptyText}>No Audio Items</Text>
                    <Text style={styles.emptySubtext}>
                      Upload your first audio item to get started
                    </Text>
                    <TouchableOpacity
                      style={styles.loginButton}
                      onPress={() => setShowUploadModal(true)}
                    >
                      <Text style={styles.loginButtonText}>Upload Audio</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upload Audio Item</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowUploadModal(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                value={uploadData.title}
                onChangeText={(text) => setUploadData(prev => ({ ...prev, title: text }))}
                placeholder="Enter audio title..."
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={uploadData.description}
                onChangeText={(text) => setUploadData(prev => ({ ...prev, description: text }))}
                placeholder="Enter description..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.textInput}
                value={uploadData.category}
                onChangeText={(text) => setUploadData(prev => ({ ...prev, category: text }))}
                placeholder="e.g., Music, Podcast, Story..."
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Audio File *</Text>
              <TouchableOpacity
                style={styles.filePickerButton}
                onPress={pickAudioFile}
              >
                <Ionicons name="document" size={20} color="#5CD4FF" />
                <Text style={styles.filePickerText}>
                  {uploadData.audioFile ? uploadData.audioFile.name : 'Select Audio File'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.uploadSubmitButton, isUploading && styles.uploadSubmitButtonDisabled]}
              onPress={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color="white" />
                  <Text style={styles.uploadSubmitButtonText}>Upload Audio Item</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
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
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#666",
    fontSize: 16,
    marginTop: 5,
  },
  uploadButton: {
    backgroundColor: '#333',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabSection: {
    paddingBottom: 10,
  },
  tabContainer: {
    maxHeight: 60,
  },
  tabContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  tabInfo: {
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  tabInfoText: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#333",
  },
  activeTabButton: {
    backgroundColor: "#5CD4FF",
  },
  tabText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "white",
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
  },
  audioCard: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  audioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  audioTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  favoriteButton: {
    padding: 5,
  },
  favoriteButtonActive: {
    // No additional styles needed, color is handled in the icon
  },
  audioDescription: {
    color: "#999",
    fontSize: 14,
    marginTop: 2,
  },
  audioMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  audioCategory: {
    color: "#5CD4FF",
    fontSize: 12,
  },
  audioDuration: {
    color: "#666",
    fontSize: 12,
  },
  audioLocation: {
    color: "#5CD4FF",
    fontSize: 12,
  },
  audioStatus: {
    color: "#4CAF50",
    fontSize: 12,
  },
  audioControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5CD4FF",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
  },

  playButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  quickPlayButton: {
    backgroundColor: "transparent",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    marginTop: 15,
  },
  progressTime: {
    color: "#999",
    fontSize: 12,
    marginBottom: 5,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#444",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#5CD4FF",
  },
  seeMoreButton: {
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  seeMoreText: {
    color: "#5CD4FF",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "center",
  },
  emptySubtext: {
    color: "#666",
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#5CD4FF",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#212121",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  closeButton: {
    padding: 10,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
    textAlignVertical: "top",
    minHeight: 100,
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
  uploadSubmitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5CD4FF",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    gap: 10,
  },
  uploadSubmitButtonDisabled: {
    opacity: 0.6,
  },
  uploadSubmitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  tapIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    justifyContent: "center",
  },
  tapIndicatorText: {
    color: "#666",
    fontSize: 12,
    marginLeft: 5,
  },
  audioItemsInfo: {
    marginBottom: 15,
  },
  soundspotAudioInfo: {
    color: "#5CD4FF",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default AudioScreen;
