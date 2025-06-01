import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";

export default function AccountScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const menuItems: {
    label: string;
    icon:
      | "person-outline"
      | "lock-closed-outline"
      | "card-outline"
      | "star-outline"
      | "location-outline"
      | "list-outline"
      | "musical-notes-outline";
    route:
      | "/user/account/personal-info"
      | "/user/account/security"
      | "/user/account/payment"
      | "/user/account/subscription-plans"
      | "/user/account/add-spot"
      | "/user/account/add-audio-item"
      | "/user/my-spots";
  }[] = [
    {
      label: "Personal Information",
      icon: "person-outline",
      route: "/user/account/personal-info",
    },
    {
      label: "Password and Security",
      icon: "lock-closed-outline",
      route: "/user/account/security",
    },
    {
      label: "Subscription Plans",
      icon: "star-outline",
      route: "/user/account/subscription-plans",
    },
    {
      label: "Payment Options",
      icon: "card-outline",
      route: "/user/account/payment",
    },
    {
      label: "My Spots",
      icon: "list-outline",
      route: "/user/my-spots",
    },
    {
      label: "Add a Spot to the Map",
      icon: "location-outline",
      route: "/user/account/add-spot",
    },
    {
      label: "Add Audio Item",
      icon: "musical-notes-outline",
      route: "/user/account/add-audio-item",
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              // Navigate to login screen after logout
              router.replace("/(auth)/login");
            } catch (error) {
              console.error("Error during logout:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    router.push("/user/account/delete-account");
  };

  return (
    <View style={styles.container}>
      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => router.push(item.route)}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color="white"
              style={styles.icon}
            />
            <Text style={styles.menuText}>{item.label}</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={24}
              color="white"
              style={styles.arrow}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={24}
            color="white"
            style={styles.icon}
          />
          <Text style={styles.logoutText}>Logout</Text>
          <Ionicons
            name="chevron-forward-outline"
            size={24}
            color="white"
            style={styles.arrow}
          />
        </TouchableOpacity>

      {/* Delete Account Button */}
      <TouchableOpacity
        style={styles.deleteButton}
          onPress={handleDeleteAccount}
      >
        <Ionicons
          name="trash-outline"
          size={24}
          color="white"
          style={styles.icon}
        />
        <Text style={styles.deleteText}>Delete my Account</Text>
        <Ionicons
          name="chevron-forward-outline"
          size={24}
          color="black"
          style={styles.arrow}
        />
      </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    padding: 20,
  },
  menuContainer: {
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 16,
  },
  icon: {
    marginRight: 10,
    color: "white",
  },
  menuText: {
    flex: 1,
    fontSize: 18,
    color: "white",
  },
  arrow: {
    color: "white",
  },
  actionButtonsContainer: {
    marginTop: "auto",
    gap: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#FF6B6B",
    padding: 15,
    borderRadius: 10,
  },
  logoutText: {
    flex: 1,
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#5CD4FF",
    padding: 15,
    borderRadius: 10,
  },
  deleteText: {
    flex: 1,
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
