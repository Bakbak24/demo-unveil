import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const PurchaseSuccessScreen = () => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/(tabs)/audio");
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="checkmark" size={48} color="#fff" />
      </View>
      <Text style={styles.successText}>Purchase successful!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    backgroundColor: "#5CD4FF",
    borderRadius: 60,
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  successText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default PurchaseSuccessScreen;