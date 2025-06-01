import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";

interface GuidedTourWrapperProps {
  imageUrl: string;
  title: string;
  isPurchased: boolean;
  onPress: () => void;
}

const GuidedTourWrapper: React.FC<GuidedTourWrapperProps> = ({ imageUrl, title, isPurchased, onPress }) => {
  return (
    <View style={styles.wrapper}>
      {/* Afbeelding */}
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
      />

      {/* Tekst en knop */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          style={[
            styles.button,
            isPurchased ? styles.startButton : styles.buyButton,
          ]}
          onPress={onPress}
        >
          <Text style={[
            styles.buttonText,
            isPurchased ? styles.startButtonText : styles.buyButtonText,
          ]}>
            {isPurchased ? "Start" : "Buy"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333333",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 10,
    marginRight: 15,
  },
  content: {
    flex: 1,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "900", // Extra bold
    marginBottom: 10,
  },
  button: {
    width: "auto", // Pas de breedte aan op basis van de tekst
    height: 53,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20, // Voeg padding toe voor een betere uitlijning
  },
  startButton: {
    backgroundColor: "#5CD4FF", // Blauw
  },
  buyButton: {
    backgroundColor: "#555555", // Grijs
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  startButtonText: {
    color: "#212121", // Zwart
  },
  buyButtonText: {
    color: "white", // Wit
  },
});

export default GuidedTourWrapper;