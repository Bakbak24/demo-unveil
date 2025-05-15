import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const BuyTourScreen = () => {
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
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      {customHeaderLeft()}

      <Image
        source={{ uri: "https://via.placeholder.com/400x250" }}
        style={styles.image}
      />

      <View style={styles.modal}>
        <View style={{ flex: 1 }}>
          <Text style={styles.modalTitle}>Trough the outskirts of Mechelen</Text>
          <Text style={styles.description}>
            This guided tour takes you through the outskirts of Mechelen, where you can discover the hidden gems of this beautiful city.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => router.push("/payment-method")}
        >
          <Text style={styles.buyButtonText}>€9.99</Text>
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
    flex: 1,
    minHeight: 300,
    justifyContent: "space-between",
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
  buyButton: {
    backgroundColor: "#5CD4FF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buyButtonText: {
    color: "#212121",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BuyTourScreen;