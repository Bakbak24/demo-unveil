import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { API_CONFIG, logApiConfig } from "../../../config/api";
import { testBackendConnection, getNetworkDiagnostics } from "../../../utils/networkTest";

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: number | null;
  description: string;
  priceFormatted: string;
}

export default function SubscriptionPlansScreen() {
  const router = useRouter();
  const { user, isLoggedIn, getToken } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    // Log API configuration for debugging
    logApiConfig();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      console.log('Fetching plans from:', `${API_CONFIG.BASE_URL}/subscriptions/plans`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/subscriptions/plans`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Plans response status:', response.status);
      
      const data = await response.json();
      console.log('Plans response data:', data);
      
      if (response.ok && data.success) {
        setPlans(data.plans);
        console.log('Plans loaded successfully:', data.plans.length, 'plans');
      } else {
        console.log('Plans response error:', data);
        Alert.alert("Error", data.message || "Failed to load subscription plans");
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      let errorMessage = "Failed to load subscription plans";
      
      if (error instanceof Error) {
        console.log('Error details:', error.message);
        if (error.message === 'Network request failed') {
          errorMessage = `Unable to connect to server at ${API_CONFIG.BASE_URL}. Please check your internet connection and try again.`;
        } else if (error.message?.includes('fetch')) {
          errorMessage = `Connection error to ${API_CONFIG.BASE_URL}. Please make sure the server is running.`;
        }
      }
      
      Alert.alert("Connection Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    
    // Check authentication using AuthContext
    if (!isLoggedIn || !user) {
      Alert.alert("Authentication Required", "Please log in to subscribe", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") }
      ]);
      return;
    }

    // Get the selected plan details
    const selectedPlan = plans.find(plan => plan.id === planId);
    if (!selectedPlan) {
      Alert.alert("Error", "Selected plan not found");
      return;
    }

    // Show payment options
    Alert.alert(
      `Subscribe to ${selectedPlan.name}`,
      `Price: ${selectedPlan.priceFormatted}\n\nChoose your payment method:`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Add New Card", 
          onPress: () => handlePayWithNewCard(planId, selectedPlan)
        },
        { 
          text: "Use Saved Card", 
          onPress: () => handlePayWithSavedCard(planId, selectedPlan)
        },
      ]
    );
  };

  const handlePayWithNewCard = async (planId: string, plan: Plan) => {
    try {
      const token = getToken();
      if (!token || !isLoggedIn || !user) {
        Alert.alert("Authentication Error", "Please log in again");
        return;
      }

      // Create payment intent
      const response = await fetch(`${API_CONFIG.BASE_URL}/subscriptions/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType: planId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Navigate to payment screen with payment intent
        router.push({
          pathname: "/user/account/stripe-payment",
          params: {
            clientSecret: data.clientSecret,
            paymentIntentId: data.paymentIntentId,
            planId: planId,
            planName: plan.name,
            planPrice: plan.priceFormatted
          }
        });
      } else {
        Alert.alert("Error", data.message || "Failed to create payment intent");
      }
    } catch (error) {
      console.error("Error creating payment intent:", error);
      Alert.alert("Error", "Failed to process payment. Please try again.");
    }
  };

  const handlePayWithSavedCard = async (planId: string, plan: Plan) => {
    try {
      const token = getToken();
      if (!token || !isLoggedIn || !user) {
        Alert.alert("Authentication Error", "Please log in again");
        return;
      }

      // Fetch saved payment methods
      const response = await fetch(`${API_CONFIG.BASE_URL}/payment/methods`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.paymentMethods && data.paymentMethods.length > 0) {
          // Show saved cards selection
          showSavedCardsSelection(data.paymentMethods, planId, plan);
        } else {
          Alert.alert(
            "No Saved Cards",
            "You don't have any saved payment methods. Would you like to add one?",
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Add Card", 
                onPress: () => handlePayWithNewCard(planId, plan)
              }
            ]
          );
        }
      } else if (response.status === 401) {
        Alert.alert("Session Expired", "Please log in again", [
          { text: "OK", onPress: () => router.replace("/(auth)/login") }
        ]);
      } else {
        Alert.alert("Error", "Failed to load payment methods. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      Alert.alert("Error", "Failed to load payment methods. Please try again.");
    }
  };

  const showSavedCardsSelection = (paymentMethods: any[], planId: string, plan: Plan) => {
    const cardOptions = paymentMethods.map((method, index) => ({
      text: `${method.card.brand.toUpperCase()} •••• ${method.card.last4}${method.isDefault ? ' (Default)' : ''}`,
      onPress: () => processPaymentWithSavedCard(method.stripePaymentMethodId, planId, plan)
    }));

    Alert.alert(
      "Select Payment Method",
      `Choose a card to pay for ${plan.name} (${plan.priceFormatted}):`,
      [
        { text: "Cancel", style: "cancel" },
        ...cardOptions,
        { 
          text: "Add New Card", 
          onPress: () => handlePayWithNewCard(planId, plan)
        }
      ]
    );
  };

  const processPaymentWithSavedCard = async (paymentMethodId: string, planId: string, plan: Plan) => {
    try {
      const token = getToken();
      if (!token) {
        Alert.alert("Authentication Error", "Please log in again");
        return;
      }

      Alert.alert(
        "Processing Payment",
        "Please wait while we process your payment...",
        [],
        { cancelable: false }
      );

      // Subscribe with saved card
      const response = await fetch(`${API_CONFIG.BASE_URL}/subscriptions/subscribe-with-saved-card`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          planType: planId,
          paymentMethodId: paymentMethodId
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          "Subscription Successful! 🎉",
          `You have successfully subscribed to ${plan.name}!\n\nPrice: ${plan.priceFormatted}\n\nYour subscription is now active and you have access to all premium features.`,
          [
            { text: "OK", onPress: () => router.back() }
          ]
        );
      } else {
        Alert.alert("Payment Failed", data.message || "Failed to process payment. Please try again.");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      Alert.alert("Error", "Failed to process payment. Please try again.");
    }
  };

  const simulateSubscriptionPurchase = async (planId: string, plan: Plan) => {
    // This function is no longer needed as we're using real Stripe payments
    // Keeping it for backward compatibility but redirecting to real payment
    handlePayWithNewCard(planId, plan);
  };

  const handleAddNewCardForPlan = (planId: string) => {
    Alert.alert(
      "Add New Card",
      "This will redirect you to add a new payment method and then subscribe to the selected plan.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Continue", 
          onPress: () => router.push(`/user/account/payment?action=add-card&plan=${planId}`)
        }
      ]
    );
  };

  const handleUseSavedCardForPlan = async (planId: string) => {
    try {
      // Use AuthContext for authentication
      const token = getToken();
      if (!token || !isLoggedIn || !user) {
        Alert.alert("Authentication Error", "Please log in again", [
          { text: "OK", onPress: () => router.replace("/(auth)/login") }
        ]);
        return;
      }

      // Fetch saved payment methods
      const response = await fetch(`${API_CONFIG.BASE_URL}/payment/methods`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.paymentMethods && data.paymentMethods.length > 0) {
          // Navigate to payment screen with saved cards
          router.push(`/user/account/payment?action=subscribe&plan=${planId}`);
        } else {
          Alert.alert(
            "No Saved Cards",
            "You don't have any saved payment methods. Would you like to add one?",
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Add Card", 
                onPress: () => handleAddNewCardForPlan(planId)
              }
            ]
          );
        }
      } else if (response.status === 401) {
        Alert.alert("Session Expired", "Please log in again", [
          { text: "OK", onPress: () => router.replace("/(auth)/login") }
        ]);
      } else {
        Alert.alert("Error", "Failed to load payment methods. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      Alert.alert("Error", "Failed to load payment methods. Please try again.");
    }
  };

  const getPlanFeatures = (planId: string) => {
    const baseFeatures = [
      "Full city unlocked",
      "All soundspots included",
      "All tours included",
    ];

    switch (planId) {
      case "day_pass":
        return [...baseFeatures, "Valid for 24 hours", "No subscription needed"];
      case "week_pass":
        return [...baseFeatures, "Valid for 7 days", "No subscription needed"];
      case "city_pass":
        return [
          "Full city unlocked forever",
          "All soundspots included",
          "All tours included",
          "Lifetime access",
          "Early access to beta features",
        ];
      default:
        return baseFeatures;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "day_pass":
        return "#4CAF50"; // Green
      case "week_pass":
        return "#2196F3"; // Blue
      case "city_pass":
        return "#FF9800"; // Orange/Gold
      default:
        return "#5CD4FF";
    }
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
        Alert.alert(
          "Network Test Results",
          `✅ Connection Successful!\n\nServer: ${basicTest.url}\nStatus: ${basicTest.status}\nPlans loaded: ${basicTest.details?.plans?.length || 0}`,
          [
            { text: "OK" },
            { text: "Retry Loading Plans", onPress: fetchPlans }
          ]
        );
      } else {
        Alert.alert(
          "Network Test Results",
          `❌ Connection Failed!\n\nServer: ${basicTest.url}\nError: ${basicTest.message}`,
          [
            { text: "OK" },
            { text: "Retry", onPress: runNetworkTest }
          ]
        );
      }
    } catch (error) {
      console.error('Network test failed:', error);
      Alert.alert("Network Test Error", "Failed to run network test");
    } finally {
      setTestingConnection(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#5CD4FF" />
        <Text style={styles.loadingText}>Loading plans...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          A perfect plan for every type of traveler.
        </Text>
        
        {/* Network Test Button (for debugging) */}
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={runNetworkTest}
          disabled={testingConnection}
        >
          <Ionicons 
            name="wifi-outline" 
            size={20} 
            color="white" 
          />
          <Text style={styles.testButtonText}>
            {testingConnection ? "Testing..." : "Test Connection"}
          </Text>
          {testingConnection && <ActivityIndicator size="small" color="white" />}
        </TouchableOpacity>
      </View>

      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <View
            key={plan.id}
            style={[
              styles.planCard,
              { borderColor: getPlanColor(plan.id) },
              plan.id === "city_pass" && styles.popularPlan,
            ]}
          >
            {plan.id === "city_pass" && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}

            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{plan.priceFormatted}</Text>
                <Text style={styles.pricePeriod}>
                  {plan.duration
                    ? plan.duration === 1
                      ? "/ day"
                      : `/ ${plan.duration} days`
                    : "/ lifetime"}
                </Text>
              </View>
            </View>

            <Text style={styles.planDescription}>{plan.description}</Text>

            <View style={styles.featuresContainer}>
              {getPlanFeatures(plan.id).map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={getPlanColor(plan.id)}
                  />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.selectButton,
                { backgroundColor: getPlanColor(plan.id) },
              ]}
              onPress={() => handleSelectPlan(plan.id)}
            >
              <Text style={styles.selectButtonText}>
                Get {plan.name.toLowerCase()}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          All plans include access to premium features and content.
        </Text>
        <Text style={styles.footerText}>
          Cancel anytime. No hidden fees.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
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
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  plansContainer: {
    padding: 20,
    gap: 20,
  },
  planCard: {
    backgroundColor: "#333",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    position: "relative",
  },
  popularPlan: {
    borderColor: "#FF9800",
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    left: 20,
    backgroundColor: "#FF9800",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  planHeader: {
    marginBottom: 12,
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  pricePeriod: {
    fontSize: 16,
    color: "#888",
    marginLeft: 4,
  },
  planDescription: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: "white",
    marginLeft: 12,
    flex: 1,
  },
  selectButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  selectButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 4,
  },
  testButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#5CD4FF",
    alignItems: "center",
  },
  testButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
}); 