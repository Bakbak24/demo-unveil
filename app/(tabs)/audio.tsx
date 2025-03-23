import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GuidedTourWrapper from "../../components/GuidedTourWrapper";
import FavouriteSoundSpot from "../../components/FavouriteSoundSpot";

const AudioScreen = () => {
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Free Roam", "Guided tours", "Your favourites"];

  // Render content gebaseerd op de actieve tab
  const renderContent = () => {
    switch (activeTab) {
      case "Guided tours":
        return (
          <>
            {/* Variant 1: Gekocht */}
            <GuidedTourWrapper
              imageUrl="https://via.placeholder.com/140"
              title="Mechelen and the holocaust"
              isPurchased={true}
              onPress={() => console.log("Start tour")}
            />
            <GuidedTourWrapper
              imageUrl="https://via.placeholder.com/140"
              title="The mirror of Mechelen"
              isPurchased={true}
              onPress={() => console.log("Start tour")}
            />
            {/* Variant 2: Niet gekocht */}
            <GuidedTourWrapper
              imageUrl="https://via.placeholder.com/140"
              title="Through the outskirts"
              isPurchased={false}
              onPress={() => console.log("Buy tour")}
            />
            <GuidedTourWrapper
              imageUrl="https://via.placeholder.com/140"
              title="A foodies guide to Mechelen"
              isPurchased={false}
              onPress={() => console.log("Buy tour")}
            />
          </>
        );
      case "Your favourites":
        return (
          <>
            {/* Lijst van favoriete sound spots */}
            <FavouriteSoundSpot
              name="Volmolen"
              distance="48m"
              onPress={() => console.log("Volmolen pressed")}
            />
            <FavouriteSoundSpot
              name="Kruidtuin"
              distance="203m"
              onPress={() => console.log("Kruidtuin pressed")}
            />
            <FavouriteSoundSpot
              name="Het Dijlepad"
              distance="412m"
              onPress={() => console.log("Het Dijlepad pressed")}
            />
            <FavouriteSoundSpot
              name="Bruul"
              distance="120m"
              onPress={() => console.log("Bruul pressed")}
            />
            <FavouriteSoundSpot
              name="Vismarkt"
              distance="85m"
              onPress={() => console.log("Vismarkt pressed")}
            />
            <FavouriteSoundSpot
              name="De Witte Vos"
              distance="310m"
              onPress={() => console.log("De witte vos pressed")}
            />
            <FavouriteSoundSpot
              name="De Moeder"
              distance="500m"
              onPress={() => console.log("De moeder pressed")}
            />
          </>
        );
      default:
        return <DefaultContent />;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.profileContainer}>
          {/* Profielfoto */}
          <Image
            source={require("../../assets/images/pfp.png")}
            style={styles.profilePicture}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === tab && styles.activeTabButtonText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Render de content gebaseerd op de actieve tab */}
        {renderContent()}
      </View>
    </ScrollView>
  );
};

