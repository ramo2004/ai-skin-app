/**
 * @file firebaseService.ts
 * @description Helper functions to upload images and store classification results.
 */

import { db, storage, auth } from "../config/firebaseConfig";
import { collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, writeBatch, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile
} from "firebase/auth";

const SAVE_CLOUD_IMAGES_KEY = "privacy.save_cloud_images";

/**
 * --- AUTHENTICATION ---
 */

/**
 * Signs up a new user with email and password.
 * @param {string} email - User's email address.
 * @param {string} password - User's chosen password.
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export const signUp = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Signs in an existing user with email and password.
 * @param {string} email - User's email address.
 * @param {string} password - User's password.
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Signs out the current user.
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  return firebaseSignOut(auth);
};

/**
 * Updates the current user's display name in Firebase Auth.
 * @param {string} name - The new display name.
 * @returns {Promise<void>}
 */
export const updateUserDisplayName = async (name: string) => {
  if (auth.currentUser) {
    return updateProfile(auth.currentUser, { displayName: name });
  }
};

/**
 * --- DATA & PROFILES ---
 */

/**
 * Represents a user's skin profile and metadata.
 */
export interface UserProfile {
  /** Full name or display name of the user. */
  displayName: string;
  /** User's age. */
  age: string;
  /** User's gender. */
  gender: string;
  /** Skin type (e.g., Oily, Dry, Sensitive). */
  skinType: string;
  /** ISO timestamp of when the profile was created. */
  createdAt: string;
}

/**
 * Saves or updates a user's profile data in Firestore.
 * @param {string} uid - The unique User ID.
 * @param {Omit<UserProfile, "createdAt">} data - Profile details excluding the timestamp.
 * @returns {Promise<void>}
 */
export const saveUserProfile = async (uid: string, data: Omit<UserProfile, "createdAt">) => {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      ...data,
      createdAt: new Date().toISOString(),
    }, { merge: true });
    
    // Sync with Firebase Auth display name for easy access
    await updateUserDisplayName(data.displayName);
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
};

/**
 * Fetches a user's profile from Firestore with a 5-second timeout for connectivity robustness.
 * @param {string} uid - The unique User ID.
 * @returns {Promise<{ profile: UserProfile | null; error: boolean }>}
 * Returns a profile object and an error flag to distinguish between "not found" and "network error".
 */
export const getUserProfile = async (uid: string): Promise<{ profile: UserProfile | null; error: boolean }> => {
  try {
    const userRef = doc(db, "users", uid);
    
    // 15-second timeout to handle Firestore "Client is Offline" hangs gracefully
    const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout: Firestore did not respond in 15s")), 15000);
    });

    const docSnap: any = await Promise.race([
        getDoc(userRef),
        timeout
    ]);
    
    if (docSnap.exists()) {
      return { profile: docSnap.data() as UserProfile, error: false };
    } else {
      return { profile: null, error: false }; // User exists, but has no profile document
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    // Treat timeouts or connection failures as errors so UI can degrade gracefully
    return { profile: null, error: true };
  }
};

/**
 * --- PRIVACY PREFERENCES ---
 */
export const getSaveCloudImagesPreference = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(SAVE_CLOUD_IMAGES_KEY);
    // Privacy-first default: disabled
    return value === "true";
  } catch {
    return false;
  }
};

export const setSaveCloudImagesPreference = async (enabled: boolean): Promise<void> => {
  await AsyncStorage.setItem(SAVE_CLOUD_IMAGES_KEY, String(enabled));
};

/**
 * Deletes all user-generated app data (profile, scans, and stored scan images).
 * Account auth remains intact so the user may continue using the app.
 */
export const deleteAllUserData = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is logged in.");
  }

  // 1) Delete profile document
  await deleteDoc(doc(db, "users", user.uid));

  // 2) Delete scan history documents in batches
  const scansQuery = query(collection(db, "scans"), where("userId", "==", user.uid));
  const scansSnapshot = await getDocs(scansQuery);
  if (!scansSnapshot.empty) {
    let batch = writeBatch(db);
    let counter = 0;
    for (const scanDoc of scansSnapshot.docs) {
      batch.delete(scanDoc.ref);
      counter += 1;
      if (counter >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        counter = 0;
      }
    }
    if (counter > 0) {
      await batch.commit();
    }
  }

  // 3) Delete all stored images for this user
  //    Safe even if image saving was disabled for some/all scans.
  const userImagesRef = ref(storage, `images/${user.uid}`);
  try {
    const listed = await listAll(userImagesRef);
    await Promise.all(listed.items.map((itemRef) => deleteObject(itemRef)));
  } catch {
    // Ignore storage-listing failures to avoid blocking data purge.
  }

  // 4) Clear local privacy preference
  await AsyncStorage.removeItem(SAVE_CLOUD_IMAGES_KEY);
};

/**
 * --- ANALYSIS HISTORY ---
 */

/**
 * Uploads an image to Firebase Storage and logs the analysis result to Firestore.
 * @param {string} photoUri - Local URI of the captured photo.
 * @param {any} classification - Result object from the AI classification service.
 * @returns {Promise<void>}
 */
export async function uploadImageForAnalysis(photoUri: string, classification: any): Promise<void> {
  if (!photoUri) {
    throw new Error("Invalid photoUri: cannot be empty.");
  }
  
  const user = auth.currentUser;
  if (!user) {
    console.warn("No user logged in, skipping upload to history.");
    return;
  }

  const shouldSaveImage = await getSaveCloudImagesPreference();
  let downloadURL: string | null = null;

  if (shouldSaveImage) {
    // 1. Prepare file blob
    const response = await fetch(photoUri);
    const blob = await response.blob();

    // 2. Upload to Storage
    const fileName = `images/${user.uid}/${Date.now()}.jpg`;
    const fileRef = ref(storage, fileName);
    await uploadBytes(fileRef, blob);
    
    // 3. Get public URL
    downloadURL = await getDownloadURL(fileRef);
  }

  // 4. Save metadata to Firestore 'scans' collection
  await addDoc(collection(db, "scans"), {
    userId: user.uid,
    imageUrl: downloadURL,
    imageStored: shouldSaveImage,
    classification: classification,
    createdAt: new Date().toISOString(),
  });
}
