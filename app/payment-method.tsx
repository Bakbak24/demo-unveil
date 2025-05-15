import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Modal, Pressable } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const PaymentMethodScreen = () => {
  const [showCardOverlay, setShowCardOverlay] = useState(false);

  const customHeaderLeft = () => (
    <TouchableOpacity
      style={styles.backButton}
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
    <View style={styles.container}>
      {customHeaderLeft()}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.largeButton}
          onPress={() => setShowCardOverlay(true)}
        >
          <MaterialCommunityIcons
            name="credit-card-outline"
            size={28}
            color="#5CD4FF"
            style={styles.buttonIconLeft}
          />
          <Text style={styles.buttonText}>Pay with saved card</Text>
          <Ionicons
            name="arrow-forward"
            size={24}
            color="#5CD4FF"
            style={styles.buttonIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.largeButton} onPress={() => { /* pay with payconiq */ }}>
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={28}
            color="#5CD4FF"
            style={styles.buttonIconLeft}
          />
          <Text style={styles.buttonText}>Pay with Payconiq</Text>
          <Ionicons
            name="arrow-forward"
            size={24}
            color="#5CD4FF"
            style={styles.buttonIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Overlay for saved card payment */}
      <Modal
        visible={showCardOverlay}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCardOverlay(false)}
      >
        <Pressable style={styles.overlayBackground} onPress={() => setShowCardOverlay(false)}>
          <Pressable style={styles.bottomSheet} onPress={() => {}}>
            <View style={styles.cardDummy}>
              <MaterialCommunityIcons name="credit-card-chip-outline" size={32} color="#5CD4FF" style={{ marginBottom: 10 }} />
              <Text style={styles.cardNumber}>**** 1234</Text>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Card Holder</Text>
                <Text style={styles.cardLabel}>Valid Thru</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardValue}>J. DOE</Text>
                <Text style={styles.cardValue}>12/27</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.payButton}
              onPress={() => {
                setShowCardOverlay(false);
                setTimeout(() => {
                  router.replace("/purchase-success");
                }, 300);
              }}
            >
              <Text style={styles.payButtonText}>Pay</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    paddingHorizontal: 20,
  },
  backButton: {
    width: 55,
    height: 55,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
    marginLeft: 0,
    marginTop: 26,
    marginBottom: 24,
    alignSelf: "flex-start",
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
  buttonIconLeft: {
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
  // Overlay styles
  overlayBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#333333",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  cardDummy: {
    width: "100%",
    backgroundColor: "#212121",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#5CD4FF",
  },
  cardNumber: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 4,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 2,
  },
  cardLabel: {
    color: "#B0B0B0",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  payButton: {
    backgroundColor: "#5CD4FF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  payButtonText: {
    color: "#212121",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PaymentMethodScreen;