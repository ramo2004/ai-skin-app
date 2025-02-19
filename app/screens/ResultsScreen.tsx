import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { getRecommendations } from "../services/recommendationService"; // Import recommendation logic

type Props = NativeStackScreenProps<RootStackParamList, "Results">;

export default function ResultsScreen({ route }: Props): JSX.Element {
  const { imageUri, classification } = route.params;

  // Get recommendations based on classification
  const recommendations = getRecommendations(classification.classification);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Classification Results</Text>
      <Image source={{ uri: imageUri }} style={styles.fullImage} />
      <Text style={styles.resultText}>
        Acne Type: {classification.classification}
      </Text>
      <Text style={styles.confidenceText}>
        Confidence: {(classification.confidence * 100).toFixed(2)}%
      </Text>

      {/* Show recommendations */}
      <Text style={styles.recommendationTitle}>Recommended Treatments:</Text>
      {recommendations.map((rec, index) => (
        <Text key={index} style={styles.recommendationText}>
          • {rec}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 16 },
  fullImage: { width: 220, height: 220, borderRadius: 10, marginBottom: 16 },
  resultText: { fontSize: 18, marginBottom: 10 },
  confidenceText: { fontSize: 14, color: "#666", marginBottom: 8 },
  recommendationTitle: { fontSize: 20, fontWeight: "600", marginTop: 20 },
  recommendationText: { fontSize: 16, marginBottom: 5 },
});
