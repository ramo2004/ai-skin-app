export type AcneType =
  | "cyst"
  | "blackhead"
  | "whitehead"
  | "papule"
  | "pustule"
  | "nodule"
  | "fungal_acne"
  | "acne_scars"
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

    // ✅ Convert URI to blob
    const response = await fetch(photoUri);
    const blob = await response.blob();

    // ✅ Create FormData for sending to backend
    const formData = new FormData();
    formData.append("file", {
      uri: photoUri,
      name: "acne.jpg",
      type: "image/jpeg",
    } as any);

    console.log("🚀 Sending request to FastAPI backend...");

    // ✅ Send the image to the FastAPI backend
    const apiResponse = await fetch("http://127.0.0.1:8000/classify/", {
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

    // ✅ Normalize the response to match frontend expected format
    let normalizedClassification: AcneType;

    switch (result.classification.toLowerCase()) {
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
      default:
        normalizedClassification = "uncertain";
        break;
    }

    return {
      classification: normalizedClassification,
      confidence: result.confidence || 0.0, // ✅ Ensure confidence fallback
    };
  } catch (error: unknown) {
    console.error("❌ Error in classifyAcne:", error);
    throw error;
  }
}
