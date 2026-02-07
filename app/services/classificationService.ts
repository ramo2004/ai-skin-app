import { getApiUrl } from "../../constants/Config";
import { auth } from "../config/firebaseConfig";
import { getUserProfile } from "./firebaseService";

export type AcneType =
  | "cyst"
  | "blackhead"
  | "whitehead"
  | "papule"
  | "pustule"
  | "nodule"
  | "fungal_acne"
  | "acne_scars"
  | "rosacea" // New
  | "perioral_dermatitis" // New
  | "folliculitis" // New
  | "no_acne_detected"
  | "uncertain"; // ✅ Added "uncertain" and "no_acne_detected" for fallback cases

/**
 * Classifies acne from a photo URI using the API.
 * @param photoUri local URI to the captured photo.
 * @returns {Promise<{ classification: AcneType, confidence: number }>}
 */
export async function classifyAcne(
  photoUri: string
): Promise<{ classification: AcneType; confidence: number }> {
  try {
    console.log("Starting classification for:", photoUri);

    // ✅ Convert URI to blob and log size
    const response = await fetch(photoUri);
    const blob = await response.blob();
    const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2);
    console.log(`📸 Image size for analysis: ${sizeInMB} MB`);

    // ✅ Create FormData for sending to backend
    const formData = new FormData();
    formData.append("file", {
      uri: photoUri,
      name: `analysis_${Date.now()}.jpg`,
      type: "image/jpeg",
    } as any);

    // ✅ Append User Profile Data if available
    if (auth.currentUser) {
      try {
        const result = await getUserProfile(auth.currentUser.uid);
        if (result.profile) {
          formData.append("age", result.profile.age);
          formData.append("gender", result.profile.gender);
          formData.append("skin_type", result.profile.skinType);
        }
      } catch (e) {
        console.warn("Failed to fetch profile for context:", e);
      }
    }

    // ✅ Get Firebase ID Token for backend authentication
    let idToken = "";
    if (auth.currentUser) {
      try {
        idToken = await auth.currentUser.getIdToken();
      } catch (e) {
        console.warn("Failed to get ID token:", e);
      }
    }

    console.log("🚀 Sending request to FastAPI backend...");

    // ✅ Send the image to the FastAPI backend with Auth Header
    const apiResponse = await fetch(getApiUrl(), {
      method: "POST",
      body: formData,
      headers: {
        "Authorization": `Bearer ${idToken}`,
      },
    });

    if (!apiResponse.ok) {
      throw new Error(`API Error: ${apiResponse.status}`);
    }

    const result = await apiResponse.json();
    console.log("✅ API Classification Result:", result);

    // Backend returns { type: "face", classification: { classification, confidence } }
    const facePayload = result?.type === "face" ? result?.classification : result;
    const rawClassification =
      typeof facePayload?.classification === "string"
        ? facePayload.classification
        : "";
    const confidence =
      typeof facePayload?.confidence === "number" ? facePayload.confidence : 0.0;

    // ✅ Normalize the response to match frontend expected format
    let normalizedClassification: AcneType;

    switch (rawClassification.toLowerCase()) {
      case "whiteheads":
        normalizedClassification = "whitehead";
        break;
      case "blackheads":
        normalizedClassification = "blackhead";
        break;
      case "papules":
        normalizedClassification = "papule";
        break;
      case "pustules":
        normalizedClassification = "pustule";
        break;
      case "nodules":
        normalizedClassification = "nodule";
        break;
      case "cystic acne":
        normalizedClassification = "cyst";
        break;
      case "fungal acne":
        normalizedClassification = "fungal_acne";
        break;
      case "acne scars":
        normalizedClassification = "acne_scars";
        break;
      case "clear skin":
        normalizedClassification = "no_acne_detected";
        break;
      case "invalid image":
        normalizedClassification = "uncertain";
        break;
      default:
        normalizedClassification = "uncertain";
        break;
    }

    return {
      classification: normalizedClassification,
      confidence,
    };
  } catch (error: unknown) {
    console.error("❌ Error in classifyAcne:", error);
    throw error;
  }
}

export interface IngredientResult {
  has_risky_ingredients: boolean;
  risk_level: "High" | "Medium" | "Low" | "Safe" | "Unknown" | "Error";
  summary: string;
  risky_ingredients: Array<{
    name: string;
    reason: string;
    rating: number;
  }>;
}

/**
 * Analyzes a product label for acne-causing ingredients.
 * @param photoUri local URI to the captured photo.
 * @returns {Promise<IngredientResult>}
 */
export async function analyzeProduct(photoUri: string): Promise<IngredientResult> {
  try {
    console.log("Starting product analysis for:", photoUri);
    const formData = new FormData();
    formData.append("file", {
      uri: photoUri,
      name: `product_${Date.now()}.jpg`,
      type: "image/jpeg",
    } as any);
    formData.append("scan_type", "product");

    // ✅ Append User Profile Data for Contextual Analysis
    if (auth.currentUser) {
      try {
        const result = await getUserProfile(auth.currentUser.uid);
        if (result.profile) {
          formData.append("age", result.profile.age);
          formData.append("gender", result.profile.gender);
          formData.append("skin_type", result.profile.skinType);
        }
      } catch (e) {
        console.warn("Failed to fetch profile for context:", e);
      }
    }
    let idToken = "";
    if (auth.currentUser) {
      try {
        idToken = await auth.currentUser.getIdToken();
      } catch (e) {
        console.warn("Failed to get ID token:", e);
      }
    }

    const apiResponse = await fetch(getApiUrl(), {
      method: "POST",
      body: formData,
      headers: {
        "Authorization": `Bearer ${idToken}`,
      },
    });

    if (!apiResponse.ok) {
      throw new Error(`API Error: ${apiResponse.status}`);
    }

    const json = await apiResponse.json();
    console.log("✅ Product Analysis Result:", json);
    
    if (json.type === "product" && json.result) {
      return json.result;
    } else {
      throw new Error("Invalid response format for product scan");
    }

  } catch (error) {
    console.error("❌ Error in analyzeProduct:", error);
    throw error;
  }
}
