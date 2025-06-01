import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export default function UserScreen() {
  const router = useRouter();
  const { user, logout, isLoggedIn } = useAuth();

  const menuItems: {
    label: string;
    icon:
      | "person-outline"
      | "information-circle-outline"
      | "settings-outline"
      | "globe-outline";
    route:
      | "/user/account"
      | "/user/about"
      | "/user/permissions"
      | "/user/language";
  }[] = [
    { label: "Account", icon: "person-outline", route: "/user/account" },
    {
      label: "About",
      icon: "information-circle-outline",
      route: "/user/about",
    },
    {
      label: "Device Permissions",
      icon: "settings-outline",
      route: "/user/permissions",
    },
    { label: "Language", icon: "globe-outline", route: "/user/language" },
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

  // If not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.loginPromptContainer}>
          <Ionicons name="person-outline" size={80} color="#666" />
          <Text style={styles.loginPromptTitle}>Please Log In</Text>
          <Text style={styles.loginPromptText}>
            You need to be logged in to access your profile
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.profileImage}
        />
        <Text style={styles.greeting}>Good morning</Text>
        <Text style={styles.username}>Unveil User</Text>
      </View>

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
              color="black"
              style={styles.icon}
            />
            <Text style={styles.menuText}>{item.label}</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={24}
              color="black"
              style={styles.arrow}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons
          name="log-out-outline"
          size={24}
          color="black"
          style={styles.icon}
        />
        <Text style={styles.logoutText}>Log Out</Text>
        <Ionicons
              name="chevron-forward-outline"
              size={24}
              color="black"
              style={styles.arrow}
            />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  profileImage: {
    width: 148,
    height: 148,
    borderRadius: 100,
    marginBottom: 10,
  },
  greeting: {
    fontSize: 14,
    color: "white",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
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
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#5CD4FF",
    padding: 15,
    borderRadius: 10,
    marginTop: "auto",
  },
  logoutText: {
    flex: 1,
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loginPromptTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  loginPromptText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#5CD4FF",
    padding: 15,
    borderRadius: 10,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
