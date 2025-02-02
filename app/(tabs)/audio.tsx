// import React, { useState } from 'react';
// import { Text, View, StyleSheet, Button, Modal, TouchableOpacity } from 'react-native';
// import AudioRecorderPlayer from 'react-native-audio-recorder-player';
// import { createStackNavigator } from '@react-navigation/stack';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { RouteProp } from '@react-navigation/native';

// type RootStackParamList = {
//   AudioList: undefined;
//   AudioPlayer: { audio: any; text: string };
// };

// type AudioListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AudioList'>;
// type AudioPlayerScreenRouteProp = RouteProp<RootStackParamList, 'AudioPlayer'>;

// type AudioListScreenProps = {
//   navigation: AudioListScreenNavigationProp;
// };

// type AudioPlayerScreenProps = {
//   route: AudioPlayerScreenRouteProp;
//   navigation: AudioListScreenNavigationProp;
// };

// const Stack = createStackNavigator<RootStackParamList>();
// const audioPlayer = new AudioRecorderPlayer();

// function AudioListScreen({ navigation }: AudioListScreenProps) {
//   return (
//     <View style={styles.container}>
//       <Button
//         title="De Dijle"
//         onPress={() =>
//           navigation.navigate('AudioPlayer', {
//             audio: require('../../assets/audio/audio_dijle.mp3'),
//             text: `De Dijle is een van de belangrijkste rivieren van Mechelen en heeft een rijke geschiedenis. Al in de middeleeuwen speelde de rivier een cruciale rol in de ontwikkeling van de stad. Het diende als handelsroute, waardoor Mechelen een bloeiend centrum werd voor ambachten en handel. De rivier werd ook gebruikt om goederen zoals bier en textiel te vervoeren. Daarnaast had de Dijle een belangrijke functie in de waterhuishouding en bood het bescherming door de aanleg van vestingen langs de oevers. Tegenwoordig is de Dijle niet alleen een historische waterweg, maar ook een bron van ontspanning, met prachtige wandelroutes en bruggen die het rijke verleden van Mechelen verbinden met het heden.`
//           })
//         }
//       />
//       <Button
//         title="Dossin Kazerne"
//         onPress={() =>
//           navigation.navigate('AudioPlayer', {
//             audio: require('../../assets/audio/audio_dossinkazerne.mp3'),
//             text: `De Dossinkazerne in Mechelen is een plek met een indrukwekkende en aangrijpende geschiedenis. Gebouwd in 1756, diende het oorspronkelijk als militair complex. Tijdens de Tweede Wereldoorlog kreeg het echter een donkere rol. Van 1942 tot 1944 werd het door de nazi's gebruikt als verzamelkamp, waar meer dan 25.000 Joden en Roma werden gedeporteerd naar Auschwitz en andere vernietigingskampen. Vandaag de dag is de Dossinkazerne een herdenkingsplaats en museum, waar bezoekers kunnen leren over de Holocaust en de gevolgen van discriminatie, racisme en intolerantie. Het is een plek van herinnering, educatie en bewustwording, die ons oproept om de geschiedenis niet te vergeten en op te komen voor mensenrechten.`
//           })
//         }
//       />
//     </View>
//   );
// }

// function AudioPlayerScreen({ route, navigation }: AudioPlayerScreenProps) {
//   const { audio, text } = route.params;
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentPosition, setCurrentPosition] = useState('0:00');
//   const [duration, setDuration] = useState('0:00');
//   const [showText, setShowText] = useState(false);

//   const playAudio = async () => {
//     setIsPlaying(true);
//     const audioPath = audio.default; // Pak het pad correct uit
//     await audioPlayer.startPlayer(audioPath);
//     audioPlayer.addPlayBackListener((e) => {
//       setCurrentPosition(audioPlayer.mmssss(Math.floor(e.currentPosition)));
//       setDuration(audioPlayer.mmssss(Math.floor(e.duration)));
//     });
//   };

//   const pauseAudio = async () => {
//     setIsPlaying(false);
//     await audioPlayer.pausePlayer();
//   };

//   const stopAudio = async () => {
//     setIsPlaying(false);
//     await audioPlayer.stopPlayer();
//     audioPlayer.removePlayBackListener();
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Now Playing</Text>
//       <Text>{currentPosition} / {duration}</Text>
//       <View style={styles.controls}>
//         {!isPlaying ? (
//           <Button title="Play" onPress={playAudio} />
//         ) : (
//           <Button title="Pause" onPress={pauseAudio} />
//         )}
//         <Button title="Stop" onPress={stopAudio} />
//       </View>
//       <TouchableOpacity style={styles.textButton} onPress={() => setShowText(true)}>
//         <Text style={styles.textButtonText}>Show Text</Text>
//       </TouchableOpacity>
//       <Modal visible={showText} animationType="slide">
//         <View style={styles.modalContainer}>
//           <Text style={styles.modalText}>{text}</Text> {/* Zorg ervoor dat tekst in een Text component staat */}
//           <Button title="Close" onPress={() => setShowText(false)} />
//         </View>
//       </Modal>
//       <Button title="Back" onPress={() => { stopAudio(); navigation.goBack(); }} />
//     </View>
//   );
// }

// export default function AudioScreen() {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen name="AudioList" component={AudioListScreen} />
//       <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} />
//     </Stack.Navigator>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     marginBottom: 20,
//   },
//   controls: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 20,
//   },
//   textButton: {
//     marginTop: 20,
//     padding: 10,
//     backgroundColor: 'blue',
//     borderRadius: 5,
//   },
//   textButtonText: {
//     color: 'white',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalText: {
//     fontSize: 18,
//     marginBottom: 20,
//   },
// });