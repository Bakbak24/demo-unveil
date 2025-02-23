import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function AccountScreen() {
  const router = useRouter();

  const menuItems: {
    label: string;
    icon:
      | "person-outline"
      | "lock-closed-outline"
      | "card-outline"
      | "location-outline";
    route:
      | "/user/account/personal-info"
      | "/user/account/security"
      | "/user/account/payment"
      | "/user/account/add-spot";
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
      label: "Payment Options",
      icon: "card-outline",
      route: "/user/account/payment",
    },
    {
      label: "Add a Spot to the Map",
      icon: "location-outline",
      route: "/user/account/add-spot",
    },
  ];

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

      {/* Delete Account Button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => console.log("Delete Account Pressed")}
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
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#5CD4FF",
    padding: 15,
    borderRadius: 10,
    marginTop: "auto",
  },
  deleteText: {
    flex: 1,
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
