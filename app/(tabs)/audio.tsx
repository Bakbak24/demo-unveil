import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Modal, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { createStackNavigator } from '@react-navigation/stack';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  AudioList: undefined;
  AudioPlayer: { audio: any; text: string };
};

type AudioListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AudioList'>;
type AudioPlayerScreenRouteProp = RouteProp<RootStackParamList, 'AudioPlayer'>;

type AudioListScreenProps = {
  navigation: AudioListScreenNavigationProp;
};

type AudioPlayerScreenProps = {
  route: AudioPlayerScreenRouteProp;
  navigation: AudioListScreenNavigationProp;
};

const Stack = createStackNavigator<RootStackParamList>();

function AudioListScreen({ navigation }: AudioListScreenProps) {
  return (
    <View style={styles.container}>
      <Button
        title="De Dijle"
        onPress={() =>
          navigation.navigate('AudioPlayer', {
            audio: require('../../assets/audio/audio_dijle.mp3'),
            text: 'De Dijle is een van de belangrijkste rivieren van Mechelen en heeft een rijke geschiedenis...'
          })
        }
      />
      <Button
        title="Dossin Kazerne"
        onPress={() =>
          navigation.navigate('AudioPlayer', {
            audio: require('../../assets/audio/audio_dossinkazerne.mp3'),
            text: 'De Dossinkazerne in Mechelen is een plek met een indrukwekkende en aangrijpende geschiedenis...'
          })
        }
      />
    </View>
  );
}

function AudioPlayerScreen({ route, navigation }: AudioPlayerScreenProps) {
  const { audio, text } = route.params;
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playAudio = async () => {
    const { sound: playbackObject, status } = await Audio.Sound.createAsync(audio);
    setSound(playbackObject);
    setIsPlaying(true);
    playbackObject.playAsync();

    playbackObject.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        setCurrentPosition(formatTime(status.positionMillis));
        setDuration(formatTime(status.durationMillis ?? 0));
      }
    });
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
      setCurrentPosition('0:00');
      setDuration('0:00');
    }
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Now Playing</Text>
      <Text>{currentPosition} / {duration}</Text>
      <View style={styles.controls}>
        {!isPlaying ? (
          <Button title="Play" onPress={playAudio} />
        ) : (
          <Button title="Pause" onPress={pauseAudio} />
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
      <Button title="Back" onPress={() => { stopAudio(); navigation.goBack(); }} />
    </View>
  );
}

export default function AudioScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AudioList" component={AudioListScreen} />
      <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  textButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  textButtonText: {
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
});
