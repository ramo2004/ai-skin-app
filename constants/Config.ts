import { API_URL } from "@env";

/**
 * Application configuration constants.
 * Centralizes environmental variables and endpoint definitions.
 */
export const Config = {
  /**
   * Base API URL fetched from environmental variables (.env).
   * Note: Update .env when switching networks (Home Wifi vs Mobile Hotspot).
   */
  API_URL: API_URL || "http://localhost:8000", 
  
  /** Endpoint for skin classification analysis. */
  CLASSIFY_ENDPOINT: "classify/",
};

/**
 * Utility to get the full classification API endpoint.
 * @returns {string} The complete URL for classification.
 */
export const getApiUrl = () => {
  const baseUrl = Config.API_URL.endsWith("/") ? Config.API_URL : `${Config.API_URL}/`;
  return `${baseUrl}${Config.CLASSIFY_ENDPOINT}`;
};
