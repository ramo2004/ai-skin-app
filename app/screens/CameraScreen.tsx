import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type CameraScreenProps = NativeStackScreenProps<RootStackParamList, "Camera">;

export default function CameraScreen({ navigation }: CameraScreenProps) {
  const [facing, setFacing] = useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need camera access.</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const sendToAPI = async (imageUri: string) => {
    setIsAnalyzing(true);
    setIsCameraActive(false);

    try {
      console.log("🚀 Preparing image for classification...");

      // ✅ Convert URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // ✅ Create FormData directly (skip Firebase)
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        name: `acne_${Date.now()}.jpg`,
        type: "image/jpeg",
      } as any);

      const API_URL = "http://192.168.86.28:8000/classify/"; // Replace with your computer's IP
      console.log("🚀 Sending request to FastAPI...", API_URL);

      // ✅ Send FormData to GPT-4 backend
      const apiResponse = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!apiResponse.ok) {
        throw new Error(`API Error: ${apiResponse.status}`);
      }

      const result = await apiResponse.json();
      console.log("✅ API Classification Result:", result);

      // ✅ Handle low confidence cases (threshold at 0.6)
      if (result?.confidence < 0.6) {
        Alert.alert(
          "Low Confidence",
          "The image could not be classified confidently. Please retake the picture with better lighting or a clearer angle."
        );
        setIsCameraActive(true);
        return;
      }

      // ✅ Navigate to results screen if confidence is high enough
      navigation.navigate("Results", {
        imageUri: imageUri, // Use original URI since you aren’t using Firebase anymore
        classification: result.classification,
        
      });
    } catch (error) {
      console.error("❌ Error in sendToAPI:", error);
      Alert.alert("Error", "Failed to classify the image.");
      setIsCameraActive(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      sendToAPI(result.assets[0].uri);
    }
  };

  async function handleTakePicture(): Promise<void> {
    if (cameraRef.current !== null) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo?.uri) {
        sendToAPI(photo.uri);
      }
    }
  }

  const handleResumeCamera = () => {
    setIsCameraActive(true);
  };

  return (
    <View style={styles.container}>
      {/* Classification Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isAnalyzing}
        onRequestClose={() => {}}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.modalText}>Classifying... Please wait</Text>
          </View>
        </View>
      </Modal>

      <CameraView
        style={styles.camera}
        facing={facing}
        ref={(ref) => (cameraRef.current = ref)}
        active={isCameraActive}
      >
        <View style={styles.captureContainer}>
          {!isCameraActive ? (
            <TouchableOpacity
              onPress={handleResumeCamera}
              style={styles.resumeButton}
            >
              <Text style={styles.captureText}>Resume Camera</Text>
            </TouchableOpacity>
          ) : (
            <>
              {/* Circular Capture Button */}
              <TouchableOpacity
                onPress={handleTakePicture}
                style={styles.captureButtonContainer}
              >
                <View style={styles.outerCircle}>
                  <View style={styles.innerCircle} />
                </View>
              </TouchableOpacity>

              {/* Improved Gallery Button */}
              <TouchableOpacity
                onPress={handlePickImage}
                style={styles.galleryButton}
              >
                <Text style={styles.captureText}>Choose from Photos</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  captureContainer: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 30,
  },
  captureButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  outerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "transparent",
    borderColor: "#fff",
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#fff",
  },
  galleryButton: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: 250,
  },
  modalText: { fontSize: 16, marginTop: 10 },
  captureText: { fontSize: 16, color: "#000" },
  resumeButton: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
    marginBottom: 20,
  },

  // ✅ FIXED: Added missing permissionContainer style
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  permissionText: {
    fontSize: 18,
    marginBottom: 20,
  },
});

