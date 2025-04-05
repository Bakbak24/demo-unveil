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
  KeyboardAvoidingView
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleLogin = () => {
    login();
    router.replace("/(tabs)");
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
        {/* Grote titel */}
        <Text style={styles.mainTitle}>Hi,{"\n"}Welcome Back</Text>

        {/* Email input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            placeholder="Enter email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
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
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Login knop */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        {/* OR separator */}
        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        {/* Social login knoppen */}
        <View style={styles.socialButtonsContainer}>
          {/* Facebook knop */}
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require("../../assets/images/facebook-icon.png")}
              style={styles.socialIcon}
            />
            <Text style={styles.socialButtonText}>Facebook</Text>
          </TouchableOpacity>

          {/* Google knop */}
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