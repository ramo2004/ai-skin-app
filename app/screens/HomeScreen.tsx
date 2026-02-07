/**
 * @file HomeScreen.tsx
 * @description Main entry screen of the app, provides access to camera functionality.
 */

import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Image, ScrollView, Dimensions, Alert } from "react-native";
import { ThemedText } from "../components/ThemedText";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { signOut, getUserProfile } from "../services/firebaseService";
import { dailyTips, SkinTip } from "../data/skinTips";
import { auth } from "../config/firebaseConfig";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const { width } = Dimensions.get("window");

/**
 * HomeScreen provides a personalized dashboard for the user.
 * Includes quick access to skin analysis, history, and daily care routines.
 */
export default function HomeScreen({ navigation }: Props): React.JSX.Element {
  /** The currently displayed daily skin tip. */
  const [dailyTip, setDailyTip] = useState<SkinTip>(dailyTips[0]);
  
  /** User's display name, defaults to "User" if profile fetch fails or is pending. */
  const [displayName, setDisplayName] = useState<string | null>("User");

  useEffect(() => {
    // Initialization logic
    const initializeHome = async () => {
      // 1. Pick a random skin tip for the day
      const randomIndex = Math.floor(Math.random() * dailyTips.length);
      setDailyTip(dailyTips[randomIndex]);

      // 2. Fetch User Name (Prefers Firestore Profile > Auth Profile > "User")
      if (auth.currentUser) {
        // Optimistic update with Auth display name
        setDisplayName(auth.currentUser.displayName || "User");
        
        try {
          const result = await getUserProfile(auth.currentUser.uid);
          if (!result.error && result.profile?.displayName) {
             setDisplayName(result.profile.displayName);
          }
        } catch (error) {
          console.warn("Failed to fetch profile name for home screen", error);
        }
      }
    };

    initializeHome();
  }, []);

  /**
   * Handles user sign out and redirects to authentication screen.
   */
  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.replace("Auth");
    } catch (error: any) {
      Alert.alert("Sign Out Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.greeting}>Hello,</ThemedText>
          <ThemedText style={styles.username}>{displayName}</ThemedText>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleSignOut}>
          <MaterialCommunityIcons name="logout" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main CTA Card */}
        <View style={styles.mainCard}>
          <View style={styles.cardContent}>
            <ThemedText style={styles.cardTitle}>Start Skin Analysis</ThemedText>
            <ThemedText style={styles.cardDescription}>
              Use AcneScan&apos;s advanced imaging to analyze your skin health and get personalized recommendations.
            </ThemedText>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate("Camera")}
            >
              <MaterialCommunityIcons name="camera" size={24} color="#fff" style={styles.btnIcon} />
              <ThemedText style={styles.btnText}>Analyze Now</ThemedText>
            </TouchableOpacity>
          </View>
          <Image 
            source={{ uri: "https://img.freepik.com/free-vector/skincare-routine-concept-illustration_114360-16434.jpg" }} // Placeholder or local asset
            style={styles.cardImage}
          />
        </View>

        {/* Quick Stats / Info Grid */}
        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate("History")}>
            <View style={[styles.iconContainer, { backgroundColor: "#e3f2fd" }]}>
              <MaterialCommunityIcons name="history" size={28} color="#2196f3" />
            </View>
            <ThemedText style={styles.gridTitle}>History</ThemedText>
            <ThemedText style={styles.gridSub}>View past logs</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate("Routine")}>
             <View style={[styles.iconContainer, { backgroundColor: "#e8f5e9" }]}>
              <MaterialCommunityIcons name="hospital-box" size={28} color="#4caf50" />
            </View>
            <ThemedText style={styles.gridTitle}>Routine</ThemedText>
            <ThemedText style={styles.gridSub}>Daily care</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Recent Tips Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Daily Tips</ThemedText>
          <View style={styles.tipCard}>
             <View style={[styles.tipIconContainer, { backgroundColor: dailyTip.color + "20" }]}>
               <MaterialCommunityIcons name={dailyTip.icon as any} size={24} color={dailyTip.color} />
             </View>
             <View style={styles.tipContent}>
                <ThemedText style={styles.tipTitle}>{dailyTip.title}</ThemedText>
                <ThemedText style={styles.tipText}>{dailyTip.description}</ThemedText>
             </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: "#666",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  profileButton: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  mainCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
    overflow: "hidden",
    position: "relative",
  },
  cardContent: {
    zIndex: 1,
  },
  cardImage: {
    position: "absolute",
    right: -20,
    bottom: -20,
    width: 120,
    height: 120,
    opacity: 0.1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    color: "#666",
    marginBottom: 20,
    lineHeight: 22,
  },
  ctaButton: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignSelf: "flex-start",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnIcon: {
    marginRight: 8,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  gridItem: {
    backgroundColor: "#fff",
    width: (width - 48 - 15) / 2,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  gridSub: {
    fontSize: 13,
    color: "#999",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  tipCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  tipContent: {
    marginLeft: 16,
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  tipIconContainer: {
    padding: 10,
    borderRadius: 12,
    marginRight: 4,
  },
});
