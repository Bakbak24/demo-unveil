import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, Modal, TouchableOpacity } from "react-native";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";

const AudioScreen = () => {
  const { audio, text } = useLocalSearchParams<{ audio: string; text: string }>();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const loadAndPlayAudio = async () => {
      const { sound: playbackObject } = await Audio.Sound.createAsync(
        require(`../../assets/audio/audio_dijle.mp3`),
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
    };

    loadAndPlayAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

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
      <Text>{currentPosition} / {duration}</Text>
      <View style={styles.controls}>
        {isPlaying ? (
          <Button title="Pause" onPress={pauseAudio} />
        ) : (
          <Button title="Play" onPress={playAudio} />
        )}
        <Button title="Stop" onPress={stopAudio} />
      </View>
      <TouchableOpacity style={styles.textButton} onPress={() => setShowText(true)}>
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
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  controls: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  textButton: { marginTop: 20, padding: 10, backgroundColor: "blue", borderRadius: 5 },
  textButtonText: { color: "white" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalText: { fontSize: 18, marginBottom: 20 },
});
