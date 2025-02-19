import type { AcneType } from "./classificationService";

/**
 * Normalizes API classification to match expected AcneType values.
 */
function normalizeAcneType(acneType: string): AcneType {
  return acneType.toLowerCase().replace(/s$/, "") as AcneType;
}

/**
 * Returns an array of recommended treatments or products for the given acne type.
 * @param acneType The predicted acne type from the API.
 * @returns {string[]} An array of recommendation strings.
 */
export function getRecommendations(acneType: string): string[] {
  const normalizedType = normalizeAcneType(acneType);

  switch (normalizedType) {
    case "cyst":
      return [
        "Consider prescription-strength retinoids",
        "Use benzoyl peroxide 5% cleanser or gel",
        "Consult a dermatologist for long-term therapy",
      ];
    case "blackhead":
      return [
        "Salicylic acid cleanser to unclog pores",
        "Retinol-based creams at night",
        "Avoid heavy moisturizers that can block pores",
      ];
    case "whitehead":
      return [
        "Gentle facial cleanser twice daily",
        "Benzoyl peroxide spot treatments",
        "Non-comedogenic moisturizers",
      ];
    case "papule":
      return [
        "Topical antibiotics or anti-inflammatory creams",
        "Avoid picking at lesions to prevent scarring",
        "Mild chemical exfoliation once a week",
      ];
    case "pustule":
      return [
        "Use benzoyl peroxide or salicylic acid treatments",
        "Apply warm compresses to help drainage",
        "Avoid popping pustules to prevent scarring",
      ];
    case "nodule":
      return [
        "Consult a dermatologist for prescription medications",
        "Oral antibiotics or isotretinoin may be required",
        "Avoid aggressive scrubbing or popping nodules",
      ];
    case "no_acne_detected":
      return [
        "Maintain a balanced skincare routine",
        "Use sunscreen to protect skin",
        "Regular checkups if any concerns arise",
      ];
    default:
      console.warn(
        `Unknown acne type received after normalization: ${normalizedType}`
      );
      return ["No specific recommendations available."];
  }
}
