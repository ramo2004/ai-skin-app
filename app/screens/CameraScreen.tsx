import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig";

type CameraScreenProps = NativeStackScreenProps<RootStackParamList, "Camera">;

export default function CameraScreen({ navigation }: CameraScreenProps) {
  const [facing, setFacing] = useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

    try {
      console.log("🚀 Uploading to Firebase...");

      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Create a unique filename
      const filename = `acne_${Date.now()}.jpg`;
      const storageRef = ref(storage, `images/${filename}`);

      // Upload to Firebase Storage
      await uploadBytes(storageRef, blob);

      // Get public URL from Firebase
      const downloadURL = await getDownloadURL(storageRef);
      console.log("✅ Firebase Upload Success! URL:", downloadURL);

      // Send the Firebase URL to Cloud Run for classification
      console.log("🚀 Sending Image URL to Cloud Run API...");
      const apiResponse = await fetch(
        "https://acne-api-983645359628.us-central1.run.app/classify",
        {
          method: "POST",
          body: JSON.stringify({ image_url: downloadURL }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!apiResponse.ok) {
        throw new Error(`API Error: ${apiResponse.status}`);
      }

      const result = await apiResponse.json();
      console.log("✅ API Classification Result:", result);

      // Navigate to results screen with classification
      navigation.navigate("Results", {
        imageUri: downloadURL,
        classification: result,
      });
    } catch (error) {
      console.error("❌ Error in sendToAPI:", error);
      Alert.alert("Error", "Failed to classify the image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Removed cropping
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

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={(ref) => (cameraRef.current = ref)}
      >
        <View style={styles.captureContainer}>
          {isAnalyzing ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <TouchableOpacity
                onPress={handleTakePicture}
                style={styles.captureButton}
              >
                <Text style={styles.captureText}>Take Picture</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePickImage}
                style={styles.galleryButton}
              >
                <Text style={styles.captureText}>Choose from photos</Text>
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
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionText: { fontSize: 18, marginBottom: 20 },
  camera: { flex: 1 },
  captureContainer: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  captureButton: {
    alignSelf: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 10,
  },
  captureText: { fontSize: 18, color: "#000000" },
  galleryButton: {
    alignSelf: "center",
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 10,
  },
});