// Standaard content voor de andere tabs
const DefaultContent = () => (
  <View>
    {/* Grotere knoppen */}
    <View style={styles.buttonsContainer}>
      <TouchableOpacity style={styles.largeButton}>
        <View style={styles.buttonImagePlaceholder} />
        <Text style={styles.buttonText}>New Stories</Text>
        <Ionicons
          name="arrow-forward"
          size={24}
          color="white"
          style={styles.buttonIcon}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.largeButton}>
        <View style={styles.buttonImagePlaceholder} />
        <Text style={styles.buttonText}>Best Reviewed Stories</Text>
        <Ionicons
          name="arrow-forward"
          size={24}
          color="white"
          style={styles.buttonIcon}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.largeButton}>
        <View style={styles.buttonImagePlaceholder} />
        <Text style={styles.buttonText}>For You</Text>
        <Ionicons
          name="arrow-forward"
          size={24}
          color="white"
          style={styles.buttonIcon}
        />
      </TouchableOpacity>
    </View>

    {/* Listen right now */}
    <Text style={styles.sectionTitle}>Listen right now</Text>
    <View style={styles.listenNowContainer}>
      <TouchableOpacity style={styles.listenNowButton}>
        <Ionicons
          name="headset"
          size={24}
          color="white"
          style={styles.listenNowIcon}
        />
        <View style={styles.listenNowTextContainer}>
          <Text style={styles.listenNowTitle}>Campus De Ham Thomas More</Text>
          <Text style={styles.listenNowDistance}>4m</Text>
        </View>
        <Ionicons
          name="play"
          size={24}
          color="#5CD4FF"
          style={styles.listenNowIcon}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.listenNowButton}>
        <Ionicons
          name="headset"
          size={24}
          color="white"
          style={styles.listenNowIcon}
        />
        <View style={styles.listenNowTextContainer}>
          <Text style={styles.listenNowTitle}>Alice Nahonplein</Text>
          <Text style={styles.listenNowDistance}>18m</Text>
        </View>
        <Ionicons
          name="play"
          size={24}
          color="#5CD4FF"
          style={styles.listenNowIcon}
        />
      </TouchableOpacity>
    </View>
    <TouchableOpacity>
      <Text style={styles.seeMoreText}>See more</Text>
    </TouchableOpacity>

    {/* Get closer to listen */}
    <Text style={styles.sectionTitle}>Get closer to listen</Text>
    <View style={styles.listenNowContainer}>
      <TouchableOpacity style={styles.listenNowButton}>
        <Ionicons
          name="headset"
          size={24}
          color="white"
          style={styles.listenNowIcon}
        />
        <View style={styles.listenNowTextContainer}>
          <Text style={styles.listenNowTitle}>Volmolen</Text>
          <Text style={styles.listenNowDistance}>48m</Text>
        </View>
        <Ionicons
          name="location"
          size={24}
          color="#5CD4FF"
          style={styles.listenNowIcon}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.listenNowButton}>
        <Ionicons
          name="headset"
          size={24}
          color="white"
          style={styles.listenNowIcon}
        />
        <View style={styles.listenNowTextContainer}>
          <Text style={styles.listenNowTitle}>Kruidtuin</Text>
          <Text style={styles.listenNowDistance}>203m</Text>
        </View>
        <Ionicons
          name="location"
          size={24}
          color="#5CD4FF"
          style={styles.listenNowIcon}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.listenNowButton}>
        <Ionicons
          name="headset"
          size={24}
          color="white"
          style={styles.listenNowIcon}
        />
        <View style={styles.listenNowTextContainer}>
          <Text style={styles.listenNowTitle}>Het Dijlepad</Text>
          <Text style={styles.listenNowDistance}>412m</Text>
        </View>
        <Ionicons
          name="location"
          size={24}
          color="#5CD4FF"
          style={styles.listenNowIcon}
        />
      </TouchableOpacity>
    </View>
    <TouchableOpacity>
      <Text style={styles.seeMoreText}>See more</Text>
    </TouchableOpacity>

    {/* Guided tours */}
    <Text style={styles.sectionTitle}>Guided tours</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.guidedToursContainer}
    >
      <View style={styles.guidedTourItem}>
        <Image
          source={{ uri: "https://via.placeholder.com/150" }}
          style={styles.guidedTourImage}
          blurRadius={5}
        />
        <Text style={styles.guidedTourTitle}>Mechelen and the holocaust</Text>
        <Text style={styles.guidedTourSubtitle}>
          From Dossin to the hidden stories
        </Text>
      </View>
      <View style={styles.guidedTourItem}>
        <Image
          source={{ uri: "https://via.placeholder.com/150" }}
          style={styles.guidedTourImage}
          blurRadius={5}
        />
        <Text style={styles.guidedTourTitle}>The mirror of Mechelen</Text>
        <Text style={styles.guidedTourSubtitle}>
          From trade route to connector
        </Text>
      </View>
      <View style={styles.guidedTourItem}>
        <Image
          source={{ uri: "https://via.placeholder.com/150" }}
          style={styles.guidedTourImage}
          blurRadius={5}
        />
        <Text style={styles.guidedTourTitle}>Trough the outskirts</Text>
        <Text style={styles.guidedTourSubtitle}>
          When you want some peace and quiet
        </Text>
      </View>
      <View style={styles.guidedTourItem}>
        <Image
          source={{ uri: "https://via.placeholder.com/150" }}
          style={styles.guidedTourImage}
          blurRadius={5}
        />
        <Text style={styles.guidedTourTitle}>A foodies guide to Mechelen</Text>
        <Text style={styles.guidedTourSubtitle}>
          Don't get too hungry listening to these
        </Text>
      </View>
    </ScrollView>
  </View>
);

export default AudioScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    paddingHorizontal: 20,
  },
  contentContainer: {
    marginTop: 30,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#5CD4FF",
    marginRight: 20,
  },
  tabsContainer: {
    flexDirection: "row",
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
    backgroundColor: "#333333",
    marginRight: 10,
  },
  activeTabButton: {
    backgroundColor: "#5CD4FF",
  },
  tabButtonText: {
    color: "white",
    fontSize: 16,
  },
  activeTabButtonText: {
    color: "#212121",
  },
  buttonsContainer: {
    marginTop: 20,
    width: "100%",
  },
  largeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333333",
    borderRadius: 10,
    marginVertical: 10,
    padding: 10,
    width: "100%",
  },
  buttonImagePlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: "#555555",
    borderRadius: 5,
    marginRight: 10,
  },
  buttonText: {
    flex: 1,
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonIcon: {
    marginLeft: 10,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "bold",
  },
  listenNowContainer: {
    marginTop: 10,
  },
  listenNowButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333333",
    borderRadius: 10,
    marginVertical: 10,
    padding: 10,
  },
  listenNowIcon: {
    marginHorizontal: 10,
  },
  listenNowTextContainer: {
    flex: 1,
  },
  listenNowTitle: {
    color: "white",
    fontSize: 18,
  },
  listenNowDistance: {
    color: "white",
    fontSize: 12,
  },
  seeMoreText: {
    color: "#5CD4FF",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  guidedToursContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  guidedTourItem: {
    marginRight: 15,
    alignItems: "center",
  },
  guidedTourImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    backgroundColor: "#5CD4FF",
  },
  guidedTourTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    width: "50%",
  },
  guidedTourSubtitle: {
    color: "white",
    fontSize: 12,
    textAlign: "left",
    marginTop: 5,
    marginBottom: 24,
    width: "80%",
  },
  tabMessage: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
    marginTop: 50,
  },
});
