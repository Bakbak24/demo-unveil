import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signup, isLoading, error, clearError } = useAuth();

  const handleSignup = async () => {
    // Validate form
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    
    if (!password) {
      Alert.alert("Error", "Please enter a password");
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    
    try {
      await signup(name, email, password);
      // Only navigate if signup was successful (no error thrown)
      router.replace("/(tabs)");
    } catch (err) {
      // Error is handled in the AuthContext and displayed via error state
      console.error("Signup failed:", err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        {/* Main title */}
        <Text style={styles.mainTitle}>Hi,{"\n"}Welcome to Unveil</Text>

        {/* Error message if any */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Form fields */}
        <View style={styles.formContainer}>
          {/* Name input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              placeholder="Enter your name"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (error) clearError();
              }}
              style={styles.input}
              autoCapitalize="words"
            />
          </View>

          {/* Email input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              placeholder="Enter email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) clearError();
              }}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              placeholder="Enter password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) clearError();
              }}
              style={styles.input}
              secureTextEntry
            />
          </View>

          {/* Confirm Password input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Repeat Password</Text>
            <TextInput
              placeholder="Repeat password"
              placeholderTextColor="#aaa"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (error) clearError();
              }}
              style={styles.input}
              secureTextEntry
            />
          </View>

          {/* Signup button */}
          <TouchableOpacity 
            style={styles.signupButton} 
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#212121" size="small" />
            ) : (
              <Text style={styles.signupButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* OR separator */}
        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        {/* Social login buttons */}
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require("../../assets/images/facebook-icon.png")}
              style={styles.socialIcon}
            />
            <Text style={styles.socialButtonText}>Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require("../../assets/images/google-icon.png")}
              style={styles.socialIcon}
            />
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>
        </View>

        {/* Login link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>LOGIN</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const window = Dimensions.get("window");
const isSmallScreen = window.height < 700;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: isSmallScreen ? 20 : 40,
    justifyContent: 'space-between',
  },
  mainTitle: {
    color: "#FFF",
    fontFamily: "NotoSans_900Black",
    fontSize: isSmallScreen ? 28 : 36,
    fontWeight: "900",
    lineHeight: isSmallScreen ? 34 : 44,
    marginBottom: isSmallScreen ? 20 : 30,
  },
  errorText: {
    color: "#ff6b6b",
    marginBottom: 10,
    fontSize: 14,
    textAlign: "center",
  },
  formContainer: {
    marginBottom: isSmallScreen ? 15 : 20,
  },
  inputWrapper: {
    marginBottom: isSmallScreen ? 10 : 12,
  },
  inputLabel: {
    color: "#FFF",
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#333",
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#FFF",
    fontSize: 16,
  },
  signupButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#5CD4FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  signupButtonText: {
    color: "#212121",
    fontSize: 16,
    fontWeight: "bold",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: isSmallScreen ? 12 : 15,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },
  orText: {
    color: "#FFF",
    marginHorizontal: 10,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: isSmallScreen ? 15 : 20,
  },
  socialButton: {
    width: "48%",
    height: 50,
    backgroundColor: "#333",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  socialButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    color: "#FFF",
    fontSize: 14,
  },
  loginLink: {
    color: "#5CD4FF",
    fontSize: 14,
    fontWeight: "bold",
  },
});