import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "ProductResults">;

export default function ProductResultsScreen({ route, navigation }: Props) {
  const { result } = route.params; // Expecting result passed via navigation

  const isSafe = !result.has_risky_ingredients && result.risk_level !== "Error";
  const riskColor = isSafe ? "#34C759" : result.risk_level === "High" ? "#FF3B30" : "#FF9500";
  const iconName = isSafe ? "shield-checkmark" : "alert-circle";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: isSafe ? "#E8F5E9" : "#FFEBEE" }]}>
            <Ionicons name={iconName} size={64} color={riskColor} />
          </View>
          <Text style={styles.title}>
            {isSafe ? "Safe Formulation" : `${result.risk_level} Risk Detected`}
          </Text>
          <Text style={styles.summary}>{result.summary}</Text>
        </View>

        {/* Ingredients List */}
        {!isSafe && result.risky_ingredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pore-Clogging Ingredients FOUND:</Text>
            {result.risky_ingredients.map((ing, index) => (
              <View key={index} style={styles.ingredientCard}>
                <View style={styles.ingredientHeader}>
                  <Text style={styles.ingredientName}>{ing.name}</Text>
                  <View style={[styles.ratingBadge, { backgroundColor: ing.rating >= 4 ? "#FF3B30" : "#FF9500" }]}>
                    <Text style={styles.ratingText}>Level {ing.rating}/5</Text>
                  </View>
                </View>
                <Text style={styles.ingredientReason}>{ing.reason}</Text>
              </View>
            ))}
          </View>
        )}

        {isSafe && (
          <View style={styles.safeCard}>
            <Ionicons name="sparkles" size={24} color="#34C759" />
            <Text style={styles.safeText}>
              No common pore-clogging ingredients were detected in this product.
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Camera")}>
          <Text style={styles.buttonText}>Scan Another Product</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => navigation.navigate("Home")}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Back to Home</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 24, alignItems: "center" },
  header: { alignItems: "center", marginBottom: 32 },
  iconContainer: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: "center", alignItems: "center", marginBottom: 16
  },
  title: { fontSize: 24, fontWeight: "700", color: "#333", marginBottom: 8 },
  summary: { fontSize: 16, color: "#666", textAlign: "center", lineHeight: 22 },
  section: { width: "100%", marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#999", marginBottom: 12, textTransform: "uppercase" },
  ingredientCard: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "#f0f0f0",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  ingredientHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  ingredientName: { fontSize: 16, fontWeight: "600", color: "#333" },
  ratingBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  ratingText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  ingredientReason: { fontSize: 14, color: "#666" },
  safeCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#E8F5E9",
    padding: 20, borderRadius: 16, marginBottom: 32, gap: 12
  },
  safeText: { flex: 1, fontSize: 15, color: "#2E7D32", lineHeight: 20 },
  button: {
    backgroundColor: "#007AFF", width: "100%", padding: 16, borderRadius: 12,
    alignItems: "center", marginBottom: 12
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  secondaryButton: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#007AFF" },
  secondaryButtonText: { color: "#007AFF" }
});
