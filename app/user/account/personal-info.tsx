import React from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from "react-native";

export default function PersonalInfoScreen() {
  return (
    <View style={styles.container}>
      {/* Profile Image Placeholder */}
      <View style={styles.profileImageContainer}>
        <Image
          source={require("../../../assets/images/icon.png")}
          style={styles.profileImage}
        />
        <Text style={styles.changeProfileText}>Change profile picture</Text>
      </View>

      {/* First Name and Last Name Input Fields */}
      <View style={styles.nameContainer}>
        <TextInput
          style={[styles.input, styles.nameInput]}
          placeholder="First Name"
          placeholderTextColor="#888"
        />
        <TextInput
          style={[styles.input, styles.nameInput]}
          placeholder="Last Name"
          placeholderTextColor="#888"
        />
      </View>

      {/* Email Input Field */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
      />

      {/* Phone Number Input Field */}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#888"
        keyboardType="phone-pad"
      />

      {/* Date of Birth Input Field */}
      <TextInput
        style={styles.input}
        placeholder="Date of Birth"
        placeholderTextColor="#888"
        keyboardType="default"
      />

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
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 148,
    height: 148,
    borderRadius: 500,
    marginBottom: 10,
  },
  changeProfileText: {
    color: "#5CD4FF",
    fontSize: 16,
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  input: {
    backgroundColor: "#333",
    color: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 16,
  },
  nameInput: {
    flex: 1,
    marginRight: 10,
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