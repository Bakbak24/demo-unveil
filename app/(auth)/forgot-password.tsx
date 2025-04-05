import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import { useState } from "react";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");

  const handleResetPassword = () => {
    // Hier zou je later de echte logica toevoegen
    console.log("Password reset requested for:", email);
    router.back(); // Terug naar vorige scherm
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wachtwoord vergeten</Text>
      <Text style={styles.subtitle}>
        Voer je e-mailadres in om een wachtwoord reset link te ontvangen
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity 
        style={styles.resetButton} 
        onPress={handleResetPassword}
      >
        <Text style={styles.buttonText}>Reset Wachtwoord</Text>
      </TouchableOpacity>

      <Link href="/(auth)/login" asChild>
        <TouchableOpacity>
          <Text style={styles.linkText}>Terug naar inloggen</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 30,
  },
  inputContainer: {
    backgroundColor: "#333",
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  input: {
    color: "white",
    height: 50,
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: "#5CD4FF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    color: "#5CD4FF",
    textAlign: "center",
    fontSize: 16,
  },
});
