import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig";

/**
 * Possible acne types, updated to match backend labels.
 */
/**
 * Possible acne types, exactly matching backend labels.
 */
import { LogBox } from "react-native";

LogBox.ignoreAllLogs(false); // ✅ Forces all logs to show

console.log("🚀🚀🚀 This is a test log! If you see this, logging is working.");
console.warn("⚠️ Warning log test!");
console.error("❌ Error log test!");

export type AcneType =
  | "cyst" // ✅ Matches backend
  | "blackhead" // ✅ Matches backend
  | "whitehead" // ✅ Matches backend
  | "papule" // ✅ Matches backend
  | "pustule" // ✅ Matches backend
  | "nodule" // ✅ Matches backend
  | "no_acne_detected"; // ✅ No change needed

/**
 * Classifies acne from a photo URI using the API.
 * @param photoUri local URI to the captured photo.
 * @returns {Promise<{ classification: AcneType, confidence: number }>}
 */
export async function classifyAcne(
  photoUri: string
): Promise<{ classification: AcneType; confidence: number }> {
  try {
    console.log("📸 Starting classification for:", photoUri); // ✅ Log image URI

    // Convert URI to blob
    const response = await fetch(photoUri);
    const blob = await response.blob();

    // Create a unique filename
    const filename = `${Date.now()}.jpg`;
    const storageRef = ref(storage, `images/${filename}`);

    console.log("📤 Uploading to Firebase...");
    await uploadBytes(storageRef, blob);
    console.log("✅ Image uploaded, fetching Firebase URL...");

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log("🔥 Firebase URL:", downloadURL); // ✅ Log Firebase URL

    // If Firebase URL is undefined, it means Firebase isn't being used.
    if (!downloadURL) {
      console.warn("⚠️ Firebase upload failed, image URL is missing.");
    }

    console.log("🚀 Sending request to Cloud Run with image URL:", downloadURL);

    // Send the image URL to your API for classification
    const apiResponse = await fetch(
      "https://acne-api-983645359628.us-central1.run.app/classify",
      {
        method: "POST",
        body: JSON.stringify({ image_url: downloadURL }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!apiResponse.ok) {
      throw new Error(`API Error: ${apiResponse.status}`);
    }

    const result = await apiResponse.json();
    console.log("✅ API Classification Result:", result);

    // Normalize API response to match frontend expectations
    const normalizedClassification = result.classification
      .toLowerCase()
      .replace(/s$/, "") as AcneType;

    return {
      classification: normalizedClassification,
      confidence: result.confidence,
    };
  } catch (error: unknown) {
    console.error("❌ Error in classifyAcne:", error);
    throw error;
  }
}
