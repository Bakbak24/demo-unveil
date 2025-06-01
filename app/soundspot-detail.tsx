import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useFavorites } from '../context/FavoritesContext';
import { useAudioItems } from '../context/AudioItemsContext';
import { useSoundspots } from '../context/SoundspotsContext';
import { AudioItem, Soundspot } from '../services/api';

const SoundspotDetailScreen = () => {
  const params = useLocalSearchParams();
  const { soundspotId } = params as { soundspotId: string };

  const [soundspot, setSoundspot] = useState<Soundspot | null>(null);
  const [audioItems, setAudioItems] = useState<AudioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [currentPlayingType, setCurrentPlayingType] = useState<'audioItem' | 'soundspot' | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  const { addToFavorites, removeFromFavorites, isFavorite, getFavoriteId } = useFavorites();
  const { fetchAudioItemsBySoundspot } = useAudioItems();
  const { soundspots } = useSoundspots();

  useEffect(() => {
    loadSoundspotData();
  }, [soundspotId]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadSoundspotData = async () => {
    setIsLoading(true);
    try {
      // Find soundspot from context
      const foundSoundspot = soundspots.find(spot => spot.id === soundspotId);
      if (foundSoundspot) {
        setSoundspot(foundSoundspot);
      }

      // Fetch audio items for this soundspot
      const items = await fetchAudioItemsBySoundspot(soundspotId);
      setAudioItems(items);
    } catch (error) {
      console.error('Error loading soundspot data:', error);
      Alert.alert('Error', 'Failed to load soundspot data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSoundspotData();
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

  const renderAudioItem = (item: AudioItem) => {
    if (!item || !item.id || typeof item.id !== 'string') {
      return null;
    }

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
            <Text style={styles.audioItemCategory}>
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
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5CD4FF" />
        <Text style={styles.loadingText}>Loading soundspot...</Text>
      </View>
    );
  }

  if (!soundspot) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={60} color="#FF6B6B" />
        <Text style={styles.errorText}>Soundspot not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCurrentlyPlayingSoundspot = currentPlayingId === soundspot.id && currentPlayingType === 'soundspot' && isPlaying;
  const isCurrentSoundspot = currentPlayingId === soundspot.id && currentPlayingType === 'soundspot';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Soundspot</Text>
        <TouchableOpacity
          style={styles.headerFavoriteButton}
          onPress={() => handleFavoriteToggle(soundspot.id, 'soundspot')}
        >
          <Ionicons 
            name={isFavorite(soundspot.id, 'soundspot') ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite(soundspot.id, 'soundspot') ? "#FF6B6B" : "white"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Soundspot Info */}
        <LinearGradient
          colors={['#5CD4FF', '#FF6B6B']}
          style={styles.soundspotCard}
        >
          <View style={styles.soundspotInfo}>
            <Text style={styles.soundspotName}>
              {(soundspot.name && typeof soundspot.name === 'string') ? soundspot.name : 'Unnamed Spot'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.soundspotLocation}>
                {' '}{(soundspot.location && soundspot.location.latitude && soundspot.location.longitude) 
                  ? `${soundspot.location.latitude.toFixed(4)}, ${soundspot.location.longitude.toFixed(4)}`
                  : '0.0000, 0.0000'
                }
              </Text>
            </View>
            {soundspot.script && typeof soundspot.script === 'string' && soundspot.script.trim() && (
              <Text style={styles.soundspotScript} numberOfLines={3}>
                {soundspot.script}
              </Text>
            )}
          </View>

          <View style={styles.soundspotControls}>
            <TouchableOpacity
              style={styles.soundspotPlayButton}
              onPress={() => router.push({
                pathname: '/audio-player',
                params: { itemId: soundspot.id, itemType: 'soundspot' }
              })}
            >
              <Ionicons name="play" size={24} color="white" />
              <Text style={styles.soundspotPlayText}>Play Soundspot</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.soundspotQuickPlay}
              onPress={() => 
                isCurrentlyPlayingSoundspot 
                  ? stopAudio() 
                  : playAudio(soundspot.audioUrl || '', soundspot.id, 'soundspot')
              }
            >
              <Ionicons
                name={isCurrentlyPlayingSoundspot ? "pause" : "play-circle"}
                size={32}
                color="white"
              />
            </TouchableOpacity>
          </View>

          {isCurrentSoundspot && (
            <View style={styles.soundspotProgress}>
              <Text style={styles.soundspotProgressTime}>
                {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
              </Text>
              <View style={styles.soundspotProgressBar}>
                <View 
                  style={[
                    styles.soundspotProgressFill, 
                    { width: `${(playbackPosition / playbackDuration) * 100 || 0}%` }
                  ]} 
                />
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Audio Items Section */}
        <View style={styles.audioItemsSection}>
          <Text style={styles.sectionTitle}>
            Audio Items ({(soundspot.audioItemsCount && typeof soundspot.audioItemsCount === 'number') ? soundspot.audioItemsCount : (Array.isArray(audioItems) ? audioItems.length : 0)})
          </Text>
          <Text style={styles.sectionSubtitle}>
            {(soundspot.audioItemsCount && typeof soundspot.audioItemsCount === 'number') ? soundspot.audioItemsCount : (Array.isArray(audioItems) ? audioItems.length : 0)} audio items + soundspot audio available
          </Text>

          {Array.isArray(audioItems) && audioItems.length > 0 ? (
            audioItems
              .filter(item => item && item.id && typeof item.id === 'string')
              .map(renderAudioItem)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes" size={60} color="#666" />
              <Text style={styles.emptyText}>No Audio Items</Text>
              <Text style={styles.emptySubtext}>
                No audio content has been added to this soundspot yet, but you can still listen to the soundspot audio above
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerFavoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#212121",
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
    backgroundColor: "#212121",
    padding: 40,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: "#5CD4FF",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  soundspotCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  soundspotInfo: {
    marginBottom: 20,
  },
  soundspotName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  soundspotLocation: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 10,
  },
  soundspotScript: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  soundspotControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  soundspotPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    justifyContent: 'center',
    marginRight: 15,
  },
  soundspotPlayText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  soundspotQuickPlay: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundspotProgress: {
    marginTop: 15,
  },
  soundspotProgressTime: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 5,
  },
  soundspotProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: "hidden",
  },
  soundspotProgressFill: {
    height: "100%",
    backgroundColor: "white",
  },
  audioItemsSection: {
    flex: 1,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sectionSubtitle: {
    color: "#666",
    fontSize: 14,
    marginBottom: 20,
  },
  audioCard: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
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
    marginBottom: 10,
  },
  audioMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  audioItemCategory: {
    color: "#5CD4FF",
    fontSize: 12,
  },
  audioDuration: {
    color: "#666",
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
});

export default SoundspotDetailScreen; 