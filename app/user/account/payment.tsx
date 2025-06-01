import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { API_CONFIG, logApiConfig } from "../../../config/api";
import { testBackendConnection, testAuthenticatedConnection, getNetworkDiagnostics } from "../../../utils/networkTest";

interface PaymentMethod {
  _id: string;
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

interface Subscription {
  planType: string;
  planName: string;
  status: string;
  endDate: string;
  isLifetime: boolean;
}

export default function PaymentScreen() {
  const router = useRouter();
  const { user, isLoggedIn, getToken } = useAuth();
  const [isModalVisible, setModalVisible] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    // Log API configuration for debugging
    logApiConfig();
    
    // Check if user is logged in before fetching data
    if (!isLoggedIn || !user) {
      console.log('User not logged in, redirecting to login');
      Alert.alert("Authentication Required", "Please log in to view payment information", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") }
      ]);
      setLoading(false);
      return;
    }
    
    fetchPaymentData();
  }, [isLoggedIn, user]);

  const fetchPaymentData = async () => {
    try {
      console.log('=== Starting fetchPaymentData ===');
      
      // Use AuthContext to get token
      const token = getToken();
      console.log('Token retrieved from AuthContext:', token ? `Token exists (length: ${token.length})` : 'No token found');
      
      if (!token || !isLoggedIn || !user) {
        console.log('No token found or user not logged in');
        setLoading(false);
        Alert.alert("Authentication Required", "Please log in to view payment information", [
          { text: "OK", onPress: () => router.replace("/(auth)/login") }
        ]);
        return;
      }

      // Log user data from AuthContext
      console.log('User data from AuthContext - ID:', user.id, 'Email:', user.email, 'Name:', user.name);

      console.log('Fetching payment data from:', API_CONFIG.BASE_URL);

      // Fetch payment methods and current subscription with better error handling
      try {
        console.log('Making API calls...');
        const [paymentResponse, subscriptionResponse] = await Promise.all([
          fetch(`${API_CONFIG.BASE_URL}/payment/methods`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${API_CONFIG.BASE_URL}/subscriptions/current`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        console.log('Payment response status:', paymentResponse.status);
        console.log('Subscription response status:', subscriptionResponse.status);

        // Handle payment methods response
        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          console.log('Payment data received:', paymentData);
          if (paymentData.success) {
            setPaymentMethods(paymentData.paymentMethods || []);
            console.log('Payment methods set:', paymentData.paymentMethods?.length || 0, 'methods');
          }
        } else if (paymentResponse.status === 401) {
          console.log('Payment methods: Authentication failed - token might be invalid');
          // Don't immediately redirect, just log the error
        } else {
          const errorText = await paymentResponse.text();
          console.log('Payment response error:', errorText);
        }

        // Handle subscription response
        if (subscriptionResponse.ok) {
          const subscriptionData = await subscriptionResponse.json();
          console.log('Subscription data received:', subscriptionData);
          if (subscriptionData.success && subscriptionData.subscription) {
            setCurrentSubscription(subscriptionData.subscription);
            console.log('Current subscription set:', subscriptionData.subscription);
          }
        } else if (subscriptionResponse.status === 401) {
          console.log('Subscription: Authentication failed - token might be invalid');
          // Don't immediately redirect, just log the error
        } else {
          const errorText = await subscriptionResponse.text();
          console.log('Subscription response error:', errorText);
        }

        // Only show authentication error if both requests failed with 401
        if (paymentResponse.status === 401 && subscriptionResponse.status === 401) {
          console.log('Both API calls failed with 401 - showing session expired dialog');
          Alert.alert(
            "Session Expired", 
            "Your session has expired. Please log in again to continue.", 
            [
              { text: "Cancel", style: "cancel" },
              { text: "Log In", onPress: () => router.replace("/(auth)/login") }
            ]
          );
        } else {
          console.log('At least one API call succeeded or failed with non-401 error');
        }
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        throw fetchError; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
      let errorMessage = "Failed to load payment information";
      
      if (error instanceof Error) {
        console.log('Error details:', error.message);
        if (error.message === 'Network request failed') {
          errorMessage = `Unable to connect to server at ${API_CONFIG.BASE_URL}. Please check your internet connection and try again.`;
        } else if (error.message?.includes('fetch')) {
          errorMessage = `Connection error to ${API_CONFIG.BASE_URL}. Please make sure the server is running.`;
        }
      }
      
      Alert.alert(
        "Connection Error", 
        errorMessage,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: fetchPaymentData }
        ]
      );
    } finally {
      console.log('=== Ending fetchPaymentData ===');
      setLoading(false);
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleAddCard = () => {
    setModalVisible(false);
    Alert.alert(
      "Add Payment Method", 
      "To add a new payment method:\n\n1. Go to 'Choose Subscription Plan'\n2. Select a plan\n3. Enter your card details\n4. Your card will be saved automatically for future use\n\nThis ensures your payment method is properly validated and secured.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Choose Plan", onPress: () => router.push('/user/account/subscription-plans') }
      ]
    );
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      setActionLoading(true);
      const token = getToken();
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/payment/methods/${paymentMethodId}/default`,
        {
          method: "PUT",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        Alert.alert("Success", "Default payment method updated");
        fetchPaymentData();
      } else {
        Alert.alert("Error", data.message || "Failed to update default payment method");
      }
    } catch (error) {
      console.error("Error setting default payment method:", error);
      Alert.alert("Error", "Failed to update default payment method");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCard = async (paymentMethodId: string) => {
    Alert.alert(
      "Delete Payment Method",
      "Are you sure you want to delete this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              const token = getToken();
              
              const response = await fetch(
                `${API_CONFIG.BASE_URL}/payment/methods/${paymentMethodId}`,
                {
                  method: "DELETE",
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              const data = await response.json();
              
              if (data.success) {
                Alert.alert("Success", "Payment method deleted");
                fetchPaymentData();
              } else {
                Alert.alert("Error", data.message || "Failed to delete payment method");
              }
            } catch (error) {
              console.error("Error deleting payment method:", error);
              Alert.alert("Error", "Failed to delete payment method");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSubscribeWithCard = (paymentMethodId: string) => {
    setModalVisible(false);
    router.push(`/user/account/subscription-plans?paymentMethod=${paymentMethodId}`);
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "visa":
        return "card-outline" as const;
      case "mastercard":
        return "card-outline" as const;
      case "amex":
        return "card-outline" as const;
      default:
        return "card-outline" as const;
    }
  };

  const formatExpiryDate = (month: number, year: number) => {
    return `${month.toString().padStart(2, "0")}/${year.toString().slice(-2)}`;
  };

  const runNetworkTest = async () => {
    setTestingConnection(true);
    try {
      console.log('Running network diagnostics...');
      const diagnostics = getNetworkDiagnostics();
      console.log('Network diagnostics:', diagnostics);

      // Test basic connection
      const basicTest = await testBackendConnection();
      console.log('Basic connection test:', basicTest);

      if (basicTest.success) {
        // Test authenticated connection
        const token = getToken();
        if (token) {
          const authTest = await testAuthenticatedConnection(token);
          console.log('Auth connection test:', authTest);
          
          Alert.alert(
            "Network Test Results",
            `✅ Basic Connection: ${basicTest.message}\n${authTest.success ? '✅' : '❌'} Authentication: ${authTest.message}`,
            [{ text: "OK" }]
          );
        } else {
          Alert.alert(
            "Network Test Results",
            `✅ Basic Connection: ${basicTest.message}\n❌ Authentication: No token found`,
            [{ text: "OK" }]
          );
        }
      } else {
        Alert.alert(
          "Network Test Results",
          `❌ Basic Connection Failed: ${basicTest.message}\nURL: ${basicTest.url}`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error('Network test failed:', error);
      Alert.alert("Network Test Error", "Failed to run network test");
    } finally {
      setTestingConnection(false);
    }
  };

  const checkAuthenticationData = async () => {
    try {
      // Use AuthContext data instead of AsyncStorage
      const token = getToken();
      const hasToken = !!token;
      const hasUserId = !!user?.id;
      const hasEmail = !!user?.email;
      
      console.log('Current authentication data from AuthContext:', {
        token: token ? `Present (${token.length} chars)` : 'Missing',
        userId: user?.id || 'Missing',
        email: user?.email || 'Missing',
        name: user?.name || 'Missing',
        isLoggedIn
      });
      
      Alert.alert(
        "Authentication Status",
        `Token: ${hasToken ? '✅ Present' : '❌ Missing'}\nUser ID: ${hasUserId ? '✅ Present' : '❌ Missing'}\nEmail: ${hasEmail ? '✅ Present' : '❌ Missing'}\nName: ${user?.name || 'Not set'}\nLogged In: ${isLoggedIn ? '✅ Yes' : '❌ No'}\n\nToken length: ${token?.length || 0}`,
        [
          { text: "OK" },
          { text: "Retry Loading", onPress: fetchPaymentData }
        ]
      );
    } catch (error) {
      console.error('Error checking auth data:', error);
      Alert.alert("Error", "Failed to check authentication data");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#5CD4FF" />
        <Text style={styles.loadingText}>Loading payment information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Current Subscription Section */}
      {currentSubscription && (
        <View style={styles.subscriptionSection}>
          <Text style={styles.sectionTitle}>Current Subscription</Text>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionName}>
                {currentSubscription.planName}
              </Text>
              <Text style={styles.subscriptionStatus}>
                Status: {currentSubscription.status}
              </Text>
              {!currentSubscription.isLifetime && (
                <Text style={styles.subscriptionExpiry}>
                  Expires: {new Date(currentSubscription.endDate).toLocaleDateString()}
                </Text>
              )}
              {currentSubscription.isLifetime && (
                <Text style={styles.subscriptionLifetime}>Lifetime Access</Text>
              )}
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
        </View>
      )}

      {/* Subscription Plans Button */}
      <TouchableOpacity
        style={styles.subscriptionButton}
        onPress={() => router.push("/user/account/subscription-plans")}
      >
        <Ionicons name="star-outline" size={24} color="white" style={styles.icon} />
        <Text style={styles.subscriptionButtonText}>
          {currentSubscription ? "Upgrade Plan" : "Choose Subscription Plan"}
        </Text>
        <Ionicons name="chevron-forward-outline" size={24} color="white" />
      </TouchableOpacity>

      {/* Your Cards Button */}
      <TouchableOpacity style={styles.yourCardsButton} onPress={toggleModal}>
        <Ionicons name="card-outline" size={24} color="white" style={styles.icon} />
        <Text style={styles.yourCardsButtonText}>Your Cards</Text>
        <Ionicons name="chevron-forward-outline" size={24} color="white" />
      </TouchableOpacity>

      {/* Network Test Button (for debugging) */}
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={runNetworkTest}
        disabled={testingConnection}
      >
        <Ionicons
          name="wifi-outline" 
          size={24}
          color="white"
          style={styles.icon}
        />
        <Text style={styles.testButtonText}>
          {testingConnection ? "Testing Connection..." : "Test Network Connection"}
        </Text>
        {testingConnection && <ActivityIndicator size="small" color="white" />}
      </TouchableOpacity>

      {/* Authentication Check Button (for debugging) */}
      <TouchableOpacity 
        style={styles.authTestButton} 
        onPress={checkAuthenticationData}
      >
        <Ionicons
          name="person-outline" 
          size={24}
          color="white"
          style={styles.icon} 
        />
        <Text style={styles.authTestButtonText}>Check Authentication Status</Text>
      </TouchableOpacity>

      {/* Cards Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Your Cards</Text>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {paymentMethods.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="card-outline" size={64} color="#888" />
                  <Text style={styles.emptyStateText}>No payment methods saved</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Add a payment method to make purchases easier
                  </Text>
                </View>
              ) : (
                <View style={styles.cardsContainer}>
                  {paymentMethods.map((method) => (
                    <View key={method._id} style={styles.cardItem}>
                      <View style={styles.cardInfo}>
                        <View style={styles.cardHeader}>
                          <Ionicons
                            name={getCardIcon(method.card.brand)}
                            size={24}
                            color="white"
                          />
                          <Text style={styles.cardBrand}>
                            {method.card.brand.toUpperCase()}
                          </Text>
                          {method.isDefault && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultText}>DEFAULT</Text>
                </View>
                          )}
                  </View>
                        <Text style={styles.cardNumber}>
                          •••• •••• •••• {method.card.last4}
                        </Text>
                        <Text style={styles.cardExpiry}>
                          Expires {formatExpiryDate(method.card.expMonth, method.card.expYear)}
                        </Text>
                </View>

                      <View style={styles.cardActions}>
                        {!method.isDefault && (
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleSetDefault(method._id)}
                            disabled={actionLoading}
                          >
                            <Text style={styles.actionButtonText}>Set Default</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={styles.subscribeButton}
                          onPress={() => handleSubscribeWithCard(method._id)}
                        >
                          <Text style={styles.subscribeButtonText}>Subscribe</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteCard(method._id)}
                          disabled={actionLoading}
                        >
                          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
                    </View>
                  ))}
                </View>
              )}

                {/* Add Card Button */}
              <TouchableOpacity style={styles.addCardButton} onPress={handleAddCard}>
                    <Ionicons name="add" size={24} color="white" />
                <Text style={styles.addCardText}>Add New Card</Text>
                  </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {actionLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#5CD4FF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    padding: 20,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  subscriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },
  subscriptionCard: {
    backgroundColor: "#333",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  subscriptionStatus: {
    fontSize: 14,
    color: "#888",
    marginBottom: 2,
  },
  subscriptionExpiry: {
    fontSize: 14,
    color: "#888",
  },
  subscriptionLifetime: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  subscriptionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF9800",
    padding: 15,
    borderRadius: 10,
    marginBottom: 16,
  },
  subscriptionButtonText: {
    flex: 1,
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  yourCardsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 16,
  },
  icon: {
    marginRight: 10,
  },
  yourCardsButtonText: {
    flex: 1,
    fontSize: 18,
    color: "white",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#212121",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    flex: 1,
    marginRight: 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
  },
  modalScrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: "white",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  cardsContainer: {
    gap: 16,
  },
  cardItem: {
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 16,
  },
  cardInfo: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardBrand: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  defaultBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: "auto",
  },
  defaultText: {
    fontSize: 10,
    color: "white",
    fontWeight: "bold",
  },
  cardNumber: {
    fontSize: 16,
    color: "white",
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 14,
    color: "#888",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    backgroundColor: "#5CD4FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  subscribeButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  subscribeButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: "auto",
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5CD4FF",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  addCardText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 16,
  },
  testButtonText: {
    flex: 1,
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  authTestButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 16,
  },
  authTestButtonText: {
    flex: 1,
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
});