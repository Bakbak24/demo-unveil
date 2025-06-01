import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

/**
 * Logout function that clears all user data and redirects to login
 */
export const logout = async (): Promise<void> => {
  try {
    // Clear all stored user data
    await AsyncStorage.multiRemove([
      "userToken",
      "userId",
      "userEmail",
      "userName",
      "userRole",
      "subscriptionStatus",
      "subscriptionType",
      "isLifetimeUser",
      "hasActiveSubscription",
      "subscriptionEndDate",
      "stripeCustomerId",
    ]);

    // Navigate to login page and reset navigation stack
    router.replace("/(auth)/login");
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    return !!token;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

/**
 * Get user token
 */
export const getUserToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("userToken");
  } catch (error) {
    console.error("Error getting user token:", error);
    return null;
  }
};

/**
 * Get user data from storage
 */
export const getUserData = async () => {
  try {
    const [
      token,
      userId,
      userEmail,
      userName,
      userRole,
      subscriptionStatus,
      subscriptionType,
      isLifetimeUser,
    ] = await AsyncStorage.multiGet([
      "userToken",
      "userId",
      "userEmail",
      "userName",
      "userRole",
      "subscriptionStatus",
      "subscriptionType",
      "isLifetimeUser",
    ]);

    return {
      token: token[1],
      userId: userId[1],
      email: userEmail[1],
      name: userName[1],
      role: userRole[1],
      subscriptionStatus: subscriptionStatus[1],
      subscriptionType: subscriptionType[1],
      isLifetimeUser: isLifetimeUser[1] === "true",
    };
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

/**
 * Store user data after login
 */
export const storeUserData = async (userData: {
  token: string;
  userId: string;
  email: string;
  name: string;
  role?: string;
  subscriptionStatus?: string;
  subscriptionType?: string;
  isLifetimeUser?: boolean;
}) => {
  try {
    const dataToStore: readonly [string, string][] = [
      ["userToken", userData.token],
      ["userId", userData.userId],
      ["userEmail", userData.email],
      ["userName", userData.name],
      ["userRole", userData.role || "user"],
      ["subscriptionStatus", userData.subscriptionStatus || "inactive"],
      ["subscriptionType", userData.subscriptionType || ""],
      ["isLifetimeUser", userData.isLifetimeUser ? "true" : "false"],
    ];

    await AsyncStorage.multiSet(dataToStore);
  } catch (error) {
    console.error("Error storing user data:", error);
    throw error;
  }
};

/**
 * Update subscription data in storage
 */
export const updateSubscriptionData = async (subscriptionData: {
  subscriptionStatus?: string;
  subscriptionType?: string;
  isLifetimeUser?: boolean;
  hasActiveSubscription?: boolean;
  subscriptionEndDate?: string;
}) => {
  try {
    const dataToUpdate: [string, string][] = [];

    if (subscriptionData.subscriptionStatus !== undefined) {
      dataToUpdate.push(["subscriptionStatus", subscriptionData.subscriptionStatus]);
    }
    if (subscriptionData.subscriptionType !== undefined) {
      dataToUpdate.push(["subscriptionType", subscriptionData.subscriptionType]);
    }
    if (subscriptionData.isLifetimeUser !== undefined) {
      dataToUpdate.push(["isLifetimeUser", subscriptionData.isLifetimeUser ? "true" : "false"]);
    }
    if (subscriptionData.hasActiveSubscription !== undefined) {
      dataToUpdate.push(["hasActiveSubscription", subscriptionData.hasActiveSubscription ? "true" : "false"]);
    }
    if (subscriptionData.subscriptionEndDate !== undefined) {
      dataToUpdate.push(["subscriptionEndDate", subscriptionData.subscriptionEndDate]);
    }

    if (dataToUpdate.length > 0) {
      await AsyncStorage.multiSet(dataToUpdate);
    }
  } catch (error) {
    console.error("Error updating subscription data:", error);
    throw error;
  }
}; 