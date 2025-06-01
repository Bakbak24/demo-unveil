import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useFavorites } from '../context/FavoritesContext';
import { useAudioItems } from '../context/AudioItemsContext';
import { useSoundspots } from '../context/SoundspotsContext';
import { AudioItem, Soundspot } from '../services/api';

const { width, height } = Dimensions.get('window');

const AudioPlayerScreen = () => {
  const params = useLocalSearchParams();
  const { itemId, itemType } = params as { itemId: string; itemType: 'audioItem' | 'soundspot' };

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [currentItem, setCurrentItem] = useState<AudioItem | Soundspot | null>(null);

  const { addToFavorites, removeFromFavorites, isFavorite, getFavoriteId } = useFavorites();
  const { audioItems } = useAudioItems();
  const { soundspots } = useSoundspots();

  useEffect(() => {
    // Find the current item with safety checks
    if (itemType === 'audioItem') {
      const item = Array.isArray(audioItems) ? audioItems.find(audio => audio && audio.id === itemId) : null;
      setCurrentItem(item || null);
    } else {
      const item = Array.isArray(soundspots) ? soundspots.find(spot => spot && spot.id === itemId) : null;
      setCurrentItem(item || null);
    }
  }, [itemId, itemType, audioItems, soundspots]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playAudio = async () => {
    if (!currentItem) return;

    const audioUrl = itemType === 'audioItem' 
      ? (currentItem as AudioItem).audioUrl 
      : (currentItem as Soundspot).audioUrl;

    if (!audioUrl || audioUrl.trim() === '') {
      Alert.alert('Error', 'Audio file not available');
      return;
    }

    setIsLoading(true);

    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true }
        );
        
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPlaybackPosition(status.positionMillis || 0);
            setPlaybackDuration(status.durationMillis || 0);
            
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPlaybackPosition(0);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio');
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      setPlaybackPosition(0);
    }
  };

  const seekAudio = async (position: number) => {
    if (sound) {
      await sound.setPositionAsync(position);
      setPlaybackPosition(position);
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleFavoriteToggle = async () => {
    if (!currentItem) return;

    try {
      if (isFavorite(itemId, itemType)) {
        const favoriteId = getFavoriteId(itemId, itemType);
        if (favoriteId) {
          await removeFromFavorites(favoriteId);
        }
      } else {
        await addToFavorites(itemId, itemType);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const getProgressPercentage = () => {
    if (playbackDuration === 0) return 0;
    return (playbackPosition / playbackDuration) * 100;
  };

  const handleProgressBarPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const progressBarWidth = width - 80;
    const percentage = locationX / progressBarWidth;
    const newPosition = percentage * playbackDuration;
    seekAudio(newPosition);
  };

  if (!currentItem) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5CD4FF" />
        <Text style={styles.loadingText}>Loading audio...</Text>
      </View>
    );
  }

  const title = itemType === 'audioItem' 
    ? ((currentItem as AudioItem)?.title && typeof (currentItem as AudioItem).title === 'string') 
      ? (currentItem as AudioItem).title 
      : 'Untitled'
    : ((currentItem as Soundspot)?.name && typeof (currentItem as Soundspot).name === 'string') 
      ? (currentItem as Soundspot).name 
      : 'Unnamed Spot';

  const description = itemType === 'audioItem' 
    ? ((currentItem as AudioItem)?.description && typeof (currentItem as AudioItem).description === 'string') 
      ? (currentItem as AudioItem).description 
      : ''
    : ((currentItem as Soundspot)?.script && typeof (currentItem as Soundspot).script === 'string') 
      ? (currentItem as Soundspot).script 
      : '';

  const category = itemType === 'audioItem' 
    ? ((currentItem as AudioItem)?.category && typeof (currentItem as AudioItem).category === 'string') 
      ? (currentItem as AudioItem).category 
      : 'General'
    : 'Soundspot';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Now Playing</Text>
        
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoriteToggle}
        >
          <Ionicons 
            name={isFavorite(itemId, itemType) ? "heart" : "heart-outline"} 
            size={28} 
            color={isFavorite(itemId, itemType) ? "#FF6B6B" : "white"} 
          />
        </TouchableOpacity>
      </View>

      {/* Album Art Area */}
      <View style={styles.albumArtContainer}>
        <View style={styles.albumArt}>
          <LinearGradient
            colors={['#5CD4FF', '#FF6B6B', '#4CAF50']}
            style={styles.albumGradient}
          >
            <Ionicons 
              name={itemType === 'audioItem' ? "musical-notes" : "location"} 
              size={80} 
              color="white" 
            />
          </LinearGradient>
        </View>
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.trackCategory}>
          {category}
        </Text>
        {description && (
          <Text style={styles.trackDescription} numberOfLines={3}>
            {description}
          </Text>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formatTime(playbackPosition)}
          </Text>
          <Text style={styles.timeText}>
            {formatTime(playbackDuration)}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.progressBarContainer}
          onPress={handleProgressBarPress}
          activeOpacity={0.8}
        >
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getProgressPercentage()}%` }
              ]} 
            />
            <View 
              style={[
                styles.progressThumb,
                { left: `${getProgressPercentage()}%` }
              ]}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => seekAudio(Math.max(0, playbackPosition - 15000))}
        >
          <Ionicons name="play-back" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playButton, isLoading && styles.playButtonLoading]}
          onPress={playAudio}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={40}
              color="white"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => seekAudio(Math.min(playbackDuration, playbackPosition + 15000))}
        >
          <Ionicons name="play-forward" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* Additional Controls */}
      <View style={styles.additionalControls}>
        <TouchableOpacity
          style={styles.additionalButton}
          onPress={stopAudio}
        >
          <Ionicons name="stop" size={24} color="#999" />
          <Text style={styles.additionalButtonText}>Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.additionalButton}
          onPress={() => {
            // Add to queue functionality can be implemented here
            Alert.alert('Info', 'Add to queue feature coming soon!');
          }}
        >
          <Ionicons name="list" size={24} color="#999" />
          <Text style={styles.additionalButtonText}>Queue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.additionalButton}
          onPress={() => {
            // Share functionality can be implemented here
            Alert.alert('Info', 'Share feature coming soon!');
          }}
        >
          <Ionicons name="share" size={24} color="#999" />
          <Text style={styles.additionalButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
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
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumArtContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  albumArt: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  albumGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 40,
  },
  trackTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  trackCategory: {
    color: '#5CD4FF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  trackDescription: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressSection: {
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeText: {
    color: '#999',
    fontSize: 12,
  },
  progressBarContainer: {
    height: 40,
    justifyContent: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5CD4FF',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: '#5CD4FF',
    borderRadius: 8,
    marginLeft: -8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#5CD4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    elevation: 5,
    shadowColor: '#5CD4FF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  playButtonLoading: {
    backgroundColor: '#999',
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 60,
    paddingBottom: 40,
  },
  additionalButton: {
    alignItems: 'center',
  },
  additionalButtonText: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
  },
});

export default AudioPlayerScreen; 