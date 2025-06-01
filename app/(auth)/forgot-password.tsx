// app/(auth)/forgot-password.tsx
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ForgotPasswordFlow() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleNext = () => {
    if (step === 1 && email) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep(5);
      }, 1500);
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
  };

  const isCodeFilled = code.every((c) => c !== "");
  const isPasswordValid = newPassword && newPassword === repeatPassword;

  const customHeaderLeft = () => (
    <TouchableOpacity
      style={{
        width: 55,
        height: 55,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#333",
        marginLeft: 10,
        marginTop: 26,
        marginBottom: 24,
      }}
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5CD4FF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          {customHeaderLeft()}

          {step === 1 && (
            <View style={styles.content}>
              <View>
                <Text style={styles.title}>Forgot your password?</Text>
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#aaa"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity
                style={[styles.button, !email && styles.buttonDisabled]}
                onPress={handleNext}
                disabled={!email}
              >
                <Text
                  style={[
                    styles.buttonText,
                    !email && styles.buttonTextDisabled,
                  ]}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={styles.content}>
              <View>
                <Text style={styles.titleCode}>Insert verification code.</Text>
                <Text style={styles.subtitle}>
                  Please allow up to 5 minutes for the code to reach your inbox.
                  If it doesn’t appear after that, you should check your spam.
                </Text>

                <View style={styles.codeContainer}>
                  {[0, 1, 2, 3, 4].map((index) => (
                    <TextInput
                      key={index}
                      style={[
                        styles.codeInput,
                        code[index] ? { borderBottomColor: "#5CD4FF" } : null,
                      ]}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={code[index]}
                      onChangeText={(text) => handleCodeChange(text, index)}
                    />
                  ))}
                </View>

                <TouchableOpacity style={styles.resendLink}>
                  <Text style={styles.resendText}>Resend code</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, !isCodeFilled && styles.buttonDisabled]}
                onPress={handleNext}
                disabled={!isCodeFilled}
              >
                <Text
                  style={[
                    styles.buttonText,
                    !isCodeFilled && styles.buttonTextDisabled,
                  ]}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View style={styles.content}>
              <View>
                <Text style={styles.title}>Your new code has been sent.</Text>
                <Text style={styles.subtitle}>
                  Please allow up to 5 minutes for the code to reach your inbox.
                  If it doesn’t appear after that, you should check your spam.
                </Text>
              </View>
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 4 && (
            <View style={styles.content}>
              <View>
                <Text style={styles.title}>Choose a new password.</Text>
                <TextInput
                  placeholder="New password"
                  placeholderTextColor="#aaa"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={styles.input}
                  secureTextEntry
                />
                <TextInput
                  placeholder="Repeat new password"
                  placeholderTextColor="#aaa"
                  value={repeatPassword}
                  onChangeText={setRepeatPassword}
                  style={styles.input}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  !isPasswordValid && styles.buttonDisabled,
                ]}
                onPress={handleNext}
                disabled={!isPasswordValid}
              >
                <Text
                  style={[
                    styles.buttonText,
                    !isPasswordValid && styles.buttonTextDisabled,
                  ]}
                >
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 5 && (
            <View style={styles.content}>
              <View>
                <Text style={styles.title}>Your password has been reset!</Text>
                <Text style={styles.subtitle}>
                  You can try to log in again using your new password you just
                  created.
                </Text>
              </View>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
              </Link>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#212121",
    padding: 20,
    paddingTop: 50,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    color: "#FFF",
    fontSize: 42,
    fontWeight: "900",
    marginBottom: 20,
  },
  titleCode: {
    color: "#FFF",
    fontSize: 36,
    fontWeight: "900",
    marginBottom: 20,
  },
  subtitle: {
    color: "#FFF",
    fontSize: 16,
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 15,
    color: "#FFF",
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#5CD4FF",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#333",
  },
  buttonText: {
    color: "#212121",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonTextDisabled: {
    color: "#FFF",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  codeInput: {
    width: 57.693,
    height: 57.693,
    backgroundColor: "transparent", 
    borderBottomWidth: 4,
    borderBottomColor: "#333",
    textAlign: "center",
    color: "#FFF",
    fontSize: 24,
    paddingVertical: 15,
  },
  resendLink: {
    alignSelf: "center",
    marginBottom: 20,
  },
  resendText: {
    color: "#5CD4FF",
    fontSize: 14,
  },
});
