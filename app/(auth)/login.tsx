import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useAuth();

  const handleLogin = async () => {
    // Validate form
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    
    if (!password) {
      Alert.alert("Error", "Please enter your password");
      return;
    }
    
    try {
      await login(email, password);
      // Only navigate if login was successful (no error thrown)
      router.replace("/(tabs)");
    } catch (err) {
      // Error is handled in the AuthContext and displayed via error state
      console.error("Login failed:", err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Main title */}
        <Text style={styles.mainTitle}>Hi,{"\n"}Welcome Back</Text>

        {/* Error message if any */}
        {error && <Text style={styles.errorText}>{error}</Text>}

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
        <View style={[styles.inputWrapper, { marginTop: 12 }]}>
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
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Login button */}
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#212121" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* OR separator */}
        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        {/* Social login buttons */}
        <View style={styles.socialButtonsContainer}>
          {/* Facebook button */}
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require("../../assets/images/facebook-icon.png")}
              style={styles.socialIcon}
            />
            <Text style={styles.socialButtonText}>Facebook</Text>
          </TouchableOpacity>

          {/* Google button */}
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require("../../assets/images/google-icon.png")}
              style={styles.socialIcon}
            />
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>
        </View>

        {/* Sign up link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Create one</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
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
  scrollContainer: {
    padding: 20,
    paddingTop: isSmallScreen ? 20 : 50,
    paddingBottom: 40,
    minHeight: window.height,
  },
  mainTitle: {
    color: "#FFF",
    fontFamily: "NotoSans_900Black",
    fontSize: isSmallScreen ? 32 : 42,
    fontWeight: "900",
    lineHeight: isSmallScreen ? 38 : 50,
    marginBottom: isSmallScreen ? 50 : 100,
    marginTop: isSmallScreen ? 20 : 0,
  },
  errorText: {
    color: "#ff6b6b",
    marginBottom: 20,
    fontSize: 14,
    textAlign: "center",
  },
  inputWrapper: {
    marginBottom: 12,
  },
  inputLabel: {
    color: "#FFF",
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 54,
    backgroundColor: "#333",
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#FFF",
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  forgotPasswordText: {
    color: "#5CD4FF",
    fontSize: 14,
  },
  loginButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#5CD4FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loginButtonText: {
    color: "#212121",
    fontSize: 16,
    fontWeight: "bold",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 23,
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
  },
  socialButton: {
    width: "48%",
    height: 54,
    backgroundColor: "#333",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  socialButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    color: "#FFF",
    fontSize: 14,
  },
  signupLink: {
    color: "#5CD4FF",
    fontSize: 14,
    fontWeight: "bold",
  },
});