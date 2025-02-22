import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Voor icoontjes

const audioFiles: { [key: string]: any } = {
  "audio_dijle.mp3": require("../../assets/audio/audio_dijle.mp3"),
  "audio_dossinkazerne.mp3": require("../../assets/audio/audio_dossinkazerne.mp3"),
};

const AudioScreen = () => {
  const { audio, text } = useLocalSearchParams() as {
    audio: keyof typeof audioFiles;
    text: string;
  };
  const router = useRouter();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const loadAndPlayAudio = async () => {
      if (!audio) return;

      try {
        const selectedAudio = audioFiles[audio];
        if (!selectedAudio) {
          console.error("Audio-bestand niet gevonden:", audio);
          return;
        }

        const { sound: playbackObject } = await Audio.Sound.createAsync(
          selectedAudio,
          { shouldPlay: true }
        );
        setSound(playbackObject);
        setIsPlaying(true);

        playbackObject.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setProgress(status.positionMillis / (status.durationMillis || 1));
            setDuration(status.durationMillis || 1);
          }
        });
      } catch (error) {
        console.error("Fout bij het laden van de audio:", error);
      }
    };

    loadAndPlayAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audio]);

  const playAudio = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const seekAudio = async (direction: "forward" | "backward") => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        let newPosition =
          direction === "forward"
            ? status.positionMillis + 5000
            : status.positionMillis - 5000;
        newPosition = Math.max(0, Math.min(newPosition, duration));
        await sound.setPositionAsync(newPosition);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Blauwe Cirkel */}
      <View style={styles.circle} />

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[styles.progressBar, { width: `${progress * 100}%` }]}
        />
        <View
          style={[styles.progressThumb, { left: `${progress * 100}%` }]}
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => seekAudio("backward")}>
          <Ionicons name="play-back" size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={isPlaying ? pauseAudio : playAudio}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={40}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => seekAudio("forward")}>
          <Ionicons name="play-forward" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* Read Button */}
      <TouchableOpacity
        style={styles.readButton}
        onPress={() => setShowText(true)}
      >
        <Text style={styles.readButtonText}>Read</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={showText} animationType="slide">
        <View style={styles.modalContainer}>
          {/* Title */}
          <Text style={styles.modalTitle}>Campus De Ham ThomasMore</Text>
          
          {/* Text about Thomas More in Mechelen */}
          <Text style={styles.modalText}>
            Thomas More is a university of applied sciences in Mechelen, Belgium. It offers a wide range of bachelor's and master's programs in various fields of study. The campus in De Ham is known for its modern facilities and vibrant student life.
          </Text>
          
          {/* Close Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowText(false)}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default AudioScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#5CD4FF",
    marginBottom: 20,
  },
  progressBarContainer: {
    width: "80%",
    height: 5,
    backgroundColor: "#444",
    borderRadius: 2.5,
    marginVertical: 15,
    position: "relative",
  },
  progressBar: {
    height: 5,
    backgroundColor: "#5CD4FF",
    borderRadius: 2.5,
    position: "absolute",
    left: 0,
    top: 0,
  },
  progressThumb: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: "#5CD4FF",
    position: "absolute",
    top: -5,
    marginLeft: -7.5,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "60%",
    marginTop: 20,
  },
  readButton: {
    position: "absolute",
    right: 20,
    bottom: 80,
    backgroundColor: "#333333",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  readButtonText: {
    color: "white",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#212121",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 24,
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  modalText: {
    fontSize: 18,
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
});