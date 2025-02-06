import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";

// Pre-gedefinieerde mapping van audio-bestanden
const audioFiles: { [key: string]: any } = {
  "audio_dijle.mp3": require("../../assets/audio/audio_dijle.mp3"),
  "audio_dossinkazerne.mp3": require("../../assets/audio/audio_dossinkazerne.mp3"),
};

const AudioScreen = () => {
  const { audio, text } = useLocalSearchParams() as {
    audio: keyof typeof audioFiles;
    text: string;
  };
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const loadAndPlayAudio = async () => {
      if (!audio) return;

      try {
        // Selecteerd het juiste audio-bestand uit de mapping
        const selectedAudio = audioFiles[audio];
        if (!selectedAudio) {
          console.error("Audio-bestand niet gevonden:", audio);
          return;
        }

        // Laad en speelt de geselecteerde audio
        const { sound: playbackObject } = await Audio.Sound.createAsync(
          selectedAudio,
          { shouldPlay: true }
        );
        setSound(playbackObject);
        setIsPlaying(true);

        playbackObject.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setCurrentPosition(formatTime(status.positionMillis));
            setDuration(formatTime(status.durationMillis ?? 0));
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
  }, [audio]); // Voegt audio toe als dependency, zodat de audio opnieuw wordt geladen wanneer deze verandert

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

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      setCurrentPosition("0:00");
      setDuration("0:00");
    }
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Now Playing</Text>
      <Text>
        {currentPosition} / {duration}
      </Text>
      <View style={styles.controls}>
        {isPlaying ? (
          <Button title="Pause" onPress={pauseAudio} />
        ) : (
          <Button title="Play" onPress={playAudio} />
        )}
        <Button title="Stop" onPress={stopAudio} />
      </View>
      <TouchableOpacity
        style={styles.textButton}
        onPress={() => setShowText(true)}
      >
        <Text style={styles.textButtonText}>Show Text</Text>
      </TouchableOpacity>
      <Modal visible={showText} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>{text}</Text>
          <Button title="Close" onPress={() => setShowText(false)} />
        </View>
      </Modal>
    </View>
  );
};

export default AudioScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: 24, marginBottom: 20 },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  textButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  textButtonText: { color: "white" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalText: { fontSize: 18, marginBottom: 20 },
});
