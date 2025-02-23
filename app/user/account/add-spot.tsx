import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AddSpotScreen() {
  const [isChecked, setIsChecked] = useState(false);

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.descriptionText}>
        Here, you can select the audio file you created. Make sure you’re at the
        location where you want the spot to be placed. Once your upload is
        complete, we’ll review it before turning it into a sound spot.
      </Text>

      <View style={styles.centerContainer}>
        <TouchableOpacity style={styles.uploadButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.uploadLabel}>Upload</Text>
      </View>

      {/* Checkbox met Bevestiging en Submit Knop */}
      <View style={styles.bottomContainer}>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              { backgroundColor: isChecked ? "#5CD4FF" : "#333" },
            ]}
            onPress={toggleCheckbox}
          >
            {isChecked && <Ionicons name="checkmark" size={16} color="white" />}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>
            I confirm that my upload is in line with the terms and conditions.
          </Text>
        </View>

        {/* Submit Knop */}
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    padding: 20,
  },
  descriptionText: {
    color: "white",
    fontSize: 16,
    textAlign: "left",
    marginBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButton: {
    backgroundColor: "#333",
    width: 55,
    height: 55,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  uploadLabel: {
    color: "white",
    fontSize: 16,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxLabel: {
    color: "white",
    fontSize: 16,
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#5CD4FF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
