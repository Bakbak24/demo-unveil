import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";

export default function SecurityScreen() {
  return (
    <View style={styles.container}>
      {/* Change Password Section */}
      <Text style={styles.sectionTitle}>Change Password</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter current password"
          placeholderTextColor="#888"
          secureTextEntry={true}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new password"
          placeholderTextColor="#888"
          secureTextEntry={true}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Repeat Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Repeat new password"
          placeholderTextColor="#888"
          secureTextEntry={true}
        />
      </View>

      {/* 2FA Section */}
      <Text style={styles.sectionTitle}>2FA</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mobile Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter mobile phone number"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
        />
      </View>

      {/* Save Changes Button */}
      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
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
  saveButton: {
    backgroundColor: "#5CD4FF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: "auto",
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});