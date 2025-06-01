import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Unveil Privacy Policy</Text>
      <Text style={styles.effectiveDate}>Effective Date: 10/10/2023</Text>
      <Text style={styles.text}>
        Welcome to Unveil! Your privacy is important to us, and we are committed
        to protecting the personal information you share with us. This Privacy
        Policy outlines how Unveil collects, uses, and safeguards your
        information when you use our audio tour app and related services. By
        using Unveil, you agree to the practices described in this Privacy
        Policy. If you do not agree, please do not use the Unveil app.
      </Text>
      <Text style={styles.sectionTitle}>1. Information We Collect</Text>
      <Text style={styles.subSectionTitle}>1.1 Information You Provide</Text>
      <Text style={styles.text}>
        When you register for an account, we may collect personal information
        such as: Name, Email address, Payment information (for purchasing audio
        tours), Profile preferences (e.g., favorite tours or locations).
      </Text>
      <Text style={styles.subSectionTitle}>1.2 Information We Collect Automatically</Text>
      <Text style={styles.text}>
        When you use Unveil, we may automatically collect information such as:
        Device information (e.g., model, operating system, and unique device
        identifiers), Location data (to provide location-based audio tours, with
        your consent), Usage data (e.g., app activity, tour preferences, and time
        spent on the app).
      </Text>
      <Text style={styles.subSectionTitle}>1.3 Information from Third Parties</Text>
      <Text style={styles.text}>
        We may receive information from third-party services you connect to
        Unveil, such as social media accounts or payment processors.
      </Text>
      <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
      <Text style={styles.subSectionTitle}>2.1 To Provide Services</Text>
      <Text style={styles.text}>
        We use your information to: Deliver personalized audio tours and related
        services, Process payments and manage subscriptions, Provide customer
        support.
      </Text>
      <Text style={styles.subSectionTitle}>2.2 To Improve Our Services</Text>
      <Text style={styles.text}>
        We analyze user behavior to improve app functionality, content, and user
        experience.
      </Text>
      <Text style={styles.subSectionTitle}>2.3 Marketing and Communication</Text>
      <Text style={styles.text}>
        With your consent, we may send you promotional materials or updates about
        new features and tours.
      </Text>
      <Text style={styles.sectionTitle}>3. Sharing Your Information</Text>
      <Text style={styles.subSectionTitle}>3.1 With Service Providers</Text>
      <Text style={styles.text}>
        We may share your information with trusted third-party service providers
        who assist us in operating the app, processing payments, or analyzing
        data. These providers are bound by confidentiality agreements and cannot
        use your information for other purposes.
      </Text>
      <Text style={styles.subSectionTitle}>3.2 Legal Requirements</Text>
      <Text style={styles.text}>
        We may disclose your information if required by law or in response to
        valid legal requests, such as court orders or subpoenas.
      </Text>
      <Text style={styles.subSectionTitle}>3.3 Business Transfers</Text>
      <Text style={styles.text}>
        If Unveil undergoes a merger, acquisition, or sale of assets, your
        information may be transferred as part of the transaction.
      </Text>
      <Text style={styles.sectionTitle}>4. Your Choices</Text>
      <Text style={styles.subSectionTitle}>4.1 Managing Your Information</Text>
      <Text style={styles.text}>
        You can update your account information or delete your account at any time
        by accessing your profile settings in the app.
      </Text>
      <Text style={styles.subSectionTitle}>4.2 Opting Out of Communications</Text>
      <Text style={styles.text}>
        You can opt out of promotional communications by following the unsubscribe
        instructions included in our emails or by contacting us directly.
      </Text>
      <Text style={styles.subSectionTitle}>4.3 Location Services</Text>
      <Text style={styles.text}>
        You can disable location tracking in your device settings if you do not
        want Unveil to access your location data.
      </Text>
      <Text style={styles.text}>
        Thank you for using Unveil! We are dedicated to making your exploration
        experiences safe and enjoyable.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  effectiveDate: {
    color: "#888",
    fontSize: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  subSectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
  },
  text: {
    color: "white",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
});