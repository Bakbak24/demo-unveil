import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useStripe, CardField } from "@stripe/stripe-react-native";
import { useAuth } from "../../../context/AuthContext";
import { API_CONFIG } from "../../../config/api";

export default function StripePaymentScreen() {
  const router = useRouter();
  const { confirmPayment, createPaymentMethod } = useStripe();
  const { getToken } = useAuth();
  const params = useLocalSearchParams();
  const cardFieldRef = useRef<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const { clientSecret, paymentIntentId, planId, planName, planPrice } = params;

  useEffect(() => {
    console.log('StripePaymentScreen mounted with params:', params);
    
    if (!clientSecret || !paymentIntentId) {
      Alert.alert("Error", "Invalid payment session", [
        { text: "OK", onPress: () => router.back() }
      ]);
    }
  }, [clientSecret, paymentIntentId]);

  // Periodic validation check
  useEffect(() => {
    const validateCard = async () => {
      try {
        const { error, paymentMethod } = await createPaymentMethod({
          paymentMethodType: 'Card',
          paymentMethodData: {
            billingDetails: { name: 'Test User' },
          },
        });
        
        if (error) {
          setCardComplete(false);
          setValidationMessage(error.message || "Please complete all card fields");
        } else {
          setCardComplete(true);
          setValidationMessage("");
        }
      } catch (err) {
        setCardComplete(false);
        setValidationMessage("Please enter valid card details");
      }
    };

    // Check card validation every 2 seconds
    const interval = setInterval(validateCard, 2000);
    
    // Initial check after 1 second
    const timeout = setTimeout(validateCard, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [createPaymentMethod]);

  const handlePayment = async () => {
    console.log('=== HANDLE PAYMENT TRIGGERED ===');
    console.log('cardComplete:', cardComplete);
    console.log('loading:', loading);
    console.log('clientSecret:', clientSecret);
    console.log('paymentIntentId:', paymentIntentId);
    
    if (!cardComplete) {
      console.log('❌ Payment blocked: Card not complete');
      Alert.alert("Complete Card Details", validationMessage || "Please fill in all card fields correctly");
      return;
    }

    if (!clientSecret) {
      console.log('❌ Payment blocked: No client secret');
      Alert.alert("Error", "Payment session expired. Please try again.");
      return;
    }

    console.log('✅ All validations passed, proceeding with payment...');

    try {
      setLoading(true);
      console.log('Starting payment with clientSecret:', clientSecret);

      // First, create a payment method from the CardField
      const { error: pmError, paymentMethod } = await createPaymentMethod({
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            name: 'Test User',
          },
        },
      });

      if (pmError) {
        console.error('Payment method creation error:', pmError);
        Alert.alert("Payment Failed", pmError.message || "Failed to create payment method");
        return;
      }

      console.log('Payment method created successfully:', paymentMethod?.id);

      // Now confirm the payment with the created payment method
      const { error, paymentIntent } = await confirmPayment(clientSecret as string, {
        paymentMethodType: 'Card',
      });

      console.log('Payment confirmation result:', { error, paymentIntent });

      if (error) {
        console.error('Payment confirmation error:', error);
        Alert.alert("Payment Failed", error.message || "Payment could not be processed");
        return;
      }

      if (paymentIntent?.status === 'Succeeded') {
        console.log('Payment succeeded, confirming with backend...');
        // Confirm payment with backend
        await confirmPaymentWithBackend();
      } else {
        console.log('Payment intent status:', paymentIntent?.status);
        Alert.alert("Payment Failed", "Payment was not completed successfully");
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert("Error", "An error occurred while processing payment");
    } finally {
      setLoading(false);
    }
  };

  const confirmPaymentWithBackend = async () => {
    try {
      const token = getToken();
      if (!token) {
        Alert.alert("Authentication Error", "Please log in again");
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/subscriptions/confirm-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          "Subscription Successful! 🎉",
          `You have successfully subscribed to ${planName}!\n\nPrice: ${planPrice}\n\nYour subscription is now active and you have access to all premium features.`,
          [
            { text: "OK", onPress: () => router.replace("/(tabs)") }
          ]
        );
      } else {
        Alert.alert("Error", data.message || "Failed to activate subscription");
      }
    } catch (error) {
      console.error('Backend confirmation error:', error);
      Alert.alert("Error", "Failed to activate subscription. Please contact support.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Complete Payment</Text>
      </View>

      <View style={styles.planInfo}>
        <Text style={styles.planName}>{planName}</Text>
        <Text style={styles.planPrice}>{planPrice}</Text>
      </View>

      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        
        <View style={styles.cardFieldContainer}>
          <CardField
            ref={cardFieldRef}
            postalCodeEnabled={true}
            placeholders={{
              number: '4242 4242 4242 4242',
              postalCode: '12345',
            }}
            cardStyle={{
              backgroundColor: '#333333',
              textColor: '#FFFFFF',
            }}
            style={styles.cardField}
            onCardChange={(cardDetails) => {
              // Simple logging only - validation handled by periodic check
              console.log('Card input changed');
            }}
          />
          
          {/* Validation Message */}
          {validationMessage ? (
            <View style={styles.validationContainer}>
              <Ionicons name="information-circle" size={16} color="#FF6B6B" />
              <Text style={styles.validationText}>{validationMessage}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.testCardInfo}>
          <Text style={styles.testCardTitle}>Test Card Numbers:</Text>
          <Text style={styles.testCardText}>• 4242 4242 4242 4242 (Visa)</Text>
          <Text style={styles.testCardText}>• 5555 5555 5555 4444 (Mastercard)</Text>
          <Text style={styles.testCardText}>• Use any future date for expiry</Text>
          <Text style={styles.testCardText}>• Use any 3-digit CVC</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.payButton, 
          (!cardComplete || loading) && styles.payButtonDisabled
        ]}
        onPress={handlePayment}
        disabled={!cardComplete || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Ionicons name="card" size={20} color="white" />
            <Text style={styles.payButtonText}>Pay {planPrice}</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.securityInfo}>
        <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
        <Text style={styles.securityText}>
          Your payment is secured by Stripe. Your card details are encrypted and never stored on our servers.
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  planInfo: {
    backgroundColor: "#333",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#5CD4FF",
  },
  paymentSection: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  cardFieldContainer: {
    marginBottom: 20,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 10,
  },
  testCardInfo: {
    backgroundColor: "#2A2A2A",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  testCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  testCardText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  payButton: {
    backgroundColor: "#5CD4FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    margin: 20,
    borderRadius: 12,
  },
  payButtonDisabled: {
    backgroundColor: "#666",
  },
  payButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    padding: 16,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
  },
  securityText: {
    flex: 1,
    color: "#888",
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
  validationContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderWidth: 1,
    borderColor: "#FF6B6B",
    borderRadius: 8,
  },
  validationText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginLeft: 8,
  },
}); 