import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as Haptics from "expo-haptics";
import { classifyAcne, analyzeProduct } from "../services/classificationService";
import { uploadImageForAnalysis } from "../services/firebaseService";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type CameraScreenProps = NativeStackScreenProps<RootStackParamList, "Camera">;

export default function CameraScreen({ navigation }: CameraScreenProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [progress, setProgress] = useState(0);
  const [scanType, setScanType] = useState<"face" | "product">("face");

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need camera access to analyze your skin.");
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need gallery access to analyze your photos.");
      return false;
    }
    return true;
  };

  const compressImage = async (uri: string) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch (error) {
      console.log("Compression error:", error);
      return uri;
    }
  };

  const simulateProgress = (target: number, duration: number) => {
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= target) {
            clearInterval(interval);
            resolve();
            return target;
          }
          return prev + 5;
        });
      }, duration / 10);
    });
  };

  const sendToAPI = async (imageUri: string) => {
    setIsAnalyzing(true);
    setProgress(0);

    try {
      // Step 1: Optimization
      setAnalysisStep("Optimizing image...");
      const compressedUri = await compressImage(imageUri);
      await simulateProgress(30, 600);
      
      if (scanType === "face") {
        // --- FACE SCAN LOGIC ---
        setAnalysisStep("Uploading to AI server...");
        const analysisPromise = classifyAcne(compressedUri);
        await simulateProgress(75, 1500);
        
        setAnalysisStep("AI is identifying skin patterns...");
        const result = await analysisPromise;
        await simulateProgress(100, 400);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.navigate("Results", {
          imageUri: compressedUri,
          classification: result.classification,
          confidence: result.confidence,
        });

        uploadImageForAnalysis(compressedUri, {
          classification: result.classification,
          confidence: result.confidence,
        }).catch(console.error);

      } else {
        // --- PRODUCT SCAN LOGIC ---
        setAnalysisStep("Reading ingredients...");
        const productPromise = analyzeProduct(compressedUri);
        await simulateProgress(60, 1000);

        setAnalysisStep("Chemist AI is analyzing risks...");
        const result = await productPromise;
        await simulateProgress(100, 800);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Correctly casting result as IngredientResult (handled by service return type)
        navigation.navigate("ProductResults", { result });
      }

    } catch (error) {
      console.error("❌ Error in sendToAPI:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't reach the AI server. Please check your connection.";
      Alert.alert("Analysis Failed", message);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
      setProgress(0);
    }
  };

  // Launch the native camera (which includes the default flip button)
  const handleTakePicture = async () => {
    console.log("📸 Take Picture button pressed");
    const hasPermission = await requestCameraPermission();
    console.log("Permission status:", hasPermission);
    if (!hasPermission) return;

    try {
        const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        });
        console.log("Camera result:", result.canceled ? "Canceled" : "Captured");

        if (!result.canceled) {
        sendToAPI(result.assets[0].uri);
        }
    } catch (e) {
        console.error("Camera launch error:", e);
    }
  };

  // Launch the image library to select a photo
  const handlePickImage = async () => {
    console.log("🖼️ Pick Image button pressed");
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
        const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        });

        if (!result.canceled) {
        sendToAPI(result.assets[0].uri);
        }
    } catch (e) {
        console.error("Image Picker error:", e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Classification Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAnalyzing}
        onRequestClose={() => {}}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.scannerLineContainer}>
               <ActivityIndicator size="large" color="#007AFF" />
            </View>
            <Text style={styles.modalText}>{analysisStep}</Text>
            <View style={styles.progressBarBg}>
               <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressSubtext}>{progress}% Complete</Text>
          </View>
        </View>
      </Modal>

      {/* Toggle Scan Type */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, scanType === "face" && styles.toggleActive]}
          onPress={() => setScanType("face")}
        >
          <Text style={[styles.toggleText, scanType === "face" && styles.toggleTextActive]}>Face Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, scanType === "product" && styles.toggleActive]}
          onPress={() => setScanType("product")}
        >
          <Text style={[styles.toggleText, scanType === "product" && styles.toggleTextActive]}>Product Audit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <Button title={scanType === "face" ? "Take Selfie" : "Scan Label"} onPress={handleTakePicture} />
        <Button title="Choose Photo" onPress={handlePickImage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    padding: 4,
    marginBottom: 40,
    width: "80%",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 16,
  },
  toggleActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontWeight: "600",
    color: "#999",
  },
  toggleTextActive: {
    color: "#007AFF",
  },
  // ... (keep other styles)
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 24,
    alignItems: "center",
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  modalText: { 
    fontSize: 18, 
    fontWeight: "600",
    marginTop: 20, 
    color: "#333",
    textAlign: "center"
  },
  progressSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  scannerLineContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    marginTop: 20,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 3,
  },
});
