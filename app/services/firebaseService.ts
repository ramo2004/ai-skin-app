/**
 * @file firebaseService.ts
 * @description Helper functions to upload images and store classification results.
 */

import { db, storage } from "../config/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Uploads an image to Firebase Storage for later analysis or record-keeping.
 * @param photoUri The local URI of the image to upload.
 */
export async function uploadImageForAnalysis(photoUri: string): Promise<void> {
  // Basic validation
  if (photoUri.length === 0) {
    throw new Error("Invalid photoUri: cannot be empty.");
  }

  const response = await fetch(photoUri);
  const blob = await response.blob();

  const fileName = `images/${Date.now()}.jpg`;
  const fileRef = ref(storage, fileName);

  await uploadBytes(fileRef, blob);
  const downloadURL = await getDownloadURL(fileRef);

  // Optionally, store a record in Firestore
  await addDoc(collection(db, "scans"), {
    imageUrl: downloadURL,
    createdAt: new Date().toISOString(),
  });
}
