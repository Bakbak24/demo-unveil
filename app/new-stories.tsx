import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import SoundSpotItem from "../components/SoundSpotItem";

const NewStoriesScreen = () => {
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

       {/* Lijst van 5 sound spots */}
       <SoundSpotItem
          name="Volmolen"
          distance="48m"
          onPress={() => console.log("Volmolen pressed")}
        />
        <SoundSpotItem
          name="Kruidtuin"
          distance="203m"
          onPress={() => console.log("Kruidtuin pressed")}
        />
        <SoundSpotItem
          name="Het Dijlepad"
          distance="412m"
          onPress={() => console.log("Het Dijlepad pressed")}
        />
        <SoundSpotItem
          name="Bruul"
          distance="120m"
          onPress={() => console.log("Bruul pressed")}
        />
        <SoundSpotItem
          name="Vismarkt"
          distance="85m"
          onPress={() => console.log("Vismarkt pressed")}
        />

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
});

export default NewStoriesScreen;