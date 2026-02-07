import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { ThemedText } from "../components/ThemedText";
import { auth } from "../config/firebaseConfig";
import { getUserProfile } from "../services/firebaseService";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ROUTINES, RoutineStep } from "../data/routineData";

/**
 * RoutineScreen displays a personalized skincare routine based on the user's skin type.
 * It uses a "Smart-Static" approach, providing dermatological baselines that will
 * eventually be refined by AI data.
 */
export default function RoutineScreen() {
  const [loading, setLoading] = useState(true);
  const [skinType, setSkinType] = useState("Normal");
  
  // Initialize with Normal as a safe fallback
  const [daySteps, setDaySteps] = useState<RoutineStep[]>(ROUTINES.Normal.day);
  const [nightSteps, setNightSteps] = useState<RoutineStep[]>(ROUTINES.Normal.night);

  useEffect(() => {
    fetchProfile();
  }, []);

  /**
   * Fetches the user profile from Firestore and updates the displayed routine.
   */
  const fetchProfile = async () => {
    if (auth.currentUser) {
      const result = await getUserProfile(auth.currentUser.uid);
      if (result.profile) {
        setSkinType(result.profile.skinType);
        
        // Select routine based on skin type, fallback to Normal if type is unrecognized
        const selectedRoutine = ROUTINES[result.profile.skinType] || ROUTINES.Normal;
        setDaySteps(selectedRoutine.day);
        setNightSteps(selectedRoutine.night);
      }
    }
    setLoading(false);
  };

  const toggleStep = (period: "day" | "night", id: number) => {
    if (period === "day") {
      setDaySteps((prev: any[]) => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
    } else {
      setNightSteps((prev: any[]) => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
    }
  };

  const renderStep = (item: any, period: "day" | "night") => (
    <TouchableOpacity 
      key={item.id} 
      style={[styles.stepCard, item.done && styles.stepDone]}
      onPress={() => toggleStep(period, item.id)}
    >
      <MaterialCommunityIcons 
        name={item.done ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
        size={24} 
        color={item.done ? "#4CAF50" : "#ccc"} 
      />
      <ThemedText style={[styles.stepText, item.done && styles.stepTextDone]}>
        {item.title}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Your Routine</ThemedText>
        <ThemedText style={styles.subtitle}>Tailored for {skinType} Skin • Week 1</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Morning Section */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="weather-sunny" size={20} color="#FF9800" />
          <ThemedText style={styles.sectionTitle}>Morning</ThemedText>
        </View>
        <View style={styles.card}>
          {daySteps.map(step => renderStep(step, "day"))}
        </View>

        {/* Night Section */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="moon-waning-crescent" size={20} color="#3F51B5" />
          <ThemedText style={styles.sectionTitle}>Evening</ThemedText>
        </View>
        <View style={styles.card}>
          {nightSteps.map(step => renderStep(step, "night"))}
        </View>

        {/* Settings / Adjust */}
        <TouchableOpacity 
          style={styles.adjustButton}
          onPress={() => Alert.alert("Coming Soon", "You'll be able to customize your products and duration in the next update!")}
        >
           <MaterialCommunityIcons name="cog" size={20} color="#666" />
           <ThemedText style={styles.adjustText}>Adjust Duration & Products</ThemedText>
        </TouchableOpacity>

        <View style={styles.disclaimerContainer}>
          <MaterialCommunityIcons name="information-outline" size={16} color="#007AFF" />
          <ThemedText style={styles.disclaimerText}>
            Smart-Static: This routine is a dermatological baseline for {skinType} skin. As you log more AI scans, we&apos;ll refine it dynamically.
          </ThemedText>
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
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
  },
  subtitle: {
    color: "#666",
    fontSize: 16,
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  stepDone: {
    opacity: 0.6,
  },
  stepText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#333",
  },
  stepTextDone: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  adjustButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    gap: 8,
  },
  adjustText: {
    color: "#666",
    fontSize: 14,
  },
  disclaimerContainer: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: "center",
     gap: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#007AFF",
    flex: 1,
    lineHeight: 16,
  },
});
