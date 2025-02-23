import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function TermsOfServiceScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Unveil Terms of Service</Text>
      <Text style={styles.effectiveDate}>Effective Date: 10/10/2023</Text>
      <Text style={styles.text}>
        Welcome to Unveil, the audio tour app designed to make your explorations
        more engaging and informative. These Terms of Service ("Terms") govern
        your use of the Unveil app and the services provided by Unveil, so please
        read them carefully. By using the Unveil app, you agree to comply with
        and be bound by these Terms. If you do not agree to these Terms, please
        do not use the Unveil app.
      </Text>
      <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
      <Text style={styles.text}>
        By accessing or using the Unveil app, you acknowledge that you have
        read, understood, and agree to be bound by these Terms. If you are using
        Unveil on behalf of a business or other legal entity, you represent and
        warrant that you have the authority to bind that entity to these Terms.
      </Text>
      <Text style={styles.sectionTitle}>2. Services</Text>
      <Text style={styles.subSectionTitle}>2.1 Registration</Text>
      <Text style={styles.text}>
        You may be required to create an account to use certain features of the
        Unveil app. You agree to provide accurate and complete information during
        the registration process and to update your information as necessary to
        ensure its accuracy. You are solely responsible for maintaining the
        confidentiality of your account credentials.
      </Text>
      <Text style={styles.subSectionTitle}>2.2 Audio Tour Services</Text>
      <Text style={styles.text}>
        Unveil provides curated audio tours for various locations, including but
        not limited to historical sites, museums, and city tours. While we make
        every effort to provide accurate and up-to-date information, we cannot
        guarantee the availability, accuracy, or completeness of the audio tour
        content, as it may be subject to changes or external factors beyond our
        control.
      </Text>
      <Text style={styles.subSectionTitle}>2.3 User Conduct</Text>
      <Text style={styles.text}>
        When using Unveil, you agree not to: Violate any applicable laws or
        regulations. Infringe upon the rights of others, including their
        intellectual property, privacy, or publicity rights. Engage in any
        activity that disrupts or interferes with the proper functioning of
        Unveil or its services. Transmit any harmful or malicious code or engage
        in any harmful activities.
      </Text>
      <Text style={styles.sectionTitle}>3. Privacy</Text>
      <Text style={styles.text}>
        Your use of Unveil is also governed by our Privacy Policy, which is
        incorporated into these Terms. Please review the Privacy Policy to
        understand how we collect, use, and disclose your personal information.
      </Text>
      <Text style={styles.sectionTitle}>4. Intellectual Property</Text>
      <Text style={styles.text}>
        Unveil and its content, including logos, trademarks, and all materials,
        are protected by intellectual property laws. You agree not to reproduce,
        distribute, or create derivative works from any content on Unveil without
        our prior written permission.
      </Text>
      <Text style={styles.sectionTitle}>5. Termination</Text>
      <Text style={styles.text}>
        We may terminate or suspend your account or access to Unveil at our sole
        discretion if you violate these Terms. You may also terminate your
        account at any time by discontinuing your use of the app.
      </Text>
      <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
      <Text style={styles.text}>
        Unveil is provided "as is" and "as available" without any warranties,
        express or implied. We do not guarantee the accuracy, completeness, or
        reliability of the audio tour content provided on the app. In no event
        shall Unveil be liable for any indirect, special, or consequential
        damages arising out of or in connection with your use of the app.
      </Text>
      <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
      <Text style={styles.text}>
        We may update these Terms from time to time. Any changes will be
        effective upon posting the updated Terms on the Unveil app. Your
        continued use of the app after such changes constitutes your acceptance
        of the updated Terms.
      </Text>
      <Text style={styles.sectionTitle}>8. Contact</Text>
      <Text style={styles.text}>
        If you have any questions about these Terms or Unveil in general, please
        contact us at [Contact Email].
      </Text>
      <Text style={styles.text}>
        Thank you for using Unveil! We hope you enjoy exploring with our audio
        tours.
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