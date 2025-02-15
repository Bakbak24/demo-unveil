import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function UserScreen() {
  const router = useRouter();

  const menuItems: {label: string; icon: "person-outline"| "information-circle-outline"| "settings-outline"| "globe-outline"; route: "/user/account" | "/user/about" | "/user/permissions" | "/user/language";}[] = [
    { label: "Account", icon: "person-outline", route: "/user/account" },
    { label: "About", icon: "information-circle-outline", route: "/user/about" },
    { label: "Device Permissions", icon: "settings-outline", route: "/user/permissions" },
    { label: "Language", icon: "globe-outline", route: "/user/language" },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: "https://placehold.co/100x100/000000/FFF" }}
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
        onPress={() => console.log("Logout Pressed")}
      >
        <Ionicons
          name="log-out-outline"
          size={24}
          color="black"
          style={styles.icon}
        />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
  },
  greeting: {
    fontSize: 18,
    color: "gray",
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
  },
  menuContainer: {
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  menuText: {
    flex: 1,
    fontSize: 18,
  },
  arrow: {
    opacity: 0.5,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginTop: "auto",
  },
  logoutText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
