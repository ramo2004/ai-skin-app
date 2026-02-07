import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { getRecommendations } from "../services/recommendationService";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<RootStackParamList, "Results">;

export default function ResultsScreen({ route, navigation }: Props): React.JSX.Element {
  const { imageUri, classification, confidence } = route.params;

  // Get recommendations based on classification
  const recommendations = getRecommendations(classification);

  // Helper to determine color based on acne type severity
  const getSeverityStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case "cyst":
      case "nodule":
        return { color: "#D32F2F", label: "Treatment Required" }; // Deep Red
      case "pustule":
      case "papule":
        return { color: "#F57C00", label: "Moderate" }; // Solid Orange
      case "no_acne_detected":
        return { color: "#388E3C", label: "Healthy" }; // Forest Green
      default:
        return { color: "#1976D2", label: "Information" }; // Royal Blue
    }
  };

  const styleInfo = getSeverityStyle(classification);
  const confidencePercent = Math.round(confidence * 100);
  const classificationLabel = classification
    .replace(/_/g, " ")
    .replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Image Header with Overlay */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.fullImage} />
          <View style={styles.overlay}>
             <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
             </TouchableOpacity>
          </View>
          <View style={styles.imageBadge}>
             <Text style={styles.imageBadgeText}>AI SCAN</Text>
          </View>
        </View>

        {/* Diagnosis Card */}
        <View style={styles.card}>
          <View style={styles.diagnosisHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>ANALYSIS RESULT</Text>
              <Text style={[styles.diagnosisTitle, { color: styleInfo.color }]}>
                {classificationLabel}
              </Text>
            </View>
            <View style={[styles.confidenceBadge, { backgroundColor: styleInfo.color + "15" }]}>
              <Text style={[styles.confidenceText, { color: styleInfo.color }]}>
                {confidencePercent}% Match
              </Text>
            </View>
          </View>
          
          <View style={styles.statusIndicator}>
             <View style={[styles.dot, { backgroundColor: styleInfo.color }]} />
             <Text style={[styles.statusLabel, { color: styleInfo.color }]}>{styleInfo.label}</Text>
          </View>

          <View style={styles.separator} />
          
          <Text style={styles.description}>
            AI analysis identified characteristics consistent with <Text style={{ fontWeight: "700", color: "#333" }}>{classification.replace(/_/g, " ")}</Text>. 
            Following the personalized treatment plan below can help improve your skin health.
          </Text>
        </View>

        {/* Treatment Recommendations */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Treatment Plan</Text>
          {recommendations.map((rec, index) => (
            <View key={index} style={styles.recCard}>
              <View style={styles.recNumber}>
                <Text style={styles.recNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.recText}>{rec}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Floating Action / Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    height: 350,
    width: "100%",
    backgroundColor: "#000",
    position: "relative",
  },
  fullImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  closeButton: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 25,
    padding: 10,
  },
  imageBadge: {
    position: "absolute",
    bottom: 60,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  imageBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#fff",
    margin: 20,
    marginTop: -40,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  diagnosisHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    color: "#999",
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 1.5,
  },
  diagnosisTitle: {
    fontSize: 26,
    fontWeight: "bold",
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  confidenceText: {
    fontSize: 13,
    fontWeight: "700",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 20,
  },
  description: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  recCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  recNumber: {
    width: 28,
    height: 28,
    backgroundColor: "#F0F7FF",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    marginTop: 2,
  },
  recNumberText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  recText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    lineHeight: 23,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 24,
    paddingBottom: 45,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  doneButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
