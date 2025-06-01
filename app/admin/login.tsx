import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { adminLogin, adminUser, isAdminLoggedIn, error, clearError } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      // Use the new adminLogin function
      await adminLogin(email.trim(), password);
      
      // Success - show appropriate message and navigate
      Alert.alert(
        'Login Successful',
        `Welcome ${adminUser?.role || 'admin'}! You can now access the admin panel.`,
        [
          {
            text: 'Pending Spots',
            onPress: () => router.push('/admin/pending-spots'),
          },
          {
            text: 'Pending Audio',
            onPress: () => router.push('/admin/pending-audio'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Admin login error:', error);
      // Error is already handled in AuthContext and displayed via error state
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@unveil.com');
    setPassword('admin123');
  };

  const fillReviewerCredentials = () => {
    setEmail('reviewer@unveil.com');
    setPassword('reviewer123');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Login</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="shield-checkmark" size={80} color="#5CD4FF" />
          <Text style={styles.logoText}>Admin Access</Text>
          <Text style={styles.logoSubtext}>
            Login with admin or reviewer credentials
          </Text>
        </View>

        {/* Error message if any */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) clearError();
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) clearError();
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Login as Admin</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.demoCredentials}>
          <Text style={styles.demoTitle}>Demo Credentials</Text>
          
          <TouchableOpacity
            style={styles.demoButton}
            onPress={fillAdminCredentials}
          >
            <View style={styles.demoButtonContent}>
              <Ionicons name="person" size={20} color="#5CD4FF" />
              <View style={styles.demoButtonText}>
                <Text style={styles.demoButtonTitle}>Admin Account</Text>
                <Text style={styles.demoButtonSubtitle}>admin@unveil.com</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={fillReviewerCredentials}
          >
            <View style={styles.demoButtonContent}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <View style={styles.demoButtonText}>
                <Text style={styles.demoButtonTitle}>Reviewer Account</Text>
                <Text style={styles.demoButtonSubtitle}>reviewer@unveil.com</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Admin and reviewer accounts are stored separately from regular user accounts to prevent conflicts.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  logoText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 15,
  },
  logoSubtext: {
    color: '#666',
    fontSize: 16,
    marginTop: 5,
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 15,
  },
  eyeButton: {
    padding: 5,
  },
  loginButton: {
    backgroundColor: '#5CD4FF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  demoCredentials: {
    marginBottom: 30,
  },
  demoTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  demoButton: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  demoButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoButtonText: {
    marginLeft: 15,
    flex: 1,
  },
  demoButtonTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoButtonSubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  infoContainer: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
  },
  infoText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  errorText: {
    color: '#FF5757',
    fontSize: 14,
    textAlign: 'center',
  },
}); 