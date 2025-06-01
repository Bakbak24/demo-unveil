import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSoundspots } from "../context/SoundspotsContext";
import { Soundspot } from "../services/api";
import { Audio } from 'expo-av';

const NewStoriesScreen = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  const { soundspots, isLoading, fetchSoundspots } = useSoundspots();

  useEffect(() => {
    fetchSoundspots();
  }, []);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playAudio = async (audioUrl: string, id: string) => {
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
      setCurrentPlayingId(id);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setCurrentPlayingId(null);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      setCurrentPlayingId(null);
    }
  };

  const renderSoundSpotItem = (spot: Soundspot) => (
    <TouchableOpacity key={spot.id} style={styles.soundSpotItem}>
      <View style={styles.soundSpotInfo}>
        <Text style={styles.soundSpotName}>{spot.name}</Text>
        <Text style={styles.soundSpotDistance}>
          {spot.location.latitude.toFixed(4)}, {spot.location.longitude.toFixed(4)}
        </Text>
      </View>
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
          size={20}
          color="#5CD4FF"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const customHeaderLeft = () => (
    <TouchableOpacity
      style={{
        width: 55,
        height: 55,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#333",
        marginLeft: 10,
        marginTop: 26,
        marginBottom: 24,
      }}
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.push("/(tabs)/user");
        }
      }}
    >
      <Ionicons name="arrow-back" size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Terugknop */}
      {customHeaderLeft()}

      {/* Grote afbeelding */}
      <Image
        source={{ uri: "https://via.placeholder.com/400x250" }} // Vervang dit door een echte afbeelding
        style={styles.image}
      />

      {/* Modal */}
      <View style={styles.modal}>
        {/* Titel "New stories" */}
        <Text style={styles.modalTitle}>New stories</Text>

       {/* Sound spots from API */}
       {isLoading ? (
         <ActivityIndicator size="large" color="#5CD4FF" style={{ marginVertical: 20 }} />
       ) : (
         soundspots.slice(0, 5).map(renderSoundSpotItem)
       )}

        {/* Titel "What's new?" */}
        <Text style={styles.whatsNewTitle}>What's new?</Text>

        {/* Beschrijvende tekst */}
        <Text style={styles.description}>
          These new stories are all from the area around de Grote Markt. We have stories about some
          restaurants and even a little gem about a palace. Make sure to keep your eyes open on this
          tab since we have new stories and secrets coming your way.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
  },
  image: {
    width: "100%",
    height: 250,
  },
  modal: {
    backgroundColor: "#333333",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: -20, // Overlap de afbeelding een beetje
  },
  modalTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  soundSpotsContainer: {
    marginBottom: 20,
  },
  soundSpot: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
  },
  whatsNewTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    color: "white",
    fontSize: 14,
    lineHeight: 20,
  },
  soundSpotItem: {
    backgroundColor: "#444",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  soundSpotInfo: {
    flex: 1,
  },
  soundSpotName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  soundSpotDistance: {
    color: "#999",
    fontSize: 12,
    marginTop: 2,
  },
  playButton: {
    padding: 10,
  },
});

export default NewStoriesScreen;