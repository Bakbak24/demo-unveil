import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  Dimensions
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSoundspots } from "../context/SoundspotsContext";
import { useAudioItems } from "../context/AudioItemsContext";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";
import { Audio } from 'expo-av';
import { Soundspot, AudioItem } from "../services/api";

const { width } = Dimensions.get('window');

const ForYouScreen = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [currentPlayingType, setCurrentPlayingType] = useState<'audioItem' | 'soundspot' | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'freeRoam' | 'guidedTours'>('all');

  const { soundspots, isLoading: spotsLoading, fetchSoundspots } = useSoundspots();
  const { audioItems, newStories: contextNewStories, bestReviewed: contextBestReviewed, isLoading: audioLoading, fetchAudioItems, fetchNewStories, fetchBestReviewed } = useAudioItems();
  const { addToFavorites, removeFromFavorites, isFavorite, getFavoriteId } = useFavorites();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    fetchSoundspots();
    fetchAudioItems();
    fetchNewStories();
    fetchBestReviewed();
  }, []);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

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
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setCurrentPlayingId(null);
          setCurrentPlayingType(null);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
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
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    return `${minutes}m`;
  };

  const renderStoryCard = (item: AudioItem, index: number) => {
    // Comprehensive safety checks
    if (!item || !item.id || typeof item.id !== 'string') {
      return null;
    }

    // Ensure all required properties exist with safe defaults
    const safeItem = {
      ...item,
      title: (item.title && typeof item.title === 'string') ? item.title : 'Untitled',
      duration: (item.duration && typeof item.duration === 'number') ? item.duration : 0,
      audioUrl: (item.audioUrl && typeof item.audioUrl === 'string') ? item.audioUrl : '',
      averageRating: (item.averageRating && typeof item.averageRating === 'number') ? item.averageRating : 0,
      soundspot: item.soundspot && typeof item.soundspot === 'object' && item.soundspot.name 
        ? { ...item.soundspot, name: String(item.soundspot.name) }
        : { name: 'Unknown Location' }
    };

    try {
      const isCurrentlyPlaying = currentPlayingId === safeItem.id && currentPlayingType === 'audioItem' && isPlaying;
      
      return (
        <TouchableOpacity 
          key={safeItem.id} 
          style={[styles.storyCard, index === 0 && styles.firstStoryCard]}
          onPress={() => router.push({
            pathname: '/audio-player',
            params: { itemId: safeItem.id, itemType: 'audioItem' }
          })}
        >
          <LinearGradient
            colors={['#5CD4FF', '#FF6B6B', '#4CAF50']}
            style={styles.storyCardBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.storyCardOverlay}>
              <View style={styles.storyCardHeader}>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => handleFavoriteToggle(safeItem.id, 'audioItem')}
                >
                  <Ionicons 
                    name={isFavorite(safeItem.id, 'audioItem') ? "heart" : "heart-outline"} 
                    size={20} 
                    color={isFavorite(safeItem.id, 'audioItem') ? "#FF6B6B" : "white"} 
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.storyCardContent}>
                <View style={styles.storyInfo}>
                  <Ionicons name="volume-high" size={16} color="white" />
                  <Text style={styles.storyLocation}>
                    {safeItem.soundspot.name}
                  </Text>
                </View>
                
                <Text style={styles.storyTitle} numberOfLines={2}>
                  {safeItem.title}
                </Text>
                
                <View style={styles.storyMeta}>
                  <Text style={styles.storyDuration}>
                    {formatDuration(safeItem.duration)}
                  </Text>
                  {(safeItem.averageRating && safeItem.averageRating > 0) ? (
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={styles.ratingText}>{safeItem.averageRating.toFixed(1)}</Text>
                    </View>
                  ) : null}
                </View>
                
                <TouchableOpacity 
                  style={[styles.playButton, isCurrentlyPlaying && styles.playButtonActive]}
                  onPress={() => playAudio(safeItem.audioUrl, safeItem.id, 'audioItem')}
                >
                  <Ionicons
                    name={isCurrentlyPlaying ? "pause" : "play"}
                    size={16}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    } catch (error) {
      console.error('Error rendering story card:', error);
      return null;
    }
  };

  const renderSoundspotCard = (spot: Soundspot) => {
    if (!spot || !spot.id || typeof spot.id !== 'string') {
      return null;
    }

    try {
      const isCurrentlyPlaying = currentPlayingId === spot.id && currentPlayingType === 'soundspot' && isPlaying;
      
      return (
        <TouchableOpacity 
          key={spot.id} 
          style={styles.soundspotCard}
          onPress={() => router.push({
            pathname: '/soundspot-detail',
            params: { soundspotId: spot.id }
          })}
        >
          <View style={styles.soundspotCardContent}>
            <View style={styles.soundspotHeader}>
              <Ionicons name="location" size={16} color="#5CD4FF" />
              <Text style={styles.soundspotName} numberOfLines={1}>
                {(spot.name && typeof spot.name === 'string') ? spot.name : 'Unnamed Spot'}
              </Text>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleFavoriteToggle(spot.id, 'soundspot');
                }}
              >
                <Ionicons 
                  name={isFavorite(spot.id, 'soundspot') ? "heart" : "heart-outline"} 
                  size={16} 
                  color={isFavorite(spot.id, 'soundspot') ? "#FF6B6B" : "#666"} 
                />
              </TouchableOpacity>
            </View>
            
            {(spot.script && typeof spot.script === 'string' && spot.script.trim()) ? (
              <Text style={styles.soundspotDescription} numberOfLines={2}>
                {spot.script}
              </Text>
            ) : null}

            {/* Audio Items Count */}
            <View style={styles.soundspotAudioInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="musical-notes" size={12} color="#5CD4FF" />
                <Text style={styles.soundspotAudioCount}>
                  {' '}{(spot.audioItemsCount && typeof spot.audioItemsCount === 'number') ? spot.audioItemsCount.toString() : '0'} audio items
                </Text>
              </View>
              <Text style={styles.soundspotAudioNote}>
                + soundspot audio
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.smallPlayButton, isCurrentlyPlaying && styles.smallPlayButtonActive]}
              onPress={(e) => {
                e.stopPropagation();
                playAudio(spot.audioUrl || '', spot.id, 'soundspot');
              }}
            >
              <Ionicons
                name={isCurrentlyPlaying ? "pause" : "play"}
                size={12}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    } catch (error) {
      console.error('Error rendering soundspot card:', error);
      return null;
    }
  };

  const isLoading = spotsLoading || audioLoading;

  // Get featured content with proper safety checks
  const safeAudioItems = Array.isArray(audioItems) ? audioItems.filter(item => item && item.id) : [];
  const safeContextNewStories = Array.isArray(contextNewStories) ? contextNewStories.filter(item => item && item.id) : [];
  const safeContextBestReviewed = Array.isArray(contextBestReviewed) ? contextBestReviewed.filter(item => item && item.id) : [];
  const safeSoundspots = Array.isArray(soundspots) ? soundspots.filter(spot => spot && spot.id) : [];

  const newStories = safeContextNewStories.length > 0 ? safeContextNewStories : safeAudioItems.slice(0, 5);
  const bestReviewed = safeContextBestReviewed.length > 0 ? safeContextBestReviewed : safeAudioItems
    .filter(item => item && item.averageRating && typeof item.averageRating === 'number' && item.averageRating > 0)
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 5);
  const featuredSpots = safeSoundspots.slice(0, 6);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>Listen, discover, experience</Text>
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.categoryTab, activeCategory === 'all' && styles.activeCategoryTab]}
            onPress={() => setActiveCategory('all')}
          >
            <Text style={[styles.categoryTabText, activeCategory === 'all' && styles.activeCategoryTabText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryTab, activeCategory === 'freeRoam' && styles.activeCategoryTab]}
            onPress={() => setActiveCategory('freeRoam')}
          >
            <Text style={[styles.categoryTabText, activeCategory === 'freeRoam' && styles.activeCategoryTabText]}>
              Free Roam
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryTab, activeCategory === 'guidedTours' && styles.activeCategoryTab]}
            onPress={() => setActiveCategory('guidedTours')}
          >
            <Text style={[styles.categoryTabText, activeCategory === 'guidedTours' && styles.activeCategoryTabText]}>
              Guided Tours
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5CD4FF" />
            <Text style={styles.loadingText}>Loading content...</Text>
          </View>
        ) : (
          <>
            {/* New Stories Section */}
            {Array.isArray(newStories) && newStories.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>New Stories</Text>
                  <TouchableOpacity 
                    style={styles.viewAllButton}
                    onPress={() => router.push('/(tabs)/audio')}
                  >
                    <Text style={styles.viewAllText}>View all</Text>
                    <Ionicons name="arrow-forward" size={16} color="#5CD4FF" />
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.storiesContainer}>
                    {newStories
                      .filter(item => item && item.id && typeof item.id === 'string')
                      .map((item, index) => {
                        try {
                          return renderStoryCard(item, index);
                        } catch (error) {
                          console.error('Error in story card map:', error);
                          return null;
                        }
                      })
                      .filter(Boolean)
                    }
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Best Reviewed Stories Section */}
            {Array.isArray(bestReviewed) && bestReviewed.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Best Reviewed Stories</Text>
                  <TouchableOpacity 
                    style={styles.viewAllButton}
                    onPress={() => router.push('/(tabs)/audio')}
                  >
                    <Text style={styles.viewAllText}>View all</Text>
                    <Ionicons name="arrow-forward" size={16} color="#5CD4FF" />
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.storiesContainer}>
                    {bestReviewed
                      .filter(item => item && item.id && typeof item.id === 'string')
                      .map((item, index) => {
                        try {
                          return renderStoryCard(item, index);
                        } catch (error) {
                          console.error('Error in best reviewed card map:', error);
                          return null;
                        }
                      })
                      .filter(Boolean)
                    }
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Listen Right Now Section */}
            {Array.isArray(featuredSpots) && featuredSpots.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Listen right now</Text>
                  <TouchableOpacity 
                    style={styles.viewAllButton}
                    onPress={() => router.push('/(tabs)/audio')}
                  >
                    <Text style={styles.viewAllText}>See more</Text>
                    <Ionicons name="arrow-forward" size={16} color="#5CD4FF" />
                  </TouchableOpacity>
                </View>
                <View style={styles.soundspotsGrid}>
                  {featuredSpots
                    .filter(spot => spot && spot.id && typeof spot.id === 'string')
                    .map((spot) => {
                      try {
                        return renderSoundspotCard(spot);
                      } catch (error) {
                        console.error('Error in featured soundspot card map:', error);
                        return null;
                      }
                    })
                    .filter(Boolean)
                  }
                </View>
              </View>
            )}

            {/* Get Closer to Listen Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Get closer to listen</Text>
              <Text style={styles.sectionSubtitle}>
                These new stories are all from the area around you
              </Text>
              <View style={styles.soundspotsGrid}>
                {safeSoundspots
                  .slice(0, 3)
                  .filter(spot => spot && spot.id && typeof spot.id === 'string')
                  .map((spot) => {
                    try {
                      return renderSoundspotCard(spot);
                    } catch (error) {
                      console.error('Error in nearby soundspot card map:', error);
                      return null;
                    }
                  })
                  .filter(Boolean)
                }
              </View>
            </View>
          </>
        )}
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: 'center',
  },
  headerSubtitle: {
    color: "#666",
    fontSize: 16,
    marginTop: 5,
    textAlign: 'center',
  },
  categoryTabs: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#333",
  },
  activeCategoryTab: {
    backgroundColor: "#5CD4FF",
  },
  categoryTabText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "500",
  },
  activeCategoryTabText: {
    color: "white",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionSubtitle: {
    color: "#666",
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  viewAllText: {
    color: "#5CD4FF",
    fontSize: 14,
    fontWeight: "500",
  },
  storiesContainer: {
    flexDirection: 'row',
    paddingLeft: 20,
  },
  storyCard: {
    width: width * 0.7,
    height: 200,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  firstStoryCard: {
    width: width * 0.8,
    height: 220,
  },
  storyCardBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  storyCardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 15,
    justifyContent: 'space-between',
  },
  storyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  storyCardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  storyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  storyLocation: {
    color: "white",
    fontSize: 12,
    marginLeft: 5,
    opacity: 0.8,
  },
  storyTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  storyDuration: {
    color: "white",
    fontSize: 12,
    opacity: 0.8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: "#FFD700",
    fontSize: 12,
    marginLeft: 2,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#5CD4FF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: 'flex-start',
  },
  playButtonActive: {
    backgroundColor: "#FF6B6B",
  },
  favoriteButton: {
    padding: 5,
  },
  soundspotsGrid: {
    paddingHorizontal: 20,
  },
  soundspotCard: {
    backgroundColor: "#333",
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  soundspotCardContent: {
    padding: 15,
  },
  soundspotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  soundspotName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginLeft: 8,
  },
  soundspotDescription: {
    color: "#999",
    fontSize: 14,
    marginBottom: 10,
  },
  soundspotAudioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  soundspotAudioCount: {
    color: "#5CD4FF",
    fontSize: 12,
    fontWeight: "500",
    marginRight: 5,
  },
  soundspotAudioNote: {
    color: "#666",
    fontSize: 11,
    fontStyle: 'italic',
  },
  smallPlayButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#5CD4FF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: 'flex-start',
  },
  smallPlayButtonActive: {
    backgroundColor: "#FF6B6B",
  },
});

export default ForYouScreen;