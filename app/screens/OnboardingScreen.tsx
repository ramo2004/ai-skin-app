import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from "react-native";
import { ThemedText } from "../components/ThemedText";
import { saveUserProfile } from "../services/firebaseService";
import { auth } from "../config/firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

const SKIN_TYPES = ["Oily", "Dry", "Combination", "Sensitive", "Normal"];
const GENDERS = ["Male", "Female", "Prefer not to say"];

export default function OnboardingScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedSkinType, setSelectedSkinType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!name.trim() || !age.trim() || !selectedGender || !selectedSkinType) {
      Alert.alert("Missing Information", "Please fill in all fields to continue.");
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
      Alert.alert("Invalid Age", "Please enter a valid age (13+).");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await saveUserProfile(user.uid, {
          displayName: name.trim(),
          age: age.trim(),
          gender: selectedGender,
          skinType: selectedSkinType,
        });
        navigation.replace("Home");
      } else {
        Alert.alert("Error", "User not logged in.");
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to save profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderOption = (
    label: string,
    currentValue: string,
    onSelect: (val: string) => void
  ) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        currentValue === label && styles.optionButtonSelected,
      ]}
      onPress={() => onSelect(label)}
    >
      <ThemedText
        style={[
          styles.optionText,
          currentValue === label && styles.optionTextSelected,
        ]}
      >
        {label}
      </ThemedText>
      {currentValue === label && (
        <MaterialCommunityIcons name="check-circle" size={20} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Personalize Your AI
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            We use this information to tailor the AI&apos;s skin analysis to your unique biological profile.
          </ThemedText>
        </View>

        <View style={styles.card}>
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>What should we call you?</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Age Field */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>How old are you?</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Age (e.g., 25)"
              placeholderTextColor="#999"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              maxLength={3}
            />
            <ThemedText style={styles.helperText}>
              Acne patterns change significantly with age.
            </ThemedText>
          </View>

          {/* Gender Field */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Gender</ThemedText>
            <View style={styles.optionsContainer}>
              {GENDERS.map((g) => (
                <View key={g}>{renderOption(g, selectedGender, setSelectedGender)}</View>
              ))}
            </View>
          </View>

          {/* Skin Type Field */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Skin Type</ThemedText>
            <View style={styles.optionsContainer}>
              {SKIN_TYPES.map((t) => (
                <View key={t}>{renderOption(t, selectedSkinType, setSelectedSkinType)}</View>
              ))}
            </View>
            <ThemedText style={styles.helperText}>
              Helps us recommend safe active ingredients.
            </ThemedText>
          </View>
        </View>

        <View style={styles.privacyContainer}>
          <MaterialCommunityIcons name="shield-lock" size={16} color="#666" />
          <ThemedText style={styles.privacyText}>
            Your data is private. It is encrypted and used solely for analysis.
          </ThemedText>
        </View>

        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
          disabled={loading}
        >
          <ThemedText style={styles.completeButtonText}>
            {loading ? "Saving Profile..." : "Complete Profile"}
          </ThemedText>
          {!loading && (
            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    textAlign: "left",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
    fontStyle: "italic",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 4,
  },
  optionButtonSelected: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
  },
  optionText: {
    fontSize: 14,
    color: "#666",
    marginRight: 6,
  },
  optionTextSelected: {
    color: "#007AFF",
    fontWeight: "600",
  },
  privacyContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    gap: 8,
  },
  privacyText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  completeButton: {
    backgroundColor: "#007AFF",
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 40,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
});
