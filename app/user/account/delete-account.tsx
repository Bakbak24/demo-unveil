import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../../../config/api";

export default function DeleteAccountScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    // Validate inputs
    if (!password) {
      Alert.alert("Error", "Please enter your password to confirm account deletion");
      return;
    }

    if (confirmText.toLowerCase() !== "delete") {
      Alert.alert("Error", "Please type 'DELETE' to confirm account deletion");
      return;
    }

    // Final confirmation
    Alert.alert(
      "Final Confirmation",
      "This action cannot be undone. Your account, subscriptions, and all data will be permanently deleted. Are you absolutely sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: performAccountDeletion,
        },
      ]
    );
  };

  const performAccountDeletion = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("Error", "Please log in again");
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear all stored data
        await AsyncStorage.multiRemove([
          "userToken",
          "userId",
          "userEmail",
          "userName",
          "userRole",
          "subscriptionStatus",
          "subscriptionType",
          "isLifetimeUser",
        ]);

        Alert.alert(
          "Account Deleted",
          "Your account has been permanently deleted. Thank you for using our service.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(auth)/login"),
            },
          ]
        );
      } else {
        Alert.alert("Error", data.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      Alert.alert("Error", "Failed to delete account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="warning" size={64} color="#FF6B6B" />
        <Text style={styles.title}>Delete Account</Text>
        <Text style={styles.subtitle}>
          This action cannot be undone and will permanently delete your account.
        </Text>
      </View>

      {/* Warning Section */}
      <View style={styles.warningContainer}>
        <Text style={styles.warningTitle}>What will be deleted:</Text>
        <View style={styles.warningItem}>
          <Ionicons name="person-outline" size={20} color="#FF6B6B" />
          <Text style={styles.warningText}>Your profile and personal information</Text>
        </View>
        <View style={styles.warningItem}>
          <Ionicons name="card-outline" size={20} color="#FF6B6B" />
          <Text style={styles.warningText}>All saved payment methods</Text>
        </View>
        <View style={styles.warningItem}>
          <Ionicons name="star-outline" size={20} color="#FF6B6B" />
          <Text style={styles.warningText}>Active subscriptions (will be cancelled)</Text>
        </View>
        <View style={styles.warningItem}>
          <Ionicons name="location-outline" size={20} color="#FF6B6B" />
          <Text style={styles.warningText}>Your spots and audio content</Text>
        </View>
        <View style={styles.warningItem}>
          <Ionicons name="heart-outline" size={20} color="#FF6B6B" />
          <Text style={styles.warningText}>Favorites and saved content</Text>
        </View>
        <View style={styles.warningItem}>
          <Ionicons name="chatbubble-outline" size={20} color="#FF6B6B" />
          <Text style={styles.warningText}>Reviews and ratings</Text>
        </View>
      </View>

      {/* Confirmation Form */}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Confirm Account Deletion</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Enter your password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#888"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Type "DELETE" to confirm (case insensitive)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Type DELETE to confirm"
            placeholderTextColor="#888"
            value={confirmText}
            onChangeText={setConfirmText}
            autoCapitalize="characters"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            (!password || confirmText.toLowerCase() !== "delete") && styles.deleteButtonDisabled,
          ]}
          onPress={handleDeleteAccount}
          disabled={loading || !password || confirmText.toLowerCase() !== "delete"}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="trash" size={20} color="white" />
              <Text style={styles.deleteButtonText}>Delete Account Forever</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Alternative Options */}
      <View style={styles.alternativeContainer}>
        <Text style={styles.alternativeTitle}>Need help instead?</Text>
        <Text style={styles.alternativeText}>
          If you're having issues with your account, consider these alternatives:
        </Text>
        
        <TouchableOpacity
          style={styles.alternativeButton}
          onPress={() => router.push("/user/account/security")}
        >
          <Ionicons name="lock-closed-outline" size={20} color="#5CD4FF" />
          <Text style={styles.alternativeButtonText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.alternativeButton}
          onPress={() => router.push("/user/account/payment")}
        >
          <Ionicons name="card-outline" size={20} color="#5CD4FF" />
          <Text style={styles.alternativeButtonText}>Manage Subscriptions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.alternativeButton}
          onPress={() => {
            Alert.alert(
              "Contact Support",
              "For support, please email us at support@unveilapp.com or contact us through the app."
            );
          }}
        >
          <Ionicons name="help-circle-outline" size={20} color="#5CD4FF" />
          <Text style={styles.alternativeButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>

      {/* Cancel Button */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
  },
  warningContainer: {
    backgroundColor: "#2A1F1F",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 16,
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: "#CCC",
    marginLeft: 12,
    flex: 1,
  },
  formContainer: {
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
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
    backgroundColor: "#444",
    color: "white",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "#FF6B6B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  deleteButtonDisabled: {
    backgroundColor: "#666",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  alternativeContainer: {
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  alternativeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  alternativeText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 16,
    lineHeight: 20,
  },
  alternativeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  alternativeButtonText: {
    color: "#5CD4FF",
    fontSize: 16,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: "#5CD4FF",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  cancelButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
}); 