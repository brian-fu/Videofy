import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth } from "../firebaseConfig";

// Function to get user data from Firebase Storage
export const getUserData = async (userId) => {
  try {
    // If no userId is provided, use the current authenticated user
    const uid = userId || auth.currentUser?.uid;
    
    if (!uid) {
      throw new Error("No user ID provided and no user is currently authenticated");
    }
    
    // Initialize Firebase Storage
    const storage = getStorage();
    
    // Create a reference to the user's folder in storage
    const userFolderRef = ref(storage, `users/${uid}`);
    
    // List all items in the user's folder
    const result = await listAll(userFolderRef);
    
    // Get download URLs for all items
    const filePromises = result.items.map(async (itemRef) => {
      const url = await getDownloadURL(itemRef);
      return {
        name: itemRef.name,
        url,
        fullPath: itemRef.fullPath,
      };
    });
    
    // Wait for all promises to resolve
    const files = await Promise.all(filePromises);
    
    // Get user metadata from Firestore
    const db = getFirestore();
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    
    // Combine storage files with user metadata
    return {
      files,
      userData: userDoc.exists() ? userDoc.data() : null
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

// Function to get a specific file from Firebase Storage
export const getUserFile = async (userId, fileName) => {
  try {
    const uid = userId || auth.currentUser?.uid;
    
    if (!uid) {
      throw new Error("No user ID provided and no user is currently authenticated");
    }
    
    const storage = getStorage();
    const fileRef = ref(storage, `users/${uid}/${fileName}`);
    
    const url = await getDownloadURL(fileRef);
    
    return {
      name: fileName,
      url,
      fullPath: fileRef.fullPath,
    };
  } catch (error) {
    console.error(`Error fetching file ${fileName}:`, error);
    throw error;
  }
};

// Function to save user data to Firestore
export const saveUserMetadata = async (userId, metadata) => {
  try {
    const uid = userId || auth.currentUser?.uid;
    
    if (!uid) {
      throw new Error("No user ID provided and no user is currently authenticated");
    }
    
    const db = getFirestore();
    const userDocRef = doc(db, "users", uid);
    
    await setDoc(userDocRef, metadata, { merge: true });
    
    return true;
  } catch (error) {
    console.error("Error saving user metadata:", error);
    throw error;
  }
}; 