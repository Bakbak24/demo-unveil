import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PaymentScreen() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    setIsAddingCard(false);
  };

  const handleAddCardPress = () => {
    setIsAddingCard(true);
  };

  return (
    <View style={styles.container}>
      {/* Your Cards Button */}
      <TouchableOpacity style={styles.yourCardsButton} onPress={toggleModal}>
        <Ionicons
          name="card-outline"
          size={24}
          color="white"
          style={styles.icon}
        />
        <Text style={styles.yourCardsButtonText}>Your Cards</Text>
        <Ionicons
          name="chevron-forward-outline"
          size={24}
          color="white"
          style={styles.arrow}
        />
      </TouchableOpacity>

      {/* Modal for Cards */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={toggleModal}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {isAddingCard ? "New Card" : "Your Cards"}
              </Text>
            </View>

            {/* Content Based on Mode */}
            {isAddingCard ? (
              // Add Card Form
              <View style={styles.addCardForm}>
                {/* Card Number Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Card Number</Text>
                  <View style={styles.cardNumberContainer}>
                    <TextInput
                      style={[styles.input, styles.cardNumberInput]}
                      placeholder="Enter card number"
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                    />
                    <Ionicons name="card" size={24} color="#888" />
                  </View>
                </View>

                {/* Name on Card Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Name on Card</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter name on card"
                    placeholderTextColor="#888"
                  />
                </View>

                {/* Expiration Date and CVV Input */}
                <View style={styles.rowContainer}>
                  <View style={[styles.inputContainer, styles.expirationInput]}>
                    <Text style={styles.label}>Expiration Date</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="MM/YY"
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.inputContainer, styles.cvvInput]}>
                    <Text style={styles.label}>CVV</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                      secureTextEntry={true}
                    />
                  </View>
                </View>

                {/* Add Card Button */}
                <TouchableOpacity style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Add Card</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Default Content (Your Cards)
              <>
                {/* Credit Card */}
                <View style={styles.creditCardContainer}>
                  <Image
                    source={require("../../../assets/images/credit-card.png")}
                    style={styles.creditCardImage}
                  />
                </View>

                {/* Add Card Button */}
                <View style={styles.addCardContainer}>
                  <TouchableOpacity
                    style={styles.addCardButton}
                    onPress={handleAddCardPress}
                  >
                    <Ionicons name="add" size={24} color="white" />
                  </TouchableOpacity>
                  <Text style={styles.addCardLabel}>Add Card</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    padding: 20,
  },
  yourCardsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 16,
  },
  icon: {
    marginRight: 10,
  },
  yourCardsButtonText: {
    flex: 1,
    fontSize: 18,
    color: "white",
  },
  arrow: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#212121",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: 50,
    height: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginRight: 50,
    flex: 1,
  },
  creditCardContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  creditCardImage: {
    width: 330,
    height: 194,
    borderRadius: 24,
  },
  closeButton: {
    width: 55,
    height: 55,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
  },
  addCardContainer: {
    alignItems: "center",
  },
  addCardButton: {
    backgroundColor: "#5CD4FF",
    width: 55,
    height: 55,
    borderRadius: 16,
    marginTop: 76,
    justifyContent: "center",
    alignItems: "center",
  },
  addCardLabel: {
    color: "white",
    fontSize: 14,
    marginTop: 10,
  },
  addCardForm: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#333",
    color: "white",
    padding: 15,
    borderRadius: 10,
  },
  cardNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardNumberInput: {
    flex: 1,
    marginRight: 10,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  expirationInput: {
    flex: 1,
    marginRight: 10,
  },
  cvvInput: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#5CD4FF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});