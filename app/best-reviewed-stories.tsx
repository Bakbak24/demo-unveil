import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const BestReviewedStoriesScreen = () => {
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
        <Text style={styles.modalTitle}>Best Reviewed Stories</Text>

        <Text style={styles.description}>
        Here you’ll find the best of the best. The ultimate secrets, the best spots from locals or an unsolved mystery. All voted best because of you guys. No idea where to start? No worries, here you’ll find an overview.
        </Text>

        <Text style={styles.sectionTitle}>Your Favourites</Text>

        <TouchableOpacity style={styles.favouriteItem} onPress={() => console.log("location pressed")}>
          <Ionicons name="star-outline" size={20} color="#FFFFFF" style={styles.icon} />
          <View style={styles.favouriteTextContainer}>
            <Text style={styles.favouriteText}>Dijleterras</Text>
            <Text style={styles.favouriteDistance}>2.5 km</Text>
          </View>
          <Ionicons name="location-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.favouriteItem} onPress={() => console.log("location pressed")}>
          <Ionicons name="star-outline" size={20} color="#FFFFFF" style={styles.icon} />
          <View style={styles.favouriteTextContainer}>
            <Text style={styles.favouriteText}>Komeetbrug</Text>
            <Text style={styles.favouriteDistance}>5.0 km</Text>
          </View>
          <Ionicons name="location-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.favouriteItem} onPress={() => console.log("location pressed")}>
          <Ionicons name="star-outline" size={20} color="#FFFFFF" style={styles.icon} />
          <View style={styles.favouriteTextContainer}>
            <Text style={styles.favouriteText}>Frituur t'pleintje</Text>
            <Text style={styles.favouriteDistance}>7.8 km</Text>
          </View>
          <Ionicons name="location-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.favouriteItem} onPress={() => console.log("location pressed")}>
          <Ionicons name="star-outline" size={20} color="#FFFFFF" style={styles.icon} />
          <View style={styles.favouriteTextContainer}>
            <Text style={styles.favouriteText}>Speelgoed museum</Text>
            <Text style={styles.favouriteDistance}>1.2 km</Text>
          </View>
          <Ionicons name="location-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.favouriteItem} onPress={() => console.log("location pressed")}>
          <Ionicons name="star-outline" size={20} color="#FFFFFF" style={styles.icon} />
          <View style={styles.favouriteTextContainer}>
            <Text style={styles.favouriteText}>Kazerne Dossin</Text>
            <Text style={styles.favouriteDistance}>3.4 km</Text>
          </View>
          <Ionicons name="location-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.favouriteItem} onPress={() => console.log("location pressed")}>
          <Ionicons name="star-outline" size={20} color="#FFFFFF" style={styles.icon} />
          <View style={styles.favouriteTextContainer}>
            <Text style={styles.favouriteText}>Frutties</Text>
            <Text style={styles.favouriteDistance}>4.1 km</Text>
          </View>
          <Ionicons name="location-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.favouriteItem} onPress={() => console.log("location pressed")}>
          <Ionicons name="star-outline" size={20} color="#FFFFFF" style={styles.icon} />
          <View style={styles.favouriteTextContainer}>
            <Text style={styles.favouriteText}>Hof van Busleyden</Text>
            <Text style={styles.favouriteDistance}>2.8 km</Text>
          </View>
          <Ionicons name="location-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.favouriteItem} onPress={() => console.log("location pressed")}>
          <Ionicons name="star-outline" size={20} color="#FFFFFF" style={styles.icon} />
          <View style={styles.favouriteTextContainer}>
            <Text style={styles.favouriteText}>Sint-Janskerk</Text>
            <Text style={styles.favouriteDistance}>6.0 km</Text>
          </View>
          <Ionicons name="location-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.favouriteItem} onPress={() => console.log("location pressed")}>
          <Ionicons name="star-outline" size={20} color="#FFFFFF" style={styles.icon} />
          <View style={styles.favouriteTextContainer}>
            <Text style={styles.favouriteText}>KUUB</Text>
            <Text style={styles.favouriteDistance}>5.5 km</Text>
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

export default BestReviewedStoriesScreen;