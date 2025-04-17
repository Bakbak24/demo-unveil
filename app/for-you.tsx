import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const ForYouScreen = () => {
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
      {customHeaderLeft()}

      <Image
        source={{ uri: "https://via.placeholder.com/400x250" }}
        style={styles.image}
      />

      <View style={styles.modal}>
        <Text style={styles.modalTitle}>For You</Text>

        <Text style={styles.description}>
          This page is your safe space. All your Favourite spots are here and you can even see how much of the city you’ve explored.
        </Text>

        <Text style={styles.sectionTitle}>Your Favourites</Text>

        <TouchableOpacity style={styles.favouriteItem} onPress={() => console.log("Favourite Place 1 pressed")}>
          <Ionicons name="star" size={20} color="#FFFFFF" style={styles.icon} />
          <View style={styles.favouriteTextContainer}>
            <Text style={styles.favouriteText}>Favourite Place 1</Text>
            <Text style={styles.favouriteDistance}>2.5 km</Text>
          </View>
          <Ionicons name="location-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.favouriteItem} onPress={() => console.log("Favourite Place 2 pressed")}>
          <Ionicons name="star" size={20} color="#FFFFFF" style={styles.icon} />
          <View style={styles.favouriteTextContainer}>
            <Text style={styles.favouriteText}>Favourite Place 2</Text>
            <Text style={styles.favouriteDistance}>5.0 km</Text>
          </View>
          <Ionicons name="location-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.favouriteItem} onPress={() => console.log("Favourite Place 3 pressed")}>
          <Ionicons name="star" size={20} color="#FFFFFF" style={styles.icon} />
          <View style={styles.favouriteTextContainer}>
            <Text style={styles.favouriteText}>Favourite Place 3</Text>
            <Text style={styles.favouriteDistance}>7.8 km</Text>
          </View>
          <Ionicons name="location-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => console.log("See More pressed")}>
          <Text style={styles.seeMoreLink}>See More</Text>
        </TouchableOpacity>
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
    marginTop: -20,
  },
  modalTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  description: {
    color: "white",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  favouriteItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#444444",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  favouriteTextContainer: {
    flex: 1,
  },
  favouriteText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  favouriteDistance: {
    color: "#B0B0B0",
    fontSize: 14,
  },
  seeMoreLink: {
    color: "#5CD4FF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default ForYouScreen;